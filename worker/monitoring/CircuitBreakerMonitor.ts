import { logger } from '../logger';

export interface CircuitBreakerStats {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export class CircuitBreakerMonitor {
  private state: CircuitBreakerStats | null = null;

  setState(state: CircuitBreakerStats): void {
    this.state = state;
    logger.debug('Circuit breaker state updated', { state });
  }

  getState(): CircuitBreakerStats | null {
    return this.state ? { ...this.state } : null;
  }

  reset(): void {
    this.state = null;
    logger.debug('Circuit breaker monitor reset');
  }
}
