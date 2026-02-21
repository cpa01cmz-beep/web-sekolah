import { describe, it, expect, vi } from 'vitest';
import {
  ok,
  bad,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  rateLimitExceeded,
  serverError,
  serviceUnavailable,
  gatewayTimeout,
  isStr,
} from '../api/response-helpers';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { ErrorCode } from '@shared/types';

describe('response-helpers', () => {
  describe('ok', () => {
    it('should return 200 status with success response', async () => {
      const app = new Hono();
      app.get('/', (c) => ok(c, { message: 'success' }));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; data: unknown };

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ message: 'success' });
      expect(body).toHaveProperty('requestId');
    });

    it('should use X-Request-ID header if present', async () => {
      const app = new Hono();
      app.get('/', (c) => ok(c, { data: 'test' }));

      const req = new Request('http://localhost', {
        method: 'GET',
        headers: { 'X-Request-ID': 'test-request-id-123' },
      });
      const res = await app.request(req);
      const body = (await res.json()) as { requestId: string };

      expect(body.requestId).toBe('test-request-id-123');
    });

    it('should generate random requestId if header not present', async () => {
      const app = new Hono();
      app.get('/', (c) => ok(c, { data: 'test' }));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { requestId: string };

      expect(body.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should handle complex data structures', async () => {
      const app = new Hono();
      const complexData = {
        user: { id: '123', name: 'Test User' },
        items: [{ id: 1 }, { id: 2 }],
        nested: { a: { b: { c: 'deep' } } },
      };
      app.get('/', (c) => ok(c, complexData));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; data: typeof complexData };

      expect(body.success).toBe(true);
      expect(body.data).toEqual(complexData);
    });
  });

  describe('bad', () => {
    it('should return 400 status with error response', async () => {
      const app = new Hono();
      app.get('/', (c) => bad(c, 'Invalid input'));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Invalid input');
      expect(body.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(body).toHaveProperty('requestId');
    });

    it('should use provided error code', async () => {
      const app = new Hono();
      app.get('/', (c) => bad(c, 'Custom error', ErrorCode.NOT_FOUND));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { code: string };

      expect(res.status).toBe(400);
      expect(body.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('should include details if provided', async () => {
      const app = new Hono();
      app.get('/', (c) =>
        bad(c, 'Validation failed', ErrorCode.VALIDATION_ERROR, {
          field: 'email',
          reason: 'invalid format',
        })
      );

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { details: Record<string, unknown> };

      expect(res.status).toBe(400);
      expect(body.details).toEqual({ field: 'email', reason: 'invalid format' });
    });
  });

  describe('unauthorized', () => {
    it('should return 401 status with UNAUTHORIZED code', async () => {
      const app = new Hono();
      app.get('/', (c) => unauthorized(c, 'Not authenticated'));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Not authenticated');
      expect(body.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(body).toHaveProperty('requestId');
    });

    it('should use default error message if not provided', async () => {
      const app = new Hono();
      app.get('/', (c) => unauthorized(c));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(401);
      expect(body.error).toBe('Unauthorized');
    });
  });

  describe('forbidden', () => {
    it('should return 403 status with FORBIDDEN code', async () => {
      const app = new Hono();
      app.get('/', (c) => forbidden(c, 'Access denied'));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Access denied');
      expect(body.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should use default error message if not provided', async () => {
      const app = new Hono();
      app.get('/', (c) => forbidden(c));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(403);
      expect(body.error).toBe('Forbidden');
    });
  });

  describe('notFound', () => {
    it('should return 404 status with NOT_FOUND code', async () => {
      const app = new Hono();
      app.get('/', (c) => notFound(c, 'Resource not found'));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Resource not found');
      expect(body.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('should use default error message if not provided', async () => {
      const app = new Hono();
      app.get('/', (c) => notFound(c));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(404);
      expect(body.error).toBe('not found');
    });
  });

  describe('conflict', () => {
    it('should return 409 status with CONFLICT code', async () => {
      const app = new Hono();
      app.get('/', (c) => conflict(c, 'Resource already exists'));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Resource already exists');
      expect(body.code).toBe(ErrorCode.CONFLICT);
    });

    it('should use default error message if not provided', async () => {
      const app = new Hono();
      app.get('/', (c) => conflict(c));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(409);
      expect(body.error).toBe('Conflict');
    });
  });

  describe('rateLimitExceeded', () => {
    it('should return 429 status with RATE_LIMIT_EXCEEDED code', async () => {
      const app = new Hono();
      app.get('/', (c) => rateLimitExceeded(c, 60));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(429);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Rate limit exceeded');
      expect(body.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
    });

    it('should include Retry-After header if provided', async () => {
      const app = new Hono();
      app.get('/', (c) => rateLimitExceeded(c, 120));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);

      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBe('120');
    });

    it('should not include Retry-After header if not provided', async () => {
      const app = new Hono();
      app.get('/', (c) => rateLimitExceeded(c));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);

      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeNull();
    });
  });

  describe('serverError', () => {
    it('should return 500 status with INTERNAL_SERVER_ERROR code', async () => {
      const app = new Hono();
      app.get('/', (c) => serverError(c, 'Database error'));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Database error');
      expect(body.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('should use default error message if not provided', async () => {
      const app = new Hono();
      app.get('/', (c) => serverError(c));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(500);
      expect(body.error).toBe('Internal server error');
    });
  });

  describe('serviceUnavailable', () => {
    it('should return 503 status with SERVICE_UNAVAILABLE code', async () => {
      const app = new Hono();
      app.get('/', (c) => serviceUnavailable(c, 'Maintenance mode'));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(503);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Maintenance mode');
      expect(body.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
    });

    it('should use default error message if not provided', async () => {
      const app = new Hono();
      app.get('/', (c) => serviceUnavailable(c));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(503);
      expect(body.error).toBe('Service unavailable');
    });
  });

  describe('gatewayTimeout', () => {
    it('should return 504 status with TIMEOUT code', async () => {
      const app = new Hono();
      app.get('/', (c) => gatewayTimeout(c, 'External service timeout'));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { success: boolean; error: string; code: string };

      expect(res.status).toBe(504);
      expect(body.success).toBe(false);
      expect(body.error).toBe('External service timeout');
      expect(body.code).toBe(ErrorCode.TIMEOUT);
    });

    it('should use default error message if not provided', async () => {
      const app = new Hono();
      app.get('/', (c) => gatewayTimeout(c));

      const req = new Request('http://localhost', { method: 'GET' });
      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(504);
      expect(body.error).toBe('Gateway timeout');
    });
  });

  describe('isStr', () => {
    it('should return true for non-empty string', () => {
      expect(isStr('hello')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isStr('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isStr(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isStr(undefined)).toBe(false);
    });

    it('should return false for number', () => {
      expect(isStr(123)).toBe(false);
    });

    it('should return false for object', () => {
      expect(isStr({})).toBe(false);
    });

    it('should return false for array', () => {
      expect(isStr([])).toBe(false);
    });

    it('should return false for boolean', () => {
      expect(isStr(true)).toBe(false);
      expect(isStr(false)).toBe(false);
    });

    it('should return true for whitespace-only string', () => {
      expect(isStr('   ')).toBe(true);
    });
  });

  describe('Error Code Consistency', () => {
    it('should use consistent error codes across all responses', async () => {
      const app = new Hono();
      app.get('/bad', (c) => bad(c, 'test'));
      app.get('/unauthorized', (c) => unauthorized(c, 'test'));
      app.get('/forbidden', (c) => forbidden(c, 'test'));
      app.get('/notFound', (c) => notFound(c, 'test'));
      app.get('/conflict', (c) => conflict(c, 'test'));
      app.get('/rateLimitExceeded', (c) => rateLimitExceeded(c));
      app.get('/serverError', (c) => serverError(c, 'test'));
      app.get('/serviceUnavailable', (c) => serviceUnavailable(c, 'test'));
      app.get('/gatewayTimeout', (c) => gatewayTimeout(c, 'test'));

      const endpoints = [
        '/bad',
        '/unauthorized',
        '/forbidden',
        '/notFound',
        '/conflict',
        '/rateLimitExceeded',
        '/serverError',
        '/serviceUnavailable',
        '/gatewayTimeout',
      ];

      for (const endpoint of endpoints) {
        const req = new Request(`http://localhost${endpoint}`, { method: 'GET' });
        const res = await app.request(req);
        const body = (await res.json()) as { code: string };

        expect(body).toHaveProperty('code');
        expect(body.code).toBeTruthy();
      }
    });
  });
});
