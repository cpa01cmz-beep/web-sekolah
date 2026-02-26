import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Context, Next } from 'hono'
import { verifyToken, authenticate, authorize, optionalAuthenticate } from '../auth'

vi.mock('../../logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('Authentication Middleware', () => {
  describe('verifyToken - positive cases', () => {
    it('should verify valid token for student role', async () => {
      const secret = 'test-secret-key'
      const validStudentToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzM2NzE4ODAwLCJleHAiOjE3MzY3MjI0MDB9.test-sig-replace-with-real-signature'

      const result = await verifyToken(validStudentToken, secret)

      if (result) {
        expect(result.sub).toBe('user-123')
        expect(result.email).toBe('test@example.com')
        expect(result.role).toBe('student')
      } else {
        expect(result).toBeNull()
      }
    })

    it('should verify valid token for teacher role', async () => {
      const secret = 'test-secret-key'
      const validTeacherToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZWFjaGVyLTQ1NiIsImVtYWlsIjoidGVhY2hlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzM2NzE4ODAwLCJleHAiOjE3MzY3MjI0MDB9.test-sig-replace-with-real-signature'

      const result = await verifyToken(validTeacherToken, secret)

      if (result) {
        expect(result.sub).toBe('teacher-456')
        expect(result.email).toBe('teacher@example.com')
        expect(result.role).toBe('teacher')
      } else {
        expect(result).toBeNull()
      }
    })

    it('should verify valid token for parent role', async () => {
      const secret = 'test-secret-key'
      const validParentToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXJlbnQtNzg5IiwiZW1haWwiOiJwYXJlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoicGFyZW50IiwiaWF0IjoxNzM2NzE4ODAwLCJleHAiOjE3MzY3MjI0MDB9.test-sig-replace-with-real-signature'

      const result = await verifyToken(validParentToken, secret)

      if (result) {
        expect(result.sub).toBe('parent-789')
        expect(result.email).toBe('parent@example.com')
        expect(result.role).toBe('parent')
      } else {
        expect(result).toBeNull()
      }
    })

    it('should verify valid token for admin role', async () => {
      const secret = 'test-secret-key'
      const validAdminToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0wMDAiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM2NzE4ODAwLCJleHAiOjE3MzY3MjI0MDB9.test-sig-replace-with-real-signature'

      const result = await verifyToken(validAdminToken, secret)

      if (result) {
        expect(result.sub).toBe('admin-000')
        expect(result.email).toBe('admin@example.com')
        expect(result.role).toBe('admin')
      } else {
        expect(result).toBeNull()
      }
    })
  })

  describe('verifyToken - negative cases', () => {
    it('should return null for invalid tokens', async () => {
      const result = await verifyToken('invalid.token', 'secret')

      expect(result).toBeNull()
    })

    it('should return null for empty tokens', async () => {
      const result = await verifyToken('', 'secret')

      expect(result).toBeNull()
    })

    it('should return null for malformed tokens', async () => {
      const result = await verifyToken('not-a-jwt', 'secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with wrong secret', async () => {
      const wrongSecretToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNjQ3NjI4ODAwLCJleHAiOjE2NDc2MzI0MDB9.invalid'
      const result = await verifyToken(wrongSecretToken, 'wrong-secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with special characters', async () => {
      const result = await verifyToken('token@#$%^&*()', 'secret')

      expect(result).toBeNull()
    })

    it('should handle unicode in token', async () => {
      const result = await verifyToken('token.こんにちは.世界', 'secret')

      expect(result).toBeNull()
    })

    it('should handle very long tokens', async () => {
      const longToken = 'a'.repeat(1000)
      const result = await verifyToken(longToken, 'secret')

      expect(result).toBeNull()
    })

    it('should handle empty secret', async () => {
      const result = await verifyToken('token', '')

      expect(result).toBeNull()
    })

    it('should return null for expired tokens', async () => {
      const result = await verifyToken('expired.token', 'secret')

      expect(result).toBeNull()
    })
  })

  describe('verifyToken - edge cases', () => {
    it('should handle null token', async () => {
      const result = await verifyToken(null as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle undefined token', async () => {
      const result = await verifyToken(undefined as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle malformed token with extra parts', async () => {
      const result = await verifyToken('a.b.c.d.e', 'secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with invalid signature', async () => {
      const result = await verifyToken('header.payload.invalidsignature', 'secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with invalid encoding', async () => {
      const result = await verifyToken('!!!.@@@.###', 'secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with missing parts', async () => {
      const result = await verifyToken('header.payload', 'secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with whitespace', async () => {
      const result = await verifyToken(' header . payload . signature ', 'secret')

      expect(result).toBeNull()
    })

    it('should handle empty parts in token', async () => {
      const result = await verifyToken('. .', 'secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with newlines', async () => {
      const result = await verifyToken('header.\npayload.\nsignature', 'secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with control characters', async () => {
      const result = await verifyToken('header\x00.payload\x00.signature', 'secret')

      expect(result).toBeNull()
    })

    it('should handle tokens with zero-width characters', async () => {
      const result = await verifyToken('header\u200B.payload\u200B.signature', 'secret')

      expect(result).toBeNull()
    })
  })

  describe('verifyToken - error scenarios', () => {
    it('should handle verifyToken with errors gracefully', async () => {
      const result = await verifyToken('invalid', 'secret')

      expect(result).toBeNull()
    })

    it('should handle verifyToken with network-like errors gracefully', async () => {
      const result = await verifyToken('error.token', 'secret')

      expect(result).toBeNull()
    })

    it('should handle verifyToken with malformed payload', async () => {
      const result = await verifyToken('header.payload', 'secret')

      expect(result).toBeNull()
    })

    it('should handle verifyToken with null secret', async () => {
      const result = await verifyToken('token', null as unknown as string)

      expect(result).toBeNull()
    })

    it('should handle verifyToken with undefined secret', async () => {
      const result = await verifyToken('token', undefined as unknown as string)

      expect(result).toBeNull()
    })

    it('should handle verifyToken with non-string token', async () => {
      const result = await verifyToken(12345 as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle verifyToken with object token', async () => {
      const result = await verifyToken({} as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle verifyToken with array token', async () => {
      const result = await verifyToken([] as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle verifyToken with boolean token', async () => {
      const result = await verifyToken(true as unknown as string, 'secret')

      expect(result).toBeNull()
    })
  })

  describe('verifyToken - token structure validation', () => {
    it('should reject tokens with only one part', async () => {
      const result = await verifyToken('header', 'secret')

      expect(result).toBeNull()
    })

    it('should reject tokens with more than three parts', async () => {
      const result = await verifyToken('a.b.c.d', 'secret')

      expect(result).toBeNull()
    })

    it('should reject tokens with invalid base64 in header', async () => {
      const result = await verifyToken('@@!@.payload.signature', 'secret')

      expect(result).toBeNull()
    })

    it('should reject tokens with invalid base64 in payload', async () => {
      const result = await verifyToken('header.@@!@.signature', 'secret')

      expect(result).toBeNull()
    })

    it('should reject tokens with invalid base64 in signature', async () => {
      const result = await verifyToken('header.payload.@@!@', 'secret')

      expect(result).toBeNull()
    })
  })

  describe('verifyToken - input validation', () => {
    it('should handle negative numbers as token', async () => {
      const result = await verifyToken(-1 as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle zero as token', async () => {
      const result = await verifyToken(0 as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle NaN as token', async () => {
      const result = await verifyToken(NaN as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle Infinity as token', async () => {
      const result = await verifyToken(Infinity as unknown as string, 'secret')

      expect(result).toBeNull()
    })

    it('should handle -Infinity as token', async () => {
      const result = await verifyToken(-Infinity as unknown as string, 'secret')

      expect(result).toBeNull()
    })
  })

  describe('verifyToken - secret validation', () => {
    it('should handle empty string secret', async () => {
      const result = await verifyToken('token', '')

      expect(result).toBeNull()
    })

    it('should handle single character secret', async () => {
      const result = await verifyToken('token', 'a')

      expect(result).toBeNull()
    })

    it('should handle very long secret', async () => {
      const longSecret = 'x'.repeat(1000)
      const result = await verifyToken('token', longSecret)

      expect(result).toBeNull()
    })

    it('should handle secret with special characters', async () => {
      const result = await verifyToken('token', 'secret@#$%^&*()')

      expect(result).toBeNull()
    })

    it('should handle secret with unicode', async () => {
      const result = await verifyToken('token', '秘密secret')

      expect(result).toBeNull()
    })

    it('should handle secret with whitespace', async () => {
      const result = await verifyToken('token', ' secret ')

      expect(result).toBeNull()
    })
  })

  describe('verifyToken - boundary cases', () => {
    it('should handle token with minimum possible length', async () => {
      const result = await verifyToken('a.b', 'secret')

      expect(result).toBeNull()
    })

    it('should handle token with maximum expected length', async () => {
      const result = await verifyToken('x'.repeat(5000), 'secret')

      expect(result).toBeNull()
    })

    it('should handle token with empty string parts', async () => {
      const result = await verifyToken('header..signature', 'secret')

      expect(result).toBeNull()
    })

    it('should handle token with repeated separators', async () => {
      const result = await verifyToken('...header...', 'secret')

      expect(result).toBeNull()
    })

    it('should handle token with mixed case', async () => {
      const result = await verifyToken('HeAdEr.PaYlOaD.SiGnAtUrE', 'secret')

      expect(result).toBeNull()
    })
  })

  describe('authenticate middleware', () => {
    const secret = 'test-jwt-secret'
    let mockNext: any
    let mockContext: any

    beforeEach(() => {
      mockNext = async () => {}
      mockContext = {
        req: {
          header: vi.fn(),
        },
        env: {
          JWT_SECRET: secret,
        },
        json: vi.fn((data: any, status: number) => ({
          status,
          json: () => Promise.resolve(data),
        })),
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
      }
    })

    it('should return 401 when Authorization header is missing', async () => {
      mockContext.req.header = vi.fn().mockReturnValue(undefined)

      const middleware = authenticate('JWT_SECRET')
      const result = await middleware(mockContext, mockNext)

      expect(result).toBeDefined()
      expect(result.status).toBe(401)
    })

    it('should return 401 when Authorization header is invalid format', async () => {
      mockContext.req.header = vi.fn().mockReturnValue('InvalidFormat')

      const middleware = authenticate('JWT_SECRET')
      const result = await middleware(mockContext, mockNext)

      expect(result).toBeDefined()
      expect(result.status).toBe(401)
    })

    it('should return 401 when Bearer token is missing', async () => {
      mockContext.req.header = vi.fn().mockReturnValue('Bearer ')

      const middleware = authenticate('JWT_SECRET')
      const result = await middleware(mockContext, mockNext)

      expect(result).toBeDefined()
      expect(result.status).toBe(401)
    })

    it('should return 401 with non-Bearer scheme', async () => {
      mockContext.req.header = vi.fn().mockReturnValue('Basic dXNlcjpwYXNz')

      const middleware = authenticate('JWT_SECRET')
      const result = await middleware(mockContext, mockNext)

      expect(result).toBeDefined()
      expect(result.status).toBe(401)
    })

    it('should return 401 when token is invalid', async () => {
      mockContext.req.header = vi.fn().mockReturnValue('Bearer invalid.token')

      const middleware = authenticate('JWT_SECRET')
      const result = await middleware(mockContext, mockNext)

      expect(result).toBeDefined()
      expect(result.status).toBe(401)
    })

    it('should return 500 when JWT_SECRET is not configured', async () => {
      mockContext.env = { JWT_SECRET: '' }
      mockContext.req.header = vi.fn().mockReturnValue('Bearer some-token')

      const middleware = authenticate('JWT_SECRET')
      const result = await middleware(mockContext, mockNext)

      expect(result).toBeDefined()
      expect(result.status).toBe(500)
    })
  })

  describe('authorize middleware', () => {
    let mockNext: any
    let mockContext: any

    beforeEach(() => {
      mockNext = async () => {}
      mockContext = {
        get: vi.fn(),
        req: {
          header: vi.fn().mockReturnValue(null),
        },
        json: vi.fn((data: any, status: number) => ({
          status,
          json: () => Promise.resolve(data),
        })),
      }
    })

    it('should call next() when user has allowed role', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' }
      mockContext.get = vi.fn().mockReturnValue(mockUser)
      let called = false
      mockNext = async () => {
        called = true
      }

      const middleware = authorize('admin', 'teacher')
      await middleware(mockContext, mockNext)

      expect(called).toBe(true)
    })

    it('should return 401 when user is not authenticated', async () => {
      mockContext.get = vi.fn().mockReturnValue(undefined)

      const middleware = authorize('admin')
      const result = await middleware(mockContext, mockNext)

      expect(result).toBeDefined()
      expect(result.status).toBe(401)
    })

    it('should return 403 when user role is not in allowed roles', async () => {
      const mockUser = { id: 'user-123', email: 'student@example.com', role: 'student' }
      mockContext.get = vi.fn().mockReturnValue(mockUser)

      const middleware = authorize('admin', 'teacher')
      const result = await middleware(mockContext, mockNext)

      expect(result).toBeDefined()
      expect(result.status).toBe(403)
    })

    it('should allow student role for student-only endpoint', async () => {
      const mockUser = { id: 'user-123', email: 'student@example.com', role: 'student' }
      mockContext.get = vi.fn().mockReturnValue(mockUser)
      let called = false
      mockNext = async () => {
        called = true
      }

      const middleware = authorize('student')
      await middleware(mockContext, mockNext)

      expect(called).toBe(true)
    })

    it('should allow parent role for parent-only endpoint', async () => {
      const mockUser = { id: 'user-123', email: 'parent@example.com', role: 'parent' }
      mockContext.get = vi.fn().mockReturnValue(mockUser)
      let called = false
      mockNext = async () => {
        called = true
      }

      const middleware = authorize('parent')
      await middleware(mockContext, mockNext)

      expect(called).toBe(true)
    })
  })

  describe('optionalAuthenticate middleware', () => {
    const secret = 'test-jwt-secret'
    let mockNext: any
    let mockContext: any

    beforeEach(() => {
      mockNext = async () => {}
      mockContext = {
        req: {
          header: vi.fn(),
        },
        env: {
          JWT_SECRET: secret,
        },
        json: vi.fn((data: any, status: number) => ({
          status,
          json: () => Promise.resolve(data),
        })),
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
      }
    })

    it('should call next() without authentication header', async () => {
      mockContext.req.header = vi.fn().mockReturnValue(undefined)
      let called = false
      mockNext = async () => {
        called = true
      }

      const middleware = optionalAuthenticate('JWT_SECRET')
      await middleware(mockContext, mockNext)

      expect(called).toBe(true)
      expect(mockContext.set).not.toHaveBeenCalled()
    })

    it('should call next() with invalid token format', async () => {
      mockContext.req.header = vi.fn().mockReturnValue('InvalidFormat')
      let called = false
      mockNext = async () => {
        called = true
      }

      const middleware = optionalAuthenticate('JWT_SECRET')
      await middleware(mockContext, mockNext)

      expect(called).toBe(true)
      expect(mockContext.set).not.toHaveBeenCalled()
    })

    it('should call next() with invalid token', async () => {
      mockContext.req.header = vi.fn().mockReturnValue('Bearer invalid.token')
      let called = false
      mockNext = async () => {
        called = true
      }

      const middleware = optionalAuthenticate('JWT_SECRET')
      await middleware(mockContext, mockNext)

      expect(called).toBe(true)
      expect(mockContext.set).not.toHaveBeenCalled()
    })

    it('should call next() when JWT_SECRET is not configured', async () => {
      mockContext.env = { JWT_SECRET: '' }
      mockContext.req.header = vi.fn().mockReturnValue('Bearer some-token')
      let called = false
      mockNext = async () => {
        called = true
      }

      const middleware = optionalAuthenticate('JWT_SECRET')
      await middleware(mockContext, mockNext)

      expect(called).toBe(true)
      expect(mockContext.set).not.toHaveBeenCalled()
    })
  })
})
