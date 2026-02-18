import type { TimestampedEntity } from './common-types';

export interface WebhookConfig extends TimestampedEntity {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

export interface WebhookEvent extends TimestampedEntity {
  id: string;
  eventType: string;
  data: Record<string, unknown>;
  processed: boolean;
}

export interface WebhookDelivery extends TimestampedEntity {
  id: string;
  eventId: string;
  webhookConfigId: string;
  status: 'pending' | 'delivered' | 'failed';
  statusCode?: number;
  attempts: number;
  nextAttemptAt?: string;
  errorMessage?: string;
  idempotencyKey?: string;
}

export interface DeadLetterQueueWebhook extends TimestampedEntity {
  id: string;
  eventId: string;
  webhookConfigId: string;
  eventType: string;
  url: string;
  payload: Record<string, unknown>;
  status: number;
  attempts: number;
  errorMessage: string;
  failedAt: string;
}

export type WebhookEventType =
  | 'grade.created'
  | 'grade.updated'
  | 'grade.deleted'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.login'
  | 'announcement.created'
  | 'announcement.updated'
  | 'announcement.deleted';
