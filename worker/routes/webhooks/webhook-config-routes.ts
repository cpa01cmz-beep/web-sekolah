import { Hono } from 'hono';
import type { Env } from '../../core-utils';
import { ok, bad, notFound, serverError } from '../../core-utils';
import { WebhookConfigEntity } from '../../entities';
import { logger } from '../../logger';
import type { Context } from 'hono';

export function webhookConfigRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/webhooks', async (c: Context) => {
    try {
      const configs = await WebhookConfigEntity.list(c.env);
      return ok(c, configs.items);
    } catch (error) {
      logger.error('Failed to list webhooks', error);
      return serverError(c, 'Failed to list webhooks');
    }
  });

  app.get('/api/webhooks/:id', async (c: Context) => {
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

  app.post('/api/webhooks', async (c: Context) => {
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

  app.put('/api/webhooks/:id', async (c: Context) => {
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

  app.delete('/api/webhooks/:id', async (c: Context) => {
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
}
