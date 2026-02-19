import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { serverTiming as serverTimingMiddleware, createServerTimingMiddleware } from '../server-timing';

describe('server-timing middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  it('should add Server-Timing header to responses', async () => {
    app.use('/api/*', serverTimingMiddleware());
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test');
    expect(res.status).toBe(200);
    expect(res.headers.has('Server-Timing')).toBe(true);
    const serverTimingHeader = res.headers.get('Server-Timing');
    expect(serverTimingHeader).toContain('total');
    expect(serverTimingHeader).toContain('dur=');
  });

  it('should add X-Request-Start header', async () => {
    app.use('/api/*', serverTimingMiddleware());
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test');
    expect(res.headers.has('X-Request-Start')).toBe(true);
    const requestStart = res.headers.get('X-Request-Start');
    expect(requestStart).toBeDefined();
    expect(Number(requestStart)).toBeGreaterThan(0);
  });

  it('should add X-Response-Time header', async () => {
    app.use('/api/*', serverTimingMiddleware());
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test');
    expect(res.headers.has('X-Response-Time')).toBe(true);
    const responseTime = res.headers.get('X-Response-Time');
    expect(responseTime).toMatch(/\d+\.\d+ms/);
  });

  it('should measure request processing time', async () => {
    app.use('/api/*', serverTimingMiddleware());
    app.get('/api/test', async () => {
      await new Promise((resolve) => setTimeout(resolve, 15));
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const res = await app.request('/api/test');
    const serverTimingHeader = res.headers.get('Server-Timing');
    const match = serverTimingHeader?.match(/dur=(\d+\.?\d*)/);
    expect(match).toBeTruthy();
    if (match) {
      const duration = parseFloat(match[1]);
      expect(duration).toBeGreaterThanOrEqual(5);
    }
  });

  it('should include description in Server-Timing header', async () => {
    app.use('/api/*', serverTimingMiddleware());
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test');
    const serverTimingHeader = res.headers.get('Server-Timing');
    expect(serverTimingHeader).toContain('desc=');
    expect(serverTimingHeader).toContain('Total request processing time');
  });

  it('should work with createServerTimingMiddleware factory', async () => {
    const middleware = createServerTimingMiddleware();
    app.use('/api/*', middleware);
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test');
    expect(res.headers.has('Server-Timing')).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    app.use('/api/*', serverTimingMiddleware());
    app.get('/api/test', () => {
      throw new Error('Test error');
    });
    app.onError((err, c) => c.json({ error: err.message }, 500));

    const res = await app.request('/api/test');
    expect(res.status).toBe(500);
    expect(res.headers.has('Server-Timing')).toBe(true);
  });
});
