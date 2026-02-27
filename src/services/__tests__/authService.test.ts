import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthService } from '../authService'
import type { BaseUser, UserRole } from '@shared/types'
import { ApiResponse } from '@shared/types'

const createMockResponse = (data: any, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: vi.fn((name: string) => {
        if (name === 'X-Request-ID') return 'test-request-id'
        return null
      }),
    },
    json: vi.fn().mockResolvedValue(data),
  }
}

const mockUsers = {
  'student@example.com': {
    id: 'student-01',
    email: 'student@example.com',
    name: 'Budi Santoso',
    role: 'student' as UserRole,
    avatarUrl: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=random',
  },
  'teacher@example.com': {
    id: 'teacher-01',
    email: 'teacher@example.com',
    name: 'Siti Aminah',
    role: 'teacher' as UserRole,
    avatarUrl: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=random',
  },
  'parent@example.com': {
    id: 'parent-01',
    email: 'parent@example.com',
    name: 'Ayah Budi',
    role: 'parent' as UserRole,
    avatarUrl: 'https://ui-avatars.com/api/?name=Ayah+Budi&background=random',
  },
  'admin@example.com': {
    id: 'admin-01',
    email: 'admin@example.com',
    name: 'Admin Sekolah',
    role: 'admin' as UserRole,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Sekolah&background=random',
  },
}

