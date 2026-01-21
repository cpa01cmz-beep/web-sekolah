import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreakerMonitor } from '../CircuitBreakerMonitor';

describe('CircuitBreakerMonitor', () => {
  let monitor: CircuitBreakerMonitor;

  beforeEach(() => {
    monitor = new CircuitBreakerMonitor();
  });

  describe('setState()', () => {
    it('should set circuit breaker state', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
      vi.useRealTimers();
    });

    it('should overwrite existing state', () => {
      const state1 = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state2 = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state1);
      monitor.setState(state2);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state2);
      vi.useRealTimers();
    });

    it('should handle state with isOpen=false', () => {
      const state = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
      expect(retrievedState?.isOpen).toBe(false);
    });

    it('should handle state with isOpen=true', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 10,
        lastFailureTime: now,
        nextAttemptTime: now + 120000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
      expect(retrievedState?.isOpen).toBe(true);
      vi.useRealTimers();
    });

    it('should handle state with zero failure count', () => {
      const state = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState?.failureCount).toBe(0);
    });

    it('should handle state with high failure count', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 999999,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState?.failureCount).toBe(999999);
      vi.useRealTimers();
    });
  });

  describe('getState()', () => {
    it('should return null when no state set', () => {
      const state = monitor.getState();

      expect(state).toBeNull();
    });

    it('should return state after setState', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
      vi.useRealTimers();
    });

    it('should return copy of state to prevent mutation', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state);
      const state1 = monitor.getState();
      
      if (state1) {
        state1.isOpen = false;
        state1.failureCount = 999;
      }

      const state2 = monitor.getState();
      expect(state2).toEqual(state);
      expect(state2?.isOpen).toBe(true);
      expect(state2?.failureCount).toBe(5);
      vi.useRealTimers();
    });

    it('should return updated state after multiple setState calls', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state1 = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      const state2 = {
        isOpen: true,
        failureCount: 3,
        lastFailureTime: now,
        nextAttemptTime: now + 30000,
      };

      const state3 = {
        isOpen: true,
        failureCount: 7,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state1);
      expect(monitor.getState()).toEqual(state1);

      monitor.setState(state2);
      expect(monitor.getState()).toEqual(state2);

      monitor.setState(state3);
      expect(monitor.getState()).toEqual(state3);
      vi.useRealTimers();
    });
  });

  describe('reset()', () => {
    it('should clear state after reset', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state);
      monitor.reset();
      const retrievedState = monitor.getState();

      expect(retrievedState).toBeNull();
      vi.useRealTimers();
    });

    it('should allow setState after reset', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state1 = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state1);
      monitor.reset();

      const state2 = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      monitor.setState(state2);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state2);
      vi.useRealTimers();
    });

    it('should handle multiple resets', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state);
      monitor.reset();
      monitor.reset();

      const retrievedState = monitor.getState();
      expect(retrievedState).toBeNull();
      vi.useRealTimers();
    });

    it('should handle reset without prior setState', () => {
      monitor.reset();
      const state = monitor.getState();

      expect(state).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle state with negative lastFailureTime', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: -1,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState?.lastFailureTime).toBe(-1);
      vi.useRealTimers();
    });

    it('should handle state with zero nextAttemptTime', () => {
      const state = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState?.nextAttemptTime).toBe(0);
    });

    it('should handle state with very large nextAttemptTime', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 999999999,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState?.nextAttemptTime).toBe(now + 999999999);
      vi.useRealTimers();
    });

    it('should handle state with lastFailureTime > nextAttemptTime', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now + 100000,
        nextAttemptTime: now,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
      vi.useRealTimers();
    });
  });

  describe('State Transition Scenarios', () => {
    it('should handle closed to open transition', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const closedState = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      const openState = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      monitor.setState(closedState);
      expect(monitor.getState()?.isOpen).toBe(false);

      monitor.setState(openState);
      expect(monitor.getState()?.isOpen).toBe(true);
      vi.useRealTimers();
    });

    it('should handle open to closed transition', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      const openState = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: now,
        nextAttemptTime: now + 60000,
      };

      const closedState = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      monitor.setState(openState);
      expect(monitor.getState()?.isOpen).toBe(true);

      monitor.setState(closedState);
      expect(monitor.getState()?.isOpen).toBe(false);
      vi.useRealTimers();
    });

    it('should handle incremental failure count updates', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const now = Date.now();
      monitor.setState({
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      });

      for (let i = 1; i <= 10; i++) {
        monitor.setState({
          isOpen: false,
          failureCount: i,
          lastFailureTime: now,
          nextAttemptTime: now + 60000,
        });

        expect(monitor.getState()?.failureCount).toBe(i);
      }
      vi.useRealTimers();
    });
  });
});
