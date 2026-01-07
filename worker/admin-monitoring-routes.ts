import { Hono } from 'hono';
import { Env, ok, serverError } from './core-utils';
import { integrationMonitor } from './integration-monitor';
import { authenticate, authorize } from './middleware/auth';
import { strictRateLimiter } from './middleware/rate-limit';
import { logger } from './logger';
import { WebhookEventEntity, WebhookDeliveryEntity, WebhookConfigEntity } from './entities';

export function adminMonitoringRoutes(app: Hono<{ Bindings: Env }>) {
  const adminRouter = new Hono<{ Bindings: Env }>();

  adminRouter.use('*', authenticate());
  adminRouter.use('*', authorize('admin'));
  adminRouter.use('*', strictRateLimiter());

  adminRouter.get('/health', async (c) => {
    try {
      const metrics = integrationMonitor.getHealthMetrics();

      return ok(c, {
        status: 'healthy',
        metrics,
      });
    } catch (error) {
      logger.error('Failed to get health metrics', error);
      return serverError(c, 'Failed to retrieve health metrics');
    }
  });

  adminRouter.get('/circuit-breaker', async (c) => {
    try {
      const metrics = integrationMonitor.getHealthMetrics();

      if (!metrics.circuitBreaker) {
        return ok(c, {
          message: 'Circuit breaker state not available (client-side only)',
        });
      }

      return ok(c, {
        circuitBreaker: metrics.circuitBreaker,
      });
    } catch (error) {
      logger.error('Failed to get circuit breaker state', error);
      return serverError(c, 'Failed to retrieve circuit breaker state');
    }
  });

  adminRouter.post('/circuit-breaker/reset', async (c) => {
    try {
      return ok(c, {
        message: 'Circuit breaker reset requested. This action must be performed on the client side.',
        action: 'Call resetCircuitBreaker() from client-side api-client module',
      });
    } catch (error) {
      logger.error('Failed to request circuit breaker reset', error);
      return serverError(c, 'Failed to request circuit breaker reset');
    }
  });

  adminRouter.get('/rate-limit', async (c) => {
    try {
      const metrics = integrationMonitor.getHealthMetrics();
      const blockRate = integrationMonitor.getRateLimitBlockRate();

      return ok(c, {
        stats: metrics.rateLimit,
        blockRate: `${blockRate.toFixed(2)}%`,
      });
    } catch (error) {
      logger.error('Failed to get rate limit stats', error);
      return serverError(c, 'Failed to retrieve rate limit stats');
    }
  });

  adminRouter.get('/webhooks', async (c) => {
    try {
      const metrics = integrationMonitor.getHealthMetrics();
      const successRate = integrationMonitor.getWebhookSuccessRate();

      return ok(c, {
        stats: metrics.webhook,
        successRate: `${successRate.toFixed(2)}%`,
      });
    } catch (error) {
      logger.error('Failed to get webhook stats', error);
      return serverError(c, 'Failed to retrieve webhook stats');
    }
  });

  adminRouter.get('/webhooks/deliveries', async (c) => {
    try {
      const pendingDeliveries = await WebhookDeliveryEntity.getPendingRetries(c.env);
      const recentDeliveries = await WebhookDeliveryEntity.list(c.env);

      return ok(c, {
        pending: pendingDeliveries.map((d: any) => ({
          id: d.id,
          webhookConfigId: d.webhookConfigId,
          attempts: d.attempts,
          nextAttemptAt: d.nextAttemptAt,
        })),
        total: recentDeliveries.items.length,
        recent: recentDeliveries.items.slice(-10),
      });
    } catch (error) {
      logger.error('Failed to get webhook deliveries', error);
      return serverError(c, 'Failed to retrieve webhook deliveries');
    }
  });

  adminRouter.get('/errors', async (c) => {
    try {
      const metrics = integrationMonitor.getHealthMetrics();

      return ok(c, {
        totalErrors: metrics.errors.totalErrors,
        errorsByCode: metrics.errors.errorsByCode,
        errorsByStatus: metrics.errors.errorsByStatus,
        recentErrors: metrics.errors.recentErrors,
      });
    } catch (error) {
      logger.error('Failed to get error stats', error);
      return serverError(c, 'Failed to retrieve error stats');
    }
  });

  adminRouter.get('/summary', async (c) => {
    try {
      const metrics = integrationMonitor.getHealthMetrics();
      const webhookSuccessRate = integrationMonitor.getWebhookSuccessRate();
      const rateLimitBlockRate = integrationMonitor.getRateLimitBlockRate();

      return ok(c, {
        timestamp: metrics.timestamp,
        uptime: `${(metrics.uptime / 1000).toFixed(2)}s`,
        systemHealth: {
          circuitBreaker: metrics.circuitBreaker?.isOpen ? 'OPEN (degraded)' : 'CLOSED (healthy)',
          webhook: webhookSuccessRate >= 95 ? 'healthy' : webhookSuccessRate >= 80 ? 'degraded' : 'unhealthy',
          rateLimiting: rateLimitBlockRate < 1 ? 'healthy' : rateLimitBlockRate < 5 ? 'elevated' : 'high',
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
    } catch (error) {
      logger.error('Failed to get integration summary', error);
      return serverError(c, 'Failed to retrieve integration summary');
    }
  });

  adminRouter.post('/reset-monitor', async (c) => {
    try {
      integrationMonitor.reset();
      logger.info('Integration monitor reset by admin');

      return ok(c, {
        message: 'Integration monitor reset successfully',
      });
    } catch (error) {
      logger.error('Failed to reset monitor', error);
      return serverError(c, 'Failed to reset integration monitor');
    }
  });

  app.route('/api/admin/monitoring', adminRouter);
}
