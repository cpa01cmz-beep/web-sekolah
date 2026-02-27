import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { auditLog, requireAuditLog } from '../audit-log'
import { logger } from '../../logger'

vi.mock('../../logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Audit Log Middleware - Critical Security/Compliance Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Happy Path - Successful Requests', () => {
    it('should log sensitive operations with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', {
        method: 'POST',
        headers: {
          'X-Request-ID': 'test-request-id',
          'cf-connecting-ip': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] CREATE_USER'),
        expect.objectContaining({
          timestamp: expect.any(String),
          requestId: 'test-request-id',
          action: 'CREATE_USER',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          path: '/users',
          method: 'POST',
          statusCode: 200,
          success: true,
        })
      )
    })

    it('should not log non-sensitive operations with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('GET_DASHBOARD'))
      app.get('/dashboard', c => c.json({ success: true }))

      await app.request('/dashboard', {
        headers: { 'X-Request-ID': 'test-request-id' },
      })

      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.debug).not.toHaveBeenCalled()
    })

    it('should log error responses (4xx/5xx) regardless of operation type', async () => {
      const app = new Hono()
      app.use('*', auditLog('GET_DASHBOARD'))
      app.get('/dashboard', c => c.json({ error: 'Not found' }, 404))

      await app.request('/dashboard', {
        headers: { 'X-Request-ID': 'test-request-id' },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] GET_DASHBOARD'),
        expect.objectContaining({
          statusCode: 404,
          success: false,
        })
      )
    })

    it('should generate request ID if not provided', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          requestId: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
        })
      )
    })

    it('should extract IP from cf-connecting-ip header', async () => {
      const app = new Hono()
      app.use('*', auditLog('LOGIN'))
      app.post('/login', c => c.json({ success: true }))

      await app.request('/login', {
        method: 'POST',
        headers: { 'cf-connecting-ip': '10.0.0.1' },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ip: '10.0.0.1',
        })
      )
    })

    it('should fallback to x-real-ip if cf-connecting-ip not available', async () => {
      const app = new Hono()
      app.use('*', auditLog('LOGIN'))
      app.post('/login', c => c.json({ success: true }))

      await app.request('/login', {
        method: 'POST',
        headers: { 'x-real-ip': '10.0.0.2' },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ip: '10.0.0.2',
        })
      )
    })

    it('should use unknown if no IP header available', async () => {
      const app = new Hono()
      app.use('*', auditLog('LOGIN'))
      app.post('/login', c => c.json({ success: true }))

      await app.request('/login', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ip: 'unknown',
        })
      )
    })

    it('should extract user agent from header', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', {
        method: 'POST',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        })
      )
    })

    it('should use unknown if user agent not provided', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userAgent: 'unknown',
        })
      )
    })

    it('should track request duration in metadata', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          metadata: expect.objectContaining({
            duration: expect.stringMatching(/^\d+ms$/),
          }),
        })
      )
    })

    it('should handle missing user context (unauthenticated request)', async () => {
      const app = new Hono()
      app.use('*', auditLog('UPDATE_USER'))
      app.put('/users/:id', c => c.json({ success: true }))

      await app.request('/users/user-123', {
        method: 'PUT',
        headers: { 'X-Request-ID': 'test-request-id' },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] UPDATE_USER'),
        expect.objectContaining({
          userId: undefined,
          userRole: undefined,
        })
      )
    })
  })

  describe('Error Handling - Exception Scenarios', () => {
    it('should log 4xx client errors with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('GET_DASHBOARD'))
      app.get('/not-found', c => c.text('Not found', 404))

      const res = await app.request('/not-found')

      expect(res.status).toBe(404)
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] GET_DASHBOARD'),
        expect.objectContaining({
          success: false,
          statusCode: 404,
        })
      )
    })

    it('should log 5xx server errors with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.text('Internal error', 500))

      const res = await app.request('/users', { method: 'POST' })

      expect(res.status).toBe(500)
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] CREATE_USER'),
        expect.objectContaining({
          success: false,
          statusCode: 500,
        })
      )
    })

    it('should include request metadata in error logs', async () => {
      const app = new Hono()
      app.use('*', auditLog('UPDATE_USER'))
      app.put('/users/:id', c => c.text('Validation failed', 400))

      const res = await app.request('/users/123', { method: 'PUT' })

      expect(res.status).toBe(400)
      const calls = (logger.info as ReturnType<typeof vi.fn>).mock.calls
      const logEntry = calls[calls.length - 1][1]

      expect(logEntry).toMatchObject({
        requestId: expect.any(String),
        path: '/users/123',
        method: 'PUT',
        statusCode: 400,
        success: false,
        metadata: expect.objectContaining({
          duration: expect.stringMatching(/^\d+ms$/),
        }),
      })
    })
  })

  describe('Sensitive Operations - All Listed Operations', () => {
    it('should log CREATE_USER with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/test', c => c.json({ success: true }))

      await app.request('/test', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] CREATE_USER'),
        expect.anything()
      )
    })

    it('should log UPDATE_USER with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('UPDATE_USER'))
      app.put('/test', c => c.json({ success: true }))

      await app.request('/test', { method: 'PUT' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] UPDATE_USER'),
        expect.anything()
      )
    })

    it('should log DELETE_USER with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('DELETE_USER'))
      app.delete('/test', c => c.json({ success: true }))

      await app.request('/test', { method: 'DELETE' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] DELETE_USER'),
        expect.anything()
      )
    })

    it('should log LOGIN with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('LOGIN'))
      app.post('/test', c => c.json({ success: true }))

      await app.request('/test', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] LOGIN'),
        expect.anything()
      )
    })

    it('should log CREATE_GRADE with INFO level', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_GRADE'))
      app.post('/test', c => c.json({ success: true }))

      await app.request('/test', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] CREATE_GRADE'),
        expect.anything()
      )
    })
  })

  describe('Edge Cases - Boundary Conditions', () => {
    it('should handle empty request body gracefully', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      expect(logger.info).toHaveBeenCalled()
    })

    it('should handle extremely long user agent strings', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      const longUserAgent = 'Mozilla/5.0 ' + 'x'.repeat(1000)

      await app.request('/users', {
        method: 'POST',
        headers: { 'user-agent': longUserAgent },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userAgent: longUserAgent,
        })
      )
    })

    it('should handle IPv6 addresses', async () => {
      const app = new Hono()
      app.use('*', auditLog('LOGIN'))
      app.post('/login', c => c.json({ success: true }))

      const ipv6Address = '2001:0db8:85a3:0000:0000:8a2e:0370:7334'

      await app.request('/login', {
        method: 'POST',
        headers: { 'cf-connecting-ip': ipv6Address },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ip: ipv6Address,
        })
      )
    })

    it('should handle malformed request IDs gracefully', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', {
        method: 'POST',
        headers: { 'X-Request-ID': 'not-a-uuid' },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          requestId: 'not-a-uuid',
        })
      )
    })

    it('should handle concurrent requests independently', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      const requests = Array.from({ length: 10 }, (_, i) =>
        app.request('/users', {
          method: 'POST',
          headers: { 'X-Request-ID': `req-${i}` },
        })
      )

      await Promise.all(requests)

      expect(logger.info).toHaveBeenCalledTimes(10)
      const requestIds = (logger.info as ReturnType<typeof vi.fn>).mock.calls.map(
        call => call[1].requestId
      )
      expect(new Set(requestIds).size).toBe(10)
    })

    it('should handle very slow requests (long duration)', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', async c => {
        await new Promise(resolve => setTimeout(() => resolve(undefined), 100))
        return c.json({ success: true })
      })

      await app.request('/users', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          metadata: expect.objectContaining({
            duration: expect.stringMatching(/^\d+ms$/),
          }),
        })
      )
    })
  })

  describe('Security & Compliance - Data Protection', () => {
    it('should not log sensitive data in request body', async () => {
      const app = new Hono()
      app.use('*', auditLog('LOGIN'))
      app.post('/login', c => c.json({ success: true }))

      await app.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'secret123' }),
      })

      const logCall = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0]
      const logEntry = logCall[1]

      expect(logEntry.metadata).not.toHaveProperty('password')
      expect(JSON.stringify(logEntry)).not.toContain('secret123')
    })

    it('should log all audit trail fields for compliance', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', {
        method: 'POST',
        headers: {
          'X-Request-ID': 'audit-trail-test',
          'cf-connecting-ip': '10.0.0.1',
          'user-agent': 'TestAgent',
        },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          timestamp: expect.any(String),
          requestId: 'audit-trail-test',
          action: 'CREATE_USER',
          ip: '10.0.0.1',
          userAgent: 'TestAgent',
          path: '/users',
          method: 'POST',
          statusCode: expect.any(Number),
          success: expect.any(Boolean),
          metadata: expect.any(Object),
        })
      )
    })

    it('should maintain ISO 8601 timestamp format', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      await app.request('/users', { method: 'POST' })

      const logCall = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0]
      const timestamp = logCall[1].timestamp

      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('requireAuditLog Function - Automatic Action Detection', () => {
    it('should use X-Action header if provided for sensitive operations', async () => {
      const app = new Hono()
      app.use('*', requireAuditLog())
      app.post('/api/action', c => c.json({ success: true }))

      await app.request('/api/action', {
        method: 'POST',
        headers: { 'X-Action': 'CREATE_USER' },
      })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] CREATE_USER'),
        expect.anything()
      )
    })

    it('should extract action from URL path if no X-Action header', async () => {
      const app = new Hono()
      app.use('*', requireAuditLog())
      app.post('/api/login', c => c.json({ success: true }))

      await app.request('/api/login', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] LOGIN'),
        expect.anything()
      )
    })

    it('should not log non-sensitive operations detected from path', async () => {
      const app = new Hono()
      app.use('*', requireAuditLog())
      app.get('/users', c => c.json({ success: true }))

      await app.request('/users', { method: 'GET' })

      expect(logger.info).not.toHaveBeenCalled()
    })

    it('should log sensitive operations extracted from path', async () => {
      const app = new Hono()
      app.use('*', requireAuditLog())
      app.post('/login', c => c.json({ success: true }))

      await app.request('/login', { method: 'POST' })

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] LOGIN'),
        expect.anything()
      )
    })
  })

  describe('Integration - Real-World Scenarios', () => {
    it('should handle complete user creation flow', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c =>
        c.json({
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        })
      )

      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'X-Request-ID': 'flow-test-001',
          'cf-connecting-ip': '192.168.1.100',
          'user-agent': 'Mozilla/5.0 TestAgent/1.0',
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
        }),
      })

      expect(res.status).toBe(200)
      expect(logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          requestId: 'flow-test-001',
          action: 'CREATE_USER',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 TestAgent/1.0',
          path: '/users',
          method: 'POST',
          statusCode: 200,
          success: true,
          metadata: expect.objectContaining({
            duration: expect.stringMatching(/^\d+ms$/),
          }),
        })
      )
    })

    it('should handle failed login attempt', async () => {
      const app = new Hono()
      app.use('*', auditLog('LOGIN'))
      app.post('/login', c => {
        return c.json({ error: 'Invalid credentials' }, 401)
      })

      const res = await app.request('/login', {
        method: 'POST',
        headers: {
          'X-Request-ID': 'login-fail-001',
          'cf-connecting-ip': '10.0.0.50',
        },
      })

      expect(res.status).toBe(401)
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] LOGIN'),
        expect.objectContaining({
          requestId: 'login-fail-001',
          action: 'LOGIN',
          statusCode: 401,
          success: false,
        })
      )
    })
  })

  describe('Performance - No Degradation', () => {
    it('should complete logging without blocking request', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      const start = Date.now()
      await app.request('/users', { method: 'POST' })
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('should handle rapid sequential requests', async () => {
      const app = new Hono()
      app.use('*', auditLog('CREATE_USER'))
      app.post('/users', c => c.json({ success: true }))

      const start = Date.now()
      const promises = Array.from({ length: 100 }, () => app.request('/users', { method: 'POST' }))
      await Promise.all(promises)
      const duration = Date.now() - start

      expect(logger.info).toHaveBeenCalledTimes(100)
      expect(duration).toBeLessThan(1000)
    })
  })
})
