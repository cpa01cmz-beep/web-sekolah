import { describe, it, expect, beforeEach } from 'vitest';
import { ApiErrorMonitor } from '../ApiErrorMonitor';

describe('ApiErrorMonitor', () => {
  let monitor: ApiErrorMonitor;

  beforeEach(() => {
    monitor = new ApiErrorMonitor();
  });

  describe('recordError()', () => {
    it('should increment total errors count', () => {
      monitor.recordError('ERR_INTERNAL', 500, '/api/test');

      const stats = monitor.getStats();
      expect(stats.totalErrors).toBe(1);
    });

    it('should increment total errors on multiple calls', () => {
      monitor.recordError('ERR_INTERNAL', 500, '/api/test');
      monitor.recordError('ERR_VALIDATION', 400, '/api/validate');

      const stats = monitor.getStats();
      expect(stats.totalErrors).toBe(2);
    });

    it('should track errors by code', () => {
      monitor.recordError('ERR_INTERNAL', 500, '/api/test');
      monitor.recordError('ERR_VALIDATION', 400, '/api/validate');
      monitor.recordError('ERR_INTERNAL', 500, '/api/error');

      const stats = monitor.getStats();
      expect(stats.errorsByCode['ERR_INTERNAL']).toBe(2);
      expect(stats.errorsByCode['ERR_VALIDATION']).toBe(1);
    });

    it('should track errors by status code', () => {
      monitor.recordError('ERR_INTERNAL', 500, '/api/test');
      monitor.recordError('ERR_VALIDATION', 400, '/api/validate');
      monitor.recordError('ERR_NOT_FOUND', 404, '/api/notfound');

      const stats = monitor.getStats();
      expect(stats.errorsByStatus[500]).toBe(1);
      expect(stats.errorsByStatus[400]).toBe(1);
      expect(stats.errorsByStatus[404]).toBe(1);
    });

    it('should add recent errors to list', () => {
      monitor.recordError('ERR_1', 500, '/api/1');
      monitor.recordError('ERR_2', 400, '/api/2');
      monitor.recordError('ERR_3', 404, '/api/3');

      const stats = monitor.getStats();
      expect(stats.recentErrors).toHaveLength(3);
    });

    it('should maintain recent errors in reverse chronological order', () => {
      monitor.recordError('ERR_1', 500, '/api/1');
      monitor.recordError('ERR_2', 400, '/api/2');
      monitor.recordError('ERR_3', 404, '/api/3');

      const stats = monitor.getStats();
      expect(stats.recentErrors[0].code).toBe('ERR_3');
      expect(stats.recentErrors[1].code).toBe('ERR_2');
      expect(stats.recentErrors[2].code).toBe('ERR_1');
    });

    it('should include timestamp in recent errors', () => {
      const beforeRecord = Date.now();
      monitor.recordError('ERR_TEST', 500, '/api/test');
      const afterRecord = Date.now();

      const stats = monitor.getStats();
      expect(stats.recentErrors[0].timestamp).toBeGreaterThanOrEqual(beforeRecord);
      expect(stats.recentErrors[0].timestamp).toBeLessThanOrEqual(afterRecord);
    });

    it('should include endpoint in recent errors', () => {
      monitor.recordError('ERR_TEST', 500, '/api/test');

      const stats = monitor.getStats();
      expect(stats.recentErrors[0].endpoint).toBe('/api/test');
    });

    it('should limit recent errors to MAX_RECENT_ERRORS', () => {
      for (let i = 0; i < 150; i++) {
        monitor.recordError(`ERR_${i}`, 500, `/api/${i}`);
      }

      const stats = monitor.getStats();
      expect(stats.recentErrors.length).toBe(100);
      expect(stats.totalErrors).toBe(150);
    });

    it('should remove oldest errors when exceeding max recent errors', () => {
      for (let i = 0; i < 105; i++) {
        monitor.recordError(`ERR_${i}`, 500, `/api/${i}`);
      }

      const stats = monitor.getStats();
      expect(stats.recentErrors[0].code).toBe('ERR_104');
      expect(stats.recentErrors[99].code).toBe('ERR_5');
    });
  });

  describe('getStats()', () => {
    it('should return zero stats for new monitor', () => {
      const stats = monitor.getStats();

      expect(stats.totalErrors).toBe(0);
      expect(stats.errorsByCode).toEqual({});
      expect(stats.errorsByStatus).toEqual({});
      expect(stats.recentErrors).toEqual([]);
    });

    it('should return snapshot of current stats', () => {
      monitor.recordError('ERR_1', 500, '/api/1');

      const stats1 = monitor.getStats();
      monitor.recordError('ERR_2', 400, '/api/2');
      const stats2 = monitor.getStats();

      expect(stats1.totalErrors).toBe(1);
      expect(stats2.totalErrors).toBe(2);
    });

    it('should return copy of stats to prevent mutation', () => {
      monitor.recordError('ERR_1', 500, '/api/1');

      const stats1 = monitor.getStats();
      stats1.errorsByCode['ERR_NEW'] = 999;

      const stats2 = monitor.getStats();
      expect(stats2.errorsByCode['ERR_NEW']).toBeUndefined();
    });

    it('should return copy of recent errors array', () => {
      monitor.recordError('ERR_1', 500, '/api/1');

      const stats1 = monitor.getStats();
      stats1.recentErrors.push({ code: 'NEW', status: 0, timestamp: 0, endpoint: '/test' });

      const stats2 = monitor.getStats();
      expect(stats2.recentErrors).toHaveLength(1);
      expect(stats2.recentErrors[0].code).toBe('ERR_1');
    });
  });

  describe('reset()', () => {
    it('should reset total errors to zero', () => {
      monitor.recordError('ERR_1', 500, '/api/1');
      monitor.reset();

      const stats = monitor.getStats();
      expect(stats.totalErrors).toBe(0);
    });

    it('should clear errors by code', () => {
      monitor.recordError('ERR_1', 500, '/api/1');
      monitor.recordError('ERR_2', 400, '/api/2');
      monitor.reset();

      const stats = monitor.getStats();
      expect(stats.errorsByCode).toEqual({});
    });

    it('should clear errors by status', () => {
      monitor.recordError('ERR_1', 500, '/api/1');
      monitor.recordError('ERR_2', 400, '/api/2');
      monitor.reset();

      const stats = monitor.getStats();
      expect(stats.errorsByStatus).toEqual({});
    });

    it('should clear recent errors', () => {
      monitor.recordError('ERR_1', 500, '/api/1');
      monitor.recordError('ERR_2', 400, '/api/2');
      monitor.reset();

      const stats = monitor.getStats();
      expect(stats.recentErrors).toEqual([]);
    });

    it('should allow recording errors after reset', () => {
      monitor.recordError('ERR_1', 500, '/api/1');
      monitor.reset();
      monitor.recordError('ERR_2', 400, '/api/2');

      const stats = monitor.getStats();
      expect(stats.totalErrors).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error code', () => {
      monitor.recordError('', 500, '/api/test');

      const stats = monitor.getStats();
      expect(stats.errorsByCode['']).toBe(1);
    });

    it('should handle empty endpoint string', () => {
      monitor.recordError('ERR_TEST', 500, '');

      const stats = monitor.getStats();
      expect(stats.recentErrors[0].endpoint).toBe('');
    });

    it('should handle negative status codes', () => {
      monitor.recordError('ERR_CUSTOM', -1, '/api/test');

      const stats = monitor.getStats();
      expect(stats.errorsByStatus[-1]).toBe(1);
    });

    it('should handle very long error codes', () => {
      const longCode = 'ERR_VERY_LONG_ERROR_CODE_NAME_WITH_MANY_CHARACTERS';
      monitor.recordError(longCode, 500, '/api/test');

      const stats = monitor.getStats();
      expect(stats.errorsByCode[longCode]).toBe(1);
    });

    it('should handle special characters in endpoint', () => {
      monitor.recordError('ERR_TEST', 500, '/api/test/:id/with/special?query=1&sort=desc');

      const stats = monitor.getStats();
      expect(stats.recentErrors[0].endpoint).toBe('/api/test/:id/with/special?query=1&sort=desc');
    });

    it('should handle concurrent recordError calls', () => {
      Promise.all([
        monitor.recordError('ERR_1', 500, '/api/1'),
        monitor.recordError('ERR_2', 500, '/api/2'),
        monitor.recordError('ERR_3', 500, '/api/3'),
      ]);

      const stats = monitor.getStats();
      expect(stats.totalErrors).toBe(3);
    });
  });

  describe('Statistical Accuracy', () => {
    it('should accurately count errors by code across many calls', () => {
      for (let i = 0; i < 10; i++) {
        monitor.recordError('ERR_A', 500, '/api/a');
      }
      for (let i = 0; i < 5; i++) {
        monitor.recordError('ERR_B', 400, '/api/b');
      }

      const stats = monitor.getStats();
      expect(stats.totalErrors).toBe(15);
      expect(stats.errorsByCode['ERR_A']).toBe(10);
      expect(stats.errorsByCode['ERR_B']).toBe(5);
    });

    it('should accurately count errors by status across many calls', () => {
      for (let i = 0; i < 8; i++) {
        monitor.recordError('ERR', 500, '/api/500');
      }
      for (let i = 0; i < 4; i++) {
        monitor.recordError('ERR', 404, '/api/404');
      }
      for (let i = 0; i < 2; i++) {
        monitor.recordError('ERR', 400, '/api/400');
      }

      const stats = monitor.getStats();
      expect(stats.errorsByStatus[500]).toBe(8);
      expect(stats.errorsByStatus[404]).toBe(4);
      expect(stats.errorsByStatus[400]).toBe(2);
    });
  });
});
