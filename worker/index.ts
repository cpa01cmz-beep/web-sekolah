// Making changes to this file is **STRICTLY** forbidden. Please add your routes in `userRoutes.ts` file.

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { userRoutes } from './user-routes';
import { authRoutes } from './auth-routes';
import { webhookRoutes } from './webhook-routes';
import { adminMonitoringRoutes } from './admin-monitoring-routes';
import { docsRoutes } from './docs-routes';
import { publicRoutes } from './routes/public-routes';
import { Env, GlobalDurableObject, ok, notFound, serverError } from './core-utils';
import { logger as pinoLogger } from './logger';
import { ClientErrorReport } from './types/index';
import { defaultRateLimiter, strictRateLimiter } from './middleware/rate-limit';
import { defaultTimeout } from './middleware/timeout';
import { securityHeaders } from './middleware/security-headers';
import { responseErrorMonitoring } from './middleware/error-monitoring';
import { cfContext } from './middleware/cf-context';
import { healthCheckCache } from './middleware/cloudflare-cache';
import { integrationMonitor } from './integration-monitor';
import { HttpStatusCode, TimeConstants } from './config/time';
import { DefaultOrigins } from './config/defaults';
import { handleScheduled } from './scheduled';
import { validateBody } from './middleware/validation';
import { clientErrorSchema, cspReportSchema } from './middleware/schemas';

// Need to export GlobalDurableObject to make it available in wrangler
export { GlobalDurableObject };

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());

app.use('/api/*', async (c, next) => {
  const allowedOrigins = (c.env.ALLOWED_ORIGINS?.split(',') || DefaultOrigins.LOCAL_DEV) as string[];
  const origin = c.req.header('Origin');

  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Max-Age', (TimeConstants.ONE_DAY_MS / 1000).toString());
    c.header('Access-Control-Expose-Headers', 'X-Request-ID, X-CF-Ray, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
    c.header('Vary', 'Origin');
  }
  
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: HttpStatusCode.NO_CONTENT });
  }
  
  await next();
});

app.use('/api/*', async (c, next) => {
  const requestId = c.req.header('cf-request-id') || c.req.header('X-Request-ID') || crypto.randomUUID();
  c.header('X-Request-ID', requestId);
  await next();
});

app.use('/api/*', cfContext());

app.use('/api/*', securityHeaders());

app.use('/api/*', defaultTimeout());

app.use('/api/*', responseErrorMonitoring());

app.use('/api/client-errors', strictRateLimiter());
app.use('/api/seed', strictRateLimiter());
app.use('/api/public/seed', strictRateLimiter());
app.use('/api/public', defaultRateLimiter());
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
publicRoutes(app);

app.get('/api/health', healthCheckCache(), async (c) => {
  const metrics = integrationMonitor.getHealthMetrics();
  const webhookSuccessRate = integrationMonitor.getWebhookSuccessRate();
  const rateLimitBlockRate = integrationMonitor.getRateLimitBlockRate();
  const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();

  return ok(c, {
    status: 'healthy',
    requestId,
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
    errors: {
      totalErrors: metrics.errors.totalErrors,
      errorRate: {
        perMinute: metrics.errors.errorRate.perMinute,
        perHour: metrics.errors.errorRate.perHour,
      },
      errorsByCode: metrics.errors.errorsByCode,
    },
  });
});

app.post('/api/client-errors', validateBody(clientErrorSchema), async (c) => {
  try {
    const e = c.get('validatedBody') as ClientErrorReport;
    pinoLogger.error('[CLIENT ERROR]', { errorReport: e });
    return ok(c, {});
  } catch (error) {
    pinoLogger.error('[CLIENT ERROR HANDLER] Failed', error);
    return serverError(c, 'Failed to process error report');
  }
});

app.post('/api/csp-report', async (c) => {
  try {
    const body = await c.req.json();
    const result = cspReportSchema.safeParse(body);
    if (result.success) {
      const violation = result.data['csp-report'];
      pinoLogger.warn('[CSP VIOLATION]', { violation });
    } else {
      pinoLogger.warn('[CSP VIOLATION] Invalid report format');
    }
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
});

app.notFound((c) => notFound(c));
app.onError((err, c) => { pinoLogger.error(`[ERROR] ${err}`); return serverError(c, err instanceof Error ? err.message : 'Internal Server Error'); });

pinoLogger.info('Server is running');

export default {
  fetch: app.fetch,
  scheduled: (controller: ScheduledController, env: Env) => {
    return handleScheduled(controller, env);
  },
} satisfies ExportedHandler<Env>;
