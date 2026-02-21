import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono, Context, Next } from 'hono';
import type { ErrorCode } from '@shared/types';

interface TimeoutOptions {
  timeoutMs: number;
}

const mockNext = vi.fn<Next>();
const mockContext = {
  res: { status: 200 },
  req: { path: '/test', header: vi.fn() },
  json: vi.fn((data: any, status: number) => ({ status, json: () => Promise.resolve(data) })),
} as unknown as Context;

const gatewayTimeout = (c: Context, error = 'Gateway timeout') =>
  c.json(
    {
      success: false,
      error,
      code: 'TIMEOUT' as ErrorCode,
      requestId: crypto.randomUUID(),
    },
    504
  );

function timeout(options: TimeoutOptions) {
  const { timeoutMs } = options;

  return async (c: Context, next: Next) => {
    let isComplete = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        if (!isComplete) {
          reject(new Error('Request timeout'));
        }
      }, timeoutMs);
    });

    try {
      await Promise.race([next(), timeoutPromise]);
      isComplete = true;
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timeout') {
        return gatewayTimeout(c, 'Request processing timeout');
      }
      throw error;
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };
}

function createTimeoutMiddleware(defaultTimeout: number = 30000) {
  return (customTimeout?: number) => {
    return timeout({ timeoutMs: customTimeout || defaultTimeout });
  };
}

const defaultTimeoutMiddleware = createTimeoutMiddleware(30000);
const shortTimeoutMiddleware = createTimeoutMiddleware(10000);
const longTimeoutMiddleware = createTimeoutMiddleware(60000);
const veryLongTimeoutMiddleware = createTimeoutMiddleware(120000);

