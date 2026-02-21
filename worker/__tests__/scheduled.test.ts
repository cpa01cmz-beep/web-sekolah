import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleScheduled, type ScheduledTask, type ScheduledTaskConfig, type TaskExecutionResult } from '../scheduled';
import { integrationMonitor } from '../integration-monitor';
import { ScheduledTaskConfig as TaskConfig } from '../config/time';

vi.mock('../webhook-service', () => ({
  WebhookService: {
    processPendingDeliveries: vi.fn(),
  },
}));

describe('Scheduled Task Timeout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    integrationMonitor.reset();
  });

  describe('ScheduledTaskConfig timeout constant', () => {
    it('should have a default timeout of 5 minutes', () => {
      expect(TaskConfig.DEFAULT_TIMEOUT_MS).toBe(5 * 60 * 1000);
    });
  });

  describe('handleScheduled', () => {
    it('should execute tasks that complete within timeout', async () => {
      const { WebhookService } = await import('../webhook-service');
      vi.mocked(WebhookService.processPendingDeliveries).mockResolvedValueOnce(undefined);

      const controller = { cron: '* * * * *', noRetry: vi.fn() } as unknown as ScheduledController;
      const env = {} as Env;

      await handleScheduled(controller, env);

      expect(WebhookService.processPendingDeliveries).toHaveBeenCalledTimes(1);
    });

    it('should handle task failures gracefully', async () => {
      const { WebhookService } = await import('../webhook-service');
      vi.mocked(WebhookService.processPendingDeliveries).mockRejectedValueOnce(new Error('Task failed'));

      const controller = { cron: '* * * * *', noRetry: vi.fn() } as unknown as ScheduledController;
      const env = {} as Env;

      await handleScheduled(controller, env);

      expect(WebhookService.processPendingDeliveries).toHaveBeenCalledTimes(1);
    });

    it('should log warning for unmatched cron expression', async () => {
      const controller = { cron: '0 0 1 1 *', noRetry: vi.fn() } as unknown as ScheduledController;
      const env = {} as Env;

      await handleScheduled(controller, env);

      const stats = integrationMonitor.getHealthMetrics().scheduledTasks;
      expect(stats.totalExecutions).toBe(0);
    });
  });

  describe('integrationMonitor scheduled task tracking', () => {
    it('should record successful task execution', async () => {
      const { WebhookService } = await import('../webhook-service');
      vi.mocked(WebhookService.processPendingDeliveries).mockResolvedValueOnce(undefined);

      const controller = { cron: '* * * * *', noRetry: vi.fn() } as unknown as ScheduledController;
      const env = {} as Env;

      await handleScheduled(controller, env);

      const stats = integrationMonitor.getHealthMetrics().scheduledTasks;
      expect(stats.totalExecutions).toBe(1);
      expect(stats.successfulExecutions).toBe(1);
      expect(stats.failedExecutions).toBe(0);
    });

    it('should record failed task execution', async () => {
      const { WebhookService } = await import('../webhook-service');
      vi.mocked(WebhookService.processPendingDeliveries).mockRejectedValueOnce(new Error('Task failed'));

      const controller = { cron: '* * * * *', noRetry: vi.fn() } as unknown as ScheduledController;
      const env = {} as Env;

      await handleScheduled(controller, env);

      const stats = integrationMonitor.getHealthMetrics().scheduledTasks;
      expect(stats.totalExecutions).toBe(1);
      expect(stats.successfulExecutions).toBe(0);
      expect(stats.failedExecutions).toBe(1);
    });
  });
});
