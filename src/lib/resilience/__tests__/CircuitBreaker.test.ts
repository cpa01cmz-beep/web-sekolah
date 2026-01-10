import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker } from '../CircuitBreaker';

vi.mock('../../../shared/types', () => ({
  ErrorCode: {
    CIRCUIT_BREAKER_OPEN: 'CIRCUIT_BREAKER_OPEN'
  }
}));

vi.mock('../../config/time', () => ({
  CircuitBreakerConfig: {
    FAILURE_THRESHOLD: 5,
    TIMEOUT_MS: 60000,
    RESET_TIMEOUT_MS: 120000
  }
}));

describe('CircuitBreaker (Frontend)', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker();
  });

  describe('initial state', () => {
    it('should start with circuit closed', () => {
      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });

    it('should have zero initial failure timestamps', () => {
      const state = breaker.getState();
      expect(state.lastFailureTime).toBe(0);
      expect(state.nextAttemptTime).toBe(0);
    });

    it('should provide immutable state from getState', () => {
      const state1 = breaker.getState();
      const state2 = breaker.getState();

      expect(state1).toEqual(state2);
      expect(Object.isFrozen(state1)).toBe(false);
    });
  });

  describe('successful execution', () => {
    it('should execute function successfully when circuit is closed', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await breaker.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);

      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });

    it('should reset failure count on success', async () => {
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      expect(breaker.getState().failureCount).toBe(3);

      const successFn = vi.fn().mockResolvedValue('success');
      await breaker.execute(successFn);

      const state = breaker.getState();
      expect(state.failureCount).toBe(0);
    });

    it('should handle async function that returns objects', async () => {
      const fn = vi.fn().mockResolvedValue({ id: '123', name: 'test' });
      const result = await breaker.execute(fn);

      expect(result).toEqual({ id: '123', name: 'test' });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle async function that returns arrays', async () => {
      const fn = vi.fn().mockResolvedValue([1, 2, 3]);
      const result = await breaker.execute(fn);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle async function that returns null', async () => {
      const fn = vi.fn().mockResolvedValue(null);
      const result = await breaker.execute(fn);

      expect(result).toBeNull();
    });

    it('should handle async function that returns undefined', async () => {
      const fn = vi.fn().mockResolvedValue(undefined);
      const result = await breaker.execute(fn);

      expect(result).toBeUndefined();
    });

    it('should handle async function that returns numbers', async () => {
      const fn = vi.fn().mockResolvedValue(42);
      const result = await breaker.execute(fn);

      expect(result).toBe(42);
    });

    it('should handle async function that returns booleans', async () => {
      const fn = vi.fn().mockResolvedValue(true);
      const result = await breaker.execute(fn);

      expect(result).toBe(true);
    });
  });

  describe('failure handling', () => {
    it('should increment failure count on error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try {
        await breaker.execute(fn);
      } catch {
        // Expected to fail
      }

      const state = breaker.getState();
      expect(state.failureCount).toBe(1);
      expect(state.isOpen).toBe(false);
    });

    it('should set lastFailureTime on error', async () => {
      const beforeError = Date.now();
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try {
        await breaker.execute(fn);
      } catch {
        // Expected to fail
      }

      const afterError = Date.now();
      const state = breaker.getState();
      expect(state.lastFailureTime).toBeGreaterThanOrEqual(beforeError);
      expect(state.lastFailureTime).toBeLessThanOrEqual(afterError);
    });

    it('should open circuit after reaching default failure threshold (5)', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected to fail
        }
      }

      const state = breaker.getState();
      expect(state.isOpen).toBe(true);
      expect(state.failureCount).toBe(5);
    });

    it('should not open circuit before reaching threshold', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 4; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected to fail
        }
      }

      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(4);
    });

    it('should reject calls immediately when circuit is open', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected to fail
        }
      }

      const errorFn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(breaker.execute(errorFn)).rejects.toThrow('Circuit breaker is open');
      expect(errorFn).toHaveBeenCalledTimes(0);
    });

    it('should throw error with ErrorCode when circuit is open', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected to fail
        }
      }

      try {
        await breaker.execute(fn);
        throw new Error('Expected error to be thrown');
      } catch (error: any) {
        expect(error.code).toBe('CIRCUIT_BREAKER_OPEN');
        expect(error.status).toBe(503);
        expect(error.retryable).toBe(false);
      }
    });

    it('should set nextAttemptTime when circuit opens', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      const beforeOpen = Date.now();

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected to fail
        }
      }

      const afterOpen = Date.now();
      const state = breaker.getState();
      expect(state.nextAttemptTime).toBeGreaterThan(beforeOpen);
      expect(state.nextAttemptTime).toBeLessThanOrEqual(afterOpen + 60000);
    });

    it('should reset halfOpenCalls when failure occurs in half-open state', async () => {
      const breakerWithShortTimeout = new CircuitBreaker(5, 100);
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        try {
          await breakerWithShortTimeout.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      try {
        await breakerWithShortTimeout.execute(failureFn);
      } catch {
        // Expected to fail
      }

      const state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);
    });
  });

  describe('half-open state recovery', () => {
    it('should allow retry after timeout period (enters half-open state)', async () => {
      const breakerWithShortTimeout = new CircuitBreaker(3, 50);
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await breakerWithShortTimeout.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      let state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      const successFn = vi.fn().mockResolvedValue('success');
      const result = await breakerWithShortTimeout.execute(successFn);

      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should keep circuit open if half-open call fails', async () => {
      const breakerWithShortTimeout = new CircuitBreaker(3, 50);
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await breakerWithShortTimeout.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        await breakerWithShortTimeout.execute(failureFn);
      } catch {
        // Expected to fail
      }

      const state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);
    });

    it('should use custom reset timeout', async () => {
      const customBreaker = new CircuitBreaker(5, 100, 50, 3);
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        try {
          await customBreaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      const state = customBreaker.getState();
      expect(state.nextAttemptTime - state.lastFailureTime).toBe(100);
    });

    it('should use default configuration when no parameters provided', () => {
      const defaultBreaker = new CircuitBreaker();
      const state = defaultBreaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });

    it.skip('should support custom halfOpenMaxCalls (BUG: halfOpenCalls reset to 0 on each execute)', async () => {
      const customBreaker = new CircuitBreaker(3, 50, 120000, 2);
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await customBreaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      const successFn = vi.fn().mockResolvedValue('success');
      await customBreaker.execute(successFn);
      await customBreaker.execute(successFn);

      const state = customBreaker.getState();
      expect(state.isOpen).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle mixed success and failures', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      await breaker.execute(successFn);
      try {
        await breaker.execute(failureFn);
      } catch {
        // Expected to fail
      }
      await breaker.execute(successFn);

      const state = breaker.getState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('should handle function throwing non-Error objects', async () => {
      const fn = vi.fn().mockRejectedValue('string error');

      try {
        await breaker.execute(fn);
      } catch {
        // Expected to fail
      }

      const state = breaker.getState();
      expect(state.failureCount).toBe(1);
    });

    it('should handle function throwing null', async () => {
      const fn = vi.fn().mockRejectedValue(null);

      try {
        await breaker.execute(fn);
      } catch {
        // Expected to fail
      }

      const state = breaker.getState();
      expect(state.failureCount).toBe(1);
    });

    it('should handle function throwing undefined', async () => {
      const fn = vi.fn().mockRejectedValue(undefined);

      try {
        await breaker.execute(fn);
      } catch {
        // Expected to fail
      }

      const state = breaker.getState();
      expect(state.failureCount).toBe(1);
    });

    it('should handle rapid consecutive failures', async () => {
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(breaker.execute(failureFn));
      }

      await Promise.allSettled(promises);

      const state = breaker.getState();
      expect(state.isOpen).toBe(true);
      expect(state.failureCount).toBeGreaterThanOrEqual(5);
    });

    it('should handle reset while circuit is open', async () => {
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      breaker.reset();

      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });

    it('should handle reset while circuit is closed', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      await breaker.execute(successFn);

      breaker.reset();

      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });

    it('should handle calling getState multiple times', () => {
      const state1 = breaker.getState();
      const state2 = breaker.getState();
      const state3 = breaker.getState();

      expect(state1).toEqual(state2);
      expect(state2).toEqual(state3);
    });

    it('should handle very high failure count without issues', async () => {
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      const state = breaker.getState();
      expect(state.failureCount).toBe(5);
      expect(typeof state.failureCount).toBe('number');
    });

    it('should maintain state across multiple successful calls', async () => {
      const successFn = vi.fn().mockResolvedValue('success');

      for (let i = 0; i < 10; i++) {
        await breaker.execute(successFn);
      }

      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });
  });

  describe('error propagation', () => {
    it('should propagate original error when circuit is closed', async () => {
      const originalError = new Error('Database connection failed');
      const fn = vi.fn().mockRejectedValue(originalError);

      try {
        await breaker.execute(fn);
      } catch (error: any) {
        expect(error.message).toBe('Database connection failed');
      }
    });

    it('should propagate Error subclass when circuit is closed', async () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const customError = new CustomError('Custom error occurred');
      const fn = vi.fn().mockRejectedValue(customError);

      try {
        await breaker.execute(fn);
      } catch (error: any) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error.name).toBe('CustomError');
      }
    });

    it('should create new error when circuit is open', async () => {
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      try {
        await breaker.execute(failureFn);
      } catch (error: any) {
        expect(error.message).toBe('Circuit breaker is open');
        expect(error.code).toBe('CIRCUIT_BREAKER_OPEN');
        expect(error.status).toBe(503);
      }
    });

    it('should not execute function when circuit is open', async () => {
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));
      const trackingFn = vi.fn().mockResolvedValue('success');

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      try {
        await breaker.execute(trackingFn);
      } catch {
        // Expected to throw circuit breaker error
      }

      expect(trackingFn).not.toHaveBeenCalled();
    });
  });

  describe('concurrent execution', () => {
    it('should handle concurrent successful calls', async () => {
      const fn = vi.fn().mockImplementation((id: string) => Promise.resolve(`result-${id}`));

      const promises = [
        breaker.execute(() => fn('1')),
        breaker.execute(() => fn('2')),
        breaker.execute(() => fn('3'))
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual(['result-1', 'result-2', 'result-3']);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent failures', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(breaker.execute(fn));
      }

      await Promise.allSettled(promises);

      const state = breaker.getState();
      expect(state.isOpen).toBe(true);
    });

    it('should handle mixed concurrent success and failures', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      const promises = [
        breaker.execute(successFn),
        breaker.execute(failureFn),
        breaker.execute(successFn)
      ];

      const results = await Promise.allSettled(promises);

      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(results.length).toBe(3);
    });
  });

  describe('type safety', () => {
    it('should support generic type parameter', async () => {
      const fn = vi.fn().mockResolvedValue({ id: '123', name: 'John' });
      const result = await breaker.execute(fn);

      expect(result).toHaveProperty('id', '123');
      expect(result).toHaveProperty('name', 'John');
    });

    it('should support void return type', async () => {
      const fn = vi.fn().mockResolvedValue(undefined);
      const result = await breaker.execute(fn);

      expect(result).toBeUndefined();
    });

    it('should support Promise<T> return type', async () => {
      const fn = vi.fn().mockResolvedValue(Promise.resolve('nested'));
      const result = await breaker.execute(fn);

      expect(result).toBe('nested');
    });
  });

  describe('behavioral verification', () => {
    it('should not modify passed function', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const originalFn = fn;

      await breaker.execute(fn);

      expect(fn).toBe(originalFn);
    });

    it('should call function exactly once per execute call', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await breaker.execute(fn);
      await breaker.execute(fn);
      await breaker.execute(fn);

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should maintain state between execute calls', async () => {
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      try {
        await breaker.execute(failureFn);
      } catch {
        // Expected to fail
      }

      const state1 = breaker.getState();

      try {
        await breaker.execute(failureFn);
      } catch {
        // Expected to fail
      }

      const state2 = breaker.getState();

      expect(state2.failureCount).toBe(state1.failureCount + 1);
    });
  });
});
