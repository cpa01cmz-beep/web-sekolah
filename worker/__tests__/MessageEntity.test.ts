import { describe, it, expect } from 'vitest'
import { MessageEntity } from '../entities/MessageEntity'
import type { Message } from '@shared/types'

describe('MessageEntity', () => {
  describe('entity configuration', () => {
    it('should have correct entityName', () => {
      expect(MessageEntity.entityName).toBe('message')
    })

    it('should have correct indexName', () => {
      expect(MessageEntity.indexName).toBe('messages')
    })

    it('should have secondary indexes defined', () => {
      expect(MessageEntity.secondaryIndexes).toBeDefined()
      expect(MessageEntity.secondaryIndexes.length).toBe(3)
      expect(MessageEntity.secondaryIndexes[0].fieldName).toBe('senderId')
      expect(MessageEntity.secondaryIndexes[1].fieldName).toBe('recipientId')
      expect(MessageEntity.secondaryIndexes[2].fieldName).toBe('parentMessageId')
    })

    it('should have initialState defined', () => {
      expect(MessageEntity.initialState).toBeDefined()
      expect(MessageEntity.initialState.senderRole).toBe('teacher')
      expect(MessageEntity.initialState.recipientRole).toBe('parent')
      expect(MessageEntity.initialState.isRead).toBe(false)
      expect(MessageEntity.initialState.deletedAt).toBeNull()
    })

    it('should have seedData defined as empty array', () => {
      expect(MessageEntity.seedData).toBeDefined()
      expect(Array.isArray(MessageEntity.seedData)).toBe(true)
    })
  })

  describe('Message type validation', () => {
    it('should have correct Message structure', () => {
      const message: Message = {
        id: 'msg-1',
        senderId: 'teacher-1',
        senderRole: 'teacher',
        recipientId: 'parent-1',
        recipientRole: 'parent',
        subject: 'Test',
        content: 'Content',
        isRead: false,
        parentMessageId: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        deletedAt: null,
      }
      expect(message.id).toBe('msg-1')
      expect(message.senderRole).toBe('teacher')
      expect(message.recipientRole).toBe('parent')
      expect(message.isRead).toBe(false)
      expect(message.parentMessageId).toBeNull()
      expect(message.deletedAt).toBeNull()
    })

    it('should support messages with parentMessageId', () => {
      const reply: Message = {
        id: 'reply-1',
        senderId: 'parent-1',
        senderRole: 'parent',
        recipientId: 'teacher-1',
        recipientRole: 'teacher',
        subject: 'Re: Test',
        content: 'Reply content',
        isRead: false,
        parentMessageId: 'msg-1',
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        deletedAt: null,
      }
      expect(reply.parentMessageId).toBe('msg-1')
    })

    it('should support soft-deleted messages', () => {
      const deletedMessage: Message = {
        id: 'deleted-1',
        senderId: 'teacher-1',
        senderRole: 'teacher',
        recipientId: 'parent-1',
        recipientRole: 'parent',
        subject: 'Deleted',
        content: 'Content',
        isRead: true,
        parentMessageId: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        deletedAt: '2026-01-03T00:00:00Z',
      }
      expect(deletedMessage.deletedAt).toBe('2026-01-03T00:00:00Z')
    })

    it('should support different user roles', () => {
      const studentToTeacher: Message = {
        id: 'msg-student',
        senderId: 'student-1',
        senderRole: 'student',
        recipientId: 'teacher-1',
        recipientRole: 'teacher',
        subject: 'Question',
        content: 'Content',
        isRead: false,
        parentMessageId: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        deletedAt: null,
      }
      expect(studentToTeacher.senderRole).toBe('student')
      expect(studentToTeacher.recipientRole).toBe('teacher')
    })
  })

  describe('senderId index', () => {
    it('should have getter for senderId index', () => {
      const senderIndex = MessageEntity.secondaryIndexes.find(i => i.fieldName === 'senderId')
      expect(senderIndex).toBeDefined()
      expect(senderIndex?.getValue).toBeDefined()

      const testState = { id: 'msg-1', senderId: 'teacher-1' } as Message
      expect(senderIndex?.getValue(testState)).toBe('teacher-1')
    })
  })

  describe('recipientId index', () => {
    it('should have getter for recipientId index', () => {
      const recipientIndex = MessageEntity.secondaryIndexes.find(i => i.fieldName === 'recipientId')
      expect(recipientIndex).toBeDefined()
      expect(recipientIndex?.getValue).toBeDefined()

      const testState = { id: 'msg-1', recipientId: 'parent-1' } as Message
      expect(recipientIndex?.getValue(testState)).toBe('parent-1')
    })
  })

  describe('parentMessageId index', () => {
    it('should have getter for parentMessageId index', () => {
      const parentIndex = MessageEntity.secondaryIndexes.find(
        i => i.fieldName === 'parentMessageId'
      )
      expect(parentIndex).toBeDefined()
      expect(parentIndex?.getValue).toBeDefined()

      const testStateWithParent = { id: 'reply-1', parentMessageId: 'msg-1' } as Message
      expect(parentIndex?.getValue(testStateWithParent)).toBe('msg-1')

      const testStateWithoutParent = { id: 'msg-1', parentMessageId: null } as Message
      expect(parentIndex?.getValue(testStateWithoutParent)).toBe('')
    })
  })
})
