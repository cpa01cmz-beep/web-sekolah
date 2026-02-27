import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import { userRoutes } from '../user-management-routes'
import { createMockEnv } from '../../__tests__/utils/mocks'
import type { Env } from '../../core-utils'

const { mockUserService } = vi.hoisted(() => {
  const mockUsersData = [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
      avatarUrl: '',
      createdAt: '',
      updatedAt: '',
      passwordHash: null,
    },
    {
      id: 'teacher-1',
      name: 'Teacher User',
      email: 'teacher@test.com',
      role: 'teacher',
      avatarUrl: '',
      classIds: ['class-1'],
      createdAt: '',
      updatedAt: '',
      passwordHash: null,
    },
    {
      id: 'student-1',
      name: 'Student User',
      email: 'student@test.com',
      role: 'student',
      avatarUrl: '',
      classId: 'class-1',
      studentIdNumber: 'S001',
      createdAt: '',
      updatedAt: '',
      passwordHash: null,
    },
  ]

  return {
    mockUserService: {
      getAllUsers: vi.fn().mockResolvedValue(mockUsersData),
    },
  }
})

vi.mock('../../domain/UserService', () => ({ UserService: mockUserService }))

vi.mock('../../middleware/auth', async () => {
  return {
    authenticate: () => async (c: any, next: any) => {
      const role = c.req.header('x-role') || 'admin'
      c.set('user', { id: 'test-user', email: 'test@test.com', role })
      await next()
    },
    authorize:
      (...roles: string[]) =>
      async (c: any, next: any) => {
        const user = c.get('user')
        if (!user) {
          return c.json({ success: false, error: 'Unauthorized' }, 401)
        }
        if (!roles.includes(user.role)) {
          return c.json({ success: false, error: 'Forbidden' }, 403)
        }
        await next()
      },
  }
})

describe('User Management Routes', () => {
  let app: Hono<{ Bindings: Env }>
  let mockEnv: Env

  beforeEach(async () => {
    mockEnv = createMockEnv()
    app = new Hono<{ Bindings: Env }>()
    userRoutes(app)
  })

  const makeRequest = async (path: string, options: RequestInit = {}) => {
    return app.request(path, { ...options, env: mockEnv })
  }

  describe('GET /api/users', () => {
    it('should return 403 when user is not admin', async () => {
      const res = await makeRequest('/api/users', { headers: { 'x-role': 'teacher' } })
      expect(res.status).toBe(403)
    })

    it('should return users when user is admin', async () => {
      const res = await makeRequest('/api/users', { headers: { 'x-role': 'admin' } })
      expect(res.status).toBe(200)
      const json = (await res.json()) as { success: boolean; data: unknown[] }
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(3)
    })
  })

  describe('DELETE /api/grades/:id', () => {
    it('should return 403 when user is not teacher', async () => {
      const res = await makeRequest('/api/grades/grade-1', {
        method: 'DELETE',
        headers: { 'x-role': 'student' },
      })
      expect(res.status).toBe(403)
    })
  })
})
