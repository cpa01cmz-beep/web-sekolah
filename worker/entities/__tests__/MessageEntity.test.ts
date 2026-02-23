import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageEntity } from '../MessageEntity'
import type { Env } from '../../types'

describe('MessageEntity', () => {
  let mockEnv: Env
  let mockStub: any

  beforeEach(() => {
    mockStub = {
      getDoc: vi.fn(),
      casPut: vi.fn(),
      del: vi.fn(),
      has: vi.fn(),
      listPrefix: vi.fn(),
      indexAddBatch: vi.fn(),
      indexRemoveBatch: vi.fn(),
    }

    mockEnv = {
      GlobalDurableObject: {
        idFromName: vi.fn().mockReturnValue('test-do-id'),
        get: vi.fn().mockReturnValue(mockStub),
      },
    } as unknown as Env
  })

  describe('countByParentMessageId', () => {
    it('should return count of items by parentMessageId', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:parent-1:entity:id-1', 'field:parent-1:entity:id-2'],
      })

      const result = await MessageEntity.countByParentMessageId(mockEnv, 'parent-1')

      expect(result).toBe(2)
      expect(mockStub.listPrefix).toHaveBeenCalled()
    })

    it('should return 0 when no items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.countByParentMessageId(mockEnv, 'nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('existsByParentMessageId', () => {
    it('should return true when items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: ['field:parent-1:entity:id-1'] })

      const result = await MessageEntity.existsByParentMessageId(mockEnv, 'parent-1')

      expect(result).toBe(true)
      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:parent-1:entity:', null, 1)
    })

    it('should return false when no items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.existsByParentMessageId(mockEnv, 'nonexistent')

      expect(result).toBe(false)
    })
  })
})
