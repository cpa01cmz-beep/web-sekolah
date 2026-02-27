import { describe, it, expect } from 'vitest'
import type { Notification } from '@shared/notification.types'
import {
  groupNotificationsByType,
  filterUnreadNotifications,
  filterNotificationsByType,
  filterNotificationsByPriority,
  calculateNotificationSummary,
  sortNotificationsByDate,
  sortNotificationsByPriority,
  getRecentNotifications,
  countUnreadByType,
  hasUrgentNotifications,
  getNotificationsRequiringAction,
} from '../notifications'

const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: '1',
  userId: 'user-1',
  type: 'system',
  title: 'Test',
  message: 'Test message',
  isRead: false,
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('Notification Utilities', () => {
  describe('groupNotificationsByType', () => {
    it('groups notifications by type', () => {
      const notifications = [
        createMockNotification({ id: '1', type: 'announcement' }),
        createMockNotification({ id: '2', type: 'announcement' }),
        createMockNotification({ id: '3', type: 'message' }),
      ]

      const groups = groupNotificationsByType(notifications)

      expect(groups).toHaveLength(2)
      expect(groups.find(g => g.type === 'announcement')?.count).toBe(2)
      expect(groups.find(g => g.type === 'message')?.count).toBe(1)
    })

    it('calculates unread count for each group', () => {
      const notifications = [
        createMockNotification({ id: '1', type: 'announcement', isRead: true }),
        createMockNotification({ id: '2', type: 'announcement', isRead: false }),
        createMockNotification({ id: '3', type: 'announcement', isRead: false }),
      ]

      const groups = groupNotificationsByType(notifications)
      const announcementGroup = groups.find(g => g.type === 'announcement')

      expect(announcementGroup?.unreadCount).toBe(2)
    })

    it('returns empty array for no notifications', () => {
      expect(groupNotificationsByType([])).toEqual([])
    })
  })

  describe('filterUnreadNotifications', () => {
    it('filters to only unread notifications', () => {
      const notifications = [
        createMockNotification({ id: '1', isRead: true }),
        createMockNotification({ id: '2', isRead: false }),
        createMockNotification({ id: '3', isRead: false }),
      ]

      const unread = filterUnreadNotifications(notifications)

      expect(unread).toHaveLength(2)
      expect(unread.every(n => !n.isRead)).toBe(true)
    })

    it('returns empty array when all read', () => {
      const notifications = [
        createMockNotification({ isRead: true }),
        createMockNotification({ isRead: true }),
      ]

      expect(filterUnreadNotifications(notifications)).toEqual([])
    })
  })

  describe('filterNotificationsByType', () => {
    it('filters by type', () => {
      const notifications = [
        createMockNotification({ id: '1', type: 'grade' }),
        createMockNotification({ id: '2', type: 'message' }),
        createMockNotification({ id: '3', type: 'grade' }),
      ]

      const grades = filterNotificationsByType(notifications, 'grade')

      expect(grades).toHaveLength(2)
      expect(grades.every(n => n.type === 'grade')).toBe(true)
    })
  })

  describe('filterNotificationsByPriority', () => {
    it('filters by priority', () => {
      const notifications = [
        createMockNotification({ id: '1', priority: 'urgent' }),
        createMockNotification({ id: '2', priority: 'low' }),
        createMockNotification({ id: '3', priority: 'urgent' }),
      ]

      const urgent = filterNotificationsByPriority(notifications, 'urgent')

      expect(urgent).toHaveLength(2)
      expect(urgent.every(n => n.priority === 'urgent')).toBe(true)
    })
  })

  describe('calculateNotificationSummary', () => {
    it('calculates summary correctly', () => {
      const notifications = [
        createMockNotification({ id: '1', type: 'grade', priority: 'high', isRead: false }),
        createMockNotification({ id: '2', type: 'grade', priority: 'low', isRead: true }),
        createMockNotification({ id: '3', type: 'message', priority: 'medium', isRead: false }),
        createMockNotification({
          id: '4',
          type: 'announcement',
          priority: 'urgent',
          isRead: false,
        }),
      ]

      const summary = calculateNotificationSummary(notifications)

      expect(summary.total).toBe(4)
      expect(summary.unread).toBe(3)
      expect(summary.byType.grade).toBe(2)
      expect(summary.byType.message).toBe(1)
      expect(summary.byPriority.high).toBe(1)
      expect(summary.byPriority.urgent).toBe(1)
    })

    it('returns zero counts for empty array', () => {
      const summary = calculateNotificationSummary([])

      expect(summary.total).toBe(0)
      expect(summary.unread).toBe(0)
      expect(summary.byType.grade).toBe(0)
      expect(summary.byPriority.high).toBe(0)
    })
  })

  describe('sortNotificationsByDate', () => {
    it('sorts by date descending by default', () => {
      const notifications = [
        createMockNotification({ id: '1', createdAt: '2026-01-01T00:00:00Z' }),
        createMockNotification({ id: '2', createdAt: '2026-01-03T00:00:00Z' }),
        createMockNotification({ id: '3', createdAt: '2026-01-02T00:00:00Z' }),
      ]

      const sorted = sortNotificationsByDate(notifications)

      expect(sorted[0].id).toBe('2')
      expect(sorted[1].id).toBe('3')
      expect(sorted[2].id).toBe('1')
    })

    it('sorts by date ascending when specified', () => {
      const notifications = [
        createMockNotification({ id: '1', createdAt: '2026-01-03T00:00:00Z' }),
        createMockNotification({ id: '2', createdAt: '2026-01-01T00:00:00Z' }),
      ]

      const sorted = sortNotificationsByDate(notifications, 'asc')

      expect(sorted[0].id).toBe('2')
      expect(sorted[1].id).toBe('1')
    })
  })

  describe('sortNotificationsByPriority', () => {
    it('sorts by priority (urgent first)', () => {
      const notifications = [
        createMockNotification({ id: '1', priority: 'low' }),
        createMockNotification({ id: '2', priority: 'urgent' }),
        createMockNotification({ id: '3', priority: 'high' }),
        createMockNotification({ id: '4', priority: 'medium' }),
      ]

      const sorted = sortNotificationsByPriority(notifications)

      expect(sorted[0].priority).toBe('urgent')
      expect(sorted[1].priority).toBe('high')
      expect(sorted[2].priority).toBe('medium')
      expect(sorted[3].priority).toBe('low')
    })
  })

  describe('getRecentNotifications', () => {
    it('returns most recent notifications up to limit', () => {
      const notifications = [
        createMockNotification({ id: '1', createdAt: '2026-01-01T00:00:00Z' }),
        createMockNotification({ id: '2', createdAt: '2026-01-05T00:00:00Z' }),
        createMockNotification({ id: '3', createdAt: '2026-01-03T00:00:00Z' }),
        createMockNotification({ id: '4', createdAt: '2026-01-04T00:00:00Z' }),
      ]

      const recent = getRecentNotifications(notifications, 2)

      expect(recent).toHaveLength(2)
      expect(recent[0].id).toBe('2')
      expect(recent[1].id).toBe('4')
    })

    it('uses default limit of 10', () => {
      const notifications = Array.from({ length: 15 }, (_, i) =>
        createMockNotification({
          id: String(i),
          createdAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
        })
      )

      const recent = getRecentNotifications(notifications)

      expect(recent).toHaveLength(10)
    })
  })

  describe('countUnreadByType', () => {
    it('counts unread by type', () => {
      const notifications = [
        createMockNotification({ id: '1', type: 'grade', isRead: false }),
        createMockNotification({ id: '2', type: 'grade', isRead: true }),
        createMockNotification({ id: '3', type: 'grade', isRead: false }),
        createMockNotification({ id: '4', type: 'message', isRead: false }),
      ]

      const counts = countUnreadByType(notifications)

      expect(counts.grade).toBe(2)
      expect(counts.message).toBe(1)
      expect(counts.announcement).toBe(0)
    })
  })

  describe('hasUrgentNotifications', () => {
    it('returns true when unread urgent notification exists', () => {
      const notifications = [
        createMockNotification({ priority: 'high', isRead: false }),
        createMockNotification({ priority: 'urgent', isRead: false }),
      ]

      expect(hasUrgentNotifications(notifications)).toBe(true)
    })

    it('returns false when urgent notification is read', () => {
      const notifications = [createMockNotification({ priority: 'urgent', isRead: true })]

      expect(hasUrgentNotifications(notifications)).toBe(false)
    })

    it('returns false when no urgent notifications', () => {
      const notifications = [createMockNotification({ priority: 'high', isRead: false })]

      expect(hasUrgentNotifications(notifications)).toBe(false)
    })
  })

  describe('getNotificationsRequiringAction', () => {
    it('returns unread notifications with action URLs', () => {
      const notifications = [
        createMockNotification({ id: '1', actionUrl: '/action/1', isRead: false }),
        createMockNotification({ id: '2', actionUrl: '/action/2', isRead: true }),
        createMockNotification({ id: '3', isRead: false }),
      ]

      const actionRequired = getNotificationsRequiringAction(notifications)

      expect(actionRequired).toHaveLength(1)
      expect(actionRequired[0].id).toBe('1')
    })

    it('returns empty array when no action required', () => {
      const notifications = [
        createMockNotification({ actionUrl: null, isRead: false }),
        createMockNotification({ actionUrl: '/action', isRead: true }),
      ]

      expect(getNotificationsRequiringAction(notifications)).toEqual([])
    })
  })
})
