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
});