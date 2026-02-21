import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { cloudflareCache, publicCache, healthCheckCache } from '../cloudflare-cache';

describe('Cloudflare Cache Middleware', () => {
  describe('cloudflareCache', () => {
    it('should set no-store Cache-Control when browserTTL is 0', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache({ browserTTL: 0 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('should set max-age Cache-Control when browserTTL is specified', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache({ browserTTL: 300 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('max-age=300');
    });

    it('should add stale-while-revalidate when specified', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache({ browserTTL: 300, staleWhileRevalidate: 86400 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('max-age=300, stale-while-revalidate=86400');
    });

    it('should set CDN-Cache-Control with max-age when cdnTTL is specified', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache({ cdnTTL: 3600 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('CDN-Cache-Control')).toBe('max-age=3600');
    });

    it('should set CDN-Cache-Control no-store when cdnTTL is 0', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache({ cdnTTL: 0 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('CDN-Cache-Control')).toBe('no-store');
    });

    it('should always set Vary header', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Vary')).toBe('Accept-Encoding, Origin');
    });

    it('should handle all options combined', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache({
        browserTTL: 300,
        cdnTTL: 3600,
        staleWhileRevalidate: 86400
      }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('max-age=300, stale-while-revalidate=86400');
      expect(res.headers.get('CDN-Cache-Control')).toBe('max-age=3600');
      expect(res.headers.get('Vary')).toBe('Accept-Encoding, Origin');
    });

    it('should use default values when no config provided', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(res.headers.get('CDN-Cache-Control')).toBe('no-store');
      expect(res.headers.get('Vary')).toBe('Accept-Encoding, Origin');
    });
  });

  describe('publicCache', () => {
    it('should set appropriate cache headers for public content', async () => {
      const app = new Hono();
      app.use('*', publicCache());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('max-age=300, stale-while-revalidate=86400');
      expect(res.headers.get('CDN-Cache-Control')).toBe('max-age=3600');
      expect(res.headers.get('Vary')).toBe('Accept-Encoding, Origin');
    });

    it('should allow 5-minute browser cache for public content', async () => {
      const app = new Hono();
      app.use('*', publicCache());
      app.get('/public/data', (c) => c.json({ data: 'public' }));

      const res = await app.request('/public/data');

      expect(res.headers.get('Cache-Control')).toContain('max-age=300');
    });

    it('should allow 1-hour CDN cache for public content', async () => {
      const app = new Hono();
      app.use('*', publicCache());
      app.get('/public/data', (c) => c.json({ data: 'public' }));

      const res = await app.request('/public/data');

      expect(res.headers.get('CDN-Cache-Control')).toBe('max-age=3600');
    });

    it('should allow stale-while-revalidate for 24 hours', async () => {
      const app = new Hono();
      app.use('*', publicCache());
      app.get('/public/data', (c) => c.json({ data: 'public' }));

      const res = await app.request('/public/data');

      expect(res.headers.get('Cache-Control')).toContain('stale-while-revalidate=86400');
    });
  });

  describe('healthCheckCache', () => {
    it('should set no-store headers for health check endpoints', async () => {
      const app = new Hono();
      app.use('*', healthCheckCache());
      app.get('/health', (c) => c.json({ status: 'healthy' }));

      const res = await app.request('/health');

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(res.headers.get('CDN-Cache-Control')).toBe('no-store');
    });

    it('should prevent any caching of health check responses', async () => {
      const app = new Hono();
      app.use('*', healthCheckCache());
      app.get('/api/health', (c) => c.json({ status: 'ok' }));

      const res = await app.request('/api/health');

      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(res.headers.get('CDN-Cache-Control')).toBe('no-store');
      expect(res.headers.get('Vary')).toBe('Accept-Encoding, Origin');
    });
  });

  describe('Cache header combinations', () => {
    it('should handle zero TTL values explicitly', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache({ browserTTL: 0, cdnTTL: 0, staleWhileRevalidate: 0 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(res.headers.get('CDN-Cache-Control')).toBe('no-store');
    });

    it('should allow stale-while-revalidate with no-store browser cache', async () => {
      const app = new Hono();
      app.use('*', cloudflareCache({ browserTTL: 0, staleWhileRevalidate: 60 }));
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.headers.get('Cache-Control')).toBe('no-store, stale-while-revalidate=60');
    });
  });
});
