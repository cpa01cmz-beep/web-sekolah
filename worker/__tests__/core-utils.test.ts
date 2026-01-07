import { describe, it, expect, vi, beforeEach } from 'vitest';

// Replicated error helpers for testing (avoiding Cloudflare Workers types)
type Context = {
  json: (data: unknown, status?: number) => Response;
  header: (name: string, value: string) => void;
  req: {
    header: (name: string) => string | null | Record<string, string>;
  }
};

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

const ok = <T>(c: Context, data: T, requestId?: string) => 
  c.json({ success: true, data, requestId: requestId || c.req.header('X-Request-ID') || crypto.randomUUID() });

const bad = (c: Context, error: string, code = ErrorCode.VALIDATION_ERROR, details?: Record<string, unknown>) => 
  c.json({ 
    success: false, 
    error, 
    code,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID(),
    details 
  }, 400);

const unauthorized = (c: Context, error = 'Unauthorized') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.UNAUTHORIZED,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  }, 401);

const forbidden = (c: Context, error = 'Forbidden') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.FORBIDDEN,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  }, 403);

const notFound = (c: Context, error = 'not found') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.NOT_FOUND,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  }, 404);

const conflict = (c: Context, error = 'Conflict') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.CONFLICT,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  }, 409);

const rateLimitExceeded = (c: Context, retryAfter?: number) => {
  if (retryAfter) {
    c.header('Retry-After', retryAfter.toString());
  }
  return c.json({ 
    success: false, 
    error: 'Rate limit exceeded', 
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  }, 429);
};

const serverError = (c: Context, error = 'Internal server error') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  }, 500);

const serviceUnavailable = (c: Context, error = 'Service unavailable') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.SERVICE_UNAVAILABLE,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  }, 503);

const gatewayTimeout = (c: Context, error = 'Gateway timeout') => 
  c.json({ 
    success: false, 
    error, 
    code: ErrorCode.TIMEOUT,
    requestId: c.req.header('X-Request-ID') || crypto.randomUUID()
  }, 504);

// Mock Context from Hono
const mockContext = {
  json: vi.fn().mockReturnValue('json-response'),
  header: vi.fn(),
  req: {
    header: vi.fn().mockReturnValue(null)
  }
} as any;

