import { IndexedEntity, SecondaryIndex, CompoundSecondaryIndex, type Env } from "../core-utils";
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
    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['recipientId', 'isRead']);
    return await compoundIndex.countByValues([recipientId, 'false']);
  }

  static async getUnreadByRecipient(env: Env, recipientId: string): Promise<Message[]> {
    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['recipientId', 'isRead']);
    const messageIds = await compoundIndex.getByValues([recipientId, 'false']);
    if (messageIds.length === 0) {
      return [];
    }
    const messages = await Promise.all(messageIds.map(id => new this(env, id).getState()));
    return messages.filter(m => m && !m.deletedAt) as Message[];
  }

  static async createWithCompoundIndex(env: Env, state: Message): Promise<Message> {
    const created = await super.create(env, state);
    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['recipientId', 'isRead']);
    await compoundIndex.add([state.recipientId, state.isRead.toString()], state.id);
    return created;
  }

  static async deleteWithCompoundIndex(env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const state = await inst.getState() as Message | null;
    if (!state) return false;

    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['recipientId', 'isRead']);
    await compoundIndex.remove([state.recipientId, state.isRead.toString()], id);
    return await super.delete(env, id);
  }

  static async updateWithCompoundIndex(env: Env, id: string, updates: Partial<Message>): Promise<Message | null> {
    const inst = new this(env, id);
    const currentState = await inst.getState() as Message | null;
    if (!currentState || currentState.deletedAt) return null;

    if (updates.isRead !== undefined && updates.isRead !== currentState.isRead) {
      const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['recipientId', 'isRead']);
      await compoundIndex.remove([currentState.recipientId, currentState.isRead.toString()], id);
      await compoundIndex.add([currentState.recipientId, updates.isRead.toString()], id);
    }

    return await super.update(env, id, updates);
  }
}
