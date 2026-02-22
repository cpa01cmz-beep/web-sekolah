import { Hono } from 'hono';
import type { Env } from '../../core-utils';
import { ok, notFound } from '../../core-utils';
import { WebhookEventEntity, WebhookDeliveryEntity } from '../../entities';
import type { Context } from 'hono';
import { withErrorHandler, withAuth } from '../route-utils';

export function webhookDeliveryRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/webhooks/:id/deliveries', ...withAuth('admin'), withErrorHandler('get webhook deliveries')(async (c: Context) => {
    const id = c.req.param('id');
    const deliveries = await WebhookDeliveryEntity.getByWebhookConfigId(c.env, id);
    return ok(c, deliveries);
  }));

  app.get('/api/webhooks/events', ...withAuth('admin'), withErrorHandler('list webhook events')(async (c: Context) => {
    const events = await WebhookEventEntity.list(c.env);
    return ok(c, events.items);
  }));

  app.get('/api/webhooks/events/:id', ...withAuth('admin'), withErrorHandler('get webhook event')(async (c: Context) => {
    const id = c.req.param('id');
    const event = await new WebhookEventEntity(c.env, id).getState();

    if (!event || event.deletedAt) {
      return notFound(c, 'Webhook event not found');
    }

    const deliveries = await WebhookDeliveryEntity.getByEventId(c.env, id);

    return ok(c, { event, deliveries });
  }));
}
