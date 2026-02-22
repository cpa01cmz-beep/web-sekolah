import { ErrorCode } from "@shared/types";
import { HttpHeader } from "@shared/http-constants";
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
  c.json({ success: true, data, requestId: requestId || c.req.header(HttpHeader.X_REQUEST_ID) || crypto.randomUUID() } as ApiSuccessResponse<T>);

const createErrorResponse = (
  c: Context, 
  error: string, 
  code: string, 
  status: number,
  details?: Record<string, unknown>
) => 
  c.json({ 
    success: false, 
    error, 
    code,
    requestId: c.req.header(HttpHeader.X_REQUEST_ID) || crypto.randomUUID(),
    details 
  } as ApiErrorResponse, status);

export const bad = (c: Context, error: string, code = ErrorCode.VALIDATION_ERROR, details?: Record<string, unknown>) => 
  createErrorResponse(c, error, code, 400, details);

export const unauthorized = (c: Context, error = 'Unauthorized') => 
  createErrorResponse(c, error, ErrorCode.UNAUTHORIZED, 401);

export const forbidden = (c: Context, error = 'Forbidden') => 
  createErrorResponse(c, error, ErrorCode.FORBIDDEN, 403);

export const notFound = (c: Context, error = 'not found') => 
  createErrorResponse(c, error, ErrorCode.NOT_FOUND, 404);

export const conflict = (c: Context, error = 'Conflict') => 
  createErrorResponse(c, error, ErrorCode.CONFLICT, 409);

export const rateLimitExceeded = (c: Context, retryAfter?: number) => {
  if (retryAfter) {
    c.header('Retry-After', retryAfter.toString());
  }
  return createErrorResponse(c, 'Rate limit exceeded', ErrorCode.RATE_LIMIT_EXCEEDED, 429);
};

export const serverError = (c: Context, error = 'Internal server error') => 
  createErrorResponse(c, error, ErrorCode.INTERNAL_SERVER_ERROR, 500);

export const serviceUnavailable = (c: Context, error = 'Service unavailable') => 
  createErrorResponse(c, error, ErrorCode.SERVICE_UNAVAILABLE, 503);

export const gatewayTimeout = (c: Context, error = 'Gateway timeout') => 
  createErrorResponse(c, error, ErrorCode.TIMEOUT, 504);

export const isStr = (s: unknown): s is string => typeof s === 'string' && s.length > 0;
