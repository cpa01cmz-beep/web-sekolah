// Making changes to this file is **STRICTLY** forbidden. Please add your routes in `userRoutes.ts` file.

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { userRoutes } from './user-routes';
import { Env, GlobalDurableObject, ok, notFound, serverError } from './core-utils';
import { defaultRateLimiter, strictRateLimiter } from './middleware/rate-limit';
import { defaultTimeout } from './middleware/timeout';

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

app.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'] }));

app.use('/api/*', async (c, next) => {
  c.header('X-Request-ID', crypto.randomUUID());
  await next();
});

app.use('/api/*', defaultTimeout());

app.use('/api/client-errors', strictRateLimiter());
app.use('/api/seed', strictRateLimiter());
app.use('/api/users', defaultRateLimiter());
app.use('/api/grades', defaultRateLimiter());
app.use('/api/students', defaultRateLimiter());
app.use('/api/teachers', defaultRateLimiter());
app.use('/api/classes', defaultRateLimiter());

userRoutes(app);

app.get('/api/health', (c) => ok(c, { status: 'healthy', timestamp: new Date().toISOString() }));

app.post('/api/client-errors', async (c) => {
  try {
    const e = await c.req.json<ClientErrorReport>();
    if (!e.message) return c.json({ success: false, error: 'Missing required fields', code: 'VALIDATION_ERROR' }, 400);
    console.error('[CLIENT ERROR]', JSON.stringify(e, null, 2));
    return c.json({ success: true });
  } catch (error) {
    console.error('[CLIENT ERROR HANDLER] Failed:', error);
    return serverError(c, 'Failed to process error report');
  }
});

app.notFound((c) => notFound(c));
app.onError((err, c) => { console.error(`[ERROR] ${err}`); return serverError(c, err instanceof Error ? err.message : 'Internal Server Error'); });

console.log(`Server is running`)

export default { fetch: app.fetch } satisfies ExportedHandler<Env>;