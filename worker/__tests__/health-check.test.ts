import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExternalServiceHealth, type HealthCheckResult } from '../health-check';

describe('External Service Health Check', () => {
  beforeEach(() => {
    ExternalServiceHealth.resetAllHealthStatus();
  });

  describe('checkWebhookService', () => {
    it('should return healthy when service responds successfully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
        } as Response)
      ) as any;

      const result = await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      expect(result.service).toBe('webhook');
      expect(result.healthy).toBe(true);
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    it('should return unhealthy when service fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
        } as Response)
      ) as any;

      const result = await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      expect(result.service).toBe('webhook');
      expect(result.healthy).toBe(false);
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeTruthy();
    });

    it('should return unhealthy when fetch throws error', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      const result = await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      expect(result.service).toBe('webhook');
      expect(result.healthy).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.timestamp).toBeTruthy();
    });

    it('should return unhealthy when fetch throws error', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Connection refused'))) as any;

      const result = await ExternalServiceHealth.checkDocsService('https://example.com/docs');

      expect(result.service).toBe('docs');
      expect(result.healthy).toBe(false);
      expect(result.error).toBe('Connection refused');
      expect(result.timestamp).toBeTruthy();
    });
  });

  describe('Health Status Management', () => {
    it('should track health status after checks', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
        } as Response)
      ) as any;

      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      const status = ExternalServiceHealth.getHealthStatus('webhook');
      expect(status).toBeTruthy();
      expect(status?.service).toBe('webhook');
      expect(status?.lastSuccess).toBeTruthy();
      expect(status?.lastFailure).toBeNull();
      expect(status?.consecutiveFailures).toBe(0);
      expect(status?.isHealthy).toBe(true);
      expect(status?.lastError).toBeNull();
    });

    it('should track consecutive failures', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');
      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');
      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');
      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');
      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      const status = ExternalServiceHealth.getHealthStatus('webhook');
      expect(status?.consecutiveFailures).toBe(5);
      expect(status?.isHealthy).toBe(false);
    });

    it('should mark unhealthy after 5 consecutive failures', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      for (let i = 0; i < 5; i++) {
        await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');
      }

      const status = ExternalServiceHealth.getHealthStatus('webhook');
      expect(status?.consecutiveFailures).toBe(5);
      expect(status?.isHealthy).toBe(false);
      expect(status?.lastError).toBe('Network error');
    });

    it('should store last error message in health status', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Connection timeout'))) as any;

      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      const status = ExternalServiceHealth.getHealthStatus('webhook');
      expect(status?.lastError).toBe('Connection timeout');
    });

    it('should reset consecutive failures on successful check', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');
      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
        } as Response)
      ) as any;

      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      const status = ExternalServiceHealth.getHealthStatus('webhook');
      expect(status?.consecutiveFailures).toBe(0);
      expect(status?.isHealthy).toBe(true);
      expect(status?.lastSuccess).toBeTruthy();
      expect(status?.lastError).toBeNull();
    });

    it('should return null for unknown service', () => {
      const status = ExternalServiceHealth.getHealthStatus('unknown');
      expect(status).toBeNull();
    });

    it('should return all health statuses', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
        } as Response)
      ) as any;

      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');
      await ExternalServiceHealth.checkDocsService('https://example.com/docs');

      const allStatuses = ExternalServiceHealth.getAllHealthStatus();
      expect(allStatuses).toHaveProperty('webhook');
      expect(allStatuses).toHaveProperty('docs');
    });

    it('should reset health status for specific service', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
        } as Response)
      ) as any;

      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      ExternalServiceHealth.resetHealthStatus('webhook');

      const status = ExternalServiceHealth.getHealthStatus('webhook');
      expect(status).toBeNull();
    });

    it('should reset all health statuses', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
        } as Response)
      ) as any;

      await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');
      await ExternalServiceHealth.checkDocsService('https://example.com/docs');

      ExternalServiceHealth.resetAllHealthStatus();

      expect(ExternalServiceHealth.getHealthStatus('webhook')).toBeNull();
      expect(ExternalServiceHealth.getHealthStatus('docs')).toBeNull();
    });
  });

  describe('Latency Measurement', () => {
    it('should measure latency for successful request', async () => {
      global.fetch = vi.fn(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true } as Response), 50))
      ) as any;

      const result = await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      expect(result.latency).toBeGreaterThanOrEqual(45);
    });

    it('should measure latency for failed request', async () => {
      global.fetch = vi.fn(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      ) as any;

      const result = await ExternalServiceHealth.checkWebhookService('https://example.com/webhook');

      expect(result.latency).toBeGreaterThanOrEqual(90);
    });
  });
});
