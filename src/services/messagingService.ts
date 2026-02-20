import type { IRepository } from '@/repositories/IRepository';
import type { Message } from '@shared/types';
import type { SendMessageData } from './serviceContracts';

export interface MessagingService {
  getMessages(type?: 'inbox' | 'sent'): Promise<Message[]>;
  getUnreadCount(): Promise<number>;
  getConversation(otherUserId: string): Promise<Message[]>;
  sendMessage(data: SendMessageData): Promise<Message>;
  markAsRead(messageId: string): Promise<Message>;
}

export function createMessagingService(
  repository: IRepository,
  messagesEndpoint: string
): MessagingService {
  return {
    async getMessages(type: 'inbox' | 'sent' = 'inbox'): Promise<Message[]> {
      return repository.get<Message[]>(`${messagesEndpoint}?type=${type}`);
    },

    async getUnreadCount(): Promise<number> {
      const result = await repository.get<{ count: number }>(`${messagesEndpoint}/unread-count`);
      return result.count;
    },

    async getConversation(otherUserId: string): Promise<Message[]> {
      return repository.get<Message[]>(`${messagesEndpoint}/${otherUserId}/conversation`);
    },

    async sendMessage(data: SendMessageData): Promise<Message> {
      return repository.post<Message>(messagesEndpoint, data);
    },

    async markAsRead(messageId: string): Promise<Message> {
      return repository.post<Message>(`${messagesEndpoint}/${messageId}/read`, {});
    }
  };
}
