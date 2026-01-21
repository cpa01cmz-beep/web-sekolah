import { describe, it, expect, beforeEach } from 'vitest';
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
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
    });

    it('should overwrite existing state', () => {
      const state1 = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      const state2 = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state1);
      monitor.setState(state2);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state2);
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
      const state = {
        isOpen: true,
        failureCount: 10,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 120000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
      expect(retrievedState?.isOpen).toBe(true);
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
      const state = {
        isOpen: true,
        failureCount: 999999,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState?.failureCount).toBe(999999);
    });
  });

  describe('getState()', () => {
    it('should return null when no state set', () => {
      const state = monitor.getState();

      expect(state).toBeNull();
    });

    it('should return state after setState', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
    });

    it('should return copy of state to prevent mutation', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
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
    });

    it('should return updated state after multiple setState calls', () => {
      const state1 = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      const state2 = {
        isOpen: true,
        failureCount: 3,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 30000,
      };

      const state3 = {
        isOpen: true,
        failureCount: 7,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state1);
      expect(monitor.getState()).toEqual(state1);

      monitor.setState(state2);
      expect(monitor.getState()).toEqual(state2);

      monitor.setState(state3);
      expect(monitor.getState()).toEqual(state3);
    });
  });

  describe('reset()', () => {
    it('should clear state after reset', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state);
      monitor.reset();
      const retrievedState = monitor.getState();

      expect(retrievedState).toBeNull();
    });

    it('should allow setState after reset', () => {
      const state1 = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
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
    });

    it('should handle multiple resets', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state);
      monitor.reset();
      monitor.reset();

      const retrievedState = monitor.getState();
      expect(retrievedState).toBeNull();
    });

    it('should handle reset without prior setState', () => {
      monitor.reset();
      const state = monitor.getState();

      expect(state).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle state with negative lastFailureTime', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: -1,
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState?.lastFailureTime).toBe(-1);
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
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 999999999,
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState?.nextAttemptTime).toBeGreaterThan(Date.now());
    });

    it('should handle state with lastFailureTime > nextAttemptTime', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now() + 100000,
        nextAttemptTime: Date.now(),
      };

      monitor.setState(state);
      const retrievedState = monitor.getState();

      expect(retrievedState).toEqual(state);
    });
  });

  describe('State Transition Scenarios', () => {
    it('should handle closed to open transition', () => {
      const closedState = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };

      const openState = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      monitor.setState(closedState);
      expect(monitor.getState()?.isOpen).toBe(false);

      monitor.setState(openState);
      expect(monitor.getState()?.isOpen).toBe(true);
    });

    it('should handle open to closed transition', () => {
      const openState = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
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
    });

    it('should handle incremental failure count updates', () => {
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
          lastFailureTime: Date.now(),
          nextAttemptTime: Date.now() + 60000,
        });

        expect(monitor.getState()?.failureCount).toBe(i);
      }
    });
  });
});
