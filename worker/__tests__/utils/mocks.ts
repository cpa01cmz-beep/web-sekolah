import { vi } from 'vitest'
import type { Env, GlobalDurableObject, Doc } from '../types'
import type { Student, Teacher, Parent, Admin, SchoolUser } from '@shared/types'

export const createMockStudent = (overrides?: Partial<Student>): Student => ({
  id: 'student-1',
  name: 'Test Student',
  email: 'student@test.com',
  role: 'student',
  avatarUrl: '',
  classId: 'class-1',
  studentIdNumber: 'S001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  passwordHash: null,
  ...overrides,
})

export const createMockTeacher = (overrides?: Partial<Teacher>): Teacher => ({
  id: 'teacher-1',
  name: 'Test Teacher',
  email: 'teacher@test.com',
  role: 'teacher',
  avatarUrl: '',
  classIds: ['class-1'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  passwordHash: null,
  ...overrides,
})

export const createMockParent = (overrides?: Partial<Parent>): Parent => ({
  id: 'parent-1',
  name: 'Test Parent',
  email: 'parent@test.com',
  role: 'parent',
  avatarUrl: '',
  childId: 'student-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  passwordHash: null,
  ...overrides,
})

export const createMockAdmin = (overrides?: Partial<Admin>): Admin => ({
  id: 'admin-1',
  name: 'Test Admin',
  email: 'admin@test.com',
  role: 'admin',
  avatarUrl: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  passwordHash: null,
  ...overrides,
})

export const createMockSchoolUser = (
  role: SchoolUser['role'],
  overrides?: Partial<SchoolUser>
): SchoolUser => {
  switch (role) {
    case 'student':
      return createMockStudent(overrides as Partial<Student>)
    case 'teacher':
      return createMockTeacher(overrides as Partial<Teacher>)
    case 'parent':
      return createMockParent(overrides as Partial<Parent>)
    case 'admin':
      return createMockAdmin(overrides as Partial<Admin>)
  }
}

export const createMockFetch = (
  response: Response | { ok: boolean; json?: () => Promise<unknown> }
): typeof fetch => {
  return vi.fn(() => Promise.resolve(response)) as unknown as typeof fetch
}

export const createMockFailingFetch = (error: Error): typeof fetch => {
  return vi.fn(() => Promise.reject(error)) as unknown as typeof fetch
}

export const createMockResponse = (
  options: { ok?: boolean; status?: number; json?: () => Promise<unknown> } = {}
): Response => {
  const { ok = true, status = 200, json = vi.fn().mockResolvedValue({}) } = options
  return {
    ok,
    status,
    json,
  } as unknown as Response
}

export const createMockEnv = (overrides?: Partial<Env>): Env => {
  const mockDO = {
    get: vi.fn(),
    idFromName: vi.fn().mockReturnValue({ name: 'test-doid' }),
    idFromString: vi.fn(),
  } as unknown as Env['GlobalDurableObject']

  return {
    GlobalDurableObject: mockDO,
    ALLOWED_ORIGINS: 'http://localhost:5173',
    JWT_SECRET: 'test-secret',
    DEFAULT_PASSWORD: 'test-password',
    ENVIRONMENT: 'development',
    SITE_URL: 'http://localhost:8787',
    ...overrides,
  }
}

export const createMockDurableObject = <T = unknown>(
  overrides?: Partial<{
    getDoc: (key: string) => Promise<Doc<T> | null>
    casPut: (
      key: string,
      expectedVersion: number,
      data: unknown
    ) => Promise<{ ok: boolean; v: number }>
    del: (key: string) => Promise<boolean>
    has: (key: string) => Promise<boolean>
    listPrefix: (
      prefix: string,
      cursor?: string | null,
      limit?: number
    ) => Promise<{ keys: string[]; next: string | null }>
    indexAddBatch: (items: string[]) => Promise<void>
    indexRemoveBatch: (items: string[]) => Promise<number>
    indexDrop: (prefix?: string) => Promise<number>
  }>
): GlobalDurableObject => {
  const mock: GlobalDurableObject = {
    getDoc: vi.fn().mockResolvedValue(null),
    casPut: vi.fn().mockResolvedValue({ ok: true, v: 1 }),
    del: vi.fn().mockResolvedValue(true),
    has: vi.fn().mockResolvedValue(false),
    listPrefix: vi.fn().mockResolvedValue({ keys: [], next: null }),
    indexAddBatch: vi.fn().mockResolvedValue(undefined),
    indexRemoveBatch: vi.fn().mockResolvedValue(0),
    indexDrop: vi.fn().mockResolvedValue(0),
    ctx: {
      storage: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(true),
        list: vi.fn().mockResolvedValue(new Map()),
      },
    } as unknown as GlobalDurableObject['ctx'],
    env: createMockEnv(),
  } as unknown as GlobalDurableObject

  if (overrides) {
    Object.assign(mock, overrides)
  }

  return mock
}

export const createMockDoc = <T>(data: T, version = 1): Doc<T> => ({
  v: version,
  data,
})

export const createMockStub = (overrides?: Partial<GlobalDurableObject>): GlobalDurableObject => {
  return createMockDurableObject(overrides) as GlobalDurableObject
}
