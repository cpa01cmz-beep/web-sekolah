import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cloudflareCache, publicCache, healthCheckCache } from '../cloudflare-cache';

describe('Cloudflare Cache Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  describe('cloudflareCache', () => {
    it('should set no-store by default', async () => {
      app.use('*', cloudflareCache());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(res.headers.get('CDN-Cache-Control')).toBe('no-store');
    });

    it('should set browser TTL with max-age', async () => {
      app.use('*', cloudflareCache({ browserTTL: 300 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('max-age=300');
    });

    it('should set CDN TTL', async () => {
      app.use('*', cloudflareCache({ cdnTTL: 3600 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('CDN-Cache-Control')).toBe('max-age=3600');
    });

    it('should set stale-while-revalidate', async () => {
      app.use('*', cloudflareCache({
        browserTTL: 60,
        staleWhileRevalidate: 300,
      }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toContain('max-age=60');
      expect(cacheControl).toContain('stale-while-revalidate=300');
    });

    it('should set all cache options together', async () => {
      app.use('*', cloudflareCache({
        browserTTL: 300,
        cdnTTL: 3600,
        staleWhileRevalidate: 86400,
      }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toContain('max-age=300');
      expect(cacheControl).toContain('stale-while-revalidate=86400');
      expect(res.headers.get('CDN-Cache-Control')).toBe('max-age=3600');
    });

    it('should add Vary header', async () => {
      app.use('*', cloudflareCache());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Vary')).toBe('Accept-Encoding, Origin');
    });
  });

  describe('publicCache', () => {
    it('should set appropriate public cache headers', async () => {
      app.use('*', publicCache());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toContain('max-age=300');
      expect(cacheControl).toContain('stale-while-revalidate=86400');
      expect(res.headers.get('CDN-Cache-Control')).toBe('max-age=3600');
    });
  });

  describe('healthCheckCache', () => {
    it('should set no-store for health check endpoints', async () => {
      app.use('*', healthCheckCache());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(res.headers.get('CDN-Cache-Control')).toBe('no-store');
    });
  });
});
