import type {
  CircuitBreakerStats,
  RateLimitStats,
  WebhookStats,
  ApiErrorStats,
  ScheduledTaskStats,
} from './monitoring';
import {
  UptimeMonitor,
  CircuitBreakerMonitor,
  RateLimitMonitor,
  WebhookMonitor,
  ApiErrorMonitor,
  ScheduledTaskMonitor,
} from './monitoring';

export interface IntegrationHealthMetrics {
  timestamp: string;
  uptime: number;
  circuitBreaker?: CircuitBreakerStats;
  rateLimit: RateLimitStats;
  webhook: WebhookStats;
  errors: ApiErrorStats;
  scheduledTasks: ScheduledTaskStats;
}

class IntegrationMonitor {
  private readonly uptimeMonitor: UptimeMonitor;
  private readonly circuitBreakerMonitor: CircuitBreakerMonitor;
  private readonly rateLimitMonitor: RateLimitMonitor;
  private readonly webhookMonitor: WebhookMonitor;
  private readonly apiErrorMonitor: ApiErrorMonitor;
  private readonly scheduledTaskMonitor: ScheduledTaskMonitor;

  constructor() {
    this.uptimeMonitor = new UptimeMonitor();
    this.circuitBreakerMonitor = new CircuitBreakerMonitor();
    this.rateLimitMonitor = new RateLimitMonitor();
    this.webhookMonitor = new WebhookMonitor();
    this.apiErrorMonitor = new ApiErrorMonitor();
    this.scheduledTaskMonitor = new ScheduledTaskMonitor();
  }

  getUptime(): number {
    return this.uptimeMonitor.getUptime();
  }

  setCircuitBreakerState(state: CircuitBreakerStats): void {
    this.circuitBreakerMonitor.setState(state);
  }

  recordRateLimitRequest(blocked: boolean): void {
    this.rateLimitMonitor.recordRequest(blocked);
  }

  updateRateLimitEntries(count: number): void {
    this.rateLimitMonitor.updateEntries(count);
  }

  recordWebhookEvent(total: number, pending: number): void {
    this.webhookMonitor.recordEvent(total, pending);
  }

  recordWebhookEventCreated(): void {
    this.webhookMonitor.recordEventCreated();
  }

  recordWebhookEventProcessed(): void {
    this.webhookMonitor.recordEventProcessed();
  }

  recordWebhookDelivery(success: boolean, deliveryTime?: number): void {
    this.webhookMonitor.recordDelivery(success, deliveryTime);
  }

  updatePendingDeliveries(count: number): void {
    this.webhookMonitor.updatePendingDeliveries(count);
  }

  recordApiError(code: string, status: number, endpoint: string): void {
    this.apiErrorMonitor.recordError(code, status, endpoint);
  }

  recordScheduledTaskExecution(name: string, success: boolean, duration: number): void {
    this.scheduledTaskMonitor.recordExecution(name, success, duration);
  }

  getWebhookSuccessRate(): number {
    return this.webhookMonitor.getSuccessRate();
  }

  getRateLimitBlockRate(): number {
    return this.rateLimitMonitor.getBlockRate();
  }

  getHealthMetrics(): IntegrationHealthMetrics {
    return {
      timestamp: new Date().toISOString(),
      uptime: this.uptimeMonitor.getUptime(),
      circuitBreaker: this.circuitBreakerMonitor.getState() || undefined,
      rateLimit: this.rateLimitMonitor.getStats(),
      webhook: this.webhookMonitor.getStats(),
      errors: this.apiErrorMonitor.getStats(),
      scheduledTasks: this.scheduledTaskMonitor.getStats(),
    };
  }

  reset(): void {
    this.uptimeMonitor.reset();
    this.circuitBreakerMonitor.reset();
    this.rateLimitMonitor.reset();
    this.webhookMonitor.reset();
    this.apiErrorMonitor.reset();
    this.scheduledTaskMonitor.reset();
  }
}

export const integrationMonitor = new IntegrationMonitor();
