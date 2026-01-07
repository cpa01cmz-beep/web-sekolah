import type { Context, Next } from 'hono';
import { integrationMonitor } from '../integration-monitor';
import { logger } from '../logger';

export function errorMonitoring() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      const status = c.res.status || 500;
      const code = error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_SERVER_ERROR';
      const endpoint = c.req.path;

      integrationMonitor.recordApiError(code, status, endpoint);
      throw error;
    }
  };
}

export function responseErrorMonitoring() {
  return async (c: Context, next: Next) => {
    await next();

    const status = c.res.status;
    if (status >= 400) {
      const code = mapStatusToErrorCode(status);
      const endpoint = c.req.path;

      integrationMonitor.recordApiError(code, status, endpoint);
      logger.debug('HTTP error response recorded', {
        status,
        code,
        endpoint,
      });
    }
  };
}

function mapStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 408:
      return 'TIMEOUT';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    case 504:
      return 'TIMEOUT';
    default:
      if (status >= 500) return 'INTERNAL_SERVER_ERROR';
      return 'NETWORK_ERROR';
  }
}
