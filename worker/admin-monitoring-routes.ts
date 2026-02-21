import { Hono } from 'hono';
import { Env, ok } from './core-utils';
import { integrationMonitor } from './integration-monitor';
import { authenticate, authorize } from './middleware/auth';
import { strictRateLimiter } from './middleware/rate-limit';
import { logger } from './logger';
import type { WebhookDelivery } from '@shared/types';
import { WebhookEventEntity, WebhookDeliveryEntity, WebhookConfigEntity } from './entities';
import { withErrorHandler } from './routes/route-utils';
import type { Context } from 'hono';

export function adminMonitoringRoutes(app: Hono<{ Bindings: Env }>) {
  const adminRouter = new Hono<{ Bindings: Env }>();

  adminRouter.use('*', authenticate());
  adminRouter.use('*', authorize('admin'));
  adminRouter.use('*', strictRateLimiter());

  adminRouter.get(
    '/health',
    withErrorHandler('retrieve health metrics')(async (c: Context) => {
      const metrics = integrationMonitor.getHealthMetrics();

      return ok(c, {
        status: 'healthy',
        metrics,
      });
    })
  );

  adminRouter.get(
    '/circuit-breaker',
    withErrorHandler('retrieve circuit breaker state')(async (c: Context) => {
      const metrics = integrationMonitor.getHealthMetrics();

      if (!metrics.circuitBreaker) {
        return ok(c, {
          message: 'Circuit breaker state not available (client-side only)',
        });
      }

      return ok(c, {
        circuitBreaker: metrics.circuitBreaker,
      });
    })
  );

  adminRouter.post(
    '/circuit-breaker/reset',
    withErrorHandler('request circuit breaker reset')(async (c: Context) => {
      return ok(c, {
        message:
          'Circuit breaker reset requested. This action must be performed on the client side.',
        action: 'Call resetCircuitBreaker() from client-side api-client module',
      });
    })
  );

  adminRouter.get(
    '/rate-limit',
    withErrorHandler('retrieve rate limit stats')(async (c: Context) => {
      const metrics = integrationMonitor.getHealthMetrics();
      const blockRate = integrationMonitor.getRateLimitBlockRate();

      return ok(c, {
        stats: metrics.rateLimit,
        blockRate: `${blockRate.toFixed(2)}%`,
      });
    })
  );

  adminRouter.get(
    '/webhooks',
    withErrorHandler('retrieve webhook stats')(async (c: Context) => {
      const metrics = integrationMonitor.getHealthMetrics();
      const successRate = integrationMonitor.getWebhookSuccessRate();

      return ok(c, {
        stats: metrics.webhook,
        successRate: `${successRate.toFixed(2)}%`,
      });
    })
  );

  adminRouter.get(
    '/webhooks/deliveries',
    withErrorHandler('retrieve webhook deliveries')(async (c: Context) => {
      const pendingDeliveries = await WebhookDeliveryEntity.getPendingRetries(c.env);
      const recentDeliveries = await WebhookDeliveryEntity.getRecentDeliveries(c.env, 10);

      return ok(c, {
        pending: pendingDeliveries.map((d: WebhookDelivery) => ({
          id: d.id,
          webhookConfigId: d.webhookConfigId,
          attempts: d.attempts,
          nextAttemptAt: d.nextAttemptAt,
        })),
        total: recentDeliveries.length,
        recent: recentDeliveries,
      });
    })
  );

  adminRouter.get(
    '/errors',
    withErrorHandler('retrieve error stats')(async (c: Context) => {
      const metrics = integrationMonitor.getHealthMetrics();

      return ok(c, {
        totalErrors: metrics.errors.totalErrors,
        errorsByCode: metrics.errors.errorsByCode,
        errorsByStatus: metrics.errors.errorsByStatus,
        recentErrors: metrics.errors.recentErrors,
      });
    })
  );

  adminRouter.get(
    '/summary',
    withErrorHandler('retrieve integration summary')(async (c: Context) => {
      const metrics = integrationMonitor.getHealthMetrics();
      const webhookSuccessRate = integrationMonitor.getWebhookSuccessRate();
      const rateLimitBlockRate = integrationMonitor.getRateLimitBlockRate();

      return ok(c, {
        timestamp: metrics.timestamp,
        uptime: `${(metrics.uptime / 1000).toFixed(2)}s`,
        systemHealth: {
          circuitBreaker: metrics.circuitBreaker?.isOpen ? 'OPEN (degraded)' : 'CLOSED (healthy)',
          webhook:
            webhookSuccessRate >= 95
              ? 'healthy'
              : webhookSuccessRate >= 80
                ? 'degraded'
                : 'unhealthy',
          rateLimiting:
            rateLimitBlockRate < 1 ? 'healthy' : rateLimitBlockRate < 5 ? 'elevated' : 'high',
        },
        circuitBreaker: metrics.circuitBreaker,
        rateLimit: {
          ...metrics.rateLimit,
          blockRate: `${rateLimitBlockRate.toFixed(2)}%`,
        },
        webhook: {
          ...metrics.webhook,
          successRate: `${webhookSuccessRate.toFixed(2)}%`,
        },
        errors: {
          total: metrics.errors.totalErrors,
          byCode: metrics.errors.errorsByCode,
          byStatus: metrics.errors.errorsByStatus,
        },
      });
    })
  );

  adminRouter.post(
    '/reset-monitor',
    withErrorHandler('reset integration monitor')(async (c: Context) => {
      integrationMonitor.reset();
      logger.info('Integration monitor reset by admin');

      return ok(c, {
        message: 'Integration monitor reset successfully',
      });
    })
  );

  app.route('/api/admin/monitoring', adminRouter);
}
