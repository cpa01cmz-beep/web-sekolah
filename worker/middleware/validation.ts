import type { Context, Next } from 'hono';
import type { z } from 'zod';
import { ZodError } from 'zod';

export function validateBody<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set('validatedBody', validatedData);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
          400
        );
      }
      return c.json(
        {
          success: false,
          error: 'Invalid request body',
          code: 'BAD_REQUEST',
        },
        400
      );
    }
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const url = new URL(c.req.url);
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      const validatedData = schema.parse(queryParams);
      c.set('validatedQuery', validatedData);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
          400
        );
      }
      return c.json(
        {
          success: false,
          error: 'Invalid query parameters',
          code: 'BAD_REQUEST',
        },
        400
      );
    }
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const params = c.req.param();
      const validatedData = schema.parse(params);
      c.set('validatedParams', validatedData);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
          400
        );
      }
      return c.json(
        {
          success: false,
          error: 'Invalid path parameters',
          code: 'BAD_REQUEST',
        },
        400
      );
    }
  };
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  return input.trim().replace(/[<>]/g, '');
}
