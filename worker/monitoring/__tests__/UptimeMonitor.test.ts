import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UptimeMonitor } from '../UptimeMonitor';

describe('UptimeMonitor', () => {
  let monitor: UptimeMonitor;

  beforeEach(() => {
    monitor = new UptimeMonitor();
  });

  describe('getUptime()', () => {
    it('should return uptime greater than or equal to zero', () => {
      const uptime = monitor.getUptime();

      expect(uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return uptime less than 100ms for newly initialized monitor', () => {
      const uptime = monitor.getUptime();

      expect(uptime).toBeLessThan(100);
    });

    it('should increase uptime over time', () => {
      vi.useFakeTimers();
      const initialUptime = monitor.getUptime();
      vi.advanceTimersByTime(100);
      const laterUptime = monitor.getUptime();
      vi.useRealTimers();

      expect(laterUptime).toBeGreaterThan(initialUptime);
      expect(laterUptime - initialUptime).toBeGreaterThanOrEqual(100);
    });

    it('should return consistent uptime for same time', () => {
      vi.useFakeTimers();
      const uptime1 = monitor.getUptime();
      const uptime2 = monitor.getUptime();
      vi.useRealTimers();

      expect(uptime1).toBe(uptime2);
    });
  });

  describe('reset()', () => {
    it('should reset uptime to near zero', () => {
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);
      const beforeReset = monitor.getUptime();
      monitor.reset();
      vi.advanceTimersByTime(10);
      const afterReset = monitor.getUptime();
      vi.useRealTimers();

      expect(beforeReset).toBeGreaterThanOrEqual(100);
      expect(afterReset).toBeLessThan(20);
    });

    it('should restart uptime tracking from zero', () => {
      vi.useFakeTimers();
      vi.advanceTimersByTime(50);
      monitor.reset();
      vi.advanceTimersByTime(30);
      const uptime = monitor.getUptime();
      vi.useRealTimers();

      expect(uptime).toBeGreaterThanOrEqual(30);
      expect(uptime).toBeLessThan(40);
    });

    it('should handle multiple resets correctly', () => {
      vi.useFakeTimers();
      
      monitor.reset();
      vi.advanceTimersByTime(10);
      const uptime1 = monitor.getUptime();
      
      monitor.reset();
      vi.advanceTimersByTime(20);
      const uptime2 = monitor.getUptime();
      
      monitor.reset();
      vi.advanceTimersByTime(30);
      const uptime3 = monitor.getUptime();
      
      vi.useRealTimers();

      expect(uptime1).toBeGreaterThanOrEqual(10);
      expect(uptime1).toBeLessThan(15);
      expect(uptime2).toBeGreaterThanOrEqual(20);
      expect(uptime2).toBeLessThan(25);
      expect(uptime3).toBeGreaterThanOrEqual(30);
      expect(uptime3).toBeLessThan(35);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero elapsed time', () => {
      vi.useFakeTimers();
      const freshMonitor = new UptimeMonitor();
      const uptime = freshMonitor.getUptime();
      vi.useRealTimers();

      expect(uptime).toBe(0);
    });

    it('should handle long uptime periods', () => {
      vi.useFakeTimers();
      const freshMonitor = new UptimeMonitor();
      vi.advanceTimersByTime(999999);
      const uptime = freshMonitor.getUptime();
      vi.useRealTimers();

      expect(uptime).toBeGreaterThanOrEqual(999999);
    });
  });
});
