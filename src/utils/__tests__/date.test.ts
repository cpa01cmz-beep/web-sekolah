import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, formatDateLong, formatTime } from '../date';

describe('formatDate utility', () => {
  describe('formatDate', () => {
    it('should format date as short format by default', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('1/15/2024');
    });

    it('should format string date as short format', () => {
      const result = formatDate('2024-01-15T10:30:00Z', 'short');
      expect(result).toBe('1/15/2024');
    });

    it('should format date as long format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'long');
      expect(result).toBe('January 15, 2024');
    });

    it('should format date as time format', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const result = formatDate(date, 'time');
      expect(result).toMatch(/\d+:\d+/);
    });

    it('should format date as month-year format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'month-year');
      expect(result).toBe('Jan 2024');
    });

    it('should format date as full-date format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'full-date');
      expect(result).toMatch(/January 15, 2024/);
    });

    it('should handle invalid date string', () => {
      const result = formatDate('invalid-date', 'short');
      expect(result).toBe('Invalid Date');
    });

    it('should handle invalid Date object', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate, 'short');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateShort(date);
      expect(result).toBe('1/15/2024');
    });
  });

  describe('formatDateLong', () => {
    it('should format date in long format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateLong(date);
      expect(result).toBe('January 15, 2024');
    });
  });

  describe('formatTime', () => {
    it('should format time from date', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const result = formatTime(date);
      expect(result).toMatch(/\d+:\d+/);
    });

    it('should format time from date string', () => {
      const result = formatTime('2024-01-15T09:15:00Z');
      expect(result).toMatch(/\d+:\d+/);
    });

    it('should handle invalid time', () => {
      const invalidDate = new Date('invalid');
      const result = formatTime(invalidDate);
      expect(result).toBe('Invalid Time');
    });
  });
});
