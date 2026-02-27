import { describe, it, expect, beforeEach } from 'vitest'
import { RateLimitMonitor } from '../RateLimitMonitor'

describe('RateLimitMonitor', () => {
  let monitor: RateLimitMonitor

  beforeEach(() => {
    monitor = new RateLimitMonitor()
  })

  describe('recordRequest()', () => {
    it('should increment total requests count', () => {
      monitor.recordRequest(false)

      const stats = monitor.getStats()
      expect(stats.totalRequests).toBe(1)
    })

    it('should increment total requests on multiple calls', () => {
      monitor.recordRequest(false)
      monitor.recordRequest(false)
      monitor.recordRequest(false)

      const stats = monitor.getStats()
      expect(stats.totalRequests).toBe(3)
    })

    it('should not increment blocked requests when not blocked', () => {
      monitor.recordRequest(false)
      monitor.recordRequest(false)

      const stats = monitor.getStats()
      expect(stats.blockedRequests).toBe(0)
    })

    it('should increment blocked requests when blocked', () => {
      monitor.recordRequest(true)
      monitor.recordRequest(true)

      const stats = monitor.getStats()
      expect(stats.blockedRequests).toBe(2)
    })

    it('should increment total requests regardless of blocked status', () => {
      monitor.recordRequest(true)
      monitor.recordRequest(false)

      const stats = monitor.getStats()
      expect(stats.totalRequests).toBe(2)
    })

    it('should handle mixed blocked and non-blocked requests', () => {
      monitor.recordRequest(false)
      monitor.recordRequest(true)
      monitor.recordRequest(false)
      monitor.recordRequest(true)
      monitor.recordRequest(false)

      const stats = monitor.getStats()
      expect(stats.totalRequests).toBe(5)
      expect(stats.blockedRequests).toBe(2)
    })
  })

  describe('updateEntries()', () => {
    it('should update current entries count', () => {
      monitor.updateEntries(10)

      const stats = monitor.getStats()
      expect(stats.currentEntries).toBe(10)
    })

    it('should overwrite existing entries count', () => {
      monitor.updateEntries(5)
      monitor.updateEntries(15)

      const stats = monitor.getStats()
      expect(stats.currentEntries).toBe(15)
    })

    it('should handle zero entries', () => {
      monitor.updateEntries(0)

      const stats = monitor.getStats()
      expect(stats.currentEntries).toBe(0)
    })

    it('should handle large entry counts', () => {
      monitor.updateEntries(99999)

      const stats = monitor.getStats()
      expect(stats.currentEntries).toBe(99999)
    })
  })

  describe('getStats()', () => {
    it('should return zero stats for new monitor', () => {
      const stats = monitor.getStats()

      expect(stats.totalRequests).toBe(0)
      expect(stats.blockedRequests).toBe(0)
      expect(stats.currentEntries).toBe(0)
      expect(stats.windowMs).toBeDefined()
    })

    it('should return current window MS from config', () => {
      const stats = monitor.getStats()
      expect(stats.windowMs).toBe(900000)
    })

    it('should return snapshot of current stats', () => {
      monitor.recordRequest(true)

      const stats1 = monitor.getStats()
      monitor.recordRequest(false)
      const stats2 = monitor.getStats()

      expect(stats1.totalRequests).toBe(1)
      expect(stats2.totalRequests).toBe(2)
    })

    it('should return copy of stats to prevent mutation', () => {
      monitor.recordRequest(true)
      monitor.updateEntries(10)

      const stats1 = monitor.getStats()
      stats1.totalRequests = 999
      stats1.currentEntries = 777

      const stats2 = monitor.getStats()
      expect(stats2.totalRequests).toBe(1)
      expect(stats2.currentEntries).toBe(10)
    })
  })

  describe('getBlockRate()', () => {
    it('should return 0 when no requests made', () => {
      const rate = monitor.getBlockRate()
      expect(rate).toBe(0)
    })

    it('should return 0 when no blocked requests', () => {
      monitor.recordRequest(false)
      monitor.recordRequest(false)
      monitor.recordRequest(false)

      const rate = monitor.getBlockRate()
      expect(rate).toBe(0)
    })

    it('should calculate correct block rate with some blocked', () => {
      monitor.recordRequest(false)
      monitor.recordRequest(true)
      monitor.recordRequest(false)
      monitor.recordRequest(true)

      const rate = monitor.getBlockRate()
      expect(rate).toBe(50)
    })

    it('should return 100% when all requests blocked', () => {
      monitor.recordRequest(true)
      monitor.recordRequest(true)
      monitor.recordRequest(true)

      const rate = monitor.getBlockRate()
      expect(rate).toBe(100)
    })

    it('should return 0% when no requests blocked', () => {
      monitor.recordRequest(false)
      monitor.recordRequest(false)
      monitor.recordRequest(false)

      const rate = monitor.getBlockRate()
      expect(rate).toBe(0)
    })

    it('should handle large numbers of requests', () => {
      for (let i = 0; i < 100; i++) {
        monitor.recordRequest(i % 2 === 0)
      }

      const rate = monitor.getBlockRate()
      expect(rate).toBe(50)
    })

    it('should handle decimal block rate correctly', () => {
      monitor.recordRequest(false)
      monitor.recordRequest(true)

      const rate = monitor.getBlockRate()
      expect(rate).toBe(50)
    })

    it('should handle many requests with few blocked', () => {
      for (let i = 0; i < 1000; i++) {
        monitor.recordRequest(i === 0)
      }

      const rate = monitor.getBlockRate()
      expect(rate).toBe(0.1)
    })
  })

  describe('reset()', () => {
    it('should reset total requests to zero', () => {
      monitor.recordRequest(true)
      monitor.recordRequest(false)
      monitor.reset()

      const stats = monitor.getStats()
      expect(stats.totalRequests).toBe(0)
    })

    it('should reset blocked requests to zero', () => {
      monitor.recordRequest(true)
      monitor.recordRequest(true)
      monitor.reset()

      const stats = monitor.getStats()
      expect(stats.blockedRequests).toBe(0)
    })

    it('should reset current entries to zero', () => {
      monitor.updateEntries(100)
      monitor.reset()

      const stats = monitor.getStats()
      expect(stats.currentEntries).toBe(0)
    })

    it('should preserve window MS after reset', () => {
      monitor.reset()
      const stats = monitor.getStats()
      expect(stats.windowMs).toBe(900000)
    })

    it('should allow recording requests after reset', () => {
      monitor.recordRequest(true)
      monitor.reset()
      monitor.recordRequest(false)

      const stats = monitor.getStats()
      expect(stats.totalRequests).toBe(1)
      expect(stats.blockedRequests).toBe(0)
    })

    it('should handle multiple resets', () => {
      monitor.recordRequest(true)
      monitor.recordRequest(false)
      monitor.reset()
      monitor.reset()

      const stats = monitor.getStats()
      expect(stats.totalRequests).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent recordRequest calls', () => {
      Promise.all([
        monitor.recordRequest(true),
        monitor.recordRequest(false),
        monitor.recordRequest(true),
      ])

      const stats = monitor.getStats()
      expect(stats.totalRequests).toBe(3)
      expect(stats.blockedRequests).toBe(2)
    })

    it('should track block rate correctly after many requests', () => {
      for (let i = 0; i < 100; i++) {
        monitor.recordRequest(i < 10)
      }

      const rate = monitor.getBlockRate()
      expect(rate).toBe(10)
    })
  })
})
