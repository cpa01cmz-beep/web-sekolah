import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UptimeMonitor } from '../UptimeMonitor';

describe('UptimeMonitor', () => {
  describe('constructor', () => {
    it('should initialize with current timestamp', () => {
      vi.useFakeTimers().setSystemTime(1705730400000);
      const newMonitor = new UptimeMonitor();
      const uptime = newMonitor.getUptime();
      vi.useRealTimers();

      expect(uptime).toBe(0);
    });
  });

  describe('getUptime()', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(1705730400000);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return zero uptime immediately after construction', () => {
      const uptime = new UptimeMonitor().getUptime();
      expect(uptime).toBe(0);
    });

    it('should return uptime elapsed since construction', () => {
      const monitor = new UptimeMonitor();
      vi.advanceTimersByTime(10000);
      const uptime = monitor.getUptime();
      expect(uptime).toBe(10000);
    });

    it('should return uptime in milliseconds', () => {
      const monitor = new UptimeMonitor();
      vi.advanceTimersByTime(5000);
      const uptime = monitor.getUptime();
      expect(uptime).toBe(5000);
    });

    it('should handle time advances', () => {
      const monitor = new UptimeMonitor();
      vi.advanceTimersByTime(10000);
      let uptime = monitor.getUptime();
      expect(uptime).toBe(10000);

      vi.advanceTimersByTime(2000);
      uptime = monitor.getUptime();
      expect(uptime).toBe(12000);

      vi.advanceTimersByTime(5000);
      uptime = monitor.getUptime();
      expect(uptime).toBe(17000);
    });

    it('should return non-negative uptime', () => {
      const uptime = new UptimeMonitor().getUptime();
      expect(uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('reset()', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(1705730400000);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should reset start time', () => {
      const monitor = new UptimeMonitor();
      vi.advanceTimersByTime(10000);
      monitor.reset();
      vi.advanceTimersByTime(5000);

      const uptime = monitor.getUptime();
      expect(uptime).toBe(5000);
    });

    it('should return zero uptime immediately after reset', () => {
      const monitor = new UptimeMonitor();
      monitor.reset();

      const uptime = monitor.getUptime();
      expect(uptime).toBe(0);
    });

    it('should handle multiple resets', () => {
      const monitor = new UptimeMonitor();
      vi.advanceTimersByTime(10000);
      monitor.reset();
      vi.advanceTimersByTime(5000);

      let uptime = monitor.getUptime();
      expect(uptime).toBe(5000);

      monitor.reset();
      vi.advanceTimersByTime(2000);

      uptime = monitor.getUptime();
      expect(uptime).toBe(2000);
    });

    it('should allow time tracking after reset', () => {
      const monitor = new UptimeMonitor();
      monitor.reset();
      vi.advanceTimersByTime(1000);

      const uptime = monitor.getUptime();
      expect(uptime).toBe(1000);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(1705730400000);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle long uptime periods', () => {
      const monitor = new UptimeMonitor();
      vi.advanceTimersByTime(86400000);
      const uptime = monitor.getUptime();
      expect(uptime).toBe(86400000);
    });

    it('should handle very short uptime periods', () => {
      const monitor = new UptimeMonitor();
      vi.advanceTimersByTime(1);
      const uptime = monitor.getUptime();
      expect(uptime).toBe(1);
    });

    it('should handle zero time advance', () => {
      const uptime = new UptimeMonitor().getUptime();
      expect(uptime).toBe(0);
    });
  });
});