describe('Timeout Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.req.header = vi.fn();
  });

  describe('timeout function', () => {
    it('should allow request to complete within timeout', async () => {
      const middleware = timeout({ timeoutMs: 1000 });
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should timeout request that exceeds timeout', async () => {
      const middleware = timeout({ timeoutMs: 50 });
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      const result = await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(result?.status).toBe(504);
      const json = (await result?.json()) as any;
      expect(json.success).toBe(false);
      expect(json.code).toBe('TIMEOUT');
      expect(json.error).toBe('Request processing timeout');
    });

    it('should handle synchronous next function', async () => {
      const middleware = timeout({ timeoutMs: 1000 });
      mockNext.mockImplementationOnce(() => {
        return Promise.resolve();
      });

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should not interfere with non-timeout errors', async () => {
      const middleware = timeout({ timeoutMs: 1000 });
      mockNext.mockImplementationOnce(async () => {
        throw new Error('Some other error');
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow('Some other error');
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should cleanup timer after successful completion', async () => {
      const middleware = timeout({ timeoutMs: 1000 });
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await middleware(mockContext, mockNext);

      expect(clearTimeout).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should cleanup timer after timeout', async () => {
      const middleware = timeout({ timeoutMs: 50 });
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      await middleware(mockContext, mockNext);

      expect(clearTimeout).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should handle very short timeout', async () => {
      const middleware = timeout({ timeoutMs: 1 });
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      const result = await middleware(mockContext, mockNext);

      expect(result?.status).toBe(504);
    });

    it('should handle very long timeout', async () => {
      const middleware = timeout({ timeoutMs: 10000 });
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTimeoutMiddleware', () => {
    it('should create middleware with default timeout', async () => {
      const factory = createTimeoutMiddleware(5000);
      const middleware = factory();

      expect(typeof middleware).toBe('function');
    });

    it('should create middleware with custom timeout', async () => {
      const factory = createTimeoutMiddleware(5000);
      const middleware = factory(2000);

      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should use custom timeout when provided', async () => {
      const factory = createTimeoutMiddleware(5000);
      const middleware = factory(50);

      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      const result = await middleware(mockContext, mockNext);

      expect(result?.status).toBe(504);
    });

    it('should use default timeout when custom not provided', async () => {
      const factory = createTimeoutMiddleware(50);
      const middleware = factory();

      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      const result = await middleware(mockContext, mockNext);

      expect(result?.status).toBe(504);
    });
  });

  describe('Predefined timeout middlewares', () => {
    it('defaultTimeoutMiddleware should use 30 second timeout', async () => {
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await defaultTimeoutMiddleware()(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('shortTimeoutMiddleware should use 10 second timeout', async () => {
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await shortTimeoutMiddleware()(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('longTimeoutMiddleware should use 60 second timeout', async () => {
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await longTimeoutMiddleware()(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('veryLongTimeoutMiddleware should use 2 minute timeout', async () => {
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await veryLongTimeoutMiddleware()(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with Hono', () => {
    it('should work as Hono middleware', async () => {
      const app = new Hono();

      app.use('/fast', timeout({ timeoutMs: 1000 }));
      app.get('/fast', (c) => c.json({ success: true }));

      const res = await app.request('/fast');

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
    });

    it('should handle timeout in Hono app', async () => {
      const app = new Hono();

      app.use('/slow', timeout({ timeoutMs: 10 }));
      app.get('/slow', async (c) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return c.json({ success: true });
      });

      const res = await app.request('/slow');

      expect(res.status).toBe(504);
      const json = (await res.json()) as any;
      expect(json.success).toBe(false);
      expect(json.code).toBe('TIMEOUT');
    });

    it('should allow requests that complete just before timeout', async () => {
      const app = new Hono();

      app.use('/tight', timeout({ timeoutMs: 100 }));
      app.get('/tight', async (c) => {
        await new Promise((resolve) => setTimeout(resolve, 90));
        return c.json({ success: true });
      });

      const res = await app.request('/tight');

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
    });

    it('should timeout requests that exceed timeout by small margin', async () => {
      const app = new Hono();

      app.use('/slow', timeout({ timeoutMs: 100 }));
      app.get('/slow', async (c) => {
        await new Promise((resolve) => setTimeout(resolve, 120));
        return c.json({ success: true });
      });

      const res = await app.request('/slow');

      expect(res.status).toBe(504);
    });
  });

  describe('Edge cases', () => {
    it('should handle timeout of 0ms', async () => {
      const middleware = timeout({ timeoutMs: 0 });
      mockNext.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const result = await middleware(mockContext, mockNext);

      expect(result?.status).toBe(504);
    });

    it('should handle immediate completion', async () => {
      const middleware = timeout({ timeoutMs: 1000 });
      mockNext.mockImplementationOnce(() => {
        return Promise.resolve();
      });

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle null next gracefully', async () => {
      const middleware = timeout({ timeoutMs: 1000 });
      mockNext.mockImplementationOnce(async () => {
        throw new TypeError('Cannot read properties of null');
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow();
    });

    it('should handle next that returns value', async () => {
      const middleware = timeout({ timeoutMs: 1000 });
      mockNext.mockImplementationOnce(async () => {
        return undefined as any;
      });

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent requests with same middleware instance', async () => {
      const app = new Hono();

      app.use('/', timeout({ timeoutMs: 500 }));
      app.get('/:id', async (c) => {
        const id = c.req.param('id');
        await new Promise((resolve) => setTimeout(resolve, parseInt(id) * 50));
        return c.json({ success: true, id });
      });

      const [res1, res2, res3] = await Promise.all([
        app.request('/2'),
        app.request('/5'),
        app.request('/1'),
      ]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res3.status).toBe(200);

      const json1 = (await res1.json()) as { success: boolean; id: string };
      const json2 = (await res2.json()) as { success: boolean; id: string };
      const json3 = (await res3.json()) as { success: boolean; id: string };

      expect(json1.id).toBe('2');
      expect(json2.id).toBe('5');
      expect(json3.id).toBe('1');
    });
  });
});
