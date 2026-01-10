import { Hono } from 'hono';
import type { Env } from '../../core-utils';
import { ok, notFound, serverError } from '../../core-utils';
import { WebhookService } from '../../webhook-service';
import { DeadLetterQueueWebhookEntity } from '../../entities';
import { logger } from '../../logger';
import type { Context } from 'hono';

export function webhookAdminRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/admin/webhooks/process', async (c: Context) => {
    try {
      await WebhookService.processPendingDeliveries(c.env);
      return ok(c, { message: 'Pending webhook deliveries processed' });
    } catch (error) {
      logger.error('Failed to process webhook deliveries', error);
      return serverError(c, 'Failed to process webhook deliveries');
    }
  });

  app.get('/api/admin/webhooks/dead-letter-queue', async (c: Context) => {
    try {
      const failedWebhooks = await DeadLetterQueueWebhookEntity.getAllFailed(c.env);
      return ok(c, failedWebhooks);
    } catch (error) {
      logger.error('Failed to get dead letter queue', error);
      return serverError(c, 'Failed to get dead letter queue');
    }
  });

  app.get('/api/admin/webhooks/dead-letter-queue/:id', async (c: Context) => {
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

  app.delete('/api/admin/webhooks/dead-letter-queue/:id', async (c: Context) => {
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
}
