import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WebhookDeliveryEntity } from '../WebhookDeliveryEntity'
import type { Env } from '../../types'
import type { WebhookDelivery } from '@shared/types'

describe('WebhookDeliveryEntity', () => {
  let mockEnv: Env
  let mockStub: any

  const createMockDelivery = (overrides: Partial<WebhookDelivery> = {}): WebhookDelivery => ({
    id: 'delivery-1',
    eventId: 'event-1',
    webhookConfigId: 'config-1',
    status: 'pending',
    attempts: 0,
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
    deletedAt: null,
    ...overrides,
  })

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

  describe('getPendingRetries', () => {
    it('should return pending deliveries filtered by nextAttemptAt', async () => {
      const now = new Date().toISOString()
      const deliveries = [
        createMockDelivery({ id: 'delivery-1', nextAttemptAt: '2020-01-01T09:00:00.000Z' }),
        createMockDelivery({ id: 'delivery-2', nextAttemptAt: '2099-01-01T11:00:00.000Z' }),
      ]

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:pending:entity:delivery-1', 'field:pending:entity:delivery-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: deliveries[0] })
        .mockResolvedValueOnce({ v: 1, data: deliveries[1] })

      const result = await WebhookDeliveryEntity.getPendingRetries(mockEnv)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('delivery-1')
    })

    it('should return empty array when no pending deliveries', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.getPendingRetries(mockEnv)

      expect(result).toHaveLength(0)
    })
  })

  describe('getByIdempotencyKey', () => {
    it('should return delivery when found by idempotency key', async () => {
      const delivery = createMockDelivery({ id: 'delivery-1', idempotencyKey: 'idem-123' })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:idem-123:entity:delivery-1'],
      })
      mockStub.getDoc.mockResolvedValue({ v: 1, data: delivery })

      const result = await WebhookDeliveryEntity.getByIdempotencyKey(mockEnv, 'idem-123')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('delivery-1')
    })

    it('should return null when no delivery found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.getByIdempotencyKey(mockEnv, 'nonexistent')

      expect(result).toBeNull()
    })

    it('should return null when delivery is soft-deleted', async () => {
      const deletedDelivery = createMockDelivery({
        id: 'delivery-1',
        deletedAt: '2024-01-02T00:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:idem-123:entity:delivery-1'],
      })
      mockStub.getDoc.mockResolvedValue({ v: 1, data: deletedDelivery })

      const result = await WebhookDeliveryEntity.getByIdempotencyKey(mockEnv, 'idem-123')

      expect(result).toBeNull()
    })
  })

  describe('getByEventId', () => {
    it('should return deliveries for the given event', async () => {
      const deliveries = [
        createMockDelivery({ id: 'delivery-1', eventId: 'event-1' }),
        createMockDelivery({ id: 'delivery-2', eventId: 'event-1' }),
      ]

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:event-1:entity:delivery-1', 'field:event-1:entity:delivery-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: deliveries[0] })
        .mockResolvedValueOnce({ v: 1, data: deliveries[1] })

      const result = await WebhookDeliveryEntity.getByEventId(mockEnv, 'event-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('delivery-1')
    })

    it('should return empty array when no deliveries found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.getByEventId(mockEnv, 'event-nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('getByWebhookConfigId', () => {
    it('should return deliveries for the given webhook config', async () => {
      const deliveries = [
        createMockDelivery({ id: 'delivery-1', webhookConfigId: 'config-1' }),
        createMockDelivery({ id: 'delivery-2', webhookConfigId: 'config-1' }),
      ]

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:config-1:entity:delivery-1', 'field:config-1:entity:delivery-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: deliveries[0] })
        .mockResolvedValueOnce({ v: 1, data: deliveries[1] })

      const result = await WebhookDeliveryEntity.getByWebhookConfigId(mockEnv, 'config-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('delivery-1')
    })

    it('should return empty array when no deliveries found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.getByWebhookConfigId(mockEnv, 'config-nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('getRecentDeliveries', () => {
    it('should return recent deliveries', async () => {
      const deliveries = [
        createMockDelivery({ id: 'delivery-1', createdAt: '2024-01-01T10:00:00.000Z' }),
        createMockDelivery({ id: 'delivery-2', createdAt: '2024-01-02T10:00:00.000Z' }),
      ]

      mockStub.listPrefix.mockResolvedValueOnce({
        keys: [
          'date:2024-01-02T10:00:00.000Z:entity:delivery-2',
          'date:2024-01-01T10:00:00.000Z:entity:delivery-1',
        ],
      })
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: deliveries[1] })
        .mockResolvedValueOnce({ v: 1, data: deliveries[0] })

      const result = await WebhookDeliveryEntity.getRecentDeliveries(mockEnv, 10)

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no deliveries found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.getRecentDeliveries(mockEnv, 10)

      expect(result).toHaveLength(0)
    })

    it('should filter out soft-deleted deliveries', async () => {
      const deletedDelivery = createMockDelivery({
        id: 'delivery-1',
        deletedAt: '2024-01-02T00:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['date:2024-01-01T10:00:00.000Z:entity:delivery-1'],
      })
      mockStub.getDoc.mockResolvedValue({ v: 1, data: deletedDelivery })

      const result = await WebhookDeliveryEntity.getRecentDeliveries(mockEnv, 10)

      expect(result).toHaveLength(0)
    })
  })

  describe('countByStatus', () => {
    it('should return count of deliveries by status', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:pending:entity:delivery-1', 'field:pending:entity:delivery-2'],
      })

      const result = await WebhookDeliveryEntity.countByStatus(mockEnv, 'pending')

      expect(result).toBe(2)
    })

    it('should return 0 when no deliveries found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.countByStatus(mockEnv, 'pending')

      expect(result).toBe(0)
    })
  })

  describe('existsByStatus', () => {
    it('should return true when deliveries exist with status', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:pending:entity:delivery-1'],
      })

      const result = await WebhookDeliveryEntity.existsByStatus(mockEnv, 'pending')

      expect(result).toBe(true)
    })

    it('should return false when no deliveries with status', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.existsByStatus(mockEnv, 'pending')

      expect(result).toBe(false)
    })
  })

  describe('countByEventId', () => {
    it('should return count of deliveries by event', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:event-1:entity:delivery-1', 'field:event-1:entity:delivery-2'],
      })

      const result = await WebhookDeliveryEntity.countByEventId(mockEnv, 'event-1')

      expect(result).toBe(2)
    })

    it('should return 0 when no deliveries found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.countByEventId(mockEnv, 'event-nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('existsByEventId', () => {
    it('should return true when deliveries exist for event', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:event-1:entity:delivery-1'],
      })

      const result = await WebhookDeliveryEntity.existsByEventId(mockEnv, 'event-1')

      expect(result).toBe(true)
    })

    it('should return false when no deliveries for event', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.existsByEventId(mockEnv, 'event-nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('countByWebhookConfigId', () => {
    it('should return count of deliveries by webhook config', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:config-1:entity:delivery-1', 'field:config-1:entity:delivery-2'],
      })

      const result = await WebhookDeliveryEntity.countByWebhookConfigId(mockEnv, 'config-1')

      expect(result).toBe(2)
    })

    it('should return 0 when no deliveries found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.countByWebhookConfigId(
        mockEnv,
        'config-nonexistent'
      )

      expect(result).toBe(0)
    })
  })

  describe('existsByWebhookConfigId', () => {
    it('should return true when deliveries exist for webhook config', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:config-1:entity:delivery-1'],
      })

      const result = await WebhookDeliveryEntity.existsByWebhookConfigId(mockEnv, 'config-1')

      expect(result).toBe(true)
    })

    it('should return false when no deliveries for webhook config', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.existsByWebhookConfigId(
        mockEnv,
        'config-nonexistent'
      )

      expect(result).toBe(false)
    })
  })

  describe('createWithDateIndex', () => {
    it('should create delivery with date index', async () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

      const delivery = createMockDelivery({ id: 'delivery-1' })

      mockStub.getDoc.mockResolvedValue(null)
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 })
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.createWithDateIndex(mockEnv, delivery)

      expect(result.id).toBe('delivery-1')

      vi.useRealTimers()
    })
  })

  describe('deleteWithDateIndex', () => {
    it('should delete delivery and remove date index', async () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

      const delivery = createMockDelivery({ id: 'delivery-1' })

      mockStub.getDoc.mockResolvedValue({ v: 1, data: delivery })
      mockStub.del.mockResolvedValue(true)
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await WebhookDeliveryEntity.deleteWithDateIndex(mockEnv, 'delivery-1')

      expect(result).toBe(true)

      vi.useRealTimers()
    })
  })
})
