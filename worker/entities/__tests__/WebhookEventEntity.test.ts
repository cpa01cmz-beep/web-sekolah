import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WebhookEventEntity } from '../WebhookEventEntity'
import type { Env } from '../../types'

describe('WebhookEventEntity', () => {
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

  describe('entity configuration', () => {
    it('should have correct entity name', () => {
      expect(WebhookEventEntity.entityName).toBe('webhookEvent')
    })

    it('should have correct index name', () => {
      expect(WebhookEventEntity.indexName).toBe('webhookEvents')
    })

    it('should have correct initial state', () => {
      expect(WebhookEventEntity.initialState).toEqual({
        id: '',
        eventType: '',
        data: {},
        processed: false,
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
      })
    })

    it('should have secondary indexes defined', () => {
      expect(WebhookEventEntity.secondaryIndexes).toHaveLength(2)
      expect(WebhookEventEntity.secondaryIndexes[0].fieldName).toBe('processed')
      expect(WebhookEventEntity.secondaryIndexes[1].fieldName).toBe('eventType')
    })
  })

  describe('getPending', () => {
    it('should return pending events by processed status', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:false:entity:event-1', 'field:false:entity:event-2'],
        next: null,
      })
      mockStub.getDoc
        .mockResolvedValueOnce({
          v: 1,
          data: {
            id: 'event-1',
            eventType: 'user.created',
            data: {},
            processed: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            deletedAt: null,
          },
        })
        .mockResolvedValueOnce({
          v: 1,
          data: {
            id: 'event-2',
            eventType: 'user.updated',
            data: {},
            processed: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            deletedAt: null,
          },
        })

      const result = await WebhookEventEntity.getPending(mockEnv)

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no pending events', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null })

      const result = await WebhookEventEntity.getPending(mockEnv)

      expect(result).toHaveLength(0)
    })
  })

  describe('getByEventType', () => {
    it('should return events by event type', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:user.created:entity:event-1'],
        next: null,
      })
      mockStub.getDoc.mockResolvedValueOnce({
        v: 1,
        data: {
          id: 'event-1',
          eventType: 'user.created',
          data: { userId: 'user-1' },
          processed: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        },
      })

      const result = await WebhookEventEntity.getByEventType(mockEnv, 'user.created')

      expect(result).toHaveLength(1)
      expect(result[0].eventType).toBe('user.created')
    })

    it('should return empty array for non-existent event type', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null })

      const result = await WebhookEventEntity.getByEventType(mockEnv, 'nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('countPending', () => {
    it('should return count of pending events', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: [
          'field:false:entity:event-1',
          'field:false:entity:event-2',
          'field:false:entity:event-3',
        ],
        next: null,
      })

      const result = await WebhookEventEntity.countPending(mockEnv)

      expect(result).toBe(3)
    })

    it('should return 0 when no pending events', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null })

      const result = await WebhookEventEntity.countPending(mockEnv)

      expect(result).toBe(0)
    })
  })

  describe('existsPending', () => {
    it('should return true when pending events exist', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:false:entity:event-1'],
        next: null,
      })

      const result = await WebhookEventEntity.existsPending(mockEnv)

      expect(result).toBe(true)
    })

    it('should return false when no pending events exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null })

      const result = await WebhookEventEntity.existsPending(mockEnv)

      expect(result).toBe(false)
    })
  })

  describe('countByEventType', () => {
    it('should return count of events by event type', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:grade.created:entity:event-1', 'field:grade.created:entity:event-2'],
        next: null,
      })

      const result = await WebhookEventEntity.countByEventType(mockEnv, 'grade.created')

      expect(result).toBe(2)
    })

    it('should return 0 for non-existent event type', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null })

      const result = await WebhookEventEntity.countByEventType(mockEnv, 'nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('existsByEventType', () => {
    it('should return true when events exist for event type', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:user.updated:entity:event-1'],
        next: null,
      })

      const result = await WebhookEventEntity.existsByEventType(mockEnv, 'user.updated')

      expect(result).toBe(true)
    })

    it('should return false when no events exist for event type', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null })

      const result = await WebhookEventEntity.existsByEventType(mockEnv, 'nonexistent')

      expect(result).toBe(false)
    })
  })
})
