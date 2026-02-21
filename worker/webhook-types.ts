import type { Grade, Announcement, SchoolUser, Message } from '@shared/types';

export type GradeCreatedPayload = Grade;
export type GradeUpdatedPayload = Grade;
export type GradeDeletedPayload = {
  id: string;
  studentId: string;
  courseId: string;
  deletedAt: string;
};
export type UserCreatedPayload = SchoolUser;
export type UserUpdatedPayload = SchoolUser;
export type UserDeletedPayload = { id: string; role: string };
export type UserLoginPayload = {
  userId: string;
  email: string;
  role: string;
  loginMethod: 'password';
  loginAt: string;
};
export type AnnouncementCreatedPayload = Announcement;
export type AnnouncementUpdatedPayload = Announcement;
export type AnnouncementDeletedPayload = { id: string; deletedAt: string };
export type MessageCreatedPayload = Message;
export type MessageReadPayload = { id: string; readAt: string; readBy: string };

export type WebhookEventPayload =
  | GradeCreatedPayload
  | GradeUpdatedPayload
  | GradeDeletedPayload
  | UserCreatedPayload
  | UserUpdatedPayload
  | UserDeletedPayload
  | UserLoginPayload
  | AnnouncementCreatedPayload
  | AnnouncementUpdatedPayload
  | AnnouncementDeletedPayload
  | MessageCreatedPayload
  | MessageReadPayload;

/**
 * Converts a typed webhook payload to Record<string, unknown> for storage.
 *
 * This conversion is necessary because WebhookEvent.data is typed as Record<string, unknown>
 * for JSON serialization compatibility, but strongly-typed payloads don't have index signatures.
 *
 * @param payload - The strongly-typed webhook payload
 * @returns The payload as Record<string, unknown> for storage
 */
export function toWebhookPayload<T extends WebhookEventPayload>(
  payload: T
): Record<string, unknown> {
  return payload as unknown as Record<string, unknown>;
}
