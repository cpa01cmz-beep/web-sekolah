import { ErrorCode } from "@shared/types";
import type { Context } from "hono";

interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  requestId?: string;
}

type ApiStandardResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export const ok = <T>(c: Context, data: T, requestId?: string) => 
  c.json({ success: true, data, requestId: requestId || c.req.header('X-Request-ID') || crypto.randomUUID() } as ApiSuccessResponse<T>);

export const bad = (c: Context, error: string, code = ErrorCode.VALIDATION_ERROR, details?: Record<string, unknown>) => 
  c.json({ 
    success: false, 
    error, 
    code,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID(),
    details 
  } as ApiErrorResponse, 400);

export const unauthorized = (c: Context, error = 'Unauthorized') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.UNAUTHORIZED,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  } as ApiErrorResponse, 401);

export const forbidden = (c: Context, error = 'Forbidden') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.FORBIDDEN,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  } as ApiErrorResponse, 403);

export const notFound = (c: Context, error = 'not found') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.NOT_FOUND,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  } as ApiErrorResponse, 404);

export const conflict = (c: Context, error = 'Conflict') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.CONFLICT,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  } as ApiErrorResponse, 409);

export const rateLimitExceeded = (c: Context, retryAfter?: number) => {
  if (retryAfter) {
    c.header('Retry-After', retryAfter.toString());
  }
  return c.json({ 
    success: false, 
    error: 'Rate limit exceeded', 
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  } as ApiErrorResponse, 429);
};

export const serverError = (c: Context, error = 'Internal server error') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  } as ApiErrorResponse, 500);

export const serviceUnavailable = (c: Context, error = 'Service unavailable') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.SERVICE_UNAVAILABLE,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  } as ApiErrorResponse, 503);

export const gatewayTimeout = (c: Context, error = 'Gateway timeout') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.TIMEOUT,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  } as ApiErrorResponse, 504);

export const isStr = (s: unknown): s is string => typeof s === 'string' && s.length > 0;
