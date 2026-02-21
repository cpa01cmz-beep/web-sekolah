import { Hono } from 'hono';
import type { Env } from '../../core-utils';
import { ok, notFound } from '../../core-utils';
import { WebhookService } from '../../webhook-service';
import { DeadLetterQueueWebhookEntity } from '../../entities';
import { logger } from '../../logger';
import type { Context } from 'hono';
import { withErrorHandler } from '../route-utils';

export function webhookAdminRoutes(app: Hono<{ Bindings: Env }>) {
  app.post(
    '/api/admin/webhooks/process',
    withErrorHandler('process webhook deliveries')(async (c: Context) => {
      await WebhookService.processPendingDeliveries(c.env);
      logger.info('Webhook deliveries processed', { timestamp: new Date().toISOString() });
      return ok(c, { message: 'Pending webhook deliveries processed' });
    })
  );

  app.get(
    '/api/admin/webhooks/dead-letter-queue',
    withErrorHandler('get dead letter queue')(async (c: Context) => {
      const failedWebhooks = await DeadLetterQueueWebhookEntity.getAllFailed(c.env);
      return ok(c, failedWebhooks);
    })
  );

  app.get(
    '/api/admin/webhooks/dead-letter-queue/:id',
    withErrorHandler('get dead letter queue entry')(async (c: Context) => {
      const id = c.req.param('id');
      const dlqEntry = await new DeadLetterQueueWebhookEntity(c.env, id).getState();

      if (!dlqEntry || dlqEntry.deletedAt) {
        return notFound(c, 'Dead letter queue entry not found');
      }

      return ok(c, dlqEntry);
    })
  );

  app.delete(
    '/api/admin/webhooks/dead-letter-queue/:id',
    withErrorHandler('delete dead letter queue entry')(async (c: Context) => {
      const id = c.req.param('id');
      const existing = await new DeadLetterQueueWebhookEntity(c.env, id).getState();

      if (!existing || existing.deletedAt) {
        return notFound(c, 'Dead letter queue entry not found');
      }

      await DeadLetterQueueWebhookEntity.delete(c.env, id);

      logger.info('Dead letter queue entry deleted', { id });

      return ok(c, { id, deleted: true });
    })
  );
}
