import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cfContext, getCloudflareContext } from '../cf-context';

describe('cf-context middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  it('should extract Cloudflare headers from request', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => {
      const ctx = getCloudflareContext(c);
      return c.json({ ctx });
    });

    const res = await app.request('/api/test', {
      headers: {
        'cf-ray': 'abc123',
        'cf-connecting-ip': '1.2.3.4',
        'cf-ipcountry': 'US',
      },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ctx.rayId).toBe('abc123');
    expect(body.ctx.connectingIp).toBe('1.2.3.4');
    expect(body.ctx.country).toBe('US');
  });

  it('should handle missing Cloudflare headers gracefully', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => {
      const ctx = getCloudflareContext(c);
      return c.json({ ctx });
    });

    const res = await app.request('/api/test');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ctx.rayId).toBeUndefined();
    expect(body.ctx.connectingIp).toBeUndefined();
  });

  it('should set CF-Ray response header if present', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test', {
      headers: { 'cf-ray': 'xyz789' },
    });

    expect(res.headers.get('CF-Ray')).toBe('xyz789');
  });

  it('should not set CF-Ray header if not present', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test');
    expect(res.headers.get('CF-Ray')).toBeNull();
  });

  it('should return undefined when context not set', async () => {
    app.get('/api/test', (c) => {
      const ctx = getCloudflareContext(c);
      return c.json({ ctx });
    });

    const res = await app.request('/api/test');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ctx).toBeUndefined();
  });
});
