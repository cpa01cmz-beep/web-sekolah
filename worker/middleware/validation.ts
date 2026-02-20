import type { Context, Next } from 'hono';
import type { ZodSchema, ZodError } from 'zod';
import { bad } from '../api/response-helpers';
import { logger } from '../logger';

type ValidationSource = 'body' | 'query' | 'params';

const validationMessages: Record<ValidationSource, string> = {
  body: 'Request body validation failed',
  query: 'Query parameter validation failed',
  params: 'Path parameter validation failed',
};

function formatErrorIssues(error: ZodError) {
  return error.issues.map((e) => ({
    path: e.path.map(p => String(p)).join('.'),
    message: e.message,
  }));
}

function logValidationError(c: Context, source: ValidationSource, error: ZodError) {
  logger.warn(`[VALIDATION] ${validationMessages[source]}`, {
    path: c.req.path,
    method: c.req.method,
    errors: formatErrorIssues(error),
  });
}

function createBaseValidator<T>(
  source: ValidationSource,
  extractData: (c: Context) => Record<string, unknown> | Promise<Record<string, unknown>>,
  contextKey: 'validatedBody' | 'validatedQuery' | 'validatedParams'
) {
  return (schema: ZodSchema<T>) => async (c: Context, next: Next) => {
    const data = await extractData(c);
    const result = schema.safeParse(data);

    if (!result.success) {
      logValidationError(c, source, result.error);
      return bad(c, formatZodError(result.error));
    }

    c.set(contextKey, result.data);
    await next();
  };
}

export const validateQuery = createBaseValidator(
  'query',
  (c) => {
    const url = new URL(c.req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    return queryParams;
  },
  'validatedQuery'
);

export const validateParams = createBaseValidator(
  'params',
  (c) => c.req.param(),
  'validatedParams'
);

const baseValidateBody = createBaseValidator(
  'body',
  (c) => c.req.json(),
  'validatedBody'
);

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      return await baseValidateBody(schema)(c, next);
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

function formatZodError(error: ZodError): string {
  const firstError = error.issues[0];
  
  if (firstError.path.length > 0) {
    const path = firstError.path.map(p => String(p)).join('.');
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
