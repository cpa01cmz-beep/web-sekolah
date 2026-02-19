import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { 
  cacheControl as cacheControlMiddleware, 
  noCacheMiddleware, 
  shortCacheMiddleware, 
  publicCacheMiddleware 
} from '../cache-control';

describe('cache-control middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  describe('cacheControlMiddleware', () => {
    it('should add Cache-Control header with default settings', async () => {
      app.use('/api/*', cacheControlMiddleware());
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      expect(res.headers.has('Cache-Control')).toBe(true);
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toContain('no-store');
      expect(cacheControlHeader).toContain('no-cache');
      expect(cacheControlHeader).toContain('must-revalidate');
    });

    it('should add no-store directive', async () => {
      app.use('/api/*', cacheControlMiddleware({ noStore: true }));
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toBe('no-store');
    });

    it('should add max-age directive', async () => {
      app.use('/api/*', cacheControlMiddleware({ maxAge: 300 }));
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toBe('max-age=300');
    });

    it('should add s-maxage directive', async () => {
      app.use('/api/*', cacheControlMiddleware({ sMaxAge: 600 }));
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toBe('s-maxage=600');
    });

    it('should add private directive', async () => {
      app.use('/api/*', cacheControlMiddleware({ private: true }));
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toBe('private');
    });

    it('should add stale-while-revalidate directive', async () => {
      app.use('/api/*', cacheControlMiddleware({ staleWhileRevalidate: 3600 }));
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toBe('stale-while-revalidate=3600');
    });

    it('should combine multiple directives', async () => {
      app.use('/api/*', cacheControlMiddleware({
        maxAge: 60,
        staleWhileRevalidate: 300,
      }));
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toBe('max-age=60, stale-while-revalidate=300');
    });

    it('should not override existing Cache-Control header', async () => {
      app.use('/api/*', cacheControlMiddleware({ noStore: true }));
      app.get('/api/test', (c) => {
        c.header('Cache-Control', 'custom-cache-control');
        return c.json({ success: true });
      });

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toBe('custom-cache-control');
    });
  });

  describe('noCacheMiddleware', () => {
    it('should prevent caching', async () => {
      app.use('/api/*', noCacheMiddleware);
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toContain('no-store');
      expect(cacheControlHeader).toContain('no-cache');
      expect(cacheControlHeader).toContain('must-revalidate');
    });
  });

  describe('shortCacheMiddleware', () => {
    it('should enable short-term caching', async () => {
      app.use('/api/*', shortCacheMiddleware);
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toContain('max-age=60');
      expect(cacheControlHeader).toContain('stale-while-revalidate=300');
    });
  });

  describe('publicCacheMiddleware', () => {
    it('should enable public caching', async () => {
      app.use('/api/*', publicCacheMiddleware);
      app.get('/api/test', (c) => c.json({ success: true }));

      const res = await app.request('/api/test');
      const cacheControlHeader = res.headers.get('Cache-Control');
      expect(cacheControlHeader).toContain('max-age=300');
      expect(cacheControlHeader).toContain('s-maxage=600');
      expect(cacheControlHeader).toContain('stale-while-revalidate=3600');
    });
  });
});
