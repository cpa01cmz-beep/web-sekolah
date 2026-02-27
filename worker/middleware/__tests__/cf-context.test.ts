import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { cfContext, getCfContext, getClientIp } from '../cf-context'

describe('CF Context Middleware', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
  })

  describe('cfContext', () => {
    it('should extract cf-connecting-ip header', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        const ctx = getCfContext(c)
        return c.json({ ip: ctx?.ip })
      })

      const res = await app.request('/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.ip).toBe('192.168.1.1')
    })

    it('should fallback to x-real-ip when cf-connecting-ip is missing', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        const ctx = getCfContext(c)
        return c.json({ ip: ctx?.ip })
      })

      const res = await app.request('/test', {
        headers: { 'x-real-ip': '10.0.0.1' },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.ip).toBe('10.0.0.1')
    })

    it('should fallback to x-forwarded-for when other headers are missing', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        const ctx = getCfContext(c)
        return c.json({ ip: ctx?.ip })
      })

      const res = await app.request('/test', {
        headers: { 'x-forwarded-for': '172.16.0.1, 192.168.0.1' },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.ip).toBe('172.16.0.1')
    })

    it('should return unknown when no IP headers are present', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        const ctx = getCfContext(c)
        return c.json({ ip: ctx?.ip })
      })

      const res = await app.request('/test')
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.ip).toBe('unknown')
    })

    it('should extract cf-ray header', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        const ctx = getCfContext(c)
        return c.json({ ray: ctx?.ray })
      })

      const res = await app.request('/test', {
        headers: { 'cf-ray': 'abc123-xyz' },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.ray).toBe('abc123-xyz')
    })

    it('should extract cf-ipcountry header', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        const ctx = getCfContext(c)
        return c.json({ country: ctx?.country })
      })

      const res = await app.request('/test', {
        headers: { 'cf-ipcountry': 'US' },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.country).toBe('US')
    })

    it('should extract cf-ipcity header', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        const ctx = getCfContext(c)
        return c.json({ city: ctx?.city })
      })

      const res = await app.request('/test', {
        headers: { 'cf-ipcity': 'San Francisco' },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.city).toBe('San Francisco')
    })

    it('should extract cf-timezone header', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        const ctx = getCfContext(c)
        return c.json({ timezone: ctx?.timezone })
      })

      const res = await app.request('/test', {
        headers: { 'cf-timezone': 'America/Los_Angeles' },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.timezone).toBe('America/Los_Angeles')
    })

    it('should add Server-Timing header with request duration', async () => {
      app.use('*', cfContext())
      app.get('/test', c => c.json({ success: true }))

      const res = await app.request('/test')

      expect(res.status).toBe(200)
      const serverTiming = res.headers.get('Server-Timing')
      expect(serverTiming).toMatch(/total;dur=\d+/)
    })

    it('should add X-CF-Ray response header when cf-ray is present', async () => {
      app.use('*', cfContext())
      app.get('/test', c => c.json({ success: true }))

      const res = await app.request('/test', {
        headers: { 'cf-ray': 'abc123-xyz' },
      })

      expect(res.status).toBe(200)
      expect(res.headers.get('X-CF-Ray')).toBe('abc123-xyz')
    })

    it('should add X-CF-Country response header when cf-ipcountry is present', async () => {
      app.use('*', cfContext())
      app.get('/test', c => c.json({ success: true }))

      const res = await app.request('/test', {
        headers: { 'cf-ipcountry': 'ID' },
      })

      expect(res.status).toBe(200)
      expect(res.headers.get('X-CF-Country')).toBe('ID')
    })

    it('should not add X-CF-Ray header when cf-ray is missing', async () => {
      app.use('*', cfContext())
      app.get('/test', c => c.json({ success: true }))

      const res = await app.request('/test')

      expect(res.status).toBe(200)
      expect(res.headers.get('X-CF-Ray')).toBeNull()
    })

    it('should not add X-CF-Country header when cf-ipcountry is missing', async () => {
      app.use('*', cfContext())
      app.get('/test', c => c.json({ success: true }))

      const res = await app.request('/test')

      expect(res.status).toBe(200)
      expect(res.headers.get('X-CF-Country')).toBeNull()
    })
  })

  describe('getClientIp', () => {
    it('should return IP from context', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        return c.json({ ip: getClientIp(c) })
      })

      const res = await app.request('/test', {
        headers: { 'cf-connecting-ip': '203.0.113.1' },
      })

      const body = await res.json()
      expect(body.ip).toBe('203.0.113.1')
    })

    it('should return unknown when context is not set', async () => {
      app.get('/test', c => {
        return c.json({ ip: getClientIp(c) })
      })

      const res = await app.request('/test')
      const body = await res.json()

      expect(body.ip).toBe('unknown')
    })
  })

  describe('getCfContext', () => {
    it('should return undefined when middleware is not used', async () => {
      app.get('/test', c => {
        return c.json({ context: getCfContext(c) })
      })

      const res = await app.request('/test')
      const body = await res.json()

      expect(body.context).toBeUndefined()
    })

    it('should return full context when middleware is used', async () => {
      app.use('*', cfContext())
      app.get('/test', c => {
        return c.json({ context: getCfContext(c) })
      })

      const res = await app.request('/test', {
        headers: {
          'cf-connecting-ip': '198.51.100.1',
          'cf-ray': 'ray123',
          'cf-ipcountry': 'SG',
          'cf-ipcity': 'Singapore',
          'cf-timezone': 'Asia/Singapore',
        },
      })

      const body = await res.json()
      expect(body.context).toEqual({
        ip: '198.51.100.1',
        ray: 'ray123',
        country: 'SG',
        city: 'Singapore',
        timezone: 'Asia/Singapore',
        requestStartTime: expect.any(Number),
      })
    })
  })
})
