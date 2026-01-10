import { Hono } from 'hono';
import type { Env } from '../../core-utils';
import { ok, notFound, serverError } from '../../core-utils';
import { WebhookEventEntity, WebhookDeliveryEntity } from '../../entities';
import { logger } from '../../logger';
import type { Context } from 'hono';

export function webhookDeliveryRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/webhooks/:id/deliveries', async (c: Context) => {
    try {
      const id = c.req.param('id');
      const deliveries = await WebhookDeliveryEntity.getByWebhookConfigId(c.env, id);
      return ok(c, deliveries);
    } catch (error) {
      logger.error('Failed to get webhook deliveries', error);
      return serverError(c, 'Failed to get webhook deliveries');
    }
  });

  app.get('/api/webhooks/events', async (c: Context) => {
    try {
      const events = await WebhookEventEntity.list(c.env);
      return ok(c, events.items);
    } catch (error) {
      logger.error('Failed to list webhook events', error);
      return serverError(c, 'Failed to list webhook events');
    }
  });

  app.get('/api/webhooks/events/:id', async (c: Context) => {
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
}
