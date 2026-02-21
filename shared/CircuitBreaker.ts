import { ErrorCode } from './common-types';

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export interface CircuitBreakerConfig {
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
  private readonly logger?: {
    debug: (msg: string, meta?: Record<string, unknown>) => void;
    info: (msg: string, meta?: Record<string, unknown>) => void;
    warn: (msg: string, meta?: Record<string, unknown>) => void;
    error: (msg: string, meta?: Record<string, unknown>) => void;
  };

  constructor(
    key: string,
    config?: Partial<CircuitBreakerConfig>,
    logger?: CircuitBreaker['logger']
  ) {
    this.key = key;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
    this.logger = logger;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.isOpen) {
      const now = Date.now();

      if (now < this.state.nextAttemptTime) {
        this.logger?.debug('[CircuitBreaker] Circuit is open, rejecting request', {
          key: this.key,
          failureCount: this.state.failureCount,
          nextAttemptIn: this.state.nextAttemptTime - now,
        });

        const error = new Error(`Circuit breaker is open for ${this.key}`) as Error & {
          code?: string;
          status?: number;
        };
        error.code = ErrorCode.CIRCUIT_BREAKER_OPEN;
        error.status = 503;
        throw error;
      }

      this.logger?.info('[CircuitBreaker] Circuit half-open, attempting recovery', {
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
        this.logger?.info('[CircuitBreaker] Circuit closed after successful calls', {
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

      this.logger?.warn('[CircuitBreaker] Half-open call failed, keeping circuit open', {
        key: this.key,
        failureCount: this.state.failureCount,
      });
    } else if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.isOpen = true;
      this.state.nextAttemptTime = now + this.config.timeoutMs;

      this.logger?.error('[CircuitBreaker] Circuit opened due to failures', {
        key: this.key,
        failureCount: this.state.failureCount,
        timeoutMs: this.config.timeoutMs,
        nextAttemptAt: new Date(this.state.nextAttemptTime).toISOString(),
      });
    } else {
      this.logger?.warn('[CircuitBreaker] Call failed, counting failures', {
        key: this.key,
        failureCount: this.state.failureCount,
        threshold: this.config.failureThreshold,
      });
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  isOpen(): boolean {
    if (!this.state.isOpen) {
      return false;
    }
    const now = Date.now();
    return now < this.state.nextAttemptTime;
  }

  reset(): void {
    this.logger?.info('[CircuitBreaker] Circuit manually reset', {
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

  static createWebhookBreaker(
    webhookUrl: string,
    logger?: CircuitBreaker['logger']
  ): CircuitBreaker {
    return new CircuitBreaker(`webhook:${webhookUrl}`, undefined, logger);
  }
}
