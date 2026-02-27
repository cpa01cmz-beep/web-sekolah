import { IntegrationMonitor as IntegrationMonitorConfig } from '../config/time'
import { logger } from '../logger'
import type { IMonitor } from './IMonitor'

export interface RateLimitStats {
  totalRequests: number
  blockedRequests: number
  currentEntries: number
  windowMs: number
}

export class RateLimitMonitor implements IMonitor {
  private stats: RateLimitStats = {
    totalRequests: 0,
    blockedRequests: 0,
    currentEntries: 0,
    windowMs: IntegrationMonitorConfig.DEFAULT_WINDOW_MS,
  }

  recordRequest(blocked: boolean): void {
    this.stats.totalRequests++
    if (blocked) {
      this.stats.blockedRequests++
      logger.warn('Rate limit exceeded', {
        blocked: this.stats.blockedRequests,
        total: this.stats.totalRequests,
      })
    }
  }

  updateEntries(count: number): void {
    this.stats.currentEntries = count
  }

  getStats(): RateLimitStats {
    return { ...this.stats }
  }

  getBlockRate(): number {
    if (this.stats.totalRequests === 0) return 0
    return (this.stats.blockedRequests / this.stats.totalRequests) * 100
  }

  reset(): void {
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      currentEntries: 0,
      windowMs: IntegrationMonitorConfig.DEFAULT_WINDOW_MS,
    }
    logger.debug('Rate limit monitor reset')
  }
}
