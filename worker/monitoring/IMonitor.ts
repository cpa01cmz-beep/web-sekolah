import type { CircuitBreakerStats } from './CircuitBreakerMonitor'
import type { RateLimitStats } from './RateLimitMonitor'
import type { WebhookStats } from './WebhookMonitor'
import type { ApiErrorStats } from './ApiErrorMonitor'
import type { ScheduledTaskStats } from './ScheduledTaskMonitor'

export type MonitorStats =
  | CircuitBreakerStats
  | RateLimitStats
  | WebhookStats
  | ApiErrorStats
  | ScheduledTaskStats
  | { uptime: number }

export interface IMonitor {
  reset(): void
  getStats?(): MonitorStats | null
}
