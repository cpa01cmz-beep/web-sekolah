import { Hono } from 'hono';
import type { Env } from '../core-utils';
import { ok } from '../core-utils';
import { integrationMonitor } from '../integration-monitor';
import type { Context } from 'hono';

interface ReadinessCheck {
  name: string;
  healthy: boolean;
  latency?: number;
  error?: string;
}

async function performReadinessChecks(c: Context): Promise<ReadinessCheck[]> {
  const checks: ReadinessCheck[] = [];
  const metrics = integrationMonitor.getHealthMetrics();

  checks.push({
    name: 'circuitBreaker',
    healthy: !metrics.circuitBreaker?.isOpen,
  });

  const webhookSuccessRate = integrationMonitor.getWebhookSuccessRate();
  const hasWebhookActivity = metrics.webhook.totalDeliveries > 0;
  checks.push({
    name: 'webhook',
    healthy: !hasWebhookActivity || webhookSuccessRate >= 80,
  });

  const errorRatePerMinute = metrics.errors.errorRate.perMinute;
  checks.push({
    name: 'errorRate',
    healthy: errorRatePerMinute < 100,
  });

  return checks;
}

export function healthRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health/live', async (c: Context) => {
    return ok(c, {
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/health/ready', async (c: Context) => {
    const checks = await performReadinessChecks(c);
    const allHealthy = checks.every((check) => check.healthy);

    const response = {
      status: allHealthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: checks.reduce(
        (acc, check) => ({
          ...acc,
          [check.name]: {
            status: check.healthy ? 'healthy' : 'unhealthy',
            ...(check.latency !== undefined && { latencyMs: check.latency }),
            ...(check.error && { error: check.error }),
          },
        }),
        {}
      ),
    };

    if (!allHealthy) {
      return c.json(
        {
          success: false,
          error: 'Service not ready',
          code: 'SERVICE_UNAVAILABLE',
          data: response,
        },
        503
      );
    }

    return ok(c, response);
  });
}
