import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatDateShort,
  formatDateLong,
  formatTime,
  formatDistanceToNow,
} from '../date'

describe('formatDate utility', () => {
  describe('formatDate', () => {
    it('should format date as short format by default', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date)
      expect(result).toBe('1/15/2024')
    })

    it('should format string date as short format', () => {
      const result = formatDate('2024-01-15T10:30:00Z', 'short')
      expect(result).toBe('1/15/2024')
    })

    it('should format date as long format', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date, 'long')
      expect(result).toBe('January 15, 2024')
    })

    it('should format date as time format', () => {
      const date = new Date('2024-01-15T14:30:00Z')
      const result = formatDate(date, 'time')
      expect(result).toMatch(/\d+:\d+/)
    })

    it('should format date as month-year format', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date, 'month-year')
      expect(result).toBe('Jan 2024')
    })

    it('should format date as full-date format', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date, 'full-date')
      expect(result).toMatch(/January 15, 2024/)
    })

    it('should handle invalid date string', () => {
      const result = formatDate('invalid-date', 'short')
      expect(result).toBe('Invalid Date')
    })

    it('should handle invalid Date object', () => {
      const invalidDate = new Date('invalid')
      const result = formatDate(invalidDate, 'short')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDateShort(date)
      expect(result).toBe('1/15/2024')
    })
  })

  describe('formatDateLong', () => {
    it('should format date in long format', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDateLong(date)
      expect(result).toBe('January 15, 2024')
    })
  })

  describe('formatTime', () => {
    it('should format time from date', () => {
      const date = new Date('2024-01-15T14:30:00Z')
      const result = formatTime(date)
      expect(result).toMatch(/\d+:\d+/)
    })

    it('should format time from date string', () => {
      const result = formatTime('2024-01-15T09:15:00Z')
      expect(result).toMatch(/\d+:\d+/)
    })

    it('should handle invalid time', () => {
      const invalidDate = new Date('invalid')
      const result = formatTime(invalidDate)
      expect(result).toBe('Invalid Time')
    })
  })

  describe('formatDistanceToNow', () => {
    let mockNow: number

    beforeEach(() => {
      mockNow = new Date('2024-06-15T12:00:00Z').getTime()
      vi.useFakeTimers()
      vi.setSystemTime(mockNow)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "just now" for dates less than a minute ago', () => {
      const date = new Date('2024-06-15T11:59:30Z')
      expect(formatDistanceToNow(date)).toBe('just now')
    })

    it('should return "just now" for the current time', () => {
      const date = new Date(mockNow)
      expect(formatDistanceToNow(date)).toBe('just now')
    })

    it('should return minutes ago for dates within an hour', () => {
      const date = new Date('2024-06-15T11:30:00Z')
      expect(formatDistanceToNow(date)).toBe('30 minutes ago')
    })

    it('should return singular "minute ago" for 1 minute', () => {
      const date = new Date('2024-06-15T11:59:00Z')
      expect(formatDistanceToNow(date)).toBe('1 minute ago')
    })

    it('should return hours ago for dates within a day', () => {
      const date = new Date('2024-06-15T08:00:00Z')
      expect(formatDistanceToNow(date)).toBe('4 hours ago')
    })

    it('should return singular "hour ago" for 1 hour', () => {
      const date = new Date('2024-06-15T11:00:00Z')
      expect(formatDistanceToNow(date)).toBe('1 hour ago')
    })

    it('should return days ago for dates within a week', () => {
      const date = new Date('2024-06-13T12:00:00Z')
      expect(formatDistanceToNow(date)).toBe('2 days ago')
    })

    it('should return singular "day ago" for 1 day', () => {
      const date = new Date('2024-06-14T12:00:00Z')
      expect(formatDistanceToNow(date)).toBe('1 day ago')
    })

    it('should return weeks ago for dates within a month', () => {
      const date = new Date('2024-06-01T12:00:00Z')
      expect(formatDistanceToNow(date)).toBe('2 weeks ago')
    })

    it('should return singular "week ago" for 1 week', () => {
      const date = new Date('2024-06-08T12:00:00Z')
      expect(formatDistanceToNow(date)).toBe('1 week ago')
    })

    it('should return months ago for dates within a year', () => {
      const date = new Date('2024-03-15T12:00:00Z')
      expect(formatDistanceToNow(date)).toBe('3 months ago')
    })

    it('should return singular "month ago" for 1 month', () => {
      const date = new Date('2024-05-15T12:00:00Z')
      expect(formatDistanceToNow(date)).toBe('1 month ago')
    })

    it('should return years ago for dates over a year', () => {
      const date = new Date('2022-06-15T12:00:00Z')
      expect(formatDistanceToNow(date)).toBe('2 years ago')
    })

    it('should return singular "year ago" for 1 year', () => {
      const date = new Date('2023-06-15T12:00:00Z')
      expect(formatDistanceToNow(date)).toBe('1 year ago')
    })

    it('should accept string date', () => {
      const result = formatDistanceToNow('2024-06-15T11:30:00Z')
      expect(result).toBe('30 minutes ago')
    })

    it('should handle invalid date string', () => {
      const result = formatDistanceToNow('invalid-date')
      expect(result).toBe('Invalid Date')
    })

    it('should handle invalid Date object', () => {
      const invalidDate = new Date('invalid')
      const result = formatDistanceToNow(invalidDate)
      expect(result).toBe('Invalid Date')
    })
  })
})
