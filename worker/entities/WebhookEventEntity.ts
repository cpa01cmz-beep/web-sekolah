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
}
