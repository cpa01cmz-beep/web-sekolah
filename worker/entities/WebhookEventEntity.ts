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

  static async getPending(env: Env): Promise<WebhookEvent[]> {
    return this.getBySecondaryIndex(env, 'processed', 'false');
  }

  static async getByEventType(env: Env, eventType: string): Promise<WebhookEvent[]> {
    return this.getBySecondaryIndex(env, 'eventType', eventType);
  }
}
