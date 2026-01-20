import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreakerRegistry } from '../CircuitBreakerRegistry';

let circuitBreakerInstances = new Map<string, any>();

const mockResetAll = () => {
  circuitBreakerInstances.clear();
};

beforeEach(() => {
  circuitBreakerInstances.clear();

  vi.doMock('../CircuitBreaker', () => {
    const MockCircuitBreaker = class {
      private key: string;
      private state: {
        isOpen: boolean;
        failureCount: number;
        lastFailureTime: number;
        nextAttemptTime: number;
      };

      constructor(key: string) {
        this.key = key;
        this.state = {
          isOpen: false,
          failureCount: 0,
          lastFailureTime: 0,
          nextAttemptTime: 0
        };
      }

      static createWebhookBreaker(webhookUrl: string) {
        const instance = new MockCircuitBreaker(`webhook:${webhookUrl}`);
        circuitBreakerInstances.set(webhookUrl, instance);
        return instance;
      }

      reset() {
        this.state = {
          isOpen: false,
          failureCount: 0,
          lastFailureTime: 0,
          nextAttemptTime: 0
        };
      }

      getState() {
        return { ...this.state };
      }
    };

    return { CircuitBreaker: MockCircuitBreaker };
  });

  vi.doMock('../logger', () => ({
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    }
  }));
});

