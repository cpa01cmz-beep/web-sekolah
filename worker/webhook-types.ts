import type { Grade, Announcement, SchoolUser, Message } from '@shared/types'

export type GradeCreatedPayload = Grade
export type GradeUpdatedPayload = Grade
export type GradeDeletedPayload = { id: string; studentId: string; courseId: string }
export type UserCreatedPayload = SchoolUser
export type UserUpdatedPayload = SchoolUser
export type UserDeletedPayload = { id: string; role: string }
export type UserLoginPayload = {
  userId: string
  email: string
  role: string
  loginMethod: 'password'
  loginAt: string
}
export type AnnouncementCreatedPayload = Announcement
export type AnnouncementUpdatedPayload = Announcement
export type AnnouncementDeletedPayload = { id: string; title: string; authorId: string }
export type MessageCreatedPayload = Message
export type MessageReadPayload = { id: string; readAt: string; readBy: string }

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
  | MessageReadPayload

export function toWebhookPayload<T extends WebhookEventPayload>(
  payload: T
): Record<string, unknown> {
  return payload as unknown as Record<string, unknown>
}
