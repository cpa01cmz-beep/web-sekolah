import type { Env } from './core-utils';
import { WebhookConfigEntity, WebhookEventEntity, WebhookDeliveryEntity } from './entities';
import type { WebhookConfig, WebhookEvent, WebhookDelivery } from '@shared/types';
import { logger } from './logger';

const MAX_RETRIES = 6;
const RETRY_DELAYS = [1, 5, 15, 30, 60, 120].map(minutes => minutes * 60 * 1000);

export class WebhookService {
  static async triggerEvent(env: Env, eventType: string, data: Record<string, unknown>): Promise<void> {
    logger.info('Triggering webhook event', { eventType });

    const activeConfigs = await WebhookConfigEntity.getByEventType(env, eventType);

    if (activeConfigs.length === 0) {
      logger.debug('No active webhooks configured for event', { eventType });
      return;
    }

    for (const config of activeConfigs) {
      const eventId = `event-${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      const event: WebhookEvent = {
        id: eventId,
        eventType,
        data,
        processed: false,
        createdAt: now,
        updatedAt: now
      };

      await new WebhookEventEntity(env, eventId).save(event);

      const deliveryId = `delivery-${crypto.randomUUID()}`;
      const delivery: WebhookDelivery = {
        id: deliveryId,
        eventId,
        webhookConfigId: config.id,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: now,
        createdAt: now,
        updatedAt: now
      };

      await new WebhookDeliveryEntity(env, deliveryId).save(delivery);

      logger.info('Webhook event created', { eventId, webhookConfigId: config.id, eventType });
    }
  }

  static async processPendingDeliveries(env: Env): Promise<void> {
    logger.info('Processing pending webhook deliveries');

    const pendingDeliveries = await WebhookDeliveryEntity.getPendingRetries(env);

    logger.info(`Found ${pendingDeliveries.length} pending webhook deliveries`);

    for (const delivery of pendingDeliveries) {
      await this.attemptDelivery(env, delivery);
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

    const payload = {
      id: event.id,
      eventType: event.eventType,
      data: event.data,
      timestamp: event.createdAt
    };

    const signature = await this.generateSignature(JSON.stringify(payload), config.secret);

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': event.id,
          'X-Webhook-Timestamp': event.createdAt,
          'User-Agent': 'Akademia-Pro-Webhook/1.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        await this.markDeliveryDelivered(env, delivery, response.status);
        logger.info('Webhook delivered successfully', {
          deliveryId: delivery.id,
          webhookConfigId: config.id,
          statusCode: response.status
        });
      } else {
        const errorText = await response.text();
        await this.handleDeliveryError(env, delivery, response.status, errorText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.handleDeliveryError(env, delivery, 0, errorMessage);
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
    }
  }

  private static async handleDeliveryError(env: Env, delivery: WebhookDelivery, statusCode: number, errorMessage: string): Promise<void> {
    const newAttempt = delivery.attempts + 1;

    if (newAttempt >= MAX_RETRIES) {
      await this.markDeliveryFailed(env, delivery, `Max retries exceeded: ${errorMessage}`);
      logger.error('Webhook delivery failed after max retries', {
        deliveryId: delivery.id,
        webhookConfigId: delivery.webhookConfigId,
        statusCode,
        errorMessage
      });
      return;
    }

    const retryDelay = RETRY_DELAYS[Math.min(newAttempt, RETRY_DELAYS.length - 1)];
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
      webhookConfigId: delivery.webhookConfigId,
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

  private static async generateSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const data = encoder.encode(payload);

    const importedKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', importedKey, data);
    const hash = new Uint8Array(signature);
    const hexArray = Array.from(hash).map(b => b.toString(16).padStart(2, '0'));
    return `sha256=${hexArray.join('')}`;
  }
}

export async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const expectedSignature = await WebhookService['generateSignature'](payload, secret);

    return signature === expectedSignature;
  } catch {
    return false;
  }
}