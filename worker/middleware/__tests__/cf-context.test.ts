import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cfContext, getCfContext, getClientIp } from '../cf-context';

describe('Cloudflare Context Middleware', () => {
  describe('cfContext', () => {
    it('should extract cf-connecting-ip header', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => {
        const ctx = getCfContext(c);
        return c.json({ ip: ctx?.ip });
      });

      const res = await app.request('/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ip).toBe('192.168.1.1');
    });

    it('should extract cf-ray header', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => {
        const ctx = getCfContext(c);
        return c.json({ ray: ctx?.ray });
      });

      const res = await app.request('/test', {
        headers: { 'cf-ray': 'abc123-XYZ' },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ray).toBe('abc123-XYZ');
    });

    it('should extract cf-ipcountry header', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => {
        const ctx = getCfContext(c);
        return c.json({ country: ctx?.country });
      });

      const res = await app.request('/test', {
        headers: { 'cf-ipcountry': 'US' },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.country).toBe('US');
    });

    it('should fallback to x-real-ip when cf-connecting-ip is not present', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => {
        const ctx = getCfContext(c);
        return c.json({ ip: ctx?.ip });
      });

      const res = await app.request('/test', {
        headers: { 'x-real-ip': '10.0.0.1' },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ip).toBe('10.0.0.1');
    });

    it('should fallback to x-forwarded-for when other headers are not present', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => {
        const ctx = getCfContext(c);
        return c.json({ ip: ctx?.ip });
      });

      const res = await app.request('/test', {
        headers: { 'x-forwarded-for': '172.16.0.1, 192.168.0.1' },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ip).toBe('172.16.0.1');
    });

    it('should return unknown when no IP headers are present', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => {
        const ctx = getCfContext(c);
        return c.json({ ip: ctx?.ip });
      });

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ip).toBe('unknown');
    });

    it('should add Server-Timing header with request duration', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      const serverTiming = res.headers.get('Server-Timing');
      expect(serverTiming).toMatch(/total;dur=\d+/);
    });

    it('should add X-CF-Ray response header when present', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test', {
        headers: { 'cf-ray': 'test-ray-123' },
      });

      expect(res.headers.get('X-CF-Ray')).toBe('test-ray-123');
    });

    it('should add X-CF-Country response header when present', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test', {
        headers: { 'cf-ipcountry': 'ID' },
      });

      expect(res.headers.get('X-CF-Country')).toBe('ID');
    });

    it('should not add X-CF-Ray when not present', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.headers.get('X-CF-Ray')).toBeNull();
    });
  });

  describe('getClientIp', () => {
    it('should return client IP from context', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => {
        return c.json({ ip: getClientIp(c) });
      });

      const res = await app.request('/test', {
        headers: { 'cf-connecting-ip': '203.0.113.50' },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ip).toBe('203.0.113.50');
    });

    it('should return unknown when context is not set', () => {
      const app = new Hono();
      app.get('/test', (c) => {
        return c.json({ ip: getClientIp(c) });
      });

      const result = getClientIp({ get: () => undefined } as any);
      expect(result).toBe('unknown');
    });
  });

  describe('getCfContext', () => {
    it('should return undefined when context is not set', () => {
      const result = getCfContext({ get: () => undefined } as any);
      expect(result).toBeUndefined();
    });

    it('should return full context when set', async () => {
      const app = new Hono();
      app.use('*', cfContext());
      app.get('/test', (c) => {
        const ctx = getCfContext(c);
        return c.json({
          ip: ctx?.ip,
          ray: ctx?.ray,
          country: ctx?.country,
          city: ctx?.city,
          timezone: ctx?.timezone,
        });
      });

      const res = await app.request('/test', {
        headers: {
          'cf-connecting-ip': '1.2.3.4',
          'cf-ray': 'ray-id',
          'cf-ipcountry': 'SG',
          'cf-ipcity': 'Singapore',
          'cf-timezone': 'Asia/Singapore',
        },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ip).toBe('1.2.3.4');
      expect(body.ray).toBe('ray-id');
      expect(body.country).toBe('SG');
      expect(body.city).toBe('Singapore');
      expect(body.timezone).toBe('Asia/Singapore');
    });
  });
});
