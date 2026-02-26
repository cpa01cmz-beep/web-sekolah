import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageEntity } from '../MessageEntity'
import type { Env } from '../../types'
import type { Message } from '@shared/types'

describe('MessageEntity', () => {
  let mockEnv: Env
  let mockStub: any

  const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'msg-1',
    senderId: 'teacher-1',
    senderRole: 'teacher',
    recipientId: 'parent-1',
    recipientRole: 'parent',
    subject: 'Test Subject',
    content: 'Test Content',
    isRead: false,
    parentMessageId: null,
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

  describe('getBySenderId', () => {
    it('should return messages sent by the given sender', async () => {
      const messages = [
        createMockMessage({ id: 'msg-1', senderId: 'teacher-1' }),
        createMockMessage({ id: 'msg-2', senderId: 'teacher-1' }),
      ]

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:teacher-1:entity:msg-1', 'field:teacher-1:entity:msg-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: messages[0] })
        .mockResolvedValueOnce({ v: 1, data: messages[1] })

      const result = await MessageEntity.getBySenderId(mockEnv, 'teacher-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('msg-1')
      expect(result[1].id).toBe('msg-2')
    })

    it('should return empty array when no messages found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.getBySenderId(mockEnv, 'teacher-nonexistent')

      expect(result).toHaveLength(0)
    })

    it('should filter out soft-deleted messages', async () => {
      const deletedMessage = createMockMessage({
        id: 'msg-1',
        deletedAt: '2024-01-02T00:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:teacher-1:entity:msg-1'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: deletedMessage })

      const result = await MessageEntity.getBySenderId(mockEnv, 'teacher-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('getByRecipientId', () => {
    it('should return messages received by the given recipient', async () => {
      const messages = [
        createMockMessage({ id: 'msg-1', recipientId: 'parent-1' }),
        createMockMessage({ id: 'msg-2', recipientId: 'parent-1' }),
      ]

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:parent-1:entity:msg-1', 'field:parent-1:entity:msg-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: messages[0] })
        .mockResolvedValueOnce({ v: 1, data: messages[1] })

      const result = await MessageEntity.getByRecipientId(mockEnv, 'parent-1')

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no messages found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.getByRecipientId(mockEnv, 'parent-nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('getConversation', () => {
    it('should return conversation between two users sorted by date', async () => {
      const sentMsg = createMockMessage({
        id: 'msg-1',
        senderId: 'teacher-1',
        recipientId: 'parent-1',
        createdAt: '2024-01-01T10:00:00.000Z',
      })
      const receivedMsg = createMockMessage({
        id: 'msg-2',
        senderId: 'parent-1',
        recipientId: 'teacher-1',
        createdAt: '2024-01-01T11:00:00.000Z',
      })

      mockStub.listPrefix
        .mockResolvedValueOnce({
          keys: ['field:teacher-1:entity:msg-1'],
        })
        .mockResolvedValueOnce({
          keys: ['field:teacher-1:entity:msg-2'],
        })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: sentMsg })
        .mockResolvedValueOnce({ v: 1, data: receivedMsg })

      const result = await MessageEntity.getConversation(mockEnv, 'teacher-1', 'parent-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('msg-1')
      expect(result[1].id).toBe('msg-2')
    })

    it('should return empty array when no conversation exists', async () => {
      mockStub.listPrefix.mockResolvedValueOnce({ keys: [] }).mockResolvedValueOnce({ keys: [] })

      const result = await MessageEntity.getConversation(mockEnv, 'teacher-1', 'parent-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('getThread', () => {
    it('should return parent message with replies sorted by date', async () => {
      const parentMsg = createMockMessage({
        id: 'parent-msg',
        parentMessageId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
      })
      const reply1 = createMockMessage({
        id: 'reply-1',
        parentMessageId: 'parent-msg',
        createdAt: '2024-01-01T11:00:00.000Z',
      })
      const reply2 = createMockMessage({
        id: 'reply-2',
        parentMessageId: 'parent-msg',
        createdAt: '2024-01-01T12:00:00.000Z',
      })

      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: parentMsg })
      mockStub.listPrefix.mockResolvedValueOnce({
        keys: ['field:parent-msg:entity:reply-1', 'field:parent-msg:entity:reply-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: reply1 })
        .mockResolvedValueOnce({ v: 1, data: reply2 })

      const result = await MessageEntity.getThread(mockEnv, 'parent-msg')

      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('parent-msg')
    })

    it('should return empty array when parent message not found', async () => {
      mockStub.getDoc.mockResolvedValue({
        v: 1,
        data: { id: 'nonexistent', deletedAt: '2024-01-01T00:00:00.000Z' },
      })
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.getThread(mockEnv, 'nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('markAsRead', () => {
    it('should mark message as read and update compound index', async () => {
      const message = createMockMessage({ id: 'msg-1', isRead: false })
      const updatedMessage = { ...message, isRead: true, updatedAt: '2024-01-01T12:00:00.000Z' }

      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: message })
        .mockResolvedValueOnce({ v: 1, data: message })
      mockStub.casPut.mockResolvedValue({ ok: true, v: 2 })
      mockStub.listPrefix.mockResolvedValue({ keys: [] })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc.mockResolvedValueOnce({ v: 2, data: updatedMessage })

      const result = await MessageEntity.markAsRead(mockEnv, 'msg-1')

      expect(result).not.toBeNull()
    })

    it('should return null when message not found', async () => {
      mockStub.getDoc.mockResolvedValue(null)
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.markAsRead(mockEnv, 'nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('countUnread', () => {
    it('should return count of unread messages for recipient', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['compound:parent-1:false:entity:msg-1', 'compound:parent-1:false:entity:msg-2'],
      })

      const result = await MessageEntity.countUnread(mockEnv, 'parent-1')

      expect(result).toBe(2)
    })

    it('should return 0 when no unread messages', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.countUnread(mockEnv, 'parent-1')

      expect(result).toBe(0)
    })
  })

  describe('getUnreadByRecipient', () => {
    it('should return unread messages for recipient', async () => {
      const unreadMsg = createMockMessage({ id: 'msg-1', isRead: false })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['compound:parent-1:false:entity:msg-1'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: unreadMsg })

      const result = await MessageEntity.getUnreadByRecipient(mockEnv, 'parent-1')

      expect(result).toHaveLength(1)
      expect(result[0].isRead).toBe(false)
    })

    it('should return empty array when no unread messages', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.getUnreadByRecipient(mockEnv, 'parent-1')

      expect(result).toHaveLength(0)
    })

    it('should filter out soft-deleted messages', async () => {
      const deletedMsg = createMockMessage({
        id: 'msg-1',
        deletedAt: '2024-01-02T00:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['compound:parent-1:false:entity:msg-1'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: deletedMsg })

      const result = await MessageEntity.getUnreadByRecipient(mockEnv, 'parent-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('countBySenderId', () => {
    it('should return count of messages by sender', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: [
          'field:teacher-1:entity:msg-1',
          'field:teacher-1:entity:msg-2',
          'field:teacher-1:entity:msg-3',
        ],
      })

      const result = await MessageEntity.countBySenderId(mockEnv, 'teacher-1')

      expect(result).toBe(3)
    })

    it('should return 0 when no messages from sender', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.countBySenderId(mockEnv, 'teacher-nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('existsBySenderId', () => {
    it('should return true when sender has messages', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: ['field:teacher-1:entity:msg-1'] })

      const result = await MessageEntity.existsBySenderId(mockEnv, 'teacher-1')

      expect(result).toBe(true)
    })

    it('should return false when sender has no messages', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.existsBySenderId(mockEnv, 'teacher-nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('countByRecipientId', () => {
    it('should return count of messages for recipient', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:parent-1:entity:msg-1', 'field:parent-1:entity:msg-2'],
      })

      const result = await MessageEntity.countByRecipientId(mockEnv, 'parent-1')

      expect(result).toBe(2)
    })

    it('should return 0 when no messages for recipient', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.countByRecipientId(mockEnv, 'parent-nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('existsByRecipientId', () => {
    it('should return true when recipient has messages', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: ['field:parent-1:entity:msg-1'] })

      const result = await MessageEntity.existsByRecipientId(mockEnv, 'parent-1')

      expect(result).toBe(true)
    })

    it('should return false when recipient has no messages', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.existsByRecipientId(mockEnv, 'parent-nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('getRecentForSender', () => {
    it('should return recent messages sent by sender with limit', async () => {
      const msg1 = createMockMessage({
        id: 'msg-1',
        senderId: 'teacher-1',
        createdAt: '2024-01-01T10:00:00.000Z',
      })
      const msg2 = createMockMessage({
        id: 'msg-2',
        senderId: 'teacher-1',
        createdAt: '2024-01-01T11:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['date:teacher-1:sent:msg-1', 'date:teacher-1:sent:msg-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: msg1 })
        .mockResolvedValueOnce({ v: 1, data: msg2 })

      const result = await MessageEntity.getRecentForSender(mockEnv, 'teacher-1', 10)

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no recent messages', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.getRecentForSender(mockEnv, 'teacher-1')

      expect(result).toHaveLength(0)
    })

    it('should filter out soft-deleted messages', async () => {
      const deletedMsg = createMockMessage({
        id: 'msg-1',
        deletedAt: '2024-01-02T00:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['date:teacher-1:sent:msg-1'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: deletedMsg })

      const result = await MessageEntity.getRecentForSender(mockEnv, 'teacher-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('getRecentForRecipient', () => {
    it('should return recent messages received by recipient', async () => {
      const msg1 = createMockMessage({
        id: 'msg-1',
        recipientId: 'parent-1',
        createdAt: '2024-01-01T10:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['date:parent-1:received:msg-1'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: msg1 })

      const result = await MessageEntity.getRecentForRecipient(mockEnv, 'parent-1', 5)

      expect(result).toHaveLength(1)
    })

    it('should return empty array when no recent messages', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.getRecentForRecipient(mockEnv, 'parent-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('createWithAllIndexes', () => {
    it('should create message and add to all indexes', async () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

      const message = createMockMessage({ id: 'new-msg' })

      mockStub.getDoc.mockResolvedValue(null)
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 })
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.createWithAllIndexes(mockEnv, message)

      expect(result.id).toBe('new-msg')

      vi.useRealTimers()
    })
  })

  describe('deleteWithAllIndexes', () => {
    it('should delete message and remove from all indexes', async () => {
      const message = createMockMessage({ id: 'msg-1' })

      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: message })
      mockStub.del.mockResolvedValue(true)
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await MessageEntity.deleteWithAllIndexes(mockEnv, 'msg-1')

      expect(result).toBe(true)
    })
  })

  describe('softDelete', () => {
    it('should return null when message already soft deleted', async () => {
      const deletedMessage = createMockMessage({
        id: 'msg-1',
        deletedAt: '2024-01-01T00:00:00.000Z',
      })

      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: deletedMessage })

      const result = await MessageEntity.softDelete(mockEnv, 'msg-1')

      expect(result).toBeNull()
    })
  })
})
