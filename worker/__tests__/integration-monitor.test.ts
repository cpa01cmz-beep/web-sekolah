import { describe, it, expect, beforeEach, vi } from 'vitest'
import { integrationMonitor } from '../integration-monitor'

describe('IntegrationMonitor', () => {
  beforeEach(() => {
    integrationMonitor.reset()
  })

  describe('Uptime Tracking', () => {
    it('should return uptime greater than zero after initialization', () => {
      const uptime = integrationMonitor.getUptime()

      expect(uptime).toBeGreaterThanOrEqual(0)
      expect(uptime).toBeLessThan(100)
    })

    it('should increase uptime over time', () => {
      vi.useFakeTimers()
      const initialUptime = integrationMonitor.getUptime()
      vi.advanceTimersByTime(10)
      const laterUptime = integrationMonitor.getUptime()
      vi.useRealTimers()

      expect(laterUptime).toBeGreaterThan(initialUptime)
    })

    it('should reset uptime on reset()', () => {
      integrationMonitor.reset()
      const resetUptime = integrationMonitor.getUptime()

      expect(resetUptime).toBeGreaterThanOrEqual(0)
      expect(resetUptime).toBeLessThan(100)
    })
  })

  describe('Circuit Breaker State Tracking', () => {
    it('should update circuit breaker state', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      }

      integrationMonitor.setCircuitBreakerState(state)
      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.circuitBreaker).toEqual(state)
    })

    it('should handle null circuit breaker state', () => {
      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.circuitBreaker).toBeUndefined()
    })

    it('should update circuit breaker state multiple times', () => {
      const state1 = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      }

      const state2 = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      }

      integrationMonitor.setCircuitBreakerState(state1)
      let metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.circuitBreaker).toEqual(state1)

      integrationMonitor.setCircuitBreakerState(state2)
      metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.circuitBreaker).toEqual(state2)
    })
  })

  describe('Rate Limit Statistics', () => {
    it('should record allowed requests', () => {
      integrationMonitor.recordRateLimitRequest(false)

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.rateLimit.totalRequests).toBe(1)
      expect(metrics.rateLimit.blockedRequests).toBe(0)
    })

    it('should record blocked requests', () => {
      integrationMonitor.recordRateLimitRequest(true)

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.rateLimit.totalRequests).toBe(1)
      expect(metrics.rateLimit.blockedRequests).toBe(1)
    })

    it('should calculate block rate correctly', () => {
      integrationMonitor.recordRateLimitRequest(false)
      integrationMonitor.recordRateLimitRequest(false)
      integrationMonitor.recordRateLimitRequest(true)

      const blockRate = integrationMonitor.getRateLimitBlockRate()

      expect(blockRate).toBeCloseTo(33.33, 1)
    })

    it('should return zero block rate when no requests', () => {
      const blockRate = integrationMonitor.getRateLimitBlockRate()

      expect(blockRate).toBe(0)
    })

    it('should update current entries count', () => {
      integrationMonitor.updateRateLimitEntries(42)

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.rateLimit.currentEntries).toBe(42)
    })

    it('should reset rate limit stats', () => {
      integrationMonitor.recordRateLimitRequest(true)
      integrationMonitor.recordRateLimitRequest(false)
      integrationMonitor.updateRateLimitEntries(10)

      integrationMonitor.reset()
      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.rateLimit.totalRequests).toBe(0)
      expect(metrics.rateLimit.blockedRequests).toBe(0)
      expect(metrics.rateLimit.currentEntries).toBe(0)
    })
  })

  describe('Webhook Statistics', () => {
    it('should record webhook events', () => {
      integrationMonitor.recordWebhookEvent(100, 10)

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.webhook.totalEvents).toBe(100)
      expect(metrics.webhook.pendingEvents).toBe(10)
    })

    it('should record successful webhook deliveries', () => {
      integrationMonitor.recordWebhookDelivery(true, 150)

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.webhook.totalDeliveries).toBe(1)
      expect(metrics.webhook.successfulDeliveries).toBe(1)
      expect(metrics.webhook.failedDeliveries).toBe(0)
    })

    it('should record failed webhook deliveries', () => {
      integrationMonitor.recordWebhookDelivery(false)

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.webhook.totalDeliveries).toBe(1)
      expect(metrics.webhook.successfulDeliveries).toBe(0)
      expect(metrics.webhook.failedDeliveries).toBe(1)
    })

    it('should calculate success rate correctly', () => {
      integrationMonitor.recordWebhookDelivery(true, 100)
      integrationMonitor.recordWebhookDelivery(true, 200)
      integrationMonitor.recordWebhookDelivery(false)

      const successRate = integrationMonitor.getWebhookSuccessRate()

      expect(successRate).toBeCloseTo(66.67, 1)
    })

    it('should return zero success rate when no deliveries', () => {
      const successRate = integrationMonitor.getWebhookSuccessRate()

      expect(successRate).toBe(0)
    })

    it('should calculate average delivery time', () => {
      integrationMonitor.recordWebhookDelivery(true, 100)
      integrationMonitor.recordWebhookDelivery(true, 200)
      integrationMonitor.recordWebhookDelivery(true, 300)

      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.webhook.averageDeliveryTime).toBe(200)
    })

    it('should maintain delivery times limit', () => {
      for (let i = 0; i < 1050; i++) {
        integrationMonitor.recordWebhookDelivery(true, 100)
      }

      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.webhook.totalDeliveries).toBe(1050)
      expect(metrics.webhook.successfulDeliveries).toBe(1050)
    })

    it('should update pending deliveries count', () => {
      integrationMonitor.updatePendingDeliveries(5)

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.webhook.pendingDeliveries).toBe(5)
    })

    it('should handle delivery time without provided time', () => {
      integrationMonitor.recordWebhookDelivery(true)

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.webhook.totalDeliveries).toBe(1)
      expect(metrics.webhook.averageDeliveryTime).toBe(0)
    })
  })

  describe('API Error Statistics', () => {
    it('should record API errors', () => {
      integrationMonitor.recordApiError('VALIDATION_ERROR', 400, '/api/test')

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.errors.totalErrors).toBe(1)
      expect(metrics.errors.errorsByCode['VALIDATION_ERROR']).toBe(1)
      expect(metrics.errors.errorsByStatus[400]).toBe(1)
    })

    it('should record multiple errors with same code', () => {
      integrationMonitor.recordApiError('VALIDATION_ERROR', 400, '/api/test1')
      integrationMonitor.recordApiError('VALIDATION_ERROR', 400, '/api/test2')

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.errors.totalErrors).toBe(2)
      expect(metrics.errors.errorsByCode['VALIDATION_ERROR']).toBe(2)
      expect(metrics.errors.errorsByStatus[400]).toBe(2)
    })

    it('should record errors with different codes', () => {
      integrationMonitor.recordApiError('VALIDATION_ERROR', 400, '/api/test')
      integrationMonitor.recordApiError('NOT_FOUND', 404, '/api/test')
      integrationMonitor.recordApiError('INTERNAL_SERVER_ERROR', 500, '/api/test')

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.errors.totalErrors).toBe(3)
      expect(metrics.errors.errorsByCode['VALIDATION_ERROR']).toBe(1)
      expect(metrics.errors.errorsByCode['NOT_FOUND']).toBe(1)
      expect(metrics.errors.errorsByCode['INTERNAL_SERVER_ERROR']).toBe(1)
    })

    it('should track recent errors', () => {
      integrationMonitor.recordApiError('VALIDATION_ERROR', 400, '/api/test1')
      integrationMonitor.recordApiError('NOT_FOUND', 404, '/api/test2')

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.errors.recentErrors).toHaveLength(2)
      expect(metrics.errors.recentErrors[0]).toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
        endpoint: '/api/test2',
      })
    })

    it('should limit recent errors to max count', () => {
      for (let i = 0; i < 150; i++) {
        integrationMonitor.recordApiError('ERROR', 500, `/api/test/${i}`)
      }

      const metrics = integrationMonitor.getHealthMetrics()
      expect(metrics.errors.recentErrors.length).toBeLessThanOrEqual(100)
    })

    it('should maintain chronological order for recent errors', () => {
      integrationMonitor.recordApiError('ERROR1', 500, '/api/1')
      integrationMonitor.recordApiError('ERROR2', 400, '/api/2')
      integrationMonitor.recordApiError('ERROR3', 404, '/api/3')

      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.errors.recentErrors[0].code).toBe('ERROR3')
      expect(metrics.errors.recentErrors[1].code).toBe('ERROR2')
      expect(metrics.errors.recentErrors[2].code).toBe('ERROR1')
    })

    it('should reset error statistics', () => {
      integrationMonitor.recordApiError('ERROR', 500, '/api/test')
      integrationMonitor.recordApiError('ERROR2', 400, '/api/test2')

      integrationMonitor.reset()
      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.errors.totalErrors).toBe(0)
      expect(Object.keys(metrics.errors.errorsByCode).length).toBe(0)
      expect(Object.keys(metrics.errors.errorsByStatus).length).toBe(0)
      expect(metrics.errors.recentErrors).toHaveLength(0)
    })
  })

  describe('Health Metrics', () => {
    it('should return complete health metrics', () => {
      const state = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      }

      integrationMonitor.setCircuitBreakerState(state)
      integrationMonitor.recordRateLimitRequest(false)
      integrationMonitor.recordWebhookEvent(10, 2)
      integrationMonitor.recordApiError('ERROR', 500, '/api/test')

      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.timestamp).toBeDefined()
      expect(metrics.uptime).toBeGreaterThanOrEqual(0)
      expect(metrics.circuitBreaker).toBeDefined()
      expect(metrics.rateLimit).toBeDefined()
      expect(metrics.webhook).toBeDefined()
      expect(metrics.errors).toBeDefined()
    })

    it('should include timestamp in health metrics', () => {
      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should create independent copies of metrics objects', () => {
      integrationMonitor.recordRateLimitRequest(true)

      const metrics1 = integrationMonitor.getHealthMetrics()
      const metrics2 = integrationMonitor.getHealthMetrics()

      const { timestamp: ts1, uptime: up1, ...metrics1Data } = metrics1
      const { timestamp: ts2, uptime: up2, ...metrics2Data } = metrics2

      expect(metrics1Data).toEqual(metrics2Data)
      expect(metrics1).not.toBe(metrics2)
      expect(metrics1.rateLimit).not.toBe(metrics2.rateLimit)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset all statistics', () => {
      const state = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      }

      integrationMonitor.setCircuitBreakerState(state)
      integrationMonitor.recordRateLimitRequest(true)
      integrationMonitor.recordWebhookEvent(10, 2)
      integrationMonitor.recordWebhookDelivery(true, 100)
      integrationMonitor.recordApiError('ERROR', 500, '/api/test')

      integrationMonitor.reset()
      const metrics = integrationMonitor.getHealthMetrics()

      expect(metrics.circuitBreaker).toBeUndefined()
      expect(metrics.rateLimit.totalRequests).toBe(0)
      expect(metrics.rateLimit.blockedRequests).toBe(0)
      expect(metrics.rateLimit.currentEntries).toBe(0)
      expect(metrics.webhook.totalEvents).toBe(0)
      expect(metrics.webhook.pendingEvents).toBe(0)
      expect(metrics.webhook.totalDeliveries).toBe(0)
      expect(metrics.webhook.successfulDeliveries).toBe(0)
      expect(metrics.webhook.failedDeliveries).toBe(0)
      expect(metrics.webhook.pendingDeliveries).toBe(0)
      expect(metrics.webhook.averageDeliveryTime).toBe(0)
      expect(metrics.errors.totalErrors).toBe(0)
    })

    it('should reset uptime timestamp', () => {
      vi.useFakeTimers()
      const beforeReset = integrationMonitor.getUptime()
      vi.advanceTimersByTime(50)

      integrationMonitor.reset()
      const afterReset = integrationMonitor.getUptime()
      vi.useRealTimers()

      expect(afterReset).toBeLessThanOrEqual(beforeReset)
    })
  })
})
