import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { WebhookEvent } from "@shared/types";

export class WebhookEventEntity extends IndexedEntity<WebhookEvent> {
  static readonly entityName = "webhookEvent";
  static readonly indexName = "webhookEvents";
  static readonly initialState: WebhookEvent = {
    id: "",
    eventType: "",
    data: {},
    processed: false,
    createdAt: "",
    updatedAt: "",
    deletedAt: null
  };

  static readonly secondaryIndexes = [
    { fieldName: 'processed', getValue: (state: { id: string; }) => String((state as WebhookEvent).processed) },
    { fieldName: 'eventType', getValue: (state: { id: string; }) => (state as WebhookEvent).eventType }
  ];

  static async getPending(env: Env): Promise<WebhookEvent[]> {
    return this.getBySecondaryIndex(env, 'processed', 'false');
  }

  static async getByEventType(env: Env, eventType: string): Promise<WebhookEvent[]> {
    return this.getBySecondaryIndex(env, 'eventType', eventType);
  }

  static async countPending(env: Env): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'processed');
    return await index.countByValue('false');
  }

  static async existsPending(env: Env): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'processed', 'false');
  }

  static async countByEventType(env: Env, eventType: string): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'eventType');
    return await index.countByValue(eventType);
  }

  static async existsByEventType(env: Env, eventType: string): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'eventType', eventType);
  }
}
