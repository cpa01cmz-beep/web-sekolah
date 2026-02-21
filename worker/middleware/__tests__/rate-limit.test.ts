import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import {
  rateLimit,
  createRateLimiter,
  defaultRateLimiter,
  strictRateLimiter,
  looseRateLimiter,
  authRateLimiter,
  clearRateLimitStore,
  getRateLimitStore,
  type RateLimitMiddlewareOptions,
} from '../rate-limit';

describe('Rate Limiting Middleware', () => {
  let app: Hono;
  let requestCount = 0;

  beforeEach(() => {
    clearRateLimitStore();
    requestCount = 0;
    app = new Hono();
  });

  describe('Basic rate limiting', () => {
    it('should allow requests within limit', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 5, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      for (let i = 0; i < 5; i++) {
        const res = await app.request('/test');
        expect(res.status).toBe(200);
        const data = (await res.json()) as { success: boolean };
        expect(data.success).toBe(true);
      }
    });

    it('should block requests exceeding limit', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 3, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        const res = await app.request('/test');
        expect(res.status).toBe(200);
      }

      // 4th request should be blocked
      const blockedRes = await app.request('/test');
      expect(blockedRes.status).toBe(429);
      const data = (await blockedRes.json()) as { success: boolean; code: string };
      expect(data.success).toBe(false);
      expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should return proper error headers when limit exceeded', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 2, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      // Exhaust limit
      await app.request('/test');
      await app.request('/test');

      const blockedRes = await app.request('/test');
      expect(blockedRes.headers.get('Retry-After')).toBeTruthy();
      expect(blockedRes.headers.get('Retry-After')).toMatch(/^\d+$/);
    });
  });

  describe('Rate limit headers', () => {
    it('should include standard headers by default', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 10, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('9');
      expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should decrease remaining count with each request', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 5, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      const res1 = await app.request('/test');
      expect(res1.headers.get('X-RateLimit-Remaining')).toBe('4');

      const res2 = await app.request('/test');
      expect(res2.headers.get('X-RateLimit-Remaining')).toBe('3');
    });

    it('should allow disabling standard headers', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 10, windowMs: 60000 })({
        standardHeaders: false,
      });
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');

      expect(res.headers.get('X-RateLimit-Limit')).toBeNull();
      expect(res.headers.get('X-RateLimit-Remaining')).toBeNull();
      expect(res.headers.get('X-RateLimit-Reset')).toBeNull();
    });

    it('should set remaining to 0 when limit exceeded', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 1, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      await app.request('/test');
      const blockedRes = await app.request('/test');

      expect(blockedRes.headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('Custom key generation', () => {
    it('should use custom key generator when provided', async () => {
      const customKeyGenerator = (c: any) => `custom:${c.req.header('X-Custom-Id')}`;
      const limitMiddleware = createRateLimiter({ maxRequests: 2, windowMs: 60000 })({
        keyGenerator: customKeyGenerator,
      });
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      // User A makes 2 requests
      const res1 = await app.request('/test', { headers: { 'X-Custom-Id': 'user-a' } });
      expect(res1.status).toBe(200);
      const res2 = await app.request('/test', { headers: { 'X-Custom-Id': 'user-a' } });
      expect(res2.status).toBe(200);
      const res3 = await app.request('/test', { headers: { 'X-Custom-Id': 'user-a' } });
      expect(res3.status).toBe(429);

      // User B should still be allowed (different key)
      const res4 = await app.request('/test', { headers: { 'X-Custom-Id': 'user-b' } });
      expect(res4.status).toBe(200);
    });
  });

  describe('Skip options', () => {
    it('should skip counting successful requests when enabled', async () => {
      const limitMiddleware = createRateLimiter({
        maxRequests: 2,
        windowMs: 60000,
        skipSuccessfulRequests: true,
      })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      // All successful requests should not count
      for (let i = 0; i < 5; i++) {
        const res = await app.request('/test');
        expect(res.status).toBe(200);
      }
    });

    it('should skip counting failed requests when enabled', async () => {
      const limitMiddleware = createRateLimiter({
        maxRequests: 2,
        windowMs: 60000,
        skipFailedRequests: true,
      })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => {
        return c.json({ success: false }, 400);
      });

      // All failed requests should not count
      for (let i = 0; i < 5; i++) {
        const res = await app.request('/test');
        expect(res.status).toBe(400);
      }
    });
  });

  describe('Custom handler', () => {
    it('should use custom handler when provided', async () => {
      const customHandler = vi.fn((c: any, info: any) => {
        return c.json(
          {
            error: 'Custom rate limit message',
            limit: info.limit,
            remaining: info.remaining,
          },
          429
        );
      });

      const limitMiddleware = createRateLimiter({ maxRequests: 1, windowMs: 60000 })({
        handler: customHandler,
      });
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      await app.request('/test');
      const blockedRes = await app.request('/test');

      expect(customHandler).toHaveBeenCalled();
      expect(blockedRes.status).toBe(429);
      const data = (await blockedRes.json()) as { error: string; limit: number; remaining: number };
      expect(data.error).toBe('Custom rate limit message');
      expect(data.limit).toBe(1);
      expect(data.remaining).toBe(0);
    });
  });

  describe('onLimitReached callback', () => {
    it('should call onLimitReached callback when limit exceeded', async () => {
      const onLimitReached = vi.fn();

      const limitMiddleware = createRateLimiter({
        maxRequests: 1,
        windowMs: 60000,
      })({ onLimitReached });
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      await app.request('/test');
      expect(onLimitReached).not.toHaveBeenCalled();

      await app.request('/test');
      expect(onLimitReached).toHaveBeenCalledTimes(1);
    });
  });

  describe('Predefined limiters', () => {
    it('should use default rate limiter', async () => {
      app.use('*', defaultRateLimiter());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('100');
    });

    it('should use strict rate limiter', async () => {
      app.use('*', strictRateLimiter());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('50');
    });

    it('should use loose rate limiter', async () => {
      app.use('*', looseRateLimiter());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('1000');
    });

    it('should use auth rate limiter', async () => {
      app.use('*', authRateLimiter());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    });
  });

  describe('Store management', () => {
    it('should clear rate limit store', () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 1, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      app.request('/test');
      expect(getRateLimitStore().size).toBeGreaterThan(0);

      clearRateLimitStore();
      expect(getRateLimitStore().size).toBe(0);
    });

    it('should return rate limit store', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 5, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      await app.request('/test');
      const store = getRateLimitStore();

      expect(store).toBeInstanceOf(Map);
      expect(store.size).toBeGreaterThan(0);
    });
  });

  describe('Window reset', () => {
    it('should reset count after window expires', async () => {
      vi.useFakeTimers();
      const limitMiddleware = createRateLimiter({ maxRequests: 2, windowMs: 1000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      // Exhaust limit
      const res1 = await app.request('/test');
      expect(res1.status).toBe(200);
      const res2 = await app.request('/test');
      expect(res2.status).toBe(200);
      const res3 = await app.request('/test');
      expect(res3.status).toBe(429);

      // Advance past window
      vi.advanceTimersByTime(1100);

      // Should be able to make requests again
      const res4 = await app.request('/test');
      expect(res4.status).toBe(200);

      vi.useRealTimers();
    });
  });

  describe('Different paths', () => {
    it('should rate limit separately per path', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 2, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/path1', (c) => c.json({ success: true }));
      app.get('/path2', (c) => c.json({ success: true }));

      // Exhaust path1
      await app.request('/path1');
      await app.request('/path1');
      const blockedRes1 = await app.request('/path1');
      expect(blockedRes1.status).toBe(429);

      // path2 should still work
      const res1 = await app.request('/path2');
      expect(res1.status).toBe(200);
    });
  });

  describe('IP-based limiting', () => {
    it('should limit by IP address', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 1, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      // First IP
      const res1 = await app.request('/test', { headers: { 'CF-Connecting-IP': '1.1.1.1' } });
      expect(res1.status).toBe(200);
      const res2 = await app.request('/test', { headers: { 'CF-Connecting-IP': '1.1.1.1' } });
      expect(res2.status).toBe(429);

      // Different IP
      const res3 = await app.request('/test', { headers: { 'CF-Connecting-IP': '2.2.2.2' } });
      expect(res3.status).toBe(200);
    });

    it('should use X-Forwarded-For header when present', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 1, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      const res1 = await app.request('/test', {
        headers: { 'X-Forwarded-For': '1.1.1.1, 2.2.2.2' },
      });
      expect(res1.status).toBe(200);
      const res2 = await app.request('/test', {
        headers: { 'X-Forwarded-For': '1.1.1.1, 2.2.2.2' },
      });
      expect(res2.status).toBe(429);
    });
  });

  describe('Edge cases', () => {
    it('should handle remaining going negative', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 1, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      await app.request('/test');
      await app.request('/test');
      await app.request('/test');

      const res = await app.request('/test');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should handle concurrent requests', async () => {
      const limitMiddleware = createRateLimiter({ maxRequests: 3, windowMs: 60000 })();
      app.use('*', limitMiddleware);
      app.get('/test', (c) => c.json({ success: true }));

      const requests = Array.from({ length: 3 }, () => app.request('/test'));
      const results = await Promise.all(requests);

      results.forEach((res) => expect(res.status).toBe(200));
    });
  });
});
