export const HttpHeader = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  X_REQUEST_ID: 'X-Request-ID',
  X_RATELIMIT_LIMIT: 'X-RateLimit-Limit',
  X_RATELIMIT_REMAINING: 'X-RateLimit-Remaining',
  X_RATELIMIT_RESET: 'X-RateLimit-Reset',
  X_CF_RAY: 'X-CF-Ray',
  CF_REQUEST_ID: 'cf-request-id',
} as const;

export const ContentType = {
  JSON: 'application/json',
  HTML: 'text/html',
  TEXT: 'text/plain',
} as const;

export const AuthPrefix = {
  BEARER: 'Bearer',
} as const;

export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const HttpStatusRange = {
  isSuccess: (code: number): boolean => code >= 200 && code < 300,
  isClientError: (code: number): boolean => code >= 400 && code < 500,
  isServerError: (code: number): boolean => code >= 500 && code < 600,
} as const;
