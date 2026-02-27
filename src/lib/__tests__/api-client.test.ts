import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiClient } from '../api-client'
import type { ApiResponse } from '@shared/types'

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

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('success cases', () => {
    it('should return data on successful response', async () => {
      const mockData = { id: '1', name: 'Test User' }
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const result = await apiClient('/api/test')

      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith('/api/test', expect.any(Object))
    })

    it('should handle custom request init options', async () => {
      const mockData = { id: '1' }
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      const result = await apiClient('/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })

      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith('/api/test', expect.any(Object))
    })
  })

  describe('error cases', () => {
    it('should throw error on non-ok response', async () => {
      const errorJson = { error: 'Not found' }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(errorJson, 404))

      await expect(apiClient('/api/test')).rejects.toThrow('Not found')
    })

    it('should throw error with status code in error object', async () => {
      global.fetch = vi.fn().mockResolvedValue(createMockResponse({}, 500))

      const promise = apiClient('/api/test')
      await expect(promise).rejects.toThrow()

      try {
        await promise
      } catch (error: any) {
        expect(error.status).toBe(500)
      }
    }, 10000)

    it('should throw error when success is false', async () => {
      const mockResponse: ApiResponse<unknown> = {
        success: false,
        error: 'API error',
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      await expect(apiClient('/api/test')).rejects.toThrow('API error')
    })

    it('should handle JSON parse errors', async () => {
      const mockResponse = createMockResponse({}, 500)
      mockResponse.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const promise = apiClient('/api/test')
      await expect(promise).rejects.toThrow()
    }, 10000)
  })

  describe('request headers', () => {
    it('should merge headers with default Content-Type', async () => {
      const mockData = { id: '1' }
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      }

      global.fetch = vi.fn().mockResolvedValue(createMockResponse(mockResponse))

      await apiClient('/api/test', {
        headers: { Authorization: 'Bearer token' },
      })

      expect(fetch).toHaveBeenCalledWith('/api/test', expect.any(Object))
      const fetchCall = (fetch as any).mock.calls[0][1]
      expect(fetchCall.headers['Authorization']).toBe('Bearer token')
      expect(fetchCall.headers['Content-Type']).toBe('application/json')
    })
  })
})
