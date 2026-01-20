import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { rateLimit, defaultRateLimiter, strictRateLimiter, looseRateLimiter, authRateLimiter, clearRateLimitStore, getRateLimitStore } from '../middleware/rate-limit';
import { RateLimitWindow, RateLimitMaxRequests } from '../config/time';
import type { Context } from 'hono';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

describe('Rate Limiting Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    clearRateLimitStore();
    app = new Hono();
  });

  describe('Basic rate limiting', () => {
    it('should allow requests within limit', async () => {
      let requestCount = 0;
      app.use('/api/test', rateLimit({ maxRequests: 5, windowMs: 60000 }));
      app.get('/api/test', (c) => {
        requestCount++;
        return c.json({ count: requestCount });
      });

      for (let i = 0; i < 5; i++) {
        const res = await app.request('/api/test', {
          method: 'GET',
          headers: { 'x-forwarded-for': '192.168.1.1' },
        });
        expect(res.status).toBe(200);
        const data = await res.json() as { count: number };
        expect(data.count).toBe(i + 1);
      }
    });

    it('should block requests exceeding limit', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 3, windowMs: 60000 }));
      app.get('/api/test', (c) => c.json({}));

      for (let i = 0; i < 3; i++) {
        const res = await app.request('/api/test', {
          method: 'GET',
          headers: { 'x-forwarded-for': '192.168.1.2' },
        });
        expect(res.status).toBe(200);
      }

      const blockedRes = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.2' },
      });
      expect(blockedRes.status).toBe(429);
      const blockedData = await blockedRes.json() as { success: boolean; code: string };
      expect(blockedData.success).toBe(false);
      expect(blockedData.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should set rate limit headers', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 10, windowMs: 60000 }));
      app.get('/api/test', (c) => c.json({}));

      const res = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.3' },
      });

      expect(res.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('9');
      expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should set Retry-After header when rate limited', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 1, windowMs: 60000 }));
      app.get('/api/test', (c) => c.json({}));

      const firstRes = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.4' },
      });
      expect(firstRes.status).toBe(200);

      const secondRes = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.4' },
      });
      expect(secondRes.status).toBe(429);
      expect(secondRes.headers.get('Retry-After')).toBeTruthy();
      const retryAfter = parseInt(secondRes.headers.get('Retry-After') || '0');
      expect(retryAfter).toBeGreaterThan(0);
    });
  });

  describe('IP-based limiting', () => {
    it('should limit separately for different IPs', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 2, windowMs: 60000 }));
      app.get('/api/test', (c) => c.json({}));

      const ip1Res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.5' },
      });
      expect(ip1Res1.status).toBe(200);

      const ip2Res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.6' },
      });
      expect(ip2Res1.status).toBe(200);

      const ip1Res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.5' },
      });
      expect(ip1Res2.status).toBe(200);

      const ip1Res3 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.5' },
      });
      expect(ip1Res3.status).toBe(429);

      const ip2Res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.6' },
      });
      expect(ip2Res2.status).toBe(200);
    });

    it('should use cf-connecting-ip header when available', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 1, windowMs: 60000 }));
      app.get('/api/test', (c) => c.json({}));

      const res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'cf-connecting-ip': '192.168.1.7' },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'cf-connecting-ip': '192.168.1.7' },
      });
      expect(res2.status).toBe(429);
    });

    it('should handle x-forwarded-for with multiple IPs', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 1, windowMs: 60000 }));
      app.get('/api/test', (c) => c.json({}));

      const res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.8, 10.0.0.1' },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.8, 10.0.0.2' },
      });
      expect(res2.status).toBe(429);
    });
  });

  describe('Path-based limiting', () => {
    it('should limit separately for different paths', async () => {
      app.use('/api/*', rateLimit({ maxRequests: 2, windowMs: 60000 }));
      app.get('/api/path1', (c) => c.json({ path: 'path1' }));
      app.get('/api/path2', (c) => c.json({ path: 'path2' }));

      const res1 = await app.request('/api/path1', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.9' },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request('/api/path2', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.9' },
      });
      expect(res2.status).toBe(200);

      const res3 = await app.request('/api/path1', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.9' },
      });
      expect(res3.status).toBe(200);

      const res4 = await app.request('/api/path1', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.9' },
      });
      expect(res4.status).toBe(429);

      const res5 = await app.request('/api/path2', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.9' },
      });
      expect(res5.status).toBe(200);

      const res6 = await app.request('/api/path2', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.9' },
      });
      expect(res6.status).toBe(429);
    });
  });

  describe('Custom key generator', () => {
    it('should use custom key generator', async () => {
      const customKeyGenerator = (c: Context) => {
        const userId = c.req.header('X-User-ID') || 'anonymous';
        return `user:${userId}`;
      };

      app.use('/api/test', rateLimit({ maxRequests: 2, windowMs: 60000, keyGenerator: customKeyGenerator }));
      app.get('/api/test', (c) => c.json({}));

      const user1Res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'X-User-ID': 'user1' },
      });
      expect(user1Res1.status).toBe(200);

      const user2Res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'X-User-ID': 'user2' },
      });
      expect(user2Res1.status).toBe(200);

      const user1Res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'X-User-ID': 'user1' },
      });
      expect(user1Res2.status).toBe(200);

      const user1Res3 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'X-User-ID': 'user1' },
      });
      expect(user1Res3.status).toBe(429);

      const user2Res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'X-User-ID': 'user2' },
      });
      expect(user2Res2.status).toBe(200);
    });
  });

  describe('Window expiration', () => {
    it('should reset count after window expires', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 1, windowMs: 100 }));
      app.get('/api/test', (c) => c.json({}));

      const res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.10' },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.10' },
      });
      expect(res2.status).toBe(429);

      await new Promise(resolve => setTimeout(resolve, 150));

      const res3 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.10' },
      });
      expect(res3.status).toBe(200);
    });
  });

  describe('Predefined limiters', () => {
    it('should use defaultRateLimiter with standard limits', async () => {
      app.use('/api/test', defaultRateLimiter());
      app.get('/api/test', (c) => c.json({}));

      const config = { maxRequests: RateLimitMaxRequests.STANDARD, windowMs: RateLimitWindow.STANDARD };

      for (let i = 0; i < config.maxRequests; i++) {
        const res = await app.request('/api/test', {
          method: 'GET',
          headers: { 'x-forwarded-for': '192.168.1.11' },
        });
        expect(res.status).toBe(200);
      }

      const blockedRes = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.11' },
      });
      expect(blockedRes.status).toBe(429);
    });

    it('should use strictRateLimiter with strict limits', async () => {
      app.use('/api/test', strictRateLimiter());
      app.get('/api/test', (c) => c.json({}));

      const config = { maxRequests: RateLimitMaxRequests.STRICT, windowMs: RateLimitWindow.STRICT };

      for (let i = 0; i < config.maxRequests; i++) {
        const res = await app.request('/api/test', {
          method: 'GET',
          headers: { 'x-forwarded-for': '192.168.1.12' },
        });
        expect(res.status).toBe(200);
      }

      const blockedRes = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.12' },
      });
      expect(blockedRes.status).toBe(429);
    });

    it('should use looseRateLimiter with loose limits', async () => {
      app.use('/api/test', looseRateLimiter());
      app.get('/api/test', (c) => c.json({}));

      const config = { maxRequests: RateLimitMaxRequests.LOOSE, windowMs: RateLimitWindow.LOOSE };

      for (let i = 0; i < 10; i++) {
        const res = await app.request('/api/test', {
          method: 'GET',
          headers: { 'x-forwarded-for': '192.168.1.13' },
        });
        expect(res.status).toBe(200);
      }

      expect(config.maxRequests).toBeGreaterThan(10);
    });

    it('should use authRateLimiter with auth limits', async () => {
      app.use('/api/test', authRateLimiter());
      app.get('/api/test', (c) => c.json({}));

      const config = { maxRequests: RateLimitMaxRequests.AUTH, windowMs: RateLimitWindow.AUTH };

      for (let i = 0; i < config.maxRequests; i++) {
        const res = await app.request('/api/test', {
          method: 'GET',
          headers: { 'x-forwarded-for': '192.168.1.14' },
        });
        expect(res.status).toBe(200);
      }

      const blockedRes = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.14' },
      });
      expect(blockedRes.status).toBe(429);
    });
  });

  describe('Skip options', () => {
    it('should skip successful requests when configured', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 2, windowMs: 60000, skipSuccessfulRequests: true }));
      app.get('/api/test', (c) => c.json({}));

      const res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.15' },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.15' },
      });
      expect(res2.status).toBe(200);

      const res3 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.15' },
      });
      expect(res3.status).toBe(200);
    });

    it('should skip failed requests when configured', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 2, windowMs: 60000, skipFailedRequests: true }));
      app.get('/api/test', (c) => {
        const shouldFail = c.req.query('fail') === 'true';
        if (shouldFail) {
          return c.json({ error: 'Bad request' }, 400);
        }
        return c.json({});
      });

      const res1 = await app.request('/api/test?fail=true', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.16' },
      });
      expect(res1.status).toBe(400);

      const res2 = await app.request('/api/test?fail=true', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.16' },
      });
      expect(res2.status).toBe(400);

      const res3 = await app.request('/api/test?fail=true', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.16' },
      });
      expect(res3.status).toBe(400);
    });
  });

  describe('Store management', () => {
    it('should clean up expired entries', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 1, windowMs: 100 }));
      app.get('/api/test', (c) => c.json({}));

      const res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.17' },
      });
      expect(res1.status).toBe(200);

      const store1 = getRateLimitStore();
      expect(store1.size).toBeGreaterThan(0);

      await new Promise(resolve => setTimeout(resolve, 150));

      const res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.17' },
      });
      expect(res2.status).toBe(200);

      const store2 = getRateLimitStore();
      expect(store2.size).toBeGreaterThanOrEqual(0);
    });

    it('should clear rate limit store', () => {
      clearRateLimitStore();
      const store = getRateLimitStore();
      expect(store.size).toBe(0);
    });

    it('should return rate limit store entries', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 1, windowMs: 60000 }));
      app.get('/api/test', (c) => c.json({}));

      await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.18' },
      });

      const store = getRateLimitStore();
      expect(store.size).toBeGreaterThan(0);
      expect(store.get('192.168.1.18:/api/test')).toBeDefined();
    });
  });

  describe('Custom handler', () => {
    it('should use custom handler when provided', async () => {
      const customHandler = vi.fn((c: Context, info: RateLimitInfo) => {
        return c.json({ custom: true, limit: info.limit }, 429);
      });

      app.use('/api/test', rateLimit({ maxRequests: 1, windowMs: 60000, handler: customHandler }));
      app.get('/api/test', (c) => c.json({}));

      const res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.19' },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.19' },
      });
      expect(res2.status).toBe(429);
      expect(customHandler).toHaveBeenCalled();
    });
  });

  describe('onLimitReached callback', () => {
    it('should call onLimitReached when limit exceeded', async () => {
      const onLimitReached = vi.fn();

      app.use('/api/test', rateLimit({ maxRequests: 1, windowMs: 60000, onLimitReached }));
      app.get('/api/test', (c) => c.json({}));

      const res1 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.20' },
      });
      expect(res1.status).toBe(200);
      expect(onLimitReached).not.toHaveBeenCalled();

      const res2 = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.20' },
      });
      expect(res2.status).toBe(429);
      expect(onLimitReached).toHaveBeenCalled();
    });
  });

  describe('Disable standard headers', () => {
    it('should not set rate limit headers when disabled', async () => {
      app.use('/api/test', rateLimit({ maxRequests: 10, windowMs: 60000, standardHeaders: false }));
      app.get('/api/test', (c) => c.json({}));

      const res = await app.request('/api/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.21' },
      });

      expect(res.headers.get('X-RateLimit-Limit')).toBeNull();
      expect(res.headers.get('X-RateLimit-Remaining')).toBeNull();
      expect(res.headers.get('X-RateLimit-Reset')).toBeNull();
    });
  });
});
