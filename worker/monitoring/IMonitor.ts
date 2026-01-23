import type { CircuitBreakerStats } from './CircuitBreakerMonitor';
import type { RateLimitStats } from './RateLimitMonitor';
import type { WebhookStats } from './WebhookMonitor';
import type { ApiErrorStats } from './ApiErrorMonitor';

export type MonitorStats = CircuitBreakerStats | RateLimitStats | WebhookStats | ApiErrorStats | { uptime: number };

export interface IMonitor {
  reset(): void;
  getStats?(): MonitorStats | null;
}
