import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { WebhookConfig } from "@shared/types";

export class WebhookConfigEntity extends IndexedEntity<WebhookConfig> {
  static readonly entityName = "webhookConfig";
  static readonly indexName = "webhookConfigs";
  static readonly initialState: WebhookConfig = {
    id: "",
    url: "",
    events: [],
    secret: "",
    active: false,
    createdAt: "",
    updatedAt: "",
    deletedAt: null
  };

  static async getActive(env: Env): Promise<WebhookConfig[]> {
    return this.getBySecondaryIndex(env, 'active', 'true');
  }

  static async getByEventType(env: Env, eventType: string): Promise<WebhookConfig[]> {
    const activeConfigs = await this.getActive(env);
    return activeConfigs.filter(c => c.events.includes(eventType));
  }
}
