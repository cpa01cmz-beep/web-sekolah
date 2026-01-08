import { logger } from './logger';

export interface CircuitBreakerStats {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  currentEntries: number;
  windowMs: number;
}

export interface WebhookStats {
  totalEvents: number;
  pendingEvents: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  averageDeliveryTime: number;
}

export interface ApiErrorStats {
  totalErrors: number;
  errorsByCode: Record<string, number>;
  errorsByStatus: Record<number, number>;
  recentErrors: Array<{
    code: string;
    status: number;
    timestamp: number;
    endpoint: string;
  }>;
}

export interface IntegrationHealthMetrics {
  timestamp: string;
  uptime: number;
  circuitBreaker?: CircuitBreakerStats;
  rateLimit: RateLimitStats;
  webhook: WebhookStats;
  errors: ApiErrorStats;
}

class IntegrationMonitor {
  private startTime: number;
  private circuitBreakerState: CircuitBreakerStats | null = null;
  private rateLimitStats: RateLimitStats = {
    totalRequests: 0,
    blockedRequests: 0,
    currentEntries: 0,
    windowMs: 15 * 60 * 1000,
  };
  private webhookStats: WebhookStats = {
    totalEvents: 0,
    pendingEvents: 0,
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    pendingDeliveries: 0,
    averageDeliveryTime: 0,
  };
  private apiErrorStats: ApiErrorStats = {
    totalErrors: 0,
    errorsByCode: {},
    errorsByStatus: {},
    recentErrors: [],
  };
  private deliveryTimes: number[] = [];
  private readonly maxRecentErrors = 100;

  constructor() {
    this.startTime = Date.now();
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  setCircuitBreakerState(state: CircuitBreakerStats): void {
    this.circuitBreakerState = state;
    logger.debug('Circuit breaker state updated', { state });
  }

  recordRateLimitRequest(blocked: boolean): void {
    this.rateLimitStats.totalRequests++;
    if (blocked) {
      this.rateLimitStats.blockedRequests++;
      logger.warn('Rate limit exceeded', {
        blocked: this.rateLimitStats.blockedRequests,
        total: this.rateLimitStats.totalRequests,
      });
    }
  }

  updateRateLimitEntries(count: number): void {
    this.rateLimitStats.currentEntries = count;
  }

  recordWebhookEvent(total: number, pending: number): void {
    this.webhookStats.totalEvents = total;
    this.webhookStats.pendingEvents = pending;
  }

  recordWebhookEventCreated(): void {
    this.webhookStats.totalEvents++;
    this.webhookStats.pendingEvents++;
  }

  recordWebhookEventProcessed(): void {
    this.webhookStats.pendingEvents = Math.max(0, this.webhookStats.pendingEvents - 1);
  }

  recordWebhookDelivery(success: boolean, deliveryTime?: number): void {
    this.webhookStats.totalDeliveries++;
    if (success) {
      this.webhookStats.successfulDeliveries++;
    } else {
      this.webhookStats.failedDeliveries++;
    }

    if (deliveryTime) {
      this.deliveryTimes.push(deliveryTime);
      if (this.deliveryTimes.length > 1000) {
        this.deliveryTimes.shift();
      }
      this.updateAverageDeliveryTime();
    }

    const successfulRate = this.getWebhookSuccessRate();
    logger.debug('Webhook delivery recorded', {
      success,
      total: this.webhookStats.totalDeliveries,
      successful: this.webhookStats.successfulDeliveries,
      failed: this.webhookStats.failedDeliveries,
      successRate: `${successfulRate.toFixed(2)}%`,
    });
  }

  updatePendingDeliveries(count: number): void {
    this.webhookStats.pendingDeliveries = count;
  }

  recordWebhookEventCreated(): void {
    this.webhookStats.totalEvents++;
  }

  recordWebhookEventProcessed(): void {
    this.webhookStats.pendingEvents = Math.max(0, this.webhookStats.pendingEvents - 1);
  }

  private updateAverageDeliveryTime(): void {
    if (this.deliveryTimes.length === 0) {
      this.webhookStats.averageDeliveryTime = 0;
      return;
    }
    const total = this.deliveryTimes.reduce((sum, time) => sum + time, 0);
    this.webhookStats.averageDeliveryTime = total / this.deliveryTimes.length;
  }

  recordApiError(code: string, status: number, endpoint: string): void {
    this.apiErrorStats.totalErrors++;
    this.apiErrorStats.errorsByCode[code] = (this.apiErrorStats.errorsByCode[code] || 0) + 1;
    this.apiErrorStats.errorsByStatus[status] = (this.apiErrorStats.errorsByStatus[status] || 0) + 1;

    this.apiErrorStats.recentErrors.unshift({
      code,
      status,
      timestamp: Date.now(),
      endpoint,
    });

    if (this.apiErrorStats.recentErrors.length > this.maxRecentErrors) {
      this.apiErrorStats.recentErrors.pop();
    }

    logger.warn('API error recorded', {
      code,
      status,
      endpoint,
      totalErrors: this.apiErrorStats.totalErrors,
    });
  }

  getWebhookSuccessRate(): number {
    if (this.webhookStats.totalDeliveries === 0) return 0;
    return (this.webhookStats.successfulDeliveries / this.webhookStats.totalDeliveries) * 100;
  }

  getRateLimitBlockRate(): number {
    if (this.rateLimitStats.totalRequests === 0) return 0;
    return (this.rateLimitStats.blockedRequests / this.rateLimitStats.totalRequests) * 100;
  }

  getHealthMetrics(): IntegrationHealthMetrics {
    return {
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      circuitBreaker: this.circuitBreakerState || undefined,
      rateLimit: { ...this.rateLimitStats },
      webhook: { ...this.webhookStats },
      errors: {
        totalErrors: this.apiErrorStats.totalErrors,
        errorsByCode: { ...this.apiErrorStats.errorsByCode },
        errorsByStatus: { ...this.apiErrorStats.errorsByStatus },
        recentErrors: [...this.apiErrorStats.recentErrors],
      },
    };
  }

  reset(): void {
    this.startTime = Date.now();
    this.circuitBreakerState = null;
    this.rateLimitStats = {
      totalRequests: 0,
      blockedRequests: 0,
      currentEntries: 0,
      windowMs: 15 * 60 * 1000,
    };
    this.webhookStats = {
      totalEvents: 0,
      pendingEvents: 0,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      pendingDeliveries: 0,
      averageDeliveryTime: 0,
    };
    this.apiErrorStats = {
      totalErrors: 0,
      errorsByCode: {},
      errorsByStatus: {},
      recentErrors: [],
    };
    this.deliveryTimes = [];
    logger.info('Integration monitor reset');
  }
}

export const integrationMonitor = new IntegrationMonitor();
