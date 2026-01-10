import { logger } from './logger';

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  halfOpenMaxCalls: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  timeoutMs: 60000,
  halfOpenMaxCalls: 3,
};

export class CircuitBreaker {
  private readonly key: string;
  private readonly config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private halfOpenCalls = 0;

  constructor(key: string, config?: Partial<CircuitBreakerConfig>) {
    this.key = key;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.isOpen) {
      const now = Date.now();

      if (now < this.state.nextAttemptTime) {
        logger.warn('[CircuitBreaker] Circuit is open, rejecting request', {
          key: this.key,
          failureCount: this.state.failureCount,
          nextAttemptIn: this.state.nextAttemptTime - now,
        });
        throw new Error(`Circuit breaker is open for ${this.key}`);
      }

      if (this.halfOpenCalls === 0) {
        this.halfOpenCalls = 1;
      }

      logger.info('[CircuitBreaker] Circuit half-open, attempting recovery', {
        key: this.key,
        halfOpenCalls: this.halfOpenCalls,
      });
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state.isOpen) {
      this.halfOpenCalls++;

      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        logger.info('[CircuitBreaker] Circuit closed after successful calls', {
          key: this.key,
          halfOpenCalls: this.halfOpenCalls,
        });
        this.state = {
          isOpen: false,
          failureCount: 0,
          lastFailureTime: 0,
          nextAttemptTime: 0,
        };
        this.halfOpenCalls = 0;
      }
    } else {
      this.state.failureCount = 0;
    }
  }

  private onFailure(): void {
    const now = Date.now();
    this.state.failureCount++;
    this.state.lastFailureTime = now;

    if (this.state.isOpen) {
      this.halfOpenCalls = 0;
      this.state.nextAttemptTime = now + this.config.timeoutMs;

      logger.warn('[CircuitBreaker] Half-open call failed, keeping circuit open', {
        key: this.key,
        failureCount: this.state.failureCount,
      });
    } else if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.isOpen = true;
      this.state.nextAttemptTime = now + this.config.timeoutMs;

      logger.error('[CircuitBreaker] Circuit opened due to failures', {
        key: this.key,
        failureCount: this.state.failureCount,
        timeoutMs: this.config.timeoutMs,
        nextAttemptAt: new Date(this.state.nextAttemptTime).toISOString(),
      });
    } else {
      logger.warn('[CircuitBreaker] Call failed, counting failures', {
        key: this.key,
        failureCount: this.state.failureCount,
        threshold: this.config.failureThreshold,
      });
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    logger.info('[CircuitBreaker] Circuit manually reset', {
      key: this.key,
    });
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
    this.halfOpenCalls = 0;
  }

  static createWebhookBreaker(webhookUrl: string): CircuitBreaker {
    return new CircuitBreaker(`webhook:${webhookUrl}`);
  }
}