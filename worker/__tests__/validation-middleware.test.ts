import { describe, it, expect, vi } from 'vitest';
import {
  validateBody,
  validateQuery,
  validateParams,
  type ValidatedBody,
  type ValidatedQuery,
  type ValidatedParams,
} from '../middleware/validation';
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import type { z } from 'zod';

describe('validation-middleware', () => {
  describe('validateBody', () => {
    it('should set validatedBody in context for valid request body', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi
          .fn()
          .mockReturnValue({ success: true, data: { name: 'test', email: 'test@example.com' } }),
      };

      app.use('/', validateBody(schemaMock));
      app.post('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ name: 'test', email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      expect(schemaMock.safeParse).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test', email: 'test@example.com' })
      );
    });

    it('should return 400 error for invalid request body', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            issues: [
              { path: ['email'], message: 'Invalid email' },
              { path: ['name'], message: 'Name is required' },
            ],
          },
        }),
      };

      app.use('/', validateBody(schemaMock));
      app.post('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.request(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 for malformed JSON', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn(),
      };

      app.use('/', validateBody(schemaMock));
      app.post('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: 'invalid{json',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.request(req);

      expect(res.status).toBe(400);
    });
  });

  describe('validateQuery', () => {
    it('should set validatedQuery in context for valid query parameters', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({ success: true, data: { page: '1', limit: '10' } }),
      };

      app.use('/', validateQuery(schemaMock));
      app.get('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost?page=1&limit=10', {
        method: 'GET',
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      expect(schemaMock.safeParse).toHaveBeenCalledWith(
        expect.objectContaining({ page: '1', limit: '10' })
      );
    });

    it('should return 400 error for invalid query parameters', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            issues: [
              { path: ['page'], message: 'page must be a number' },
              { path: ['limit'], message: 'limit must be a positive number' },
            ],
          },
        }),
      };

      app.use('/', validateQuery(schemaMock));
      app.get('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost?page=invalid&limit=-1', {
        method: 'GET',
      });

      const res = await app.request(req);

      expect(res.status).toBe(400);
    });

    it('should handle empty query parameters', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({ success: true, data: {} }),
      };

      app.use('/', validateQuery(schemaMock));
      app.get('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'GET',
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      expect(schemaMock.safeParse).toHaveBeenCalledWith({});
    });
  });

  describe('validateParams', () => {
    it('should set validatedParams in context for valid path parameters', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({ success: true, data: { id: '123' } }),
      };

      app.use('/users/:id', validateParams(schemaMock));
      app.get('/users/:id', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/users/123', {
        method: 'GET',
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      expect(schemaMock.safeParse).toHaveBeenCalledWith({ id: '123' });
    });

    it('should return 400 error for invalid path parameters', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ path: ['id'], message: 'id must be a valid UUID' }],
          },
        }),
      };

      app.use('/users/:id', validateParams(schemaMock));
      app.get('/users/:id', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/users/invalid-id', {
        method: 'GET',
      });

      const res = await app.request(req);

      expect(res.status).toBe(400);
    });
  });

  describe('Error Message Formatting', () => {
    it('should format Zod error with path and message', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ path: ['user', 'email'], message: 'Invalid email format' }],
          },
        }),
      };

      app.use('/', validateBody(schemaMock));
      app.post('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: '{}',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(400);
      expect(body.error).toContain('user.email');
      expect(body.error).toContain('Invalid email format');
    });

    it('should format Zod error without path', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ path: [], message: 'Invalid request body' }],
          },
        }),
      };

      app.use('/', validateBody(schemaMock));
      app.post('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: '{}',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(400);
      expect(body.error).toBe('Invalid request body');
    });

    it('should format multiple Zod errors', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            issues: [
              { path: ['name'], message: 'Name is required' },
              { path: ['email'], message: 'Invalid email' },
              { path: ['age'], message: 'Age must be positive' },
            ],
          },
        }),
      };

      app.use('/', validateBody(schemaMock));
      app.post('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: '{}',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.request(req);

      expect(res.status).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle deeply nested path in Zod error', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ path: ['data', 'nested', 'deep', 'value'], message: 'Invalid value' }],
          },
        }),
      };

      app.use('/', validateBody(schemaMock));
      app.post('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: '{}',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(400);
      expect(body.error).toContain('data.nested.deep.value');
    });

    it('should handle path with array indices', async () => {
      const app = new Hono();
      const schemaMock: any = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ path: ['items', 0, 'name'], message: 'Name required' }],
          },
        }),
      };

      app.use('/', validateBody(schemaMock));
      app.post('/', (c) => c.json({ success: true }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: '{}',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.request(req);
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(400);
      expect(body.error).toContain('items.0.name');
    });
  });
});
