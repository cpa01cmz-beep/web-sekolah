import { vi } from 'vitest'
import type { ApiResponse } from '@shared/types'
import type { IRepository, ApiRequestOptions } from '@/repositories/IRepository'
import type { User, Student, Teacher, Parent, Announcement, Grade, Message } from '@shared/types'

export class MockRepository implements IRepository {
  private mockData: Record<string, unknown> = {}
  private mockErrors: Record<string, Error> = {}
  private delay: number = 0

  setMockData<T>(path: string, data: T): void {
    this.mockData[path] = data
  }

  setMockError(path: string, error: Error): void {
    this.mockErrors[path] = error
  }

  setDelay(ms: number): void {
    this.delay = ms
  }

  reset(): void {
    this.mockData = {}
    this.mockErrors = {}
    this.delay = 0
  }

  private async execute<T>(path: string): Promise<T> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay))
    }

    if (this.mockErrors[path]) {
      throw this.mockErrors[path]
    }

    if (this.mockData[path] !== undefined) {
      return this.mockData[path] as T
    }

    throw new Error(`No mock data for path: ${path}`)
  }

  async get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path)
  }

  async post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path)
  }

  async put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path)
  }

  async delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path)
  }

  async patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path)
  }
}

export const mockFetch = <T>(data: T, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  })
}

export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  } as Storage
}

export const createMockApiResponse = <T>(data: T, success = true): ApiResponse<T> => ({
  success,
  data,
  error: success ? undefined : 'Error occurred',
})

export const createMockError = (message: string, status?: number) => {
  const error = new Error(message) as Error & { status?: number }
  if (status) error.status = status
  return error
}

export const resetAllMocks = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

export const createMockFetch = <T>(data: T, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: vi.fn().mockResolvedValue(data),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  }) as unknown as ReturnType<typeof fetch>
}

export const createMockFetchError = (status: number, message = 'Error') => {
  const error = new Error(message)
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: message,
    json: vi.fn().mockRejectedValue(error),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  }) as unknown as ReturnType<typeof fetch>
}

export const setupGlobalFetch = (mockFn: ReturnType<typeof vi.fn>) => {
  Object.defineProperty(globalThis, 'fetch', {
    value: mockFn,
    writable: true,
  })
}

export const createMockWindow = () => {
  const mockWindow = {
    matchMedia: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    location: {
      href: 'http://localhost/',
      pathname: '/',
      search: '',
      hash: '',
    },
    localStorage: mockLocalStorage(),
    sessionStorage: mockLocalStorage(),
  }
  return mockWindow
}

export const setupGlobalWindow = (mockWindow: ReturnType<typeof createMockWindow>) => {
  Object.defineProperty(globalThis, 'window', {
    value: mockWindow,
    writable: true,
  })
  Object.defineProperty(globalThis, 'matchMedia', {
    value: mockWindow.matchMedia,
    writable: true,
  })
}

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'student',
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockStudent = (overrides: Partial<Student> = {}): Student => ({
  ...createMockUser({ role: 'student', ...overrides }),
  nis: '12345678',
  grade: '10',
  class: 'A',
  parentId: 'parent-1',
  ...overrides,
})

export const createMockTeacher = (overrides: Partial<Teacher> = {}): Teacher => ({
  ...createMockUser({ role: 'teacher', ...overrides }),
  nip: '98765432',
  subject: 'Mathematics',
  ...overrides,
})

export const createMockParent = (overrides: Partial<Parent> = {}): Parent => ({
  ...createMockUser({ role: 'parent', ...overrides }),
  children: [],
  ...overrides,
})

export const createMockAnnouncement = (overrides: Partial<Announcement> = {}): Announcement => ({
  id: 'announcement-1',
  title: 'Test Announcement',
  content: 'Test content',
  targetRole: 'all',
  authorId: 'user-1',
  authorName: 'Admin',
  createdAt: new Date().toISOString(),
  isActive: true,
  ...overrides,
})

export const createMockGrade = (overrides: Partial<Grade> = {}): Grade => ({
  id: 'grade-1',
  studentId: 'student-1',
  studentName: 'Student Name',
  teacherId: 'teacher-1',
  teacherName: 'Teacher Name',
  subject: 'Mathematics',
  value: 85,
  semester: '2024-1',
  description: 'Test grade',
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'message-1',
  senderId: 'user-1',
  senderName: 'Sender Name',
  receiverId: 'user-2',
  receiverName: 'Receiver Name',
  subject: 'Test Subject',
  content: 'Test content',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockApiError = (message: string, status: number) => {
  const error = new Error(message) as Error & { status?: number; response?: { status: number } }
  error.status = status
  error.response = { status }
  return error
}
