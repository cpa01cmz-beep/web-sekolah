import { Hono } from 'hono'
import type { Env } from './core-utils'
import {
  webhookConfigRoutes,
  webhookDeliveryRoutes,
  webhookTestRoutes,
  webhookAdminRoutes,
} from './routes/webhooks'
import { strictRateLimiter } from './middleware/rate-limit'

export const webhookRoutes = (app: Hono<{ Bindings: Env }>) => {
  app.use('/api/webhooks', strictRateLimiter())
  app.use('/api/webhooks/test', strictRateLimiter())

  webhookConfigRoutes(app)
  webhookDeliveryRoutes(app)
  webhookTestRoutes(app)
  webhookAdminRoutes(app)
}
