import type { Context, Next } from 'hono';
import type { ZodSchema, ZodError } from 'zod';
import { bad } from '../api/response-helpers';
import { logger } from '../logger';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const error = result.error;

        logger.warn('[VALIDATION] Request body validation failed', {
          path: c.req.path,
          method: c.req.method,
          errors: error.issues.map((e) => ({
            path: e.path.map((p) => String(p)).join('.'),
            message: e.message,
          })),
        });

        return bad(c, formatZodError(error));
      }

      c.set('validatedBody', result.data);
      await next();
    } catch (err) {
      if (err instanceof SyntaxError) {
        logger.warn('[VALIDATION] Invalid JSON in request body', {
          path: c.req.path,
          method: c.req.method,
        });
        return bad(c, 'Invalid JSON format');
      }
      throw err;
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    const url = new URL(c.req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const result = schema.safeParse(queryParams);

    if (!result.success) {
      const error = result.error;

      logger.warn('[VALIDATION] Query parameter validation failed', {
        path: c.req.path,
        method: c.req.method,
        errors: error.issues.map((e) => ({
          path: e.path.map((p) => String(p)).join('.'),
          message: e.message,
        })),
      });

      return bad(c, formatZodError(error));
    }

    c.set('validatedQuery', result.data);
    await next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    const params = c.req.param();
    const result = schema.safeParse(params);

    if (!result.success) {
      const error = result.error;

      logger.warn('[VALIDATION] Path parameter validation failed', {
        path: c.req.path,
        method: c.req.method,
        errors: error.issues.map((e) => ({
          path: e.path.map((p) => String(p)).join('.'),
          message: e.message,
        })),
      });

      return bad(c, formatZodError(error));
    }

    c.set('validatedParams', result.data);
    await next();
  };
}

function formatZodError(error: ZodError): string {
  const firstError = error.issues[0];

  if (firstError.path.length > 0) {
    const path = firstError.path.map((p) => String(p)).join('.');
    return `${path}: ${firstError.message}`;
  }

  return firstError.message;
}

export type ValidatedBody<T> = T;
export type ValidatedQuery<T> = T;
export type ValidatedParams<T> = T;

declare module 'hono' {
  interface ContextVariableMap {
    validatedBody?: unknown;
    validatedQuery?: unknown;
    validatedParams?: unknown;
  }
}
