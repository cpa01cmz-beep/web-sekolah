import { describe, it, expect } from 'vitest'
import {
  EndpointTimeout,
  ConnectionTimeout,
  TimeoutCategory,
  getTimeoutForEndpoint,
  isFastQuery,
  isComplexOperation,
} from '../endpoint-timeout'

describe('Endpoint Timeout Configuration', () => {
  describe('EndpointTimeout constants', () => {
    it('should have defined fast query timeouts', () => {
      expect(EndpointTimeout.QUERY.FAST).toBe(2000)
      expect(EndpointTimeout.QUERY.STANDARD).toBe(5000)
    })

    it('should have defined aggregation timeouts', () => {
      expect(EndpointTimeout.AGGREGATION.STANDARD).toBe(10000)
      expect(EndpointTimeout.AGGREGATION.COMPLEX).toBe(15000)
    })

    it('should have defined write timeouts', () => {
      expect(EndpointTimeout.WRITE.FAST).toBe(5000)
      expect(EndpointTimeout.WRITE.STANDARD).toBe(10000)
    })

    it('should have defined admin timeouts', () => {
      expect(EndpointTimeout.ADMIN.STANDARD).toBe(15000)
      expect(EndpointTimeout.ADMIN.COMPLEX).toBe(30000)
    })

    it('should have defined system operation timeouts', () => {
      expect(EndpointTimeout.SYSTEM.REBUILD_INDEXES).toBe(60000)
      expect(EndpointTimeout.SYSTEM.SEED).toBe(60000)
    })

    it('should have defined external service timeouts', () => {
      expect(EndpointTimeout.EXTERNAL.WEBHOOK).toBe(30000)
      expect(EndpointTimeout.EXTERNAL.DOCS).toBe(30000)
    })

    it('should have defined health check timeout', () => {
      expect(EndpointTimeout.HEALTH.CHECK).toBe(5000)
    })
  })

  describe('ConnectionTimeout constants', () => {
    it('should have defined connection timeouts', () => {
      expect(ConnectionTimeout.STANDARD).toBe(5000)
      expect(ConnectionTimeout.FAST).toBe(2000)
    })
  })

  describe('TimeoutCategory', () => {
    it('should have auth endpoint timeout', () => {
      expect(TimeoutCategory.AUTH).toBe(5000)
    })

    it('should have user query timeouts', () => {
      expect(TimeoutCategory.USER_GET).toBe(2000)
      expect(TimeoutCategory.USER_LIST).toBe(5000)
      expect(TimeoutCategory.USER_CREATE).toBe(10000)
      expect(TimeoutCategory.USER_UPDATE).toBe(5000)
      expect(TimeoutCategory.USER_DELETE).toBe(5000)
    })

    it('should have grade operation timeouts', () => {
      expect(TimeoutCategory.GRADE_GET).toBe(2000)
      expect(TimeoutCategory.GRADE_CREATE).toBe(5000)
      expect(TimeoutCategory.GRADE_UPDATE).toBe(5000)
    })

    it('should have dashboard aggregation timeouts', () => {
      expect(TimeoutCategory.DASHBOARD_TEACHER).toBe(10000)
      expect(TimeoutCategory.DASHBOARD_PARENT).toBe(10000)
      expect(TimeoutCategory.DASHBOARD_ADMIN).toBe(10000)
    })

    it('should have announcement operation timeouts', () => {
      expect(TimeoutCategory.ANNOUNCEMENT_GET).toBe(2000)
      expect(TimeoutCategory.ANNOUNCEMENT_CREATE).toBe(5000)
    })

    it('should have webhook operation timeouts', () => {
      expect(TimeoutCategory.WEBHOOK_CONFIG).toBe(5000)
      expect(TimeoutCategory.WEBHOOK_DELIVERY).toBe(5000)
      expect(TimeoutCategory.WEBHOOK_TRIGGER).toBe(30000)
    })

    it('should have system operation timeouts', () => {
      expect(TimeoutCategory.REBUILD_INDEXES).toBe(60000)
      expect(TimeoutCategory.SEED).toBe(60000)
    })

    it('should have health check timeout', () => {
      expect(TimeoutCategory.HEALTH).toBe(5000)
    })
  })

  describe('getTimeoutForEndpoint', () => {
    it('should return correct timeout for auth endpoint', () => {
      expect(getTimeoutForEndpoint('AUTH')).toBe(5000)
    })

    it('should return correct timeout for user list endpoint', () => {
      expect(getTimeoutForEndpoint('USER_LIST')).toBe(5000)
    })

    it('should return correct timeout for dashboard endpoint', () => {
      expect(getTimeoutForEndpoint('DASHBOARD_TEACHER')).toBe(10000)
    })

    it('should return correct timeout for system endpoint', () => {
      expect(getTimeoutForEndpoint('REBUILD_INDEXES')).toBe(60000)
    })
  })

  describe('isFastQuery', () => {
    it('should return true for fast queries', () => {
      expect(isFastQuery(2000)).toBe(true)
      expect(isFastQuery(3000)).toBe(true)
      expect(isFastQuery(5000)).toBe(true)
    })

    it('should return false for slow queries', () => {
      expect(isFastQuery(10000)).toBe(false)
      expect(isFastQuery(30000)).toBe(false)
      expect(isFastQuery(60000)).toBe(false)
    })
  })

  describe('isComplexOperation', () => {
    it('should return true for complex operations', () => {
      expect(isComplexOperation(15000)).toBe(true)
      expect(isComplexOperation(30000)).toBe(true)
      expect(isComplexOperation(60000)).toBe(true)
    })

    it('should return false for simple operations', () => {
      expect(isComplexOperation(2000)).toBe(false)
      expect(isComplexOperation(5000)).toBe(false)
      expect(isComplexOperation(10000)).toBe(false)
    })
  })
})
