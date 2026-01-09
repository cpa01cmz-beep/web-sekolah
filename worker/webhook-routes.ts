import { Hono } from 'hono';
import type { Env } from './core-utils';
import { ok, bad, notFound, unauthorized, serverError, forbidden } from './core-utils';
import { WebhookConfigEntity, WebhookEventEntity, WebhookDeliveryEntity, DeadLetterQueueWebhookEntity } from './entities';
import { WebhookService } from './webhook-service';
import { logger } from './logger';
import { CircuitBreaker } from './CircuitBreaker';
import { RetryDelay } from './config/time';

export const webhookRoutes = (app: Hono<{ Bindings: Env }>) => {
  app.get('/api/webhooks', async (c) => {
    try {
      const configs = await WebhookConfigEntity.list(c.env);
      return ok(c, configs.items);
    } catch (error) {
      logger.error('Failed to list webhooks', error);
      return serverError(c, 'Failed to list webhooks');
    }
  });

  app.get('/api/webhooks/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const config = await new WebhookConfigEntity(c.env, id).getState();

      if (!config || config.deletedAt) {
        return notFound(c, 'Webhook configuration not found');
      }

      return ok(c, config);
    } catch (error) {
      logger.error('Failed to get webhook', error);
      return serverError(c, 'Failed to get webhook');
    }
  });

  app.post('/api/webhooks', async (c) => {
    try {
      const body = await c.req.json<{
        url: string;
        events: string[];
        secret: string;
        active?: boolean;
      }>();

      if (!body.url || !body.events || !body.secret) {
        return bad(c, 'Missing required fields: url, events, secret');
      }

      const id = `webhook-${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      const config = {
        id,
        url: body.url,
        events: body.events,
        secret: body.secret,
        active: body.active ?? true,
        createdAt: now,
        updatedAt: now
      };

      await new WebhookConfigEntity(c.env, id).save(config);

      logger.info('Webhook configuration created', { id, url: body.url, events: body.events });

      return ok(c, config);
    } catch (error) {
      logger.error('Failed to create webhook', error);
      return serverError(c, 'Failed to create webhook');
    }
  });

  app.put('/api/webhooks/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const existing = await new WebhookConfigEntity(c.env, id).getState();

      if (!existing || existing.deletedAt) {
        return notFound(c, 'Webhook configuration not found');
      }

      const body = await c.req.json<{
        url?: string;
        events?: string[];
        secret?: string;
        active?: boolean;
      }>();

      const updated = {
        ...existing,
        url: body.url ?? existing.url,
        events: body.events ?? existing.events,
        secret: body.secret ?? existing.secret,
        active: body.active ?? existing.active,
        updatedAt: new Date().toISOString()
      };

      await new WebhookConfigEntity(c.env, id).save(updated);

      logger.info('Webhook configuration updated', { id });

      return ok(c, updated);
    } catch (error) {
      logger.error('Failed to update webhook', error);
      return serverError(c, 'Failed to update webhook');
    }
  });

  app.delete('/api/webhooks/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const existing = await new WebhookConfigEntity(c.env, id).getState();

      if (!existing || existing.deletedAt) {
        return notFound(c, 'Webhook configuration not found');
      }

      const updated = {
        ...existing,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await new WebhookConfigEntity(c.env, id).save(updated);

      logger.info('Webhook configuration deleted', { id });

      return ok(c, { id, deleted: true });
    } catch (error) {
      logger.error('Failed to delete webhook', error);
      return serverError(c, 'Failed to delete webhook');
    }
  });

  app.get('/api/webhooks/:id/deliveries', async (c) => {
    try {
      const id = c.req.param('id');
      const deliveries = await WebhookDeliveryEntity.getByWebhookConfigId(c.env, id);
      return ok(c, deliveries);
    } catch (error) {
      logger.error('Failed to get webhook deliveries', error);
      return serverError(c, 'Failed to get webhook deliveries');
    }
  });

  app.get('/api/webhooks/events', async (c) => {
    try {
      const events = await WebhookEventEntity.list(c.env);
      return ok(c, events.items);
    } catch (error) {
      logger.error('Failed to list webhook events', error);
      return serverError(c, 'Failed to list webhook events');
    }
  });

  app.get('/api/webhooks/events/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const event = await new WebhookEventEntity(c.env, id).getState();

      if (!event || event.deletedAt) {
        return notFound(c, 'Webhook event not found');
      }

      const deliveries = await WebhookDeliveryEntity.getByEventId(c.env, id);

      return ok(c, { event, deliveries });
    } catch (error) {
      logger.error('Failed to get webhook event', error);
      return serverError(c, 'Failed to get webhook event');
    }
  });

  app.post('/api/webhooks/test', async (c) => {
    let body: { url: string; secret: string } = { url: '', secret: '' };
    
    try {
      body = await c.req.json<{
        url: string;
        secret: string;
      }>();

      if (!body.url || !body.secret) {
        return bad(c, 'Missing required fields: url, secret');
      }

      const testPayload = {
        id: `test-${crypto.randomUUID()}`,
        eventType: 'test',
        data: { message: 'Webhook test payload' },
        timestamp: new Date().toISOString()
      };

      const encoder = new TextEncoder();
      const key = encoder.encode(body.secret);
      const data = encoder.encode(JSON.stringify(testPayload));

      const importedKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const signature = await crypto.subtle.sign('HMAC', importedKey, data);
      const hash = new Uint8Array(signature);
      const hexArray = Array.from(hash).map(b => b.toString(16).padStart(2, '0'));
      const signatureHeader = `sha256=${hexArray.join('')}`;

      const breaker = CircuitBreaker.createWebhookBreaker(body.url);

      let lastError: Error | unknown;
      const maxRetries = 3;
      const retryDelaysMs = [RetryDelay.ONE_SECOND_MS, RetryDelay.TWO_SECONDS_MS, RetryDelay.THREE_SECONDS_MS];
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await breaker.execute(async () => {
            return await fetch(body.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signatureHeader,
                'X-Webhook-ID': testPayload.id,
                'X-Webhook-Timestamp': testPayload.timestamp,
                'User-Agent': 'Akademia-Pro-Webhook/1.0'
              },
              body: JSON.stringify(testPayload),
              signal: AbortSignal.timeout(30000)
            });
          });

          const responseText = await response.text();

          if (attempt > 0) {
            logger.info('Webhook test succeeded after retry', {
              url: body.url,
              status: response.status,
              attempt: attempt + 1,
              retries: attempt
            });
          } else {
            logger.info('Webhook test sent', { url: body.url, status: response.status });
          }

          return ok(c, {
            success: response.ok,
            status: response.status,
            response: responseText
          });
        } catch (error) {
          lastError = error;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (errorMessage.includes('Circuit breaker is open')) {
            logger.warn('Webhook test skipped due to open circuit breaker', {
              url: body?.url,
              errorMessage
            });
            return ok(c, {
              success: false,
              error: 'Circuit breaker is open for this webhook URL. Please wait before retrying.'
            });
          }

          if (attempt < maxRetries) {
            const delay = retryDelaysMs[attempt];
            logger.info('Webhook test retrying', {
              url: body.url,
              attempt: attempt + 1,
              maxRetries: maxRetries + 1,
              delayMs: delay
            });
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      const finalErrorMessage = lastError instanceof Error ? lastError.message : 'Unknown error';
      logger.error('Webhook test failed after all retries', finalErrorMessage);
      return ok(c, {
        success: false,
        error: finalErrorMessage
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Webhook test failed with error', errorMessage);
      return serverError(c, 'Failed to test webhook');
    }
  });

  app.post('/api/admin/webhooks/process', async (c) => {
    try {
      await WebhookService.processPendingDeliveries(c.env);
      return ok(c, { message: 'Pending webhook deliveries processed' });
    } catch (error) {
      logger.error('Failed to process webhook deliveries', error);
      return serverError(c, 'Failed to process webhook deliveries');
    }
  });

  app.get('/api/admin/webhooks/dead-letter-queue', async (c) => {
    try {
      const failedWebhooks = await DeadLetterQueueWebhookEntity.getAllFailed(c.env);
      return ok(c, failedWebhooks);
    } catch (error) {
      logger.error('Failed to get dead letter queue', error);
      return serverError(c, 'Failed to get dead letter queue');
    }
  });

  app.get('/api/admin/webhooks/dead-letter-queue/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const dlqEntry = await new DeadLetterQueueWebhookEntity(c.env, id).getState();

      if (!dlqEntry || dlqEntry.deletedAt) {
        return notFound(c, 'Dead letter queue entry not found');
      }

      return ok(c, dlqEntry);
    } catch (error) {
      logger.error('Failed to get dead letter queue entry', error);
      return serverError(c, 'Failed to get dead letter queue entry');
    }
  });

  app.delete('/api/admin/webhooks/dead-letter-queue/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const existing = await new DeadLetterQueueWebhookEntity(c.env, id).getState();

      if (!existing || existing.deletedAt) {
        return notFound(c, 'Dead letter queue entry not found');
      }

      const updated = {
        ...existing,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await new DeadLetterQueueWebhookEntity(c.env, id).save(updated);

      logger.info('Dead letter queue entry deleted', { id });

      return ok(c, { id, deleted: true });
    } catch (error) {
      logger.error('Failed to delete dead letter queue entry', error);
      return serverError(c, 'Failed to delete dead letter queue entry');
    }
  });
};