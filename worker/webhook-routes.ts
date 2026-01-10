import { Hono } from 'hono';
import type { Env } from './core-utils';
import { webhookConfigRoutes, webhookDeliveryRoutes, webhookTestRoutes, webhookAdminRoutes } from './routes/webhooks';

export const webhookRoutes = (app: Hono<{ Bindings: Env }>) => {
  webhookConfigRoutes(app);
  webhookDeliveryRoutes(app);
  webhookTestRoutes(app);
  webhookAdminRoutes(app);
};
