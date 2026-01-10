import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker } from '../CircuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-key');
  });

  describe('initial state', () => {
    it('should start with circuit closed', () => {
      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
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

    it('should close circuit after successful call in half-open state', async () => {
      const breakerWithShortTimeout = new CircuitBreaker('test-key', { timeoutMs: 100 });
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));
      
      for (let i = 0; i < 5; i++) {
        try {
          await breakerWithShortTimeout.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      let state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 150));

      const successFn = vi.fn().mockResolvedValue('success');
      await breakerWithShortTimeout.execute(successFn);

      state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
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

    it('should open circuit after reaching failure threshold', async () => {
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

    it('should reject calls immediately when circuit is open', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      
      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected to fail
        }
      }

      await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is open');
      expect(fn).toHaveBeenCalledTimes(5);
    });

    it('should allow retry after timeout period', async () => {
      const breakerWithShortTimeout = new CircuitBreaker('test-key', { timeoutMs: 100 });
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));
      
      for (let i = 0; i < 5; i++) {
        try {
          await breakerWithShortTimeout.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      const successFn = vi.fn().mockResolvedValue('success');
      const result = await breakerWithShortTimeout.execute(successFn);
      
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
      
      const state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(false);
    });
  });

  describe('state management', () => {
    it('should provide current state', () => {
      const state = breaker.getState();
      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('nextAttemptTime');
    });

    it('should reset circuit to closed state', async () => {
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));
      
      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      expect(breaker.getState().isOpen).toBe(true);

      breaker.reset();
      expect(breaker.getState().isOpen).toBe(false);
      expect(breaker.getState().failureCount).toBe(0);
    });
  });

  describe('custom configuration', () => {
    it('should use custom failure threshold', async () => {
      const customBreaker = new CircuitBreaker('test-key', { failureThreshold: 3 });
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));
      
      for (let i = 0; i < 3; i++) {
        try {
          await customBreaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      expect(customBreaker.getState().isOpen).toBe(true);
    });

    it('should use custom timeout', async () => {
      const customBreaker = new CircuitBreaker('test-key', { timeoutMs: 50 });
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));
      
      for (let i = 0; i < 5; i++) {
        try {
          await customBreaker.execute(failureFn);
        } catch {
          // Expected to fail
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const successFn = vi.fn().mockResolvedValue('success');
      await customBreaker.execute(successFn);
      
      expect(customBreaker.getState().isOpen).toBe(false);
    });
  });

  describe('createWebhookBreaker', () => {
    it('should create circuit breaker with webhook URL key', () => {
      const webhookBreaker = CircuitBreaker.createWebhookBreaker('https://example.com/webhook');
      const state = webhookBreaker.getState();

      expect(state.isOpen).toBe(false);
    });
  });

  describe('half-open state with multiple calls', () => {
    it('should require multiple successful calls to close circuit (halfOpenMaxCalls)', async () => {
      const breakerWithShortTimeout = new CircuitBreaker('test', { failureThreshold: 3, timeoutMs: 50, halfOpenMaxCalls: 3 });
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await breakerWithShortTimeout.execute(failureFn);
        } catch {
        }
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      const successFn = vi.fn().mockResolvedValue('success');

      await breakerWithShortTimeout.execute(successFn);
      let state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);

      await breakerWithShortTimeout.execute(successFn);
      state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);

      await breakerWithShortTimeout.execute(successFn);
      state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(false);
    });

    it('should reset halfOpenCalls when failure occurs in half-open state', async () => {
      const breakerWithShortTimeout = new CircuitBreaker('test', { failureThreshold: 3, timeoutMs: 50, halfOpenMaxCalls: 3 });
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await breakerWithShortTimeout.execute(failureFn);
        } catch {
        }
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      const successFn = vi.fn().mockResolvedValue('success');

      await breakerWithShortTimeout.execute(successFn);
      try {
        await breakerWithShortTimeout.execute(failureFn);
      } catch {
      }

      let state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 150));

      await breakerWithShortTimeout.execute(successFn);
      state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);
    });

    it('should handle default halfOpenMaxCalls (3)', async () => {
      const breakerWithShortTimeout = new CircuitBreaker('test', { failureThreshold: 3, timeoutMs: 50 });
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await breakerWithShortTimeout.execute(failureFn);
        } catch {
        }
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      const successFn = vi.fn().mockResolvedValue('success');

      await breakerWithShortTimeout.execute(successFn);
      let state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);

      await breakerWithShortTimeout.execute(successFn);
      state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(true);

      await breakerWithShortTimeout.execute(successFn);
      state = breakerWithShortTimeout.getState();
      expect(state.isOpen).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid consecutive failures', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(breaker.execute(fn));
      }

      await Promise.allSettled(promises);

      const state = breaker.getState();
      expect(state.isOpen).toBe(true);
    });

    it('should handle mixed success and failures', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const failureFn = vi.fn().mockRejectedValue(new Error('fail'));

      await breaker.execute(successFn);
      try {
        await breaker.execute(failureFn);
      } catch {
      }
      await breaker.execute(successFn);

      const state = breaker.getState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
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

    it('should handle function throwing non-Error objects', async () => {
      const fn = vi.fn().mockRejectedValue('string error');

      try {
        await breaker.execute(fn);
      } catch {
      }

      const state = breaker.getState();
      expect(state.failureCount).toBe(1);
    });

    it('should handle function throwing null', async () => {
      const fn = vi.fn().mockRejectedValue(null);

      try {
        await breaker.execute(fn);
      } catch {
      }

      const state = breaker.getState();
      expect(state.failureCount).toBe(1);
    });

    it('should handle function throwing undefined', async () => {
      const fn = vi.fn().mockRejectedValue(undefined);

      try {
        await breaker.execute(fn);
      } catch {
      }

      const state = breaker.getState();
      expect(state.failureCount).toBe(1);
    });

    it('should handle calling getState multiple times', () => {
      const state1 = breaker.getState();
      const state2 = breaker.getState();
      const state3 = breaker.getState();

      expect(state1).toEqual(state2);
      expect(state2).toEqual(state3);
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
});