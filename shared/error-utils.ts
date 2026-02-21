import { ErrorCode } from './types';

export function mapStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 408:
      return ErrorCode.TIMEOUT;
    case 409:
      return ErrorCode.CONFLICT;
    case 422:
      return ErrorCode.BAD_REQUEST;
    case 429:
      return ErrorCode.RATE_LIMIT_EXCEEDED;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    case 504:
      return ErrorCode.TIMEOUT;
    default:
      if (status >= 500) return ErrorCode.INTERNAL_SERVER_ERROR;
      return ErrorCode.NETWORK_ERROR;
  }
}
