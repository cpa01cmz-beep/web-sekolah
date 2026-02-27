import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeadLetterQueueWebhookEntity } from '../DeadLetterQueueWebhookEntity'
import type { Env } from '../../types'

describe('DeadLetterQueueWebhookEntity', () => {
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

  describe('countByWebhookConfigId', () => {
    it('should return count of items by webhookConfigId', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:config-1:entity:id-1', 'field:config-1:entity:id-2'],
      })

      const result = await DeadLetterQueueWebhookEntity.countByWebhookConfigId(mockEnv, 'config-1')

      expect(result).toBe(2)
      expect(mockStub.listPrefix).toHaveBeenCalled()
    })

    it('should return 0 when no items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await DeadLetterQueueWebhookEntity.countByWebhookConfigId(
        mockEnv,
        'nonexistent'
      )

      expect(result).toBe(0)
    })
  })

  describe('existsByWebhookConfigId', () => {
    it('should return true when items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: ['field:config-1:entity:id-1'] })

      const result = await DeadLetterQueueWebhookEntity.existsByWebhookConfigId(mockEnv, 'config-1')

      expect(result).toBe(true)
      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:config-1:entity:', null, 1)
    })

    it('should return false when no items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await DeadLetterQueueWebhookEntity.existsByWebhookConfigId(
        mockEnv,
        'nonexistent'
      )

      expect(result).toBe(false)
    })
  })

  describe('countByEventType', () => {
    it('should return count of items by eventType', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: [
          'field:grade.created:entity:id-1',
          'field:grade.created:entity:id-2',
          'field:grade.created:entity:id-3',
        ],
      })

      const result = await DeadLetterQueueWebhookEntity.countByEventType(mockEnv, 'grade.created')

      expect(result).toBe(3)
      expect(mockStub.listPrefix).toHaveBeenCalled()
    })

    it('should return 0 when no items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await DeadLetterQueueWebhookEntity.countByEventType(mockEnv, 'nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('existsByEventType', () => {
    it('should return true when items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: ['field:grade.created:entity:id-1'] })

      const result = await DeadLetterQueueWebhookEntity.existsByEventType(mockEnv, 'grade.created')

      expect(result).toBe(true)
      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:grade.created:entity:', null, 1)
    })

    it('should return false when no items exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await DeadLetterQueueWebhookEntity.existsByEventType(mockEnv, 'nonexistent')

      expect(result).toBe(false)
    })
  })
})