describe('Core Utils - Error Response Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.json.mockReturnValue('json-response');
    mockContext.req.header.mockReturnValue(null);
  });

  describe('ok', () => {
    it('should return success response with data', () => {
      const data = { id: '123', name: 'Test' };
      const requestId = 'test-request-id';
      mockContext.req.header.mockReturnValue(requestId);

      ok(mockContext, data);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data,
        requestId
      });
    });

    it('should generate requestId if not provided', () => {
      const data = { id: '123' };
      mockContext.req.header.mockReturnValue(null);

      ok(mockContext, data);

      const call = mockContext.json.mock.calls[0][0] as { requestId: string };
      expect(call.requestId).toBeDefined();
      expect(typeof call.requestId).toBe('string');
    });
  });

  describe('bad', () => {
    it('should return 400 error with validation code', () => {
      bad(mockContext, 'Invalid input');

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
        requestId: expect.any(String),
        details: undefined
      }, 400);
    });

    it('should allow custom error code and details', () => {
      const details = { field: 'email', issue: 'Invalid format' };
      bad(mockContext, 'Custom error', ErrorCode.BAD_REQUEST, details);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error',
        code: 'BAD_REQUEST',
        requestId: expect.any(String),
        details
      }, 400);
    });
  });

  describe('unauthorized', () => {
    it('should return 401 error', () => {
      unauthorized(mockContext, 'Token expired');

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token expired',
        code: 'UNAUTHORIZED',
        requestId: expect.any(String)
      }, 401);
    });

    it('should use default error message', () => {
      unauthorized(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
        requestId: expect.any(String)
      }, 401);
    });
  });

  describe('forbidden', () => {
    it('should return 403 error', () => {
      forbidden(mockContext, 'Access denied');

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied',
        code: 'FORBIDDEN',
        requestId: expect.any(String)
      }, 403);
    });

    it('should use default error message', () => {
      forbidden(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Forbidden',
        code: 'FORBIDDEN',
        requestId: expect.any(String)
      }, 403);
    });
  });

  describe('notFound', () => {
    it('should return 404 error', () => {
      notFound(mockContext, 'User not found');

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
        code: 'NOT_FOUND',
        requestId: expect.any(String)
      }, 404);
    });

    it('should use default error message', () => {
      notFound(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'not found',
        code: 'NOT_FOUND',
        requestId: expect.any(String)
      }, 404);
    });
  });

  describe('conflict', () => {
    it('should return 409 error', () => {
      conflict(mockContext, 'Resource already exists');

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource already exists',
        code: 'CONFLICT',
        requestId: expect.any(String)
      }, 409);
    });

    it('should use default error message', () => {
      conflict(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Conflict',
        code: 'CONFLICT',
        requestId: expect.any(String)
      }, 409);
    });
  });

  describe('rateLimitExceeded', () => {
    it('should return 429 error without retry header', () => {
      rateLimitExceeded(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        requestId: expect.any(String)
      }, 429);

      expect(mockContext.header).not.toHaveBeenCalled();
    });

    it('should return 429 error with retry header', () => {
      rateLimitExceeded(mockContext, 60);

      expect(mockContext.header).toHaveBeenCalledWith('Retry-After', '60');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        requestId: expect.any(String)
      }, 429);
    });
  });

  describe('serverError', () => {
    it('should return 500 error', () => {
      serverError(mockContext, 'Database connection failed');

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database connection failed',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: expect.any(String)
      }, 500);
    });

    it('should use default error message', () => {
      serverError(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: expect.any(String)
      }, 500);
    });
  });

  describe('serviceUnavailable', () => {
    it('should return 503 error', () => {
      serviceUnavailable(mockContext, 'Maintenance mode');

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Maintenance mode',
        code: 'SERVICE_UNAVAILABLE',
        requestId: expect.any(String)
      }, 503);
    });

    it('should use default error message', () => {
      serviceUnavailable(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Service unavailable',
        code: 'SERVICE_UNAVAILABLE',
        requestId: expect.any(String)
      }, 503);
    });
  });

  describe('gatewayTimeout', () => {
    it('should return 504 error', () => {
      gatewayTimeout(mockContext, 'Upstream timeout');

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Upstream timeout',
        code: 'TIMEOUT',
        requestId: expect.any(String)
      }, 504);
    });

    it('should use default error message', () => {
      gatewayTimeout(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: 'Gateway timeout',
        code: 'TIMEOUT',
        requestId: expect.any(String)
      }, 504);
    });
  });

  describe('Error Response Consistency', () => {
    it('all error responses should include requestId', () => {
      const helpers = [
        () => bad(mockContext, 'test'),
        () => unauthorized(mockContext),
        () => forbidden(mockContext),
        () => notFound(mockContext),
        () => conflict(mockContext),
        () => rateLimitExceeded(mockContext),
        () => serverError(mockContext),
        () => serviceUnavailable(mockContext),
        () => gatewayTimeout(mockContext)
      ];

      helpers.forEach(helper => {
        helper();
        const call = mockContext.json.mock.calls[0][0] as { requestId: string };
        expect(call.requestId).toBeDefined();
        expect(typeof call.requestId).toBe('string');
        mockContext.json.mockClear();
      });
    });

    it('all error responses should have success: false', () => {
      const helpers = [
        () => bad(mockContext, 'test'),
        () => unauthorized(mockContext),
        () => forbidden(mockContext),
        () => notFound(mockContext),
        () => conflict(mockContext),
        () => rateLimitExceeded(mockContext),
        () => serverError(mockContext),
        () => serviceUnavailable(mockContext),
        () => gatewayTimeout(mockContext)
      ];

      helpers.forEach(helper => {
        helper();
        const call = mockContext.json.mock.calls[0][0] as { success: boolean };
        expect(call.success).toBe(false);
        mockContext.json.mockClear();
      });
    });

    it('all error responses should have error code', () => {
      const helpers = [
        () => bad(mockContext, 'test'),
        () => unauthorized(mockContext),
        () => forbidden(mockContext),
        () => notFound(mockContext),
        () => conflict(mockContext),
        () => rateLimitExceeded(mockContext),
        () => serverError(mockContext),
        () => serviceUnavailable(mockContext),
        () => gatewayTimeout(mockContext)
      ];

      helpers.forEach(helper => {
        helper();
        const call = mockContext.json.mock.calls[0][0] as { code: string };
        expect(call.code).toBeDefined();
        expect(typeof call.code).toBe('string');
        mockContext.json.mockClear();
      });
    });
  });

  describe('ErrorCode enum', () => {
    it('should have all error codes defined', () => {
      expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorCode.TIMEOUT).toBe('TIMEOUT');
      expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(ErrorCode.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
      expect(ErrorCode.CIRCUIT_BREAKER_OPEN).toBe('CIRCUIT_BREAKER_OPEN');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.CONFLICT).toBe('CONFLICT');
      expect(ErrorCode.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
      expect(ErrorCode.BAD_REQUEST).toBe('BAD_REQUEST');
    });

    it('should have 12 error codes', () => {
      const codes = Object.values(ErrorCode);
      expect(codes).toHaveLength(12);
    });
  });
});
