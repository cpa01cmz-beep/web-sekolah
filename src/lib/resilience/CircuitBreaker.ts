import { ErrorCode } from '../../../shared/types';
import { CircuitBreakerConfig } from '../../config/time';

interface ApiError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
  requestId?: string;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    nextAttemptTime: 0,
  };
  private readonly threshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxCalls: number;
  private halfOpenCalls = 0;

  constructor(threshold = CircuitBreakerConfig.FAILURE_THRESHOLD, resetTimeout = CircuitBreakerConfig.RESET_TIMEOUT_MS, halfOpenMaxCalls = 3) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
    this.halfOpenMaxCalls = halfOpenMaxCalls;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.isOpen) {
      const now = Date.now();

      if (now < this.state.nextAttemptTime) {
        const error = new Error('Circuit breaker is open') as ApiError;
        error.code = ErrorCode.CIRCUIT_BREAKER_OPEN;
        error.status = 503;
        error.retryable = false;
        throw error;
      }

      if (this.halfOpenCalls === 0) {
        this.halfOpenCalls = 1;
      }
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
      
      if (this.halfOpenCalls >= this.halfOpenMaxCalls) {
        this.state.isOpen = false;
        this.state.failureCount = 0;
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
      this.state.nextAttemptTime = now + this.resetTimeout;
    } else if (this.state.failureCount >= this.threshold) {
      this.state.isOpen = true;
      this.state.nextAttemptTime = now + this.resetTimeout;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
    this.halfOpenCalls = 0;
  }
}
