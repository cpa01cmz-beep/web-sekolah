import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreakerMonitor } from '../CircuitBreakerMonitor';

describe('CircuitBreakerMonitor', () => {
  let monitor: CircuitBreakerMonitor;

  beforeEach(() => {
    monitor = new CircuitBreakerMonitor();
  });

  describe('setState()', () => {
    it('should set circuit breaker state', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state);

      const result = monitor.getState();
      expect(result).toEqual(state);
    });

    it('should overwrite existing state', () => {
      const state1 = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: 1000,
        nextAttemptTime: 2000,
      };

      const state2 = {
        isOpen: false,
        failureCount: 10,
        lastFailureTime: 3000,
        nextAttemptTime: 4000,
      };

      monitor.setState(state1);
      monitor.setState(state2);

      const result = monitor.getState();
      expect(result).toEqual(state2);
    });

    it('should accept state with zero values', () => {
      const state = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      monitor.setState(state);

      const result = monitor.getState();
      expect(result).toEqual(state);
    });
  });

  describe('getState()', () => {
    it('should return null when state not set', () => {
      const result = monitor.getState();
      expect(result).toBe(null);
    });

    it('should return last set state', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state);
      const result = monitor.getState();

      expect(result).toEqual(state);
    });

    it('should not return reference to internal state', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: 1000,
        nextAttemptTime: 2000,
      };

      monitor.setState(state);
      const result1 = monitor.getState();
      const result2 = monitor.getState();

      expect(result1).not.toBe(result2);
    });
  });

  describe('reset()', () => {
    it('should clear circuit breaker state', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state);
      monitor.reset();

      const result = monitor.getState();
      expect(result).toBe(null);
    });

    it('should allow setting state after reset', () => {
      monitor.reset();

      const state = {
        isOpen: false,
        failureCount: 3,
        lastFailureTime: 1000,
        nextAttemptTime: 2000,
      };

      monitor.setState(state);
      const result = monitor.getState();

      expect(result).toEqual(state);
    });

    it('should handle multiple resets', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: 1000,
        nextAttemptTime: 2000,
      };

      monitor.setState(state);
      monitor.reset();
      monitor.reset();

      const result = monitor.getState();
      expect(result).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle isOpen as true', () => {
      const state = {
        isOpen: true,
        failureCount: 1,
        lastFailureTime: 1000,
        nextAttemptTime: 2000,
      };

      monitor.setState(state);
      const result = monitor.getState();

      expect(result?.isOpen).toBe(true);
    });

    it('should handle isOpen as false', () => {
      const state = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      monitor.setState(state);
      const result = monitor.getState();

      expect(result?.isOpen).toBe(false);
    });

    it('should handle large failure counts', () => {
      const state = {
        isOpen: false,
        failureCount: 999999,
        lastFailureTime: 1000,
        nextAttemptTime: 2000,
      };

      monitor.setState(state);
      const result = monitor.getState();

      expect(result?.failureCount).toBe(999999);
    });

    it('should handle negative timestamps', () => {
      const state = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: -1000,
        nextAttemptTime: -500,
      };

      monitor.setState(state);
      const result = monitor.getState();

      expect(result?.lastFailureTime).toBe(-1000);
      expect(result?.nextAttemptTime).toBe(-500);
    });
  });
});
