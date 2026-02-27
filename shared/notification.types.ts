import type { TimestampedEntity } from './common-types'

export type NotificationType = 'announcement' | 'message' | 'grade' | 'event' | 'system'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Notification extends TimestampedEntity {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  priority: NotificationPriority
  actionUrl?: string | null
  metadata?: Record<string, unknown> | null
}

export interface NotificationGroup {
  type: NotificationType
  count: number
  unreadCount: number
  notifications: Notification[]
}

export interface NotificationSummary {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}
