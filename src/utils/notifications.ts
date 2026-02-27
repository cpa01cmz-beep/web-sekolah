import type {
  Notification,
  NotificationGroup,
  NotificationSummary,
  NotificationType,
  NotificationPriority,
} from '@shared/notification.types'

export function groupNotificationsByType(notifications: Notification[]): NotificationGroup[] {
  const groups = new Map<NotificationType, Notification[]>()

  for (const notification of notifications) {
    const existing = groups.get(notification.type) || []
    existing.push(notification)
    groups.set(notification.type, existing)
  }

  return Array.from(groups.entries()).map(([type, items]) => ({
    type,
    count: items.length,
    unreadCount: items.filter(n => !n.isRead).length,
    notifications: items,
  }))
}

export function filterUnreadNotifications(notifications: Notification[]): Notification[] {
  return notifications.filter(n => !n.isRead)
}

export function filterNotificationsByType(
  notifications: Notification[],
  type: NotificationType
): Notification[] {
  return notifications.filter(n => n.type === type)
}

export function filterNotificationsByPriority(
  notifications: Notification[],
  priority: NotificationPriority
): Notification[] {
  return notifications.filter(n => n.priority === priority)
}

export function calculateNotificationSummary(notifications: Notification[]): NotificationSummary {
  const typeCounts: Record<NotificationType, number> = {
    announcement: 0,
    message: 0,
    grade: 0,
    event: 0,
    system: 0,
  }

  const priorityCounts: Record<NotificationPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  }

  let unread = 0

  for (const notification of notifications) {
    typeCounts[notification.type]++
    priorityCounts[notification.priority]++
    if (!notification.isRead) unread++
  }

  return {
    total: notifications.length,
    unread,
    byType: typeCounts,
    byPriority: priorityCounts,
  }
}

export function sortNotificationsByDate(
  notifications: Notification[],
  order: 'asc' | 'desc' = 'desc'
): Notification[] {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

export function sortNotificationsByPriority(notifications: Notification[]): Notification[] {
  const priorityOrder: Record<NotificationPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return [...notifications].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

export function getRecentNotifications(
  notifications: Notification[],
  limit: number = 10
): Notification[] {
  return sortNotificationsByDate(notifications).slice(0, limit)
}

export function countUnreadByType(notifications: Notification[]): Record<NotificationType, number> {
  const counts: Record<NotificationType, number> = {
    announcement: 0,
    message: 0,
    grade: 0,
    event: 0,
    system: 0,
  }

  for (const notification of notifications) {
    if (!notification.isRead) {
      counts[notification.type]++
    }
  }

  return counts
}

export function hasUrgentNotifications(notifications: Notification[]): boolean {
  return notifications.some(n => n.priority === 'urgent' && !n.isRead)
}

export function getNotificationsRequiringAction(notifications: Notification[]): Notification[] {
  return notifications.filter(n => n.actionUrl && !n.isRead)
}
