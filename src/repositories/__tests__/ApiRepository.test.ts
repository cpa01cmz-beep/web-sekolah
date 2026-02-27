import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiRepository } from '../ApiRepository'
import { apiClient } from '@/lib/api-client'
import type { ApiRequestOptions } from '../IRepository'

vi.mock('@/lib/api-client')

describe('ApiRepository', () => {
  let repository: ApiRepository

  beforeEach(() => {
    repository = new ApiRepository()
    vi.clearAllMocks()
  })

  describe('get', () => {
    it('should call apiClient with GET method', async () => {
      const mockData = { id: '1', name: 'Test' }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.get('/api/test')

      expect(apiClient).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
      })
      expect(result).toEqual(mockData)
    })

    it('should pass options to apiClient', async () => {
      const mockData = { id: '1' }
      const options: ApiRequestOptions = {
        headers: { Authorization: 'Bearer token' },
        timeout: 5000,
        circuitBreaker: false,
      }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      await repository.get('/api/test', options)

      expect(apiClient).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        ...options,
      })
    })
  })

  describe('post', () => {
    it('should call apiClient with POST method and body', async () => {
      const mockData = { id: '1' }
      const body = { name: 'Test User' }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.post('/api/users', body)

      expect(apiClient).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      expect(result).toEqual(mockData)
    })

    it('should handle undefined body', async () => {
      const mockData = { id: '1' }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      await repository.post('/api/test', undefined)

      expect(apiClient).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: undefined,
      })
    })

    it('should pass options to apiClient', async () => {
      const mockData = { id: '1' }
      const body = { name: 'Test' }
      const options: ApiRequestOptions = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      await repository.post('/api/test', body, options)

      expect(apiClient).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: JSON.stringify(body),
        ...options,
      })
    })
  })

  describe('put', () => {
    it('should call apiClient with PUT method and body', async () => {
      const mockData = { id: '1', name: 'Updated' }
      const body = { name: 'Updated' }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.put('/api/users/1', body)

      expect(apiClient).toHaveBeenCalledWith('/api/users/1', {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      expect(result).toEqual(mockData)
    })

    it('should handle undefined body', async () => {
      const mockData = { id: '1' }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      await repository.put('/api/test', undefined)

      expect(apiClient).toHaveBeenCalledWith('/api/test', {
        method: 'PUT',
        body: undefined,
      })
    })

    it('should pass options to apiClient', async () => {
      const mockData = { id: '1' }
      const body = { name: 'Test' }
      const options: ApiRequestOptions = { timeout: 8000 }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      await repository.put('/api/test', body, options)

      expect(apiClient).toHaveBeenCalledWith('/api/test', {
        method: 'PUT',
        body: JSON.stringify(body),
        ...options,
      })
    })
  })

  describe('delete', () => {
    it('should call apiClient with DELETE method', async () => {
      const mockData = { deleted: true }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.delete('/api/users/1')

      expect(apiClient).toHaveBeenCalledWith('/api/users/1', {
        method: 'DELETE',
      })
      expect(result).toEqual(mockData)
    })

    it('should pass options to apiClient', async () => {
      const mockData = { deleted: true }
      const options: ApiRequestOptions = {
        headers: { Authorization: 'Bearer token' },
      }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      await repository.delete('/api/users/1', options)

      expect(apiClient).toHaveBeenCalledWith('/api/users/1', {
        method: 'DELETE',
        ...options,
      })
    })
  })

  describe('patch', () => {
    it('should call apiClient with PATCH method and body', async () => {
      const mockData = { id: '1', name: 'Partially Updated' }
      const body = { name: 'Partially Updated' }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.patch('/api/users/1', body)

      expect(apiClient).toHaveBeenCalledWith('/api/users/1', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      expect(result).toEqual(mockData)
    })

    it('should handle undefined body', async () => {
      const mockData = { id: '1' }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      await repository.patch('/api/test', undefined)

      expect(apiClient).toHaveBeenCalledWith('/api/test', {
        method: 'PATCH',
        body: undefined,
      })
    })

    it('should pass options to apiClient', async () => {
      const mockData = { id: '1' }
      const body = { name: 'Test' }
      const options: ApiRequestOptions = { timeout: 3000 }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      await repository.patch('/api/test', body, options)

      expect(apiClient).toHaveBeenCalledWith('/api/test', {
        method: 'PATCH',
        body: JSON.stringify(body),
        ...options,
      })
    })
  })

  describe('error handling', () => {
    it('should propagate errors from apiClient', async () => {
      const mockError = new Error('Network error')
      vi.mocked(apiClient).mockRejectedValue(mockError)

      await expect(repository.get('/api/test')).rejects.toThrow('Network error')
    })

    it('should propagate errors on POST', async () => {
      const mockError = new Error('Bad request')
      vi.mocked(apiClient).mockRejectedValue(mockError)

      await expect(repository.post('/api/test', {})).rejects.toThrow('Bad request')
    })

    it('should propagate errors on PUT', async () => {
      const mockError = new Error('Not found')
      vi.mocked(apiClient).mockRejectedValue(mockError)

      await expect(repository.put('/api/test', {})).rejects.toThrow('Not found')
    })

    it('should propagate errors on DELETE', async () => {
      const mockError = new Error('Forbidden')
      vi.mocked(apiClient).mockRejectedValue(mockError)

      await expect(repository.delete('/api/test')).rejects.toThrow('Forbidden')
    })

    it('should propagate errors on PATCH', async () => {
      const mockError = new Error('Conflict')
      vi.mocked(apiClient).mockRejectedValue(mockError)

      await expect(repository.patch('/api/test', {})).rejects.toThrow('Conflict')
    })
  })

  describe('type safety', () => {
    it('should return typed data for GET', async () => {
      interface UserData {
        id: string
        name: string
        email: string
      }
      const mockData: UserData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.get<UserData>('/api/users/1')

      expect(result.email).toBe('john@example.com')
    })

    it('should return typed data for POST', async () => {
      interface CreateResponse {
        id: string
        createdAt: string
      }
      const mockData: CreateResponse = {
        id: '123',
        createdAt: '2026-01-07T00:00:00.000Z',
      }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.post<CreateResponse>('/api/users', { name: 'Test' })

      expect(result.id).toBe('123')
    })

    it('should return typed data for PUT', async () => {
      interface UpdateResponse {
        id: string
        updatedAt: string
      }
      const mockData: UpdateResponse = {
        id: '1',
        updatedAt: '2026-01-07T12:00:00.000Z',
      }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.put<UpdateResponse>('/api/users/1', { name: 'Updated' })

      expect(result.updatedAt).toContain('2026-01-07')
    })

    it('should return typed data for DELETE', async () => {
      interface DeleteResponse {
        deleted: boolean
        message: string
      }
      const mockData: DeleteResponse = {
        deleted: true,
        message: 'User deleted successfully',
      }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.delete<DeleteResponse>('/api/users/1')

      expect(result.deleted).toBe(true)
    })

    it('should return typed data for PATCH', async () => {
      interface PatchResponse {
        id: string
        patched: boolean
      }
      const mockData: PatchResponse = {
        id: '1',
        patched: true,
      }
      vi.mocked(apiClient).mockResolvedValue(mockData)

      const result = await repository.patch<PatchResponse>('/api/users/1', {
        email: 'new@example.com',
      })

      expect(result.patched).toBe(true)
    })
  })
})
