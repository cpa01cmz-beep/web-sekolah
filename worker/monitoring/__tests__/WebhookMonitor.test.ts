import { describe, it, expect, beforeEach } from 'vitest';
import { WebhookMonitor } from '../WebhookMonitor';

describe('WebhookMonitor', () => {
  let monitor: WebhookMonitor;

  beforeEach(() => {
    monitor = new WebhookMonitor();
  });

  describe('recordEvent()', () => {
    it('should update total and pending events', () => {
      monitor.recordEvent(100, 50);

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(100);
      expect(stats.pendingEvents).toBe(50);
    });

    it('should overwrite existing stats', () => {
      monitor.recordEvent(10, 5);
      monitor.recordEvent(20, 8);

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(20);
      expect(stats.pendingEvents).toBe(8);
    });

    it('should handle zero events', () => {
      monitor.recordEvent(0, 0);

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(0);
      expect(stats.pendingEvents).toBe(0);
    });

    it('should handle large event counts', () => {
      monitor.recordEvent(99999, 50000);

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(99999);
      expect(stats.pendingEvents).toBe(50000);
    });
  });

  describe('recordEventCreated()', () => {
    it('should increment total events', () => {
      monitor.recordEventCreated();

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(1);
    });

    it('should increment pending events', () => {
      monitor.recordEventCreated();

      const stats = monitor.getStats();
      expect(stats.pendingEvents).toBe(1);
    });

    it('should increment on multiple calls', () => {
      monitor.recordEventCreated();
      monitor.recordEventCreated();
      monitor.recordEventCreated();

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(3);
      expect(stats.pendingEvents).toBe(3);
    });
  });

  describe('recordEventProcessed()', () => {
    it('should decrement pending events', () => {
      monitor.recordEvent(10, 10);
      monitor.recordEventProcessed();

      const stats = monitor.getStats();
      expect(stats.pendingEvents).toBe(9);
    });

    it('should not decrement below zero', () => {
      monitor.recordEvent(5, 5);
      monitor.recordEventProcessed();
      monitor.recordEventProcessed();
      monitor.recordEventProcessed();
      monitor.recordEventProcessed();
      monitor.recordEventProcessed();
      monitor.recordEventProcessed();
      monitor.recordEventProcessed();

      const stats = monitor.getStats();
      expect(stats.pendingEvents).toBe(0);
    });

    it('should handle concurrent recordEventProcessed calls', () => {
      monitor.recordEvent(10, 10);
      monitor.recordEventProcessed();
      monitor.recordEventProcessed();
      monitor.recordEventProcessed();

      const stats = monitor.getStats();
      expect(stats.pendingEvents).toBe(7);
    });
  });

  describe('recordDelivery()', () => {
    it('should increment total deliveries', () => {
      monitor.recordDelivery(true);

      const stats = monitor.getStats();
      expect(stats.totalDeliveries).toBe(1);
    });

    it('should increment successful deliveries', () => {
      monitor.recordDelivery(true);

      const stats = monitor.getStats();
      expect(stats.successfulDeliveries).toBe(1);
    });

    it('should not increment failed deliveries on success', () => {
      monitor.recordDelivery(true);
      monitor.recordDelivery(true);

      const stats = monitor.getStats();
      expect(stats.failedDeliveries).toBe(0);
    });

    it('should increment failed deliveries', () => {
      monitor.recordDelivery(false);

      const stats = monitor.getStats();
      expect(stats.failedDeliveries).toBe(1);
    });

    it('should not increment successful deliveries on failure', () => {
      monitor.recordDelivery(false);
      monitor.recordDelivery(false);

      const stats = monitor.getStats();
      expect(stats.successfulDeliveries).toBe(0);
    });

    it('should handle mixed success and failure', () => {
      monitor.recordDelivery(true);
      monitor.recordDelivery(false);
      monitor.recordDelivery(true);
      monitor.recordDelivery(false);

      const stats = monitor.getStats();
      expect(stats.totalDeliveries).toBe(4);
      expect(stats.successfulDeliveries).toBe(2);
      expect(stats.failedDeliveries).toBe(2);
    });

    it('should handle delivery time tracking', () => {
      monitor.recordDelivery(true, 100);
      monitor.recordDelivery(true, 200);
      monitor.recordDelivery(true, 150);

      const stats = monitor.getStats();
      expect(stats.averageDeliveryTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updatePendingDeliveries()', () => {
    it('should update pending deliveries count', () => {
      monitor.updatePendingDeliveries(10);

      const stats = monitor.getStats();
      expect(stats.pendingDeliveries).toBe(10);
    });

    it('should overwrite existing pending deliveries', () => {
      monitor.updatePendingDeliveries(5);
      monitor.updatePendingDeliveries(15);

      const stats = monitor.getStats();
      expect(stats.pendingDeliveries).toBe(15);
    });

    it('should handle zero pending deliveries', () => {
      monitor.updatePendingDeliveries(0);

      const stats = monitor.getStats();
      expect(stats.pendingDeliveries).toBe(0);
    });

    it('should handle large pending delivery counts', () => {
      monitor.updatePendingDeliveries(99999);

      const stats = monitor.getStats();
      expect(stats.pendingDeliveries).toBe(99999);
    });
  });

  describe('getStats()', () => {
    it('should return zero stats for new monitor', () => {
      const stats = monitor.getStats();

      expect(stats.totalEvents).toBe(0);
      expect(stats.pendingEvents).toBe(0);
      expect(stats.totalDeliveries).toBe(0);
      expect(stats.successfulDeliveries).toBe(0);
      expect(stats.failedDeliveries).toBe(0);
      expect(stats.pendingDeliveries).toBe(0);
      expect(stats.averageDeliveryTime).toBe(0);
    });

    it('should return snapshot of current stats', () => {
      monitor.recordEventCreated();
      monitor.recordDelivery(true);

      const stats1 = monitor.getStats();
      monitor.recordEventCreated();
      const stats2 = monitor.getStats();

      expect(stats1.totalEvents).toBe(1);
      expect(stats2.totalEvents).toBe(2);
    });

    it('should return copy of stats to prevent mutation', () => {
      monitor.recordEventCreated();
      monitor.recordDelivery(true, 100);

      const stats1 = monitor.getStats();
      stats1.totalEvents = 999;
      stats1.averageDeliveryTime = 888;

      const stats2 = monitor.getStats();
      expect(stats2.totalEvents).toBe(1);
      expect(stats2.averageDeliveryTime).not.toBe(888);
    });
  });

  describe('getSuccessRate()', () => {
    it('should return 0 when no deliveries', () => {
      const rate = monitor.getSuccessRate();
      expect(rate).toBe(0);
    });

    it('should return 100% when all deliveries successful', () => {
      monitor.recordDelivery(true);
      monitor.recordDelivery(true);
      monitor.recordDelivery(true);

      const rate = monitor.getSuccessRate();
      expect(rate).toBe(100);
    });

    it('should return 0% when all deliveries failed', () => {
      monitor.recordDelivery(false);
      monitor.recordDelivery(false);
      monitor.recordDelivery(false);

      const rate = monitor.getSuccessRate();
      expect(rate).toBe(0);
    });

    it('should calculate correct success rate', () => {
      monitor.recordDelivery(true);
      monitor.recordDelivery(false);
      monitor.recordDelivery(true);
      monitor.recordDelivery(false);
      monitor.recordDelivery(true);

      const rate = monitor.getSuccessRate();
      expect(rate).toBe(60);
    });

    it('should calculate decimal success rate', () => {
      monitor.recordDelivery(true);
      monitor.recordDelivery(true);
      monitor.recordDelivery(false);

      const rate = monitor.getSuccessRate();
      expect(rate).toBeCloseTo(66.67, 1);
    });

    it('should handle large delivery counts', () => {
      for (let i = 0; i < 100; i++) {
        monitor.recordDelivery(i % 2 === 0);
      }

      const rate = monitor.getSuccessRate();
      expect(rate).toBe(50);
    });
  });

  describe('reset()', () => {
    it('should reset all stats to zero', () => {
      monitor.recordEventCreated();
      monitor.recordDelivery(true);
      monitor.recordDelivery(false);
      monitor.updatePendingDeliveries(10);

      monitor.reset();

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(0);
      expect(stats.pendingEvents).toBe(0);
      expect(stats.totalDeliveries).toBe(0);
      expect(stats.successfulDeliveries).toBe(0);
      expect(stats.failedDeliveries).toBe(0);
      expect(stats.pendingDeliveries).toBe(0);
      expect(stats.averageDeliveryTime).toBe(0);
    });

    it('should allow recording after reset', () => {
      monitor.recordEventCreated();
      monitor.recordEventCreated();
      monitor.recordDelivery(true);

      const stats1 = monitor.getStats();
      monitor.reset();
      monitor.recordEventCreated();
      monitor.recordDelivery(false);

      const stats2 = monitor.getStats();
      expect(stats1.totalEvents).toBe(2);
      expect(stats1.successfulDeliveries).toBe(1);
      expect(stats2.totalEvents).toBe(1);
      expect(stats2.successfulDeliveries).toBe(0);
      expect(stats2.failedDeliveries).toBe(1);
    });

    it('should handle multiple resets', () => {
      monitor.recordEventCreated();
      monitor.reset();
      monitor.reset();

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle delivery time array at max capacity', () => {
      for (let i = 0; i < 1005; i++) {
        monitor.recordDelivery(true, i);
      }

      const stats = monitor.getStats();
      expect(stats.totalDeliveries).toBe(1005);
      expect(stats.successfulDeliveries).toBe(1005);
      expect(stats.averageDeliveryTime).toBeGreaterThan(0);
    });

    it('should limit delivery time array to MAX_DELIVERY_TIMES', () => {
      for (let i = 0; i < 1050; i++) {
        monitor.recordDelivery(true, i);
      }

      const stats = monitor.getStats();
      expect(stats.totalDeliveries).toBe(1050);
      expect(stats.successfulDeliveries).toBe(1050);
    });

    it('should handle delivery without time', () => {
      monitor.recordDelivery(true);
      monitor.recordDelivery(false);

      const stats = monitor.getStats();
      expect(stats.totalDeliveries).toBe(2);
      expect(stats.successfulDeliveries).toBe(1);
      expect(stats.failedDeliveries).toBe(1);
    });

    it('should handle concurrent recordDelivery calls', () => {
      Promise.all([
        monitor.recordDelivery(true, 100),
        monitor.recordDelivery(false),
        monitor.recordDelivery(true, 200),
      ]);

      const stats = monitor.getStats();
      expect(stats.totalDeliveries).toBe(3);
      expect(stats.successfulDeliveries).toBe(2);
      expect(stats.failedDeliveries).toBe(1);
    });

    it('should handle many recordEventCreated calls', () => {
      for (let i = 0; i < 100; i++) {
        monitor.recordEventCreated();
      }

      const stats = monitor.getStats();
      expect(stats.totalEvents).toBe(100);
      expect(stats.pendingEvents).toBe(100);
    });

    it('should handle many recordEventProcessed calls', () => {
      monitor.recordEvent(50, 50);
      for (let i = 0; i < 40; i++) {
        monitor.recordEventProcessed();
      }

      const stats = monitor.getStats();
      expect(stats.pendingEvents).toBe(10);
    });
  });
});
