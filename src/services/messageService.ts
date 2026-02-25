import type { IRepository } from '@/repositories/IRepository'
import type { Message } from '@shared/types'
import type { SendMessageData } from './serviceContracts'

export interface MessageEndpoints {
  messages: (userId: string) => string
  messageRead: (userId: string, messageId: string) => string
  messageConversation: (userId: string, otherUserId: string) => string
  unreadCount: (userId: string) => string
  deleteMessage: (userId: string, messageId: string) => string
}

export interface MessageService {
  getMessages(userId: string, type?: 'inbox' | 'sent'): Promise<Message[]>
  getUnreadCount(userId: string): Promise<number>
  getConversation(userId: string, otherUserId: string): Promise<Message[]>
  sendMessage(userId: string, data: SendMessageData): Promise<Message>
  markAsRead(userId: string, messageId: string): Promise<Message>
  deleteMessage(userId: string, messageId: string): Promise<{ deleted: boolean; id: string }>
}

export function createMessageService(
  repository: IRepository,
  endpoints: MessageEndpoints
): MessageService {
  return {
    async getMessages(userId: string, type: 'inbox' | 'sent' = 'inbox'): Promise<Message[]> {
      return repository.get<Message[]>(`${endpoints.messages(userId)}?type=${type}`)
    },

    async getUnreadCount(userId: string): Promise<number> {
      const result = await repository.get<{ count: number }>(endpoints.unreadCount(userId))
      return result.count
    },

    async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
      return repository.get<Message[]>(endpoints.messageConversation(userId, otherUserId))
    },

    async sendMessage(userId: string, data: SendMessageData): Promise<Message> {
      return repository.post<Message>(endpoints.messages(userId), data)
    },

    async markAsRead(userId: string, messageId: string): Promise<Message> {
      return repository.post<Message>(endpoints.messageRead(userId, messageId), {})
    },

    async deleteMessage(
      userId: string,
      messageId: string
    ): Promise<{ deleted: boolean; id: string }> {
      return repository.delete<{ deleted: boolean; id: string }>(
        endpoints.deleteMessage(userId, messageId)
      )
    },
  }
}
