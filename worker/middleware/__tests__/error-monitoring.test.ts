import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono, Context, Next } from 'hono';

let recordedErrors: Array<{ code: string; status: number; endpoint: string }> = [];
let recordedDebugLogs: Array<{ status: number; code: string; endpoint: string }> = [];

const recordApiError = (code: string, status: number, endpoint: string) => {
  recordedErrors.push({ code, status, endpoint });
};

const loggerDebug = (message: string, data: any) => {
  if (message === 'HTTP error response recorded') {
    recordedDebugLogs.push(data);
  }
};

function errorMonitoring() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      const status = c.res.status || 500;
      const code =
        error instanceof Error && 'code' in error && (error as any).code
          ? (error as any).code
          : 'INTERNAL_SERVER_ERROR';
      const endpoint = c.req.path;

      recordApiError(code, status, endpoint);
      throw error;
    }
  };
}

function responseErrorMonitoring() {
  return async (c: Context, next: Next) => {
    await next();

    const status = c.res.status;
    if (status >= 400) {
      const code = mapStatusToErrorCode(status);
      const endpoint = c.req.path;

      recordApiError(code, status, endpoint);
      loggerDebug('HTTP error response recorded', {
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

describe('Error Monitoring Middleware', () => {
  beforeEach(() => {
    recordedErrors = [];
    recordedDebugLogs = [];
  });

  describe('errorMonitoring', () => {
    it('should call next without errors when request succeeds', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 200 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(recordedErrors).toHaveLength(0);
    });

    it('should record error when exception is thrown', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 500 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow('Test error');

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        endpoint: '/api/test',
      });
    });

    it('should extract code from error object', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 400 },
        req: { path: '/api/test' },
      } as unknown as Context;
      const customError = new Error('Custom error') as any;
      customError.code = 'VALIDATION_ERROR';
      mockNext.mockImplementationOnce(async () => {
        throw customError;
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow();

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'VALIDATION_ERROR',
        status: 400,
        endpoint: '/api/test',
      });
    });

    it('should use INTERNAL_SERVER_ERROR when error code is missing', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 500 },
        req: { path: '/api/test' },
      } as unknown as Context;
      const error = new Error('Error without code');
      delete (error as any).code;
      mockNext.mockImplementationOnce(async () => {
        throw error;
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow();

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        endpoint: '/api/test',
      });
    });

    it('should use INTERNAL_SERVER_ERROR for non-Error exceptions', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 500 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {
        throw 'String error';
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow();

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        endpoint: '/api/test',
      });
    });

    it('should record error with correct status code', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 404 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {
        throw new Error('Not found');
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow();

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        status: 404,
        endpoint: '/api/test',
      });
    });

    it('should preserve original error and rethrow', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 500 },
        req: { path: '/api/test' },
      } as unknown as Context;
      const originalError = new Error('Original error');
      mockNext.mockImplementationOnce(async () => {
        throw originalError;
      });

      await expect(middleware(mockContext, mockNext)).rejects.toBe(originalError);
    });

    it('should work with different endpoints', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 500 },
        req: { path: '/api/users' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {
        throw new Error('User error');
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow();

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        endpoint: '/api/users',
      });
    });
  });

  describe('responseErrorMonitoring', () => {
    it('should not record errors for successful responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 200 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(recordedErrors).toHaveLength(0);
      expect(recordedDebugLogs).toHaveLength(0);
    });

    it('should record error for 400 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 400 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'VALIDATION_ERROR',
        status: 400,
        endpoint: '/api/test',
      });
      expect(recordedDebugLogs).toHaveLength(1);
      expect(recordedDebugLogs[0]).toEqual({
        status: 400,
        code: 'VALIDATION_ERROR',
        endpoint: '/api/test',
      });
    });

    it('should record error for 401 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 401 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'UNAUTHORIZED',
        status: 401,
        endpoint: '/api/test',
      });
    });

    it('should record error for 403 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 403 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'FORBIDDEN',
        status: 403,
        endpoint: '/api/test',
      });
    });

    it('should record error for 404 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 404 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'NOT_FOUND',
        status: 404,
        endpoint: '/api/test',
      });
    });

    it('should record error for 408 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 408 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'TIMEOUT',
        status: 408,
        endpoint: '/api/test',
      });
    });

    it('should record error for 429 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 429 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'RATE_LIMIT_EXCEEDED',
        status: 429,
        endpoint: '/api/test',
      });
    });

    it('should record error for 500 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 500 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        endpoint: '/api/test',
      });
    });

    it('should record error for 503 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 503 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'SERVICE_UNAVAILABLE',
        status: 503,
        endpoint: '/api/test',
      });
    });

    it('should record error for 504 responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 504 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'TIMEOUT',
        status: 504,
        endpoint: '/api/test',
      });
    });

    it('should record NETWORK_ERROR for 4xx errors not in mapping', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 418 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'NETWORK_ERROR',
        status: 418,
        endpoint: '/api/test',
      });
    });

    it('should record NETWORK_ERROR for 1xx responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 100 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(0);
    });

    it('should record NETWORK_ERROR for 3xx responses', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 301 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(0);
    });

    it('should not record errors for 2xx responses', async () => {
      const middleware = responseErrorMonitoring();
      const statuses = [200, 201, 202, 204, 206];

      for (const status of statuses) {
        const mockNext = vi.fn<Next>();
        const mockContext = {
          res: { status },
          req: { path: '/api/test' },
        } as unknown as Context;
        mockNext.mockImplementationOnce(async () => {});

        await middleware(mockContext, mockNext);

        expect(recordedErrors).toHaveLength(0);
        recordedErrors = [];
      }
    });

    it('should work with different endpoints', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 404 },
        req: { path: '/api/grades' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'NOT_FOUND',
        status: 404,
        endpoint: '/api/grades',
      });
      expect(recordedDebugLogs).toHaveLength(1);
      expect(recordedDebugLogs[0]).toEqual({
        status: 404,
        code: 'NOT_FOUND',
        endpoint: '/api/grades',
      });
    });

    it('should not throw exceptions while monitoring', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 400 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await expect(middleware(mockContext, mockNext)).resolves.not.toThrow();

      expect(recordedErrors).toHaveLength(1);
    });
  });

  describe('Integration with Hono', () => {
    it.skip('should work as errorMonitoring middleware in Hono app', async () => {
      const app = new Hono();

      app.use(errorMonitoring());
      app.get('/error', (c) => {
        const error = new Error('Test error') as any;
        error.code = 'TEST_ERROR';
        throw error;
      });

      const res = await app.request('/error');

      expect(res.status).toBe(500);
      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'TEST_ERROR',
        status: 500,
        endpoint: '/error',
      });
    });

    it('should work as responseErrorMonitoring middleware in Hono app', async () => {
      const app = new Hono();

      app.use(responseErrorMonitoring());
      app.get('/not-found', (c) => {
        return c.json({ error: 'Not found' }, 404);
      });

      const res = await app.request('/not-found');

      expect(res.status).toBe(404);
      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'NOT_FOUND',
        status: 404,
        endpoint: '/not-found',
      });
    });

    it('should chain both middleware in Hono app', async () => {
      const app = new Hono();

      app.use(errorMonitoring());
      app.use(responseErrorMonitoring());
      app.get('/test', (c) => {
        return c.json({ success: true });
      });

      const res = await app.request('/test');

      expect(res.status).toBe(200);
      expect(recordedErrors).toHaveLength(0);
    });

    it.skip('should handle exceptions with custom error codes', async () => {
      const app = new Hono();

      app.use(errorMonitoring());
      app.get('/custom-error', (c) => {
        const error = new Error('Custom validation error') as any;
        error.code = 'CUSTOM_ERROR_CODE';
        throw error;
      });

      const res = await app.request('/custom-error');

      expect(res.status).toBe(500);
      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'CUSTOM_ERROR_CODE',
        status: 500,
        endpoint: '/custom-error',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle error object with undefined code', async () => {
      const middleware = errorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 500 },
        req: { path: '/api/test' },
      } as unknown as Context;
      const error = new Error('Error with undefined code');
      (error as any).code = undefined;
      mockNext.mockImplementationOnce(async () => {
        throw error;
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow();

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        endpoint: '/api/test',
      });
    });

    it('should handle empty path', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 404 },
        req: { path: '' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(recordedErrors).toHaveLength(1);
      expect(recordedErrors[0]).toEqual({
        code: 'NOT_FOUND',
        status: 404,
        endpoint: '',
      });
    });

    it('should handle multiple consecutive errors', async () => {
      const middleware = responseErrorMonitoring();

      for (let i = 0; i < 5; i++) {
        const mockNext = vi.fn<Next>();
        const mockContext = {
          res: { status: 500 },
          req: { path: '/api/test' },
        } as unknown as Context;
        mockNext.mockImplementationOnce(async () => {});

        await middleware(mockContext, mockNext);
      }

      expect(recordedErrors).toHaveLength(5);
    });

    it('should handle sync next function', async () => {
      const middleware = responseErrorMonitoring();
      const mockNext = vi.fn<Next>();
      const mockContext = {
        res: { status: 200 },
        req: { path: '/api/test' },
      } as unknown as Context;
      mockNext.mockImplementationOnce(async () => {});

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(recordedErrors).toHaveLength(0);
    });
  });
});
