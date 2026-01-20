import type { Env } from './core-utils';
import { WebhookConfigEntity, WebhookEventEntity, WebhookDeliveryEntity, DeadLetterQueueWebhookEntity } from './entities';
import type { WebhookConfig, WebhookEvent, WebhookDelivery } from '@shared/types';
import { logger } from './logger';
import { integrationMonitor } from './integration-monitor';
import { WEBHOOK_CONFIG } from './webhook-constants';
import { generateSignature, verifySignature } from './webhook-crypto';
import type { WebhookEventPayload } from './webhook-types';
import { CircuitBreaker } from '@shared/CircuitBreaker';

export class WebhookService {
  private static readonly circuitBreakers = new Map<string, CircuitBreaker>();

  private static getOrCreateCircuitBreaker(url: string): CircuitBreaker {
    const existing = this.circuitBreakers.get(url);
    if (existing) {
      return existing;
    }

    const breaker = CircuitBreaker.createWebhookBreaker(url, logger);
    this.circuitBreakers.set(url, breaker);
    logger.debug('Created new circuit breaker for webhook URL', { url });
    return breaker;
  }

  static async triggerEvent(env: Env, eventType: string, data: Record<string, unknown>): Promise<void> {
    logger.info('Triggering webhook event', { eventType });

    const activeConfigs = await WebhookConfigEntity.getByEventType(env, eventType);

    if (activeConfigs.length === 0) {
      logger.debug('No active webhooks configured for event', { eventType });
      return;
    }

    const now = new Date().toISOString();
    const eventId = `event-${crypto.randomUUID()}`;

    const event: WebhookEvent = {
      id: eventId,
      eventType,
      data,
      processed: false,
      createdAt: now,
      updatedAt: now
    };

    await new WebhookEventEntity(env, eventId).save(event);
    integrationMonitor.recordWebhookEventCreated();

    for (const config of activeConfigs) {
      const idempotencyKey = `${eventId}:${config.id}`;
      
      const existingDelivery = await WebhookDeliveryEntity.getByIdempotencyKey(env, idempotencyKey);
      if (existingDelivery) {
        logger.debug('Webhook delivery already exists with idempotency key', { idempotencyKey });
        continue;
      }

      const deliveryId = `delivery-${crypto.randomUUID()}`;
      const delivery: WebhookDelivery = {
        id: deliveryId,
        eventId,
        webhookConfigId: config.id,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: now,
        createdAt: now,
        updatedAt: now,
        idempotencyKey
      };

      await WebhookDeliveryEntity.createWithDateIndex(env, delivery);

      logger.info('Webhook delivery created', { deliveryId, eventId, webhookConfigId: config.id, eventType, idempotencyKey });
    }
  }

  static async processPendingDeliveries(env: Env): Promise<void> {
    logger.info('Processing pending webhook deliveries');

    const pendingDeliveries = await WebhookDeliveryEntity.getPendingRetries(env);
    integrationMonitor.updatePendingDeliveries(pendingDeliveries.length);

    logger.info(`Found ${pendingDeliveries.length} pending webhook deliveries`);

    const concurrencyLimit = WEBHOOK_CONFIG.CONCURRENCY_LIMIT;
    
    for (let i = 0; i < pendingDeliveries.length; i += concurrencyLimit) {
      const batch = pendingDeliveries.slice(i, i + concurrencyLimit);
      await Promise.all(batch.map(delivery => this.attemptDelivery(env, delivery)));
    }
  }

  private static async attemptDelivery(env: Env, delivery: WebhookDelivery): Promise<void> {
    const deliveryEntity = new WebhookDeliveryEntity(env, delivery.id);
    const config = await new WebhookConfigEntity(env, delivery.webhookConfigId).getState();
    const event = await new WebhookEventEntity(env, delivery.eventId).getState();

    if (!config || !event) {
      logger.error('Webhook config or event not found', {
        deliveryId: delivery.id,
        webhookConfigId: delivery.webhookConfigId,
        eventId: delivery.eventId
      });
      await this.markDeliveryFailed(env, delivery, 'Configuration or event not found');
      return;
    }

    if (!config.active) {
      logger.info('Webhook config is inactive, skipping delivery', { webhookConfigId: config.id });
      await this.markDeliveryFailed(env, delivery, 'Webhook configuration is inactive');
      return;
    }

    const breaker = this.getOrCreateCircuitBreaker(config.url);

    const payload = {
      id: event.id,
      eventType: event.eventType,
      data: event.data,
      timestamp: event.createdAt
    };

    const signature = await generateSignature(JSON.stringify(payload), config.secret);
    const deliveryStartTime = Date.now();

    try {
      const response = await breaker.execute(async () => {
        return await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-ID': event.id,
            'X-Webhook-Timestamp': event.createdAt,
            'User-Agent': 'Akademia-Pro-Webhook/1.0'
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(WEBHOOK_CONFIG.REQUEST_TIMEOUT_MS)
        });
      });