describe('CircuitBreakerRegistry - Critical Path Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    CircuitBreakerRegistry.resetAll();
    circuitBreakerInstances.clear();
  });

  describe('getOrCreate - Circuit Breaker Lifecycle', () => {
    it('should create new circuit breaker for URL', async () => {
      const url = 'https://example.com/webhook';
      const breaker = CircuitBreakerRegistry.getOrCreate(url);

      expect(breaker).toBeDefined();
      expect(CircuitBreakerRegistry.has(url)).toBe(true);
    });

    it('should return existing circuit breaker for same URL', async () => {
      const url = 'https://example.com/webhook';
      const breaker1 = CircuitBreakerRegistry.getOrCreate(url);
      const breaker2 = CircuitBreakerRegistry.getOrCreate(url);

      expect(breaker1).toBe(breaker2);
      expect(CircuitBreakerRegistry.size()).toBe(1);
    });

    it('should create separate circuit breakers for different URLs', async () => {
      const url1 = 'https://example.com/webhook1';
      const url2 = 'https://example.com/webhook2';
      const breaker1 = CircuitBreakerRegistry.getOrCreate(url1);
      const breaker2 = CircuitBreakerRegistry.getOrCreate(url2);

      expect(breaker1).not.toBe(breaker2);
      expect(CircuitBreakerRegistry.size()).toBe(2);
    });

    it('should create circuit breaker with default config', async () => {
      const url = 'https://example.com/webhook';
      const breaker = CircuitBreakerRegistry.getOrCreate(url);

      expect(breaker).toBeDefined();
      expect(breaker.getState()).toEqual({
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      });
    });
  });

  describe('reset - Individual Circuit Breaker Reset', () => {
    it('should reset existing circuit breaker', async () => {
      const url = 'https://example.com/webhook';
      const breaker = CircuitBreakerRegistry.getOrCreate(url);

      const result = CircuitBreakerRegistry.reset(url);

      expect(result).toBe(true);
      expect(breaker.getState().isOpen).toBe(false);
      expect(breaker.getState().failureCount).toBe(0);
    });

    it('should return false when circuit breaker does not exist', () => {
      const url = 'https://example.com/webhook';
      const result = CircuitBreakerRegistry.reset(url);

      expect(result).toBe(false);
    });

    it('should keep other circuit breakers intact when resetting one', async () => {
      const url1 = 'https://example.com/webhook1';
      const url2 = 'https://example.com/webhook2';

      const breaker1 = CircuitBreakerRegistry.getOrCreate(url1);
      const breaker2 = CircuitBreakerRegistry.getOrCreate(url2);

      CircuitBreakerRegistry.reset(url1);

      expect(CircuitBreakerRegistry.has(url1)).toBe(true);
      expect(CircuitBreakerRegistry.has(url2)).toBe(true);
      expect(breaker1.getState().isOpen).toBe(false);
      expect(breaker1.getState().failureCount).toBe(0);
      expect(breaker2.getState().isOpen).toBe(false);
      expect(breaker2.getState().failureCount).toBe(0);
    });
  });

  describe('resetAll - Clear All Circuit Breakers', () => {
    it('should clear all circuit breakers from registry', async () => {
      const url1 = 'https://example.com/webhook1';
      const url2 = 'https://example.com/webhook2';

      CircuitBreakerRegistry.getOrCreate(url1);
      CircuitBreakerRegistry.getOrCreate(url2);

      expect(CircuitBreakerRegistry.size()).toBe(2);

      CircuitBreakerRegistry.resetAll();

      expect(CircuitBreakerRegistry.size()).toBe(0);
    });

    it('should call reset on all circuit breakers', async () => {
      const breaker1 = CircuitBreakerRegistry.getOrCreate('url1');
      const breaker2 = CircuitBreakerRegistry.getOrCreate('url2');
      const breaker3 = CircuitBreakerRegistry.getOrCreate('url3');

      const reset1 = vi.spyOn(breaker1, 'reset');
      const reset2 = vi.spyOn(breaker2, 'reset');
      const reset3 = vi.spyOn(breaker3, 'reset');

      CircuitBreakerRegistry.resetAll();

      expect(reset1).toHaveBeenCalledTimes(1);
      expect(reset2).toHaveBeenCalledTimes(1);
      expect(reset3).toHaveBeenCalledTimes(1);
    });

    it('should handle empty registry gracefully', () => {
      expect(() => CircuitBreakerRegistry.resetAll()).not.toThrow();
      expect(CircuitBreakerRegistry.size()).toBe(0);
    });
  });

  describe('size - Registry State Query', () => {
    it('should return 0 for empty registry', () => {
      expect(CircuitBreakerRegistry.size()).toBe(0);
    });

    it('should return 1 after creating one circuit breaker', async () => {
      CircuitBreakerRegistry.getOrCreate('https://example.com/webhook');
      expect(CircuitBreakerRegistry.size()).toBe(1);
    });

    it('should return correct count after multiple creations', async () => {
      CircuitBreakerRegistry.getOrCreate('url1');
      CircuitBreakerRegistry.getOrCreate('url2');
      CircuitBreakerRegistry.getOrCreate('url3');

      expect(CircuitBreakerRegistry.size()).toBe(3);
    });

    it('should not increase size for duplicate URL requests', async () => {
      const url = 'https://example.com/webhook';

      CircuitBreakerRegistry.getOrCreate(url);
      expect(CircuitBreakerRegistry.size()).toBe(1);

      CircuitBreakerRegistry.getOrCreate(url);
      expect(CircuitBreakerRegistry.size()).toBe(1);
    });
  });

  describe('has - Registry Existence Check', () => {
    it('should return false for non-existent URL', () => {
      expect(CircuitBreakerRegistry.has('https://example.com/webhook')).toBe(false);
    });

    it('should return true for existing URL', async () => {
      const url = 'https://example.com/webhook';
      CircuitBreakerRegistry.getOrCreate(url);

      expect(CircuitBreakerRegistry.has(url)).toBe(true);
    });

    it('should return true after resetting circuit breaker (reset only resets state)', async () => {
      const url = 'https://example.com/webhook';
      CircuitBreakerRegistry.getOrCreate(url);

      expect(CircuitBreakerRegistry.has(url)).toBe(true);

      CircuitBreakerRegistry.reset(url);

      expect(CircuitBreakerRegistry.has(url)).toBe(true);
    });

    it('should return false after resetAll', async () => {
      const url = 'https://example.com/webhook';
      CircuitBreakerRegistry.getOrCreate(url);

      expect(CircuitBreakerRegistry.has(url)).toBe(true);

      CircuitBreakerRegistry.resetAll();

      expect(CircuitBreakerRegistry.has(url)).toBe(false);
    });
  });

  describe('getAllStates - State Retrieval for Monitoring', () => {
    it('should return empty map for empty registry', () => {
      const states = CircuitBreakerRegistry.getAllStates();

      expect(states).toBeInstanceOf(Map);
      expect(states.size).toBe(0);
    });

    it('should return states for all circuit breakers', async () => {
      CircuitBreakerRegistry.getOrCreate('https://example.com/webhook1');
      CircuitBreakerRegistry.getOrCreate('https://example.com/webhook2');

      const states = CircuitBreakerRegistry.getAllStates();

      expect(states.size).toBe(2);
      expect(states.get('https://example.com/webhook1')).toEqual({
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      });
      expect(states.get('https://example.com/webhook2')).toEqual({
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      });
    });

    it('should include all required state fields', async () => {
      CircuitBreakerRegistry.getOrCreate('https://example.com/webhook');

      const states = CircuitBreakerRegistry.getAllStates();
      const state = states.get('https://example.com/webhook');

      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('nextAttemptTime');
    });

    it('should reflect state changes after circuit breaker operations', async () => {
      const url = 'https://example.com/webhook';
      const breaker = CircuitBreakerRegistry.getOrCreate(url);

      const states1 = CircuitBreakerRegistry.getAllStates();
      expect(states1.get(url)).toEqual({
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      });

      breaker.reset();

      const states2 = CircuitBreakerRegistry.getAllStates();
      expect(states2.get(url)).toEqual({
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      });
    });
  });

  describe('Edge Cases - Boundary Conditions', () => {
    it('should handle URLs with special characters', async () => {
      const url = 'https://example.com/webhook?token=abc-123&type=testing';
      CircuitBreakerRegistry.getOrCreate(url);

      expect(CircuitBreakerRegistry.has(url)).toBe(true);
    });

    it('should handle very long URLs', async () => {
      const longPath = 'a'.repeat(1000);
      const url = `https://example.com/${longPath}`;
      CircuitBreakerRegistry.getOrCreate(url);

      expect(CircuitBreakerRegistry.has(url)).toBe(true);
    });

    it('should handle concurrent getOrCreate calls for same URL', async () => {
      const url = 'https://example.com/webhook';

      const [breaker1, breaker2, breaker3] = await Promise.all([
        Promise.resolve(CircuitBreakerRegistry.getOrCreate(url)),
        Promise.resolve(CircuitBreakerRegistry.getOrCreate(url)),
        Promise.resolve(CircuitBreakerRegistry.getOrCreate(url))
      ]);

      expect(breaker1).toBe(breaker2);
      expect(breaker2).toBe(breaker3);
      expect(CircuitBreakerRegistry.size()).toBe(1);
    });

    it('should handle empty string URL', async () => {
      const url = '';
      CircuitBreakerRegistry.getOrCreate(url);

      expect(CircuitBreakerRegistry.has(url)).toBe(true);
    });

    it('should maintain isolation between different registries (test scenario)', async () => {
      const url1 = 'https://example.com/webhook1';
      const url2 = 'https://example.com/webhook2';

      CircuitBreakerRegistry.getOrCreate(url1);
      CircuitBreakerRegistry.getOrCreate(url2);

      const states = CircuitBreakerRegistry.getAllStates();

      expect(states.size).toBe(2);
      expect(states.has(url1)).toBe(true);
      expect(states.has(url2)).toBe(true);
    });
  });

  describe('Integration - Real-World Scenarios', () => {
    it('should handle typical webhook circuit breaker lifecycle', async () => {
      const webhookUrl = 'https://example.com/webhooks/payment';

      const breaker = CircuitBreakerRegistry.getOrCreate(webhookUrl);
      expect(CircuitBreakerRegistry.size()).toBe(1);
      expect(CircuitBreakerRegistry.has(webhookUrl)).toBe(true);

      CircuitBreakerRegistry.reset(webhookUrl);
      expect(CircuitBreakerRegistry.size()).toBe(1);
      expect(CircuitBreakerRegistry.has(webhookUrl)).toBe(true);
      expect(breaker.getState().isOpen).toBe(false);
      expect(breaker.getState().failureCount).toBe(0);

      CircuitBreakerRegistry.resetAll();
      expect(CircuitBreakerRegistry.size()).toBe(0);
      expect(CircuitBreakerRegistry.has(webhookUrl)).toBe(false);
    });

    it('should support monitoring multiple webhook endpoints', async () => {
      const webhookUrls = [
        'https://api.service1.com/webhook',
        'https://api.service2.com/webhook',
        'https://api.service3.com/webhook'
      ];

      webhookUrls.forEach(url => CircuitBreakerRegistry.getOrCreate(url));

      expect(CircuitBreakerRegistry.size()).toBe(3);

      const states = CircuitBreakerRegistry.getAllStates();
      expect(states.size).toBe(3);

      webhookUrls.forEach(url => {
        expect(CircuitBreakerRegistry.has(url)).toBe(true);
        expect(states.has(url)).toBe(true);
      });
    });

    it('should handle webhook endpoint deprecation gracefully', async () => {
      const oldUrl = 'https://example.com/webhooks/v1';
      const newUrl = 'https://example.com/webhooks/v2';

      CircuitBreakerRegistry.getOrCreate(oldUrl);
      expect(CircuitBreakerRegistry.size()).toBe(1);

      CircuitBreakerRegistry.reset(oldUrl);
      expect(CircuitBreakerRegistry.has(oldUrl)).toBe(true);
      expect(CircuitBreakerRegistry.size()).toBe(1);

      CircuitBreakerRegistry.resetAll();
      expect(CircuitBreakerRegistry.has(oldUrl)).toBe(false);

      CircuitBreakerRegistry.getOrCreate(newUrl);
      expect(CircuitBreakerRegistry.size()).toBe(1);
    });
  });
});
