import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody, validateQuery, validateParams, type ValidatedBody, type ValidatedQuery, type ValidatedParams } from '../validation';

describe('Validation Middleware', () => {
  describe('validateBody', () => {
    it('should pass valid body and set validatedBody in context', async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string(), age: z.number() });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json(c.get('validatedBody') as z.infer<typeof schema>));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', age: 30 }),
      });
      
      expect(res.status).toBe(200);
      const data = await res.json() as z.infer<typeof schema>;
      expect(data).toEqual({ name: 'John', age: 30 });
    });

    it('should reject invalid body with 400 status', async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string(), age: z.number() });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John' }),
      });
      
      expect(res.status).toBe(400);
    });

    it('should reject body with wrong type', async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string(), age: z.number() });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', age: 'thirty' }),
      });
      
      expect(res.status).toBe(400);
    });

    it('should handle invalid JSON', async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string() });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{',
      });
      
      expect(res.status).toBe(400);
    });

    it('should validate nested objects', async () => {
      const app = new Hono();
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json(c.get('validatedBody') as z.infer<typeof schema>));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { name: 'John', email: 'john@example.com' } }),
      });
      
      expect(res.status).toBe(200);
      const data = await res.json() as z.infer<typeof schema>;
      expect(data.user.name).toBe('John');
      expect(data.user.email).toBe('john@example.com');
    });

    it('should validate arrays', async () => {
      const app = new Hono();
      const schema = z.array(z.object({ id: z.string(), name: z.string() }));
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json(c.get('validatedBody') as z.infer<typeof schema>));
      
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      
      expect(res.status).toBe(200);
      const data = await res.json() as z.infer<typeof schema>;
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Item 1');
    });

    it('should reject when required field is missing', async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string().min(2), email: z.string().email() });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John' }),
      });
      
      expect(res.status).toBe(400);
    });

    it('should validate with min constraint', async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string().min(2) });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json(c.get('validatedBody') as z.infer<typeof schema>));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Jo' }),
      });
      
      expect(res.status).toBe(200);
    });

    it('should reject when min constraint not met', async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string().min(2) });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'J' }),
      });
      
      expect(res.status).toBe(400);
    });
  });

  describe('validateQuery', () => {
    it('should pass valid query params and set validatedQuery in context', async () => {
      const app = new Hono();
      const schema = z.object({ page: z.string(), limit: z.string() });
      
      app.use('*', validateQuery(schema));
      app.get('/test', (c) => c.json(c.get('validatedQuery') as z.infer<typeof schema>));
      
      const res = await app.request('/test?page=1&limit=10');
      
      expect(res.status).toBe(200);
      const data = await res.json() as z.infer<typeof schema>;
      expect(data).toEqual({ page: '1', limit: '10' });
    });

    it('should reject invalid query params', async () => {
      const app = new Hono();
      const schema = z.object({ page: z.string(), limit: z.string() });
      
      app.use('*', validateQuery(schema));
      app.get('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test?page=1');
      
      expect(res.status).toBe(400);
    });

    it('should handle optional query params', async () => {
      const app = new Hono();
      const schema = z.object({
        page: z.string(),
        limit: z.string().optional(),
        sort: z.string().optional(),
      });
      
      app.use('*', validateQuery(schema));
      app.get('/test', (c) => c.json(c.get('validatedQuery') as z.infer<typeof schema>));
      
      const res = await app.request('/test?page=1');
      
      expect(res.status).toBe(200);
      const data = await res.json() as z.infer<typeof schema>;
      expect(data.page).toBe('1');
      expect(data.limit).toBeUndefined();
      expect(data.sort).toBeUndefined();
    });

    it('should validate query param with transform', async () => {
      const app = new Hono();
      const schema = z.object({
        page: z.string().transform((val) => parseInt(val, 10)),
        limit: z.string().transform((val) => parseInt(val, 10)),
      });
      
      app.use('*', validateQuery(schema));
      app.get('/test', (c) => c.json(c.get('validatedQuery') as z.infer<typeof schema>));
      
      const res = await app.request('/test?page=1&limit=10');
      
      expect(res.status).toBe(200);
      const data = await res.json() as z.infer<typeof schema>;
      expect(data.page).toBe(1);
      expect(data.limit).toBe(10);
    });

    it('should validate enum query param', async () => {
      const app = new Hono();
      const schema = z.object({
        sort: z.enum(['asc', 'desc']),
      });
      
      app.use('*', validateQuery(schema));
      app.get('/test', (c) => c.json(c.get('validatedQuery') as z.infer<typeof schema>));
      
      const res = await app.request('/test?sort=asc');
      
      expect(res.status).toBe(200);
      const data = await res.json() as z.infer<typeof schema>;
      expect(data.sort).toBe('asc');
    });

    it('should reject invalid enum value', async () => {
      const app = new Hono();
      const schema = z.object({
        sort: z.enum(['asc', 'desc']),
      });
      
      app.use('*', validateQuery(schema));
      app.get('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test?sort=invalid');
      
      expect(res.status).toBe(400);
    });
  });

  describe('validateParams', () => {
    it('should validate path param schema', () => {
      const schema = z.object({ id: z.string() });
      const middleware = validateParams(schema);
      
      expect(typeof middleware).toBe('function');
    });

    it('should validate path params with multiple fields', () => {
      const schema = z.object({
        userId: z.string().uuid(),
        postId: z.string().uuid(),
      });
      const middleware = validateParams(schema);
      
      expect(typeof middleware).toBe('function');
    });

    it('should validate path params with validations', () => {
      const schema = z.object({
        id: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/),
      });
      const middleware = validateParams(schema);
      
      expect(typeof middleware).toBe('function');
    });
  });

  describe('Request body size limit', () => {
    it('should reject body exceeding default size limit (1MB)', async () => {
      const app = new Hono();
      const schema = z.object({ data: z.string() });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const largeData = 'x'.repeat(1024 * 1024 + 100);
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: largeData }),
      });
      
      expect(res.status).toBe(413);
      const data = await res.json() as { success: boolean; code: string };
      expect(data.success).toBe(false);
      expect(data.code).toBe('PAYLOAD_TOO_LARGE');
    });

    it('should accept body within default size limit', async () => {
      const app = new Hono();
      const schema = z.object({ data: z.string() });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const normalData = 'x'.repeat(1024);
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: normalData }),
      });
      
      expect(res.status).toBe(200);
    });

    it('should reject body exceeding custom size limit', async () => {
      const app = new Hono();
      const schema = z.object({ data: z.string() });
      
      app.use('*', validateBody(schema, { maxSize: 100 }));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'x'.repeat(200) }),
      });
      
      expect(res.status).toBe(413);
      const data = await res.json() as { success: boolean; code: string };
      expect(data.code).toBe('PAYLOAD_TOO_LARGE');
    });

    it('should reject based on Content-Length header when present', async () => {
      const app = new Hono();
      const schema = z.object({ data: z.string() });
      
      app.use('*', validateBody(schema, { maxSize: 100 }));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Content-Length': '200',
        },
        body: JSON.stringify({ data: 'test' }),
      });
      
      expect(res.status).toBe(413);
    });

    it('should accept body within custom size limit', async () => {
      const app = new Hono();
      const schema = z.object({ data: z.string() });
      
      app.use('*', validateBody(schema, { maxSize: 1000 }));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
      });
      
      expect(res.status).toBe(200);
    });
  });

  describe('Type exports', () => {
    it('should export ValidatedBody type', () => {
      type Test = ValidatedBody<{ name: string }>;
      const data: Test = { name: 'test' };
      expect(data.name).toBe('test');
    });

    it('should export ValidatedQuery type', () => {
      type Test = ValidatedQuery<{ page: string }>;
      const data: Test = { page: '1' };
      expect(data.page).toBe('1');
    });

    it('should export ValidatedParams type', () => {
      type Test = ValidatedParams<{ id: string }>;
      const data: Test = { id: '123' };
      expect(data.id).toBe('123');
    });
  });

  describe('Middleware chaining', () => {
    it('should work with multiple validation middleware in sequence', async () => {
      const app = new Hono();
      const bodySchema = z.object({ name: z.string() });
      const querySchema = z.object({ page: z.string() });
      
      app.use('*', validateBody(bodySchema));
      app.use('*', validateQuery(querySchema));
      
      app.post('/test', (c) => {
        return c.json({
          body: c.get('validatedBody'),
          query: c.get('validatedQuery'),
        });
      });
      
      const res = await app.request('/test?page=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John' }),
      });
      
      expect(res.status).toBe(200);
      const data = await res.json() as {
        body: z.infer<typeof bodySchema>;
        query: z.infer<typeof querySchema>;
      };
      expect(data.body.name).toBe('John');
      expect(data.query.page).toBe('1');
    });
  });

  describe('Complex validation scenarios', () => {
    it('should handle discriminated unions', async () => {
      const app = new Hono();
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('a'), value: z.string() }),
        z.object({ type: z.literal('b'), count: z.number() }),
      ]);
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json(c.get('validatedBody') as z.infer<typeof schema>));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'a', value: 'test' }),
      });
      
      expect(res.status).toBe(200);
      const data = await res.json() as z.infer<typeof schema>;
      expect(data.type).toBe('a');
      if (data.type === 'a') {
        expect(data.value).toBe('test');
      }
    });

    it('should reject invalid discriminated union', async () => {
      const app = new Hono();
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('a'), value: z.string() }),
        z.object({ type: z.literal('b'), count: z.number() }),
      ]);
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'c', value: 'test' }),
      });
      
      expect(res.status).toBe(400);
    });

    it('should handle refined schemas', async () => {
      const app = new Hono();
      const schema = z.object({
        password: z.string().refine((val) => val.length >= 8, {
          message: 'Password must be at least 8 characters',
        }),
      });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json(c.get('validatedBody') as z.infer<typeof schema>));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'password123' }),
      });
      
      expect(res.status).toBe(200);
    });

    it('should reject refined schema constraint failure', async () => {
      const app = new Hono();
      const schema = z.object({
        password: z.string().refine((val) => val.length >= 8, {
          message: 'Password must be at least 8 characters',
        }),
      });
      
      app.use('*', validateBody(schema));
      app.post('/test', (c) => c.json({ success: true }));
      
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'short' }),
      });
      
      expect(res.status).toBe(400);
    });
  });
});
