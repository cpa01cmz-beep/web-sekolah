import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { Message, UserRole } from "@shared/types";

export class MessageEntity extends IndexedEntity<Message> {
  static readonly entityName = "message";
  static readonly indexName = "messages";
  static readonly initialState: Message = { 
    id: "", 
    senderId: "", 
    senderRole: 'teacher', 
    recipientId: "", 
    recipientRole: 'parent', 
    subject: "", 
    content: "", 
    isRead: false, 
    parentMessageId: null,
    createdAt: '', 
    updatedAt: '', 
    deletedAt: null 
  };
  static seedData: Message[] = [];

  static readonly secondaryIndexes = [
    { fieldName: 'senderId', getValue: (state: { id: string; }) => (state as Message).senderId },
    { fieldName: 'recipientId', getValue: (state: { id: string; }) => (state as Message).recipientId },
    { fieldName: 'parentMessageId', getValue: (state: { id: string; }) => (state as Message).parentMessageId || '' }
  ];

  static async getBySenderId(env: Env, senderId: string): Promise<Message[]> {
    return this.getBySecondaryIndex(env, 'senderId', senderId);
  }

  static async getByRecipientId(env: Env, recipientId: string): Promise<Message[]> {
    return this.getBySecondaryIndex(env, 'recipientId', recipientId);
  }

  static async getConversation(env: Env, userId1: string, userId2: string): Promise<Message[]> {
    const sent = await this.getBySenderId(env, userId1);
    const received = await this.getByRecipientId(env, userId1);
    
    const conversation = [...sent, ...received].filter(msg => 
      (msg.senderId === userId1 && msg.recipientId === userId2) ||
      (msg.senderId === userId2 && msg.recipientId === userId1)
    );
    
    return conversation.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  static async getThread(env: Env, parentMessageId: string): Promise<Message[]> {
    const parent = await this.get(env, parentMessageId);
    if (!parent) return [];
    
    const replies = await this.getBySecondaryIndex(env, 'parentMessageId', parentMessageId);
    return [parent, ...replies].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  static async markAsRead(env: Env, messageId: string): Promise<Message | null> {
    const message = await this.get(env, messageId);
    if (!message) return null;
    
    return this.update(env, messageId, { isRead: true });
  }

  static async countUnread(env: Env, recipientId: string): Promise<number> {
    const messages = await this.getByRecipientId(env, recipientId);
    return messages.filter(msg => !msg.isRead && !msg.deletedAt).length;
  }
}
