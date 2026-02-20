import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreaker } from '../CircuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-key', {
      failureThreshold: 3,
      timeoutMs: 1000,
      halfOpenMaxCalls: 1,
    });
  });

  describe('isOpen()', () => {
    it('should return false when circuit is closed', () => {
      expect(breaker.isOpen()).toBe(false);
    });

    it('should return true when circuit is open and within timeout', async () => {
      vi.useFakeTimers();

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      expect(breaker.isOpen()).toBe(true);

      vi.useRealTimers();
    });

    it('should return false when circuit is half-open (timeout elapsed)', async () => {
      vi.useFakeTimers();

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      expect(breaker.isOpen()).toBe(true);

      vi.advanceTimersByTime(1001);

      expect(breaker.isOpen()).toBe(false);

      vi.useRealTimers();
    });

    it('should return false after successful execution closes circuit', async () => {
      vi.useFakeTimers();

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      expect(breaker.isOpen()).toBe(true);

      vi.advanceTimersByTime(1001);

      await breaker.execute(() => Promise.resolve('success'));

      expect(breaker.isOpen()).toBe(false);

      vi.useRealTimers();
    });

    it('should return false after reset', async () => {
      vi.useFakeTimers();

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      expect(breaker.isOpen()).toBe(true);

      breaker.reset();

      expect(breaker.isOpen()).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('execute()', () => {
    it('should execute function when circuit is closed', async () => {
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
    });

    it('should open circuit after failure threshold reached', async () => {
      vi.useFakeTimers();

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      const state = breaker.getState();
      expect(state.isOpen).toBe(true);
      expect(state.failureCount).toBe(3);

      vi.useRealTimers();
    });

    it('should reject immediately when circuit is open', async () => {
      vi.useFakeTimers();

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      await expect(breaker.execute(() => Promise.resolve('success')))
        .rejects.toThrow('Circuit breaker is open');

      vi.useRealTimers();
    });

    it('should allow request in half-open state', async () => {
      vi.useFakeTimers();

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      vi.advanceTimersByTime(1001);

      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');

      vi.useRealTimers();
    });

    it('should close circuit after successful half-open calls', async () => {
      const halfOpenBreaker = new CircuitBreaker('half-open-test', {
        failureThreshold: 2,
        timeoutMs: 1000,
        halfOpenMaxCalls: 1,
      });

      vi.useFakeTimers();

      for (let i = 0; i < 2; i++) {
        try {
          await halfOpenBreaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      expect(halfOpenBreaker.getState().isOpen).toBe(true);

      vi.advanceTimersByTime(1001);

      await halfOpenBreaker.execute(() => Promise.resolve('success'));

      expect(halfOpenBreaker.getState().isOpen).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('getState()', () => {
    it('should return current state', () => {
      const state = breaker.getState();

      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
      expect(state.lastFailureTime).toBe(0);
      expect(state.nextAttemptTime).toBe(0);
    });

    it('should return copy of state', () => {
      const state1 = breaker.getState();
      state1.isOpen = true;
      state1.failureCount = 999;

      const state2 = breaker.getState();
      expect(state2.isOpen).toBe(false);
      expect(state2.failureCount).toBe(0);
    });
  });

  describe('reset()', () => {
    it('should reset circuit to closed state', async () => {
      vi.useFakeTimers();

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Failure')));
        } catch {
          /* expected error */
        }
      }

      expect(breaker.getState().isOpen).toBe(true);

      breaker.reset();

      const state = breaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('createWebhookBreaker()', () => {
    it('should create breaker with webhook key prefix', () => {
      const webhookBreaker = CircuitBreaker.createWebhookBreaker('https://example.com/webhook');
      const state = webhookBreaker.getState();

      expect(state.isOpen).toBe(false);
    });
  });
});