      if (response.ok) {
        const deliveryTime = Date.now() - deliveryStartTime;
        await this.markDeliveryDelivered(env, delivery, response.status);
        integrationMonitor.recordWebhookDelivery(true, deliveryTime);
        logger.info('Webhook delivered successfully', {
          deliveryId: delivery.id,
          webhookConfigId: config.id,
          statusCode: response.status
        });
      } else {
        const errorText = await response.text();
        await this.handleDeliveryError(env, delivery, config, response.status, errorText);
        integrationMonitor.recordWebhookDelivery(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Circuit breaker is open')) {
        await this.markDeliveryFailed(env, delivery, `Circuit breaker open: ${errorMessage}`);
        logger.warn('Webhook delivery skipped due to open circuit breaker', {
          deliveryId: delivery.id,
          webhookConfigId: config.id,
          errorMessage
        });
      } else {
        await this.handleDeliveryError(env, delivery, config, 0, errorMessage);
      }
      
      integrationMonitor.recordWebhookDelivery(false);
    }
  }

  private static async markDeliveryDelivered(env: Env, delivery: WebhookDelivery, statusCode: number): Promise<void> {
    const deliveryEntity = new WebhookDeliveryEntity(env, delivery.id);
    await deliveryEntity.save({
      ...delivery,
      status: 'delivered',
      statusCode,
      attempts: delivery.attempts + 1,
      nextAttemptAt: undefined,
      updatedAt: new Date().toISOString()
    });

    const eventEntity = new WebhookEventEntity(env, delivery.eventId);
    const event = await eventEntity.getState();
    if (event) {
      await eventEntity.save({
        ...event,
        processed: true,
        updatedAt: new Date().toISOString()
      });
      integrationMonitor.recordWebhookEventProcessed();
    }
  }

  private static async handleDeliveryError(env: Env, delivery: WebhookDelivery, config: WebhookConfig, statusCode: number, errorMessage: string): Promise<void> {
    const newAttempt = delivery.attempts + 1;

    if (newAttempt >= WEBHOOK_CONFIG.MAX_RETRIES) {
      await this.archiveToDeadLetterQueue(env, delivery, config, statusCode, errorMessage);
      await this.markDeliveryFailed(env, delivery, `Max retries exceeded: ${errorMessage}`);
      logger.error('Webhook delivery failed after max retries', {
        deliveryId: delivery.id,
        webhookConfigId: config.id,
        statusCode,
        errorMessage
      });
      return;
    }

    const retryDelay = WEBHOOK_CONFIG.RETRY_DELAYS_MS[Math.min(newAttempt, WEBHOOK_CONFIG.RETRY_DELAYS_MS.length - 1)];
    const nextAttemptAt = new Date(Date.now() + retryDelay).toISOString();

    const deliveryEntity = new WebhookDeliveryEntity(env, delivery.id);
    await deliveryEntity.save({
      ...delivery,
      status: 'pending',
      statusCode,
      attempts: newAttempt,
      nextAttemptAt,
      errorMessage,
      updatedAt: new Date().toISOString()
    });

    logger.warn('Webhook delivery failed, scheduling retry', {
      deliveryId: delivery.id,
      webhookConfigId: config.id,
      statusCode,
      errorMessage,
      attempt: newAttempt,
      nextAttemptAt
    });
  }

  private static async markDeliveryFailed(env: Env, delivery: WebhookDelivery, errorMessage: string): Promise<void> {
    const deliveryEntity = new WebhookDeliveryEntity(env, delivery.id);
    await deliveryEntity.save({
      ...delivery,
      status: 'failed',
      errorMessage,
      updatedAt: new Date().toISOString()
    });
  }

  private static async archiveToDeadLetterQueue(env: Env, delivery: WebhookDelivery, config: WebhookConfig, statusCode: number, errorMessage: string): Promise<void> {
    const event = await new WebhookEventEntity(env, delivery.eventId).getState();
    if (!event) return;

    const dlqId = `dlq-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const dlqEntry = {
      id: dlqId,
      eventId: delivery.eventId,
      webhookConfigId: config.id,
      eventType: event.eventType,
      url: config.url,
      payload: event.data,
      status: statusCode,
      attempts: delivery.attempts,
      errorMessage,
      failedAt: now,
      createdAt: now,
      updatedAt: now
    };

    await new DeadLetterQueueWebhookEntity(env, dlqId).save(dlqEntry);
    logger.info('Webhook archived to dead letter queue', { dlqId, deliveryId: delivery.id });
    integrationMonitor.recordWebhookDelivery(false);
  }
}

export { verifySignature };