describe('AuthService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('login', () => {
    it('should successfully login a student', async () => {
      const credentials = {
        email: 'student@example.com',
        password: 'password123',
        role: 'student' as UserRole,
      }

      const mockResponse: ApiResponse<{ token: string; user: BaseUser }> = {
        success: true,
        data: {
          token: 'mock-jwt-token-student-' + Date.now(),
          user: mockUsers['student@example.com'],
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.login(credentials)

      vi.advanceTimersByTime(500)

      const result = await promise

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe(credentials.email)
      expect(result.user.role).toBe('student')
      expect(result.user.id).toBe('student-01')
      expect(result.token).toBeDefined()
      expect(result.token).toContain('mock-jwt-token')
    })

    it('should successfully login a teacher', async () => {
      const credentials = {
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher' as UserRole,
      }

      const mockResponse: ApiResponse<{ token: string; user: BaseUser }> = {
        success: true,
        data: {
          token: 'mock-jwt-token-teacher-' + Date.now(),
          user: mockUsers['teacher@example.com'],
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.login(credentials)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe(credentials.email)
      expect(result.user.role).toBe('teacher')
      expect(result.user.id).toBe('teacher-01')
    })

    it('should successfully login a parent', async () => {
      const credentials = {
        email: 'parent@example.com',
        password: 'password123',
        role: 'parent' as UserRole,
      }

      const mockResponse: ApiResponse<{ token: string; user: BaseUser }> = {
        success: true,
        data: {
          token: 'mock-jwt-token-parent-' + Date.now(),
          user: mockUsers['parent@example.com'],
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.login(credentials)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe(credentials.email)
      expect(result.user.role).toBe('parent')
      expect(result.user.id).toBe('parent-01')
    })

    it('should successfully login an admin', async () => {
      const credentials = {
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin' as UserRole,
      }

      const mockResponse: ApiResponse<{ token: string; user: BaseUser }> = {
        success: true,
        data: {
          token: 'mock-jwt-token-admin-' + Date.now(),
          user: mockUsers['admin@example.com'],
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.login(credentials)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe(credentials.email)
      expect(result.user.role).toBe('admin')
      expect(result.user.id).toBe('admin-01')
    })

    it('should throw error when email is missing', async () => {
      const credentials = {
        email: '',
        password: 'password123',
        role: 'student' as UserRole,
      }

      const mockResponse: ApiResponse = {
        success: false,
        error: 'Email and password are required',
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse, 400))

      await expect(AuthService.login(credentials)).rejects.toThrow(
        'Email and password are required'
      )
    })

    it('should throw error when password is missing', async () => {
      const credentials = {
        email: 'student@example.com',
        password: '',
        role: 'student' as UserRole,
      }

      const mockResponse: ApiResponse = {
        success: false,
        error: 'Email and password are required',
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse, 400))

      await expect(AuthService.login(credentials)).rejects.toThrow(
        'Email and password are required'
      )
    })

    it('should use the provided email in the response', async () => {
      const customEmail = 'custom.student@test.com'
      const credentials = {
        email: customEmail,
        password: 'password123',
        role: 'student' as UserRole,
      }

      const mockResponse: ApiResponse<{ token: string; user: BaseUser }> = {
        success: true,
        data: {
          token: 'mock-jwt-token-custom-' + Date.now(),
          user: {
            ...mockUsers['student@example.com'],
            email: customEmail,
          },
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.login(credentials)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.user.email).toBe(customEmail)
    })

    it('should return unique token for each login', async () => {
      const credentials = {
        email: 'student@example.com',
        password: 'password123',
        role: 'student' as UserRole,
      }

      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        const mockResponse: ApiResponse<{ token: string; user: BaseUser }> = {
          success: true,
          data: {
            token: `mock-jwt-token-student-${callCount}-${Date.now()}`,
            user: mockUsers['student@example.com'],
          },
        }
        return Promise.resolve(createMockResponse(mockResponse))
      })

      const promise1 = AuthService.login(credentials)
      vi.advanceTimersByTime(500)
      const result1 = await promise1

      vi.advanceTimersByTime(100)

      const promise2 = AuthService.login(credentials)
      vi.advanceTimersByTime(500)
      const result2 = await promise2

      expect(result1.token).not.toBe(result2.token)
    })
  })

  describe('logout', () => {
    it('should successfully logout', async () => {
      const promise = AuthService.logout()
      vi.advanceTimersByTime(500)
      await expect(promise).resolves.not.toThrow()
    })

    it('should resolve to undefined', async () => {
      const promise = AuthService.logout()
      vi.advanceTimersByTime(500)
      const result = await promise
      expect(result).toBeUndefined()
    })

    it('should simulate API delay', async () => {
      const promise = AuthService.logout()

      vi.advanceTimersByTime(499)
      let resolved = false
      promise.then(() => {
        resolved = true
      })

      expect(resolved).toBe(false)

      vi.advanceTimersByTime(1)
      await promise

      expect(resolved).toBe(true)
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when token is not provided', async () => {
      const result = await AuthService.getCurrentUser('')
      expect(result).toBeNull()
    })

    it('should return null for invalid token format', async () => {
      const invalidToken = 'invalid-token'

      const mockResponse: ApiResponse = {
        success: false,
        error: 'Invalid token',
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse, 401))

      const result = await AuthService.getCurrentUser(invalidToken)
      expect(result).toBeNull()
    })

    it('should return student user for student token', async () => {
      const studentToken = 'mock-jwt-token-student01-1234567890'

      const mockResponse: ApiResponse<BaseUser> = {
        success: true,
        data: {
          ...mockUsers['student@example.com'],
          email: 'budi@example.com',
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.getCurrentUser(studentToken)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result).toBeDefined()
      expect(result!.id).toBe('student-01')
      expect(result!.role).toBe('student')
      expect(result!.email).toBe('budi@example.com')
    })

    it('should return teacher user for teacher token', async () => {
      const teacherToken = 'mock-jwt-token-teacher01-1234567890'

      const mockResponse: ApiResponse<BaseUser> = {
        success: true,
        data: {
          ...mockUsers['teacher@example.com'],
          email: 'siti@example.com',
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.getCurrentUser(teacherToken)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result).toBeDefined()
      expect(result!.id).toBe('teacher-01')
      expect(result!.role).toBe('teacher')
      expect(result!.email).toBe('siti@example.com')
    })

    it('should return parent user for parent token', async () => {
      const parentToken = 'mock-jwt-token-parent01-1234567890'

      const mockResponse: ApiResponse<BaseUser> = {
        success: true,
        data: {
          ...mockUsers['parent@example.com'],
          email: 'ayah.budi@example.com',
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.getCurrentUser(parentToken)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result).toBeDefined()
      expect(result!.id).toBe('parent-01')
      expect(result!.role).toBe('parent')
      expect(result!.email).toBe('ayah.budi@example.com')
    })

    it('should return admin user for admin token', async () => {
      const adminToken = 'mock-jwt-token-admin01-1234567890'

      const mockResponse: ApiResponse<BaseUser> = {
        success: true,
        data: mockUsers['admin@example.com'],
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.getCurrentUser(adminToken)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result).toBeDefined()
      expect(result!.id).toBe('admin-01')
      expect(result!.role).toBe('admin')
      expect(result!.email).toBe('admin@example.com')
    })

    it('should include avatar URL for all user types', async () => {
      const studentToken = 'mock-jwt-token-student-01-1234567890'

      const mockResponse: ApiResponse<BaseUser> = {
        success: true,
        data: {
          ...mockUsers['student@example.com'],
          email: 'budi@example.com',
        },
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const promise = AuthService.getCurrentUser(studentToken)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result).toBeDefined()
      expect(result!.id).toBe('student-01')
      expect(result!.role).toBe('student')
      expect(result!.email).toBe('budi@example.com')
      expect(result!.avatarUrl).toBeDefined()
      expect(result!.avatarUrl).toContain('ui-avatars.com')
    })
  })
})
