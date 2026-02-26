import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createQueryHook, createEntityQueryKey, createSimpleQueryKey } from '../query-factory'
import { CachingTime } from '../time'
import { createMockFetch, setupGlobalFetch } from '@/test/utils/mocks'

describe('query-factory', () => {
  let queryClient: QueryClient

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children)
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setupGlobalFetch(vi.fn())
  })

  describe('createQueryHook', () => {
    it('should create a query hook with correct query key', () => {
      const useTestQuery = createQueryHook<{ data: string }, [string]>({
        queryKey: params => ['test', params[0]],
        queryFn: async () => ({ data: 'test' }),
      })

      const wrapper = createWrapper()
      renderHook(() => useTestQuery(['id-123']), { wrapper })

      const cachedQuery = queryClient.getQueryCache().find({ queryKey: ['test', 'id-123'] })
      expect(cachedQuery).toBeDefined()
    })

    it('should use default options when provided', async () => {
      const useTestQuery = createQueryHook<{ data: string }, []>({
        queryKey: () => ['test'],
        queryFn: async () => ({ data: 'test' }),
        defaultOptions: {
          staleTime: CachingTime.ONE_HOUR,
        },
      })

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: { data: 'test' } }),
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestQuery([]), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: 'test' })
    })

    it('should allow overriding options at call time', async () => {
      const useTestQuery = createQueryHook<{ data: string }, []>({
        queryKey: () => ['test-override'],
        queryFn: async () => ({ data: 'test' }),
        defaultOptions: {
          staleTime: CachingTime.ONE_HOUR,
        },
      })

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: { data: 'test' } }),
      })

      const wrapper = createWrapper()
      const { result } = renderHook(
        () => useTestQuery([], { staleTime: CachingTime.FIVE_MINUTES }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('should handle query errors', async () => {
      const useTestQuery = createQueryHook<{ data: string }, []>({
        queryKey: () => ['test-error'],
        queryFn: async () => {
          throw new Error('Query failed')
        },
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestQuery([]), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error).toBeInstanceOf(Error)
    })

    it('should respect enabled option', () => {
      const useTestQuery = createQueryHook<{ data: string }, []>({
        queryKey: () => ['test-enabled'],
        queryFn: async () => ({ data: 'test' }),
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestQuery([], { enabled: false }), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
    })

    it('should work with multiple parameters', async () => {
      const useMultiParamQuery = createQueryHook<{ result: string }, [string, number]>({
        queryKey: params => ['multi', params[0], params[1]],
        queryFn: async params => ({ result: `${params[0]}-${params[1]}` }),
      })

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: { result: 'test-42' } }),
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useMultiParamQuery(['test', 42]), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      const cachedQuery = queryClient.getQueryCache().find({ queryKey: ['multi', 'test', 42] })
      expect(cachedQuery).toBeDefined()
    })
  })

  describe('createEntityQueryKey', () => {
    it('should create query key with entity and id', () => {
      const studentKey = createEntityQueryKey('students')
      expect(studentKey('student-123')).toEqual(['students', 'student-123'])
    })

    it('should create query key with sub-resource', () => {
      const studentKey = createEntityQueryKey('students')
      expect(studentKey('student-123', 'grades')).toEqual(['students', 'student-123', 'grades'])
    })

    it('should work with different entity types', () => {
      const teacherKey = createEntityQueryKey('teachers')
      const classKey = createEntityQueryKey('classes')

      expect(teacherKey('teacher-1', 'schedule')).toEqual(['teachers', 'teacher-1', 'schedule'])
      expect(classKey('class-1', 'students')).toEqual(['classes', 'class-1', 'students'])
    })
  })

  describe('createSimpleQueryKey', () => {
    it('should create simple query key', () => {
      const dashboardKey = createSimpleQueryKey('admin-dashboard')
      expect(dashboardKey()).toEqual(['admin-dashboard'])
    })

    it('should work with different key names', () => {
      const settingsKey = createSimpleQueryKey('settings')
      const usersKey = createSimpleQueryKey('users')

      expect(settingsKey()).toEqual(['settings'])
      expect(usersKey()).toEqual(['users'])
    })
  })
})
