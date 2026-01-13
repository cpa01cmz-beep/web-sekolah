import { CircuitBreaker } from './CircuitBreaker';
import { logger } from './logger';

const circuitBreakers = new Map<string, CircuitBreaker>();

export class CircuitBreakerRegistry {
  private static getInstance(url: string): CircuitBreaker | null {
    return circuitBreakers.get(url) ?? null;
  }

  private static setInstance(url: string, breaker: CircuitBreaker): void {
    circuitBreakers.set(url, breaker);
  }

  static getOrCreate(url: string): CircuitBreaker {
    const existing = this.getInstance(url);
    if (existing) {
      return existing;
    }

    const breaker = CircuitBreaker.createWebhookBreaker(url);
    this.setInstance(url, breaker);
    logger.debug('Created new circuit breaker for webhook URL', { url });
    return breaker;
  }

  static reset(url: string): boolean {
    const breaker = this.getInstance(url);
    if (breaker) {
      breaker.reset();
      logger.info('Reset circuit breaker for webhook URL', { url });
      return true;
    }
    return false;
  }

  static resetAll(): void {
    for (const [url, breaker] of circuitBreakers) {
      breaker.reset();
    }
    logger.info('Reset all circuit breakers', { count: circuitBreakers.size });
    circuitBreakers.clear();
  }

  static size(): number {
    return circuitBreakers.size;
  }

  static has(url: string): boolean {
    return circuitBreakers.has(url);
  }

  static getAllStates(): Map<string, { isOpen: boolean; failureCount: number; lastFailureTime: number; nextAttemptTime: number }> {
    const states = new Map();
    for (const [url, breaker] of circuitBreakers) {
      states.set(url, {
        isOpen: breaker.getState().isOpen,
        failureCount: breaker.getState().failureCount,
        lastFailureTime: breaker.getState().lastFailureTime,
        nextAttemptTime: breaker.getState().nextAttemptTime
      });
    }
    return states;
  }
}
