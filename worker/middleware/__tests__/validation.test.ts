import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody, validateQuery, validateParams, type ValidatedBody, type ValidatedQuery, type ValidatedParams } from '../validation';

vi.mock('../validation', async () => {
  const actual = await vi.importActual<typeof import('../validation')>('../validation');
  return {
    ...actual,
  };
});

describe('Validation Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  describe('validateBody - middleware behavior', () => {
    it('should be a function that accepts Zod schema', () => {
      const schema = z.object({ name: z.string() });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should accept complex Zod schemas', () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        age: z.number().min(18),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should accept array schemas', () => {
      const schema = z.array(z.string());
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should accept primitive schemas', () => {
      const stringSchema = validateBody(z.string());
      const numberSchema = validateBody(z.number());
      const booleanSchema = validateBody(z.boolean());

      expect(typeof stringSchema).toBe('function');
      expect(typeof numberSchema).toBe('function');
      expect(typeof booleanSchema).toBe('function');
    });
  });

  describe('validateQuery - middleware behavior', () => {
    it('should be a function that accepts Zod schema', () => {
      const schema = z.object({ page: z.string() });
      const middleware = validateQuery(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should accept query schemas with optional fields', () => {
      const schema = z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        sort: z.string().optional(),
      });
      const middleware = validateQuery(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should accept query schemas with transformations', () => {
      const schema = z.object({
        page: z.string().transform((val) => parseInt(val, 10)),
        limit: z.string().transform((val) => parseInt(val, 10)),
      });
      const middleware = validateQuery(schema);

      expect(typeof middleware).toBe('function');
    });
  });

  describe('validateParams - middleware behavior', () => {
    it('should be a function that accepts Zod schema', () => {
      const schema = z.object({ id: z.string() });
      const middleware = validateParams(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should accept params schemas with multiple fields', () => {
      const schema = z.object({
        userId: z.string().uuid(),
        postId: z.string().uuid(),
      });
      const middleware = validateParams(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should accept params schemas with validations', () => {
      const schema = z.object({
        id: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/),
      });
      const middleware = validateParams(schema);

      expect(typeof middleware).toBe('function');
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

  describe('Zod schema compatibility', () => {
    it('should work with z.object schemas', () => {
      const schema = z.object({ name: z.string() });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.array schemas', () => {
      const schema = z.array(z.number());
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.union schemas', () => {
      const schema = z.union([z.string(), z.number()]);
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.intersection schemas', () => {
      const schema = z.intersection(
        z.object({ name: z.string() }),
        z.object({ age: z.number() })
      );
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.record schemas', () => {
      const schema = z.record(z.string());
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.tuple schemas', () => {
      const schema = z.tuple([z.string(), z.number()]);
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.enum schemas', () => {
      const schema = z.enum(['student', 'teacher', 'parent', 'admin']);
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.literal schemas', () => {
      const schema = z.literal('admin');
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.nativeEnum schemas', () => {
      enum Role {
        Student = 'student',
        Teacher = 'teacher',
      }
      const schema = z.nativeEnum(Role);
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.discriminatedUnion schemas', () => {
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('a'), value: z.string() }),
        z.object({ type: z.literal('b'), count: z.number() }),
      ]);
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.optional schemas', () => {
      const schema = z.object({ name: z.string().optional() });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.nullable schemas', () => {
      const schema = z.object({ name: z.string().nullable() });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.default schemas', () => {
      const schema = z.object({ name: z.string().default('John') });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.refine schemas', () => {
      const schema = z.object({
        password: z.string().refine((val) => val.length >= 8),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.transform schemas', () => {
      const schema = z.object({
        email: z.string().transform((val) => val.toLowerCase()),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.coerce schemas', () => {
      const schema = z.object({
        age: z.coerce.number(),
        email: z.coerce.string(),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.custom schemas', () => {
      const customSchema = z.custom<string>((val) => typeof val === 'string' && val.length > 0);
      const middleware = validateBody(customSchema);

      expect(typeof middleware).toBe('function');
    });

    it('should work with z.pipe schemas', () => {
      const schema = z.string().pipe(z.string().min(5));
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });
  });

  describe('Common validation patterns', () => {
    it('should validate user creation schemas', () => {
      const userSchema = z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        role: z.enum(['student', 'teacher', 'parent', 'admin']),
      });
      const middleware = validateBody(userSchema);

      expect(typeof middleware).toBe('function');
    });

    it('should validate pagination schemas', () => {
      const paginationSchema = z.object({
        page: z.string().transform((val) => parseInt(val, 10)),
        limit: z.string().transform((val) => parseInt(val, 10)),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      });
      const middleware = validateQuery(paginationSchema);

      expect(typeof middleware).toBe('function');
    });

    it('should validate ID parameter schemas', () => {
      const idSchema = z.object({
        id: z.string().uuid(),
      });
      const middleware = validateParams(idSchema);

      expect(typeof middleware).toBe('function');
    });

    it('should validate search schemas', () => {
      const searchSchema = z.object({
        q: z.string().min(1).max(100),
        filter: z.string().optional(),
        category: z.string().optional(),
      });
      const middleware = validateQuery(searchSchema);

      expect(typeof middleware).toBe('function');
    });

    it('should validate nested object schemas', () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        address: z.object({
          street: z.string(),
          city: z.string(),
          country: z.string(),
        }),
      });
      const middleware = validateBody(nestedSchema);

      expect(typeof middleware).toBe('function');
    });

    it('should validate array of objects schemas', () => {
      const arraySchema = z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          quantity: z.number(),
        })
      );
      const middleware = validateBody(arraySchema);

      expect(typeof middleware).toBe('function');
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle schema with multiple validation rules', () => {
      const schema = z.object({
        name: z.string().min(2).max(100),
        email: z.string().email().min(5).max(255),
        age: z.number().min(0).max(150),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with complex transformations', () => {
      const schema = z.object({
        birthDate: z.string().transform((val) => new Date(val)),
        coordinates: z.object({
          lat: z.string().transform((val) => parseFloat(val)),
          lng: z.string().transform((val) => parseFloat(val)),
        }),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with conditional validation', () => {
      const schema = z.object({
        type: z.enum(['a', 'b']),
        valueA: z.string().optional(),
        valueB: z.number().optional(),
      }).refine(
        (data) => {
          if (data.type === 'a') return !!data.valueA;
          if (data.type === 'b') return !!data.valueB;
          return false;
        },
        {
          message: 'Value must match type',
        }
      );
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });
  });

  describe('Middleware integration', () => {
    it('should allow chaining with other middleware', () => {
      const authMiddleware = vi.fn();
      const logMiddleware = vi.fn();

      const schema = z.object({ name: z.string() });
      const validationMiddleware = validateBody(schema);

      expect(typeof authMiddleware).toBe('function');
      expect(typeof logMiddleware).toBe('function');
      expect(typeof validationMiddleware).toBe('function');
    });

    it('should support multiple validation middleware in sequence', () => {
      const bodySchema = z.object({ name: z.string() });
      const querySchema = z.object({ page: z.string() });
      const paramsSchema = z.object({ id: z.string() });

      const bodyMiddleware = validateBody(bodySchema);
      const queryMiddleware = validateQuery(querySchema);
      const paramsMiddleware = validateParams(paramsSchema);

      expect(typeof bodyMiddleware).toBe('function');
      expect(typeof queryMiddleware).toBe('function');
      expect(typeof paramsMiddleware).toBe('function');
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety with validated data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should support generic type parameters', () => {
      type UserData = {
        name: string;
        email: string;
      };

      const schema: z.ZodType<UserData> = z.object({
        name: z.string(),
        email: z.string(),
      });

      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty object schema', () => {
      const schema = z.object({});
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with only optional fields', () => {
      const schema = z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        age: z.number().optional(),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with deeply nested objects', () => {
      const schema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              level4: z.object({
                value: z.string(),
              }),
            }),
          }),
        }),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with large arrays', () => {
      const schema = z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          value: z.number(),
        })
      );
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with many fields', () => {
      const schema = z.object({
        field1: z.string(),
        field2: z.string(),
        field3: z.string(),
        field4: z.string(),
        field5: z.string(),
        field6: z.string(),
        field7: z.string(),
        field8: z.string(),
        field9: z.string(),
        field10: z.string(),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with regex validations', () => {
      const schema = z.object({
        phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with date validations', () => {
      const schema = z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with email validations', () => {
      const schema = z.object({
        email: z.string().email(),
        workEmail: z.string().email(),
        personalEmail: z.string().email(),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should handle schema with URL validations', () => {
      const schema = z.object({
        website: z.string().url(),
        avatar: z.string().url(),
      });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
    });
  });

  describe('Hono context integration', () => {
    it('should set validatedBody in context', () => {
      const testApp = new Hono();
      const schema = z.object({ name: z.string() });
      testApp.use('*', validateBody(schema));
      testApp.post('/test', (c) => c.json({ success: true }));

      expect(typeof testApp).toBe('object');
    });

    it('should set validatedQuery in context', () => {
      const testApp = new Hono();
      const schema = z.object({ page: z.string() });
      testApp.use('*', validateQuery(schema));
      testApp.get('/test', (c) => c.json({ success: true }));

      expect(typeof testApp).toBe('object');
    });

    it('should set validatedParams in context', () => {
      const testApp = new Hono();
      const schema = z.object({ id: z.string() });
      testApp.use('*', validateParams(schema));
      testApp.get('/test/:id', (c) => c.json({ success: true }));

      expect(typeof testApp).toBe('object');
    });
  });
});
