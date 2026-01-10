import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { WebhookDelivery } from "@shared/types";

export class WebhookDeliveryEntity extends IndexedEntity<WebhookDelivery> {
  static readonly entityName = "webhookDelivery";
  static readonly indexName = "webhookDeliveries";
  static readonly initialState: WebhookDelivery = {
    id: "",
    eventId: "",
    webhookConfigId: "",
    status: "pending",
    attempts: 0,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    idempotencyKey: undefined
  };

  static async getPendingRetries(env: Env): Promise<WebhookDelivery[]> {
    const pendingDeliveries = await this.getBySecondaryIndex(env, 'status', 'pending');
    const now = new Date().toISOString();
    return pendingDeliveries.filter(
      d => d.nextAttemptAt && d.nextAttemptAt <= now
    );
  }

  static async getByIdempotencyKey(env: Env, idempotencyKey: string): Promise<WebhookDelivery | null> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'idempotencyKey');
    const deliveryIds = await index.getByValue(idempotencyKey);
    if (deliveryIds.length === 0) return null;
    const deliveries = await Promise.all(deliveryIds.map(id => new this(env, id).getState()));
    const validDelivery = deliveries.find(d => d && !d.deletedAt);
    return validDelivery || null;
  }

  static async getByEventId(env: Env, eventId: string): Promise<WebhookDelivery[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'eventId');
    const deliveryIds = await index.getByValue(eventId);
    const deliveries = await Promise.all(deliveryIds.map(id => new this(env, id).getState()));
    return deliveries.filter(d => d && !d.deletedAt) as WebhookDelivery[];
  }

  static async getByWebhookConfigId(env: Env, webhookConfigId: string): Promise<WebhookDelivery[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'webhookConfigId');
    const deliveryIds = await index.getByValue(webhookConfigId);
    const deliveries = await Promise.all(deliveryIds.map(id => new this(env, id).getState()));
    return deliveries.filter(d => d && !d.deletedAt) as WebhookDelivery[];
  }
}
