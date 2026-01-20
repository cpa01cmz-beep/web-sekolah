import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { DeadLetterQueueWebhook } from "@shared/types";

export class DeadLetterQueueWebhookEntity extends IndexedEntity<DeadLetterQueueWebhook> {
  static readonly entityName = "deadLetterQueueWebhook";
  static readonly indexName = "deadLetterQueueWebhooks";
  static readonly initialState: DeadLetterQueueWebhook = {
    id: "",
    eventId: "",
    webhookConfigId: "",
    eventType: "",
    url: "",
    payload: {},
    status: 0,
    attempts: 0,
    errorMessage: "",
    failedAt: "",
    createdAt: "",
    updatedAt: "",
    deletedAt: null
  };

  static readonly secondaryIndexes = [
    { fieldName: 'webhookConfigId', getValue: (state: { id: string; }) => (state as DeadLetterQueueWebhook).webhookConfigId },
    { fieldName: 'eventType', getValue: (state: { id: string; }) => (state as DeadLetterQueueWebhook).eventType }
  ];

  static async getAllFailed(env: Env): Promise<DeadLetterQueueWebhook[]> {
    const result = await this.list(env);
    return result.items;
  }

  static async getByWebhookConfigId(env: Env, webhookConfigId: string): Promise<DeadLetterQueueWebhook[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'webhookConfigId');
    const dlqIds = await index.getByValue(webhookConfigId);
    const dlqItems = await Promise.all(dlqIds.map(id => new this(env, id).getState()));
    return dlqItems.filter(d => d && !d.deletedAt) as DeadLetterQueueWebhook[];
  }

  static async getByEventType(env: Env, eventType: string): Promise<DeadLetterQueueWebhook[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'eventType');
    const dlqIds = await index.getByValue(eventType);
    const dlqItems = await Promise.all(dlqIds.map(id => new this(env, id).getState()));
    return dlqItems.filter(d => d && !d.deletedAt) as DeadLetterQueueWebhook[];
  }
}
