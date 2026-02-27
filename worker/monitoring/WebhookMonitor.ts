import { IntegrationMonitor as IntegrationMonitorConfig } from '../config/time'
import { logger } from '../logger'
import type { IMonitor } from './IMonitor'

export interface WebhookStats {
  totalEvents: number
  pendingEvents: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  pendingDeliveries: number
  averageDeliveryTime: number
}

export class WebhookMonitor implements IMonitor {
  private stats: WebhookStats = {
    totalEvents: 0,
    pendingEvents: 0,
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    pendingDeliveries: 0,
    averageDeliveryTime: 0,
  }

  private deliveryTimes: number[] = []
  private readonly maxDeliveryTimes: number = IntegrationMonitorConfig.MAX_DELIVERY_TIMES

  recordEvent(total: number, pending: number): void {
    this.stats.totalEvents = total
    this.stats.pendingEvents = pending
  }

  recordEventCreated(): void {
    this.stats.totalEvents++
    this.stats.pendingEvents++
  }

  recordEventProcessed(): void {
    this.stats.pendingEvents = Math.max(0, this.stats.pendingEvents - 1)
  }

  recordDelivery(success: boolean, deliveryTime?: number): void {
    this.stats.totalDeliveries++
    if (success) {
      this.stats.successfulDeliveries++
    } else {
      this.stats.failedDeliveries++
    }

    if (deliveryTime !== undefined) {
      this.deliveryTimes.push(deliveryTime)
      if (this.deliveryTimes.length > this.maxDeliveryTimes) {
        this.deliveryTimes.shift()
      }
      this.updateAverageDeliveryTime()
    }

    const successfulRate = this.getSuccessRate()
    logger.debug('Webhook delivery recorded', {
      success,
      total: this.stats.totalDeliveries,
      successful: this.stats.successfulDeliveries,
      failed: this.stats.failedDeliveries,
      successRate: `${successfulRate.toFixed(2)}%`,
    })
  }

  updatePendingDeliveries(count: number): void {
    this.stats.pendingDeliveries = count
  }

  getStats(): WebhookStats {
    return { ...this.stats }
  }

  getSuccessRate(): number {
    if (this.stats.totalDeliveries === 0) return 0
    return (this.stats.successfulDeliveries / this.stats.totalDeliveries) * 100
  }

  private updateAverageDeliveryTime(): void {
    if (this.deliveryTimes.length === 0) {
      this.stats.averageDeliveryTime = 0
      return
    }
    const total = this.deliveryTimes.reduce((sum, time) => sum + time, 0)
    this.stats.averageDeliveryTime = total / this.deliveryTimes.length
  }

  reset(): void {
    this.stats = {
      totalEvents: 0,
      pendingEvents: 0,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      pendingDeliveries: 0,
      averageDeliveryTime: 0,
    }
    this.deliveryTimes = []
    logger.debug('Webhook monitor reset')
  }
}
