// Making changes to this file is **STRICTLY** forbidden. Please add your routes in `userRoutes.ts` file.

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { userRoutes } from './user-routes';
import { authRoutes } from './auth-routes';
import { webhookRoutes } from './webhook-routes';
import { adminMonitoringRoutes } from './admin-monitoring-routes';
import { docsRoutes } from './docs-routes';
import { Env, GlobalDurableObject, ok, notFound, serverError, bad } from './core-utils';
import { logger as pinoLogger } from './logger';
import { defaultRateLimiter, strictRateLimiter } from './middleware/rate-limit';
import { defaultTimeout } from './middleware/timeout';
import { securityHeaders } from './middleware/security-headers';
import { responseErrorMonitoring } from './middleware/error-monitoring';
import { integrationMonitor } from './integration-monitor';
import { HttpStatusCode, TimeConstants } from './config/time';
import { DefaultOrigins } from './config/defaults';

// Need to export GlobalDurableObject to make it available in wrangler
export { GlobalDurableObject };
export interface ClientErrorReport {
    message: string;
    url: string;
    userAgent: string;
    timestamp: string;
    stack?: string;
    componentStack?: string;
    errorBoundary?: boolean;
    errorBoundaryProps?: Record<string, unknown>;
    source?: string;
    lineno?: number;
    colno?: number;
    error?: unknown;
  }
const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());

app.use('/api/*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || DefaultOrigins.LOCAL_DEV;
  const origin = c.req.header('Origin');
  
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.length > 0) {
    c.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', (TimeConstants.ONE_DAY_MS / 1000).toString());
  
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: HttpStatusCode.NO_CONTENT });
  }
  
  await next();
});

app.use('/api/*', async (c, next) => {
  c.header('X-Request-ID', crypto.randomUUID());
  await next();
});

app.use('/api/*', securityHeaders());

app.use('/api/*', defaultTimeout());

app.use('/api/*', responseErrorMonitoring());

app.use('/api/client-errors', strictRateLimiter());
app.use('/api/seed', strictRateLimiter());
app.use('/api/users', defaultRateLimiter());
app.use('/api/grades', defaultRateLimiter());
app.use('/api/students', defaultRateLimiter());
app.use('/api/teachers', defaultRateLimiter());
app.use('/api/classes', defaultRateLimiter());
app.use('/api/auth', strictRateLimiter());
app.use('/api/webhooks', defaultRateLimiter());
app.use('/api/admin/webhooks', strictRateLimiter());

authRoutes(app);
userRoutes(app);
webhookRoutes(app);
adminMonitoringRoutes(app);
docsRoutes(app);

app.get('/api/health', async (c) => {
  const metrics = integrationMonitor.getHealthMetrics();
  const webhookSuccessRate = integrationMonitor.getWebhookSuccessRate();
  const rateLimitBlockRate = integrationMonitor.getRateLimitBlockRate();

  return ok(c, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${(metrics.uptime / 1000).toFixed(2)}s`,
    systemHealth: {
      circuitBreaker: metrics.circuitBreaker?.isOpen ? 'OPEN (degraded)' : 'CLOSED (healthy)',
      webhook: webhookSuccessRate >= 95 ? 'healthy' : webhookSuccessRate >= 80 ? 'degraded' : 'unhealthy',
      rateLimiting: rateLimitBlockRate < 1 ? 'healthy' : rateLimitBlockRate < 5 ? 'elevated' : 'high',
    },
    webhook: {
      successRate: `${webhookSuccessRate.toFixed(2)}%`,
      totalDeliveries: metrics.webhook.totalDeliveries,
      successfulDeliveries: metrics.webhook.successfulDeliveries,
      failedDeliveries: metrics.webhook.failedDeliveries,
      pendingDeliveries: metrics.webhook.pendingDeliveries,
    },
    rateLimit: {
      blockRate: `${rateLimitBlockRate.toFixed(2)}%`,
      totalRequests: metrics.rateLimit.totalRequests,
      blockedRequests: metrics.rateLimit.blockedRequests,
      currentEntries: metrics.rateLimit.currentEntries,
    },
  });
});

app.post('/api/client-errors', async (c) => {
  try {
    const e = await c.req.json<ClientErrorReport>();
    if (!e.message) return bad(c, 'Missing required fields');
    pinoLogger.error('[CLIENT ERROR]', { errorReport: e });
    return ok(c, {});
  } catch (error) {
    pinoLogger.error('[CLIENT ERROR HANDLER] Failed', error);
    return serverError(c, 'Failed to process error report');
  }
});

app.notFound((c) => notFound(c));
app.onError((err, c) => { pinoLogger.error(`[ERROR] ${err}`); return serverError(c, err instanceof Error ? err.message : 'Internal Server Error'); });

pinoLogger.info('Server is running');

export default { fetch: app.fetch } satisfies ExportedHandler<Env>;