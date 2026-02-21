import { IndexedEntity, type Env } from '../core-utils';
import type { DeadLetterQueueWebhook } from '@shared/types';

export class DeadLetterQueueWebhookEntity extends IndexedEntity<DeadLetterQueueWebhook> {
  static readonly entityName = 'deadLetterQueueWebhook';
  static readonly indexName = 'deadLetterQueueWebhooks';
  static readonly initialState: DeadLetterQueueWebhook = {
    id: '',
    eventId: '',
    webhookConfigId: '',
    eventType: '',
    url: '',
    payload: {},
    status: 0,
    attempts: 0,
    errorMessage: '',
    failedAt: '',
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };

  static readonly secondaryIndexes = [
    {
      fieldName: 'webhookConfigId',
      getValue: (state: { id: string }) => (state as DeadLetterQueueWebhook).webhookConfigId,
    },
    {
      fieldName: 'eventType',
      getValue: (state: { id: string }) => (state as DeadLetterQueueWebhook).eventType,
    },
  ];

  static async getAllFailed(env: Env): Promise<DeadLetterQueueWebhook[]> {
    const result = await this.list(env);
    return result.items;
  }

  static async getByWebhookConfigId(
    env: Env,
    webhookConfigId: string
  ): Promise<DeadLetterQueueWebhook[]> {
    return this.getBySecondaryIndex(env, 'webhookConfigId', webhookConfigId);
  }

  static async getByEventType(env: Env, eventType: string): Promise<DeadLetterQueueWebhook[]> {
    return this.getBySecondaryIndex(env, 'eventType', eventType);
  }
}
