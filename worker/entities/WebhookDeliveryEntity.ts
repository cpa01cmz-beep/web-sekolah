import { IndexedEntity, SecondaryIndex, type Env } from '../core-utils';
import type { WebhookDelivery } from '@shared/types';
import { DateSortedSecondaryIndex } from '../storage/DateSortedSecondaryIndex';

export class WebhookDeliveryEntity extends IndexedEntity<WebhookDelivery> {
  static readonly entityName = 'webhookDelivery';
  static readonly indexName = 'webhookDeliveries';
  static readonly initialState: WebhookDelivery = {
    id: '',
    eventId: '',
    webhookConfigId: '',
    status: 'pending',
    attempts: 0,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    idempotencyKey: undefined,
  };

  static readonly secondaryIndexes = [
    {
      fieldName: 'eventId',
      getValue: (state: { id: string }) => (state as WebhookDelivery).eventId,
    },
    {
      fieldName: 'webhookConfigId',
      getValue: (state: { id: string }) => (state as WebhookDelivery).webhookConfigId,
    },
    { fieldName: 'status', getValue: (state: { id: string }) => (state as WebhookDelivery).status },
    {
      fieldName: 'idempotencyKey',
      getValue: (state: { id: string }) => (state as WebhookDelivery).idempotencyKey || '',
    },
  ];

  static async getPendingRetries(env: Env): Promise<WebhookDelivery[]> {
    const pendingDeliveries = await this.getBySecondaryIndex(env, 'status', 'pending');
    const now = new Date().toISOString();
    return pendingDeliveries.filter((d) => d.nextAttemptAt && d.nextAttemptAt <= now);
  }

  static async getByIdempotencyKey(
    env: Env,
    idempotencyKey: string
  ): Promise<WebhookDelivery | null> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'idempotencyKey');
    const deliveryIds = await index.getByValue(idempotencyKey);
    if (deliveryIds.length === 0) return null;
    const deliveries = await Promise.all(deliveryIds.map((id) => new this(env, id).getState()));
    const validDelivery = deliveries.find((d) => d && !d.deletedAt);
    return validDelivery || null;
  }

  static async getByEventId(env: Env, eventId: string): Promise<WebhookDelivery[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'eventId');
    const deliveryIds = await index.getByValue(eventId);
    const deliveries = await Promise.all(deliveryIds.map((id) => new this(env, id).getState()));
    return deliveries.filter((d) => d && !d.deletedAt) as WebhookDelivery[];
  }

  static async getByWebhookConfigId(env: Env, webhookConfigId: string): Promise<WebhookDelivery[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'webhookConfigId');
    const deliveryIds = await index.getByValue(webhookConfigId);
    const deliveries = await Promise.all(deliveryIds.map((id) => new this(env, id).getState()));
    return deliveries.filter((d) => d && !d.deletedAt) as WebhookDelivery[];
  }

  static async getRecentDeliveries(env: Env, limit: number = 10): Promise<WebhookDelivery[]> {
    const index = new DateSortedSecondaryIndex(env, this.entityName);
    const recentIds = await index.getRecent(limit);
    if (recentIds.length === 0) {
      return [];
    }
    const deliveries = await Promise.all(recentIds.map((id) => new this(env, id).getState()));
    return deliveries.filter((d) => d && !d.deletedAt) as WebhookDelivery[];
  }

  static async createWithDateIndex(env: Env, state: WebhookDelivery): Promise<WebhookDelivery> {
    const created = await super.create(env, state);
    const dateIndex = new DateSortedSecondaryIndex(env, this.entityName);
    await dateIndex.add(state.createdAt, state.id);
    return created as WebhookDelivery;
  }

  static async deleteWithDateIndex(env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const state = (await inst.getState()) as WebhookDelivery | null;
    if (!state) return false;

    const dateIndex = new DateSortedSecondaryIndex(env, this.entityName);
    await dateIndex.remove(state.createdAt, id);
    return await super.delete(env, id);
  }
}
