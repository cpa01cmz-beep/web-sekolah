import type { Env } from './core-utils';
import { logger } from './logger';
import { integrationMonitor } from './integration-monitor';

type ScheduledTask = (env: Env) => Promise<void>;

interface ScheduledTaskConfig {
  name: string;
  cron: string;
  handler: ScheduledTask;
}

const SCHEDULED_TASKS: ScheduledTaskConfig[] = [
  {
    name: 'process-webhook-deliveries',
    cron: '* * * * *',
    handler: async (env: Env) => {
      logger.debug('Processing pending webhook deliveries (scheduled)');
      const { WebhookService } = await import('./webhook-service');
      await WebhookService.processPendingDeliveries(env);
    },
  },
];

async function executeTask(task: ScheduledTaskConfig, env: Env): Promise<void> {
  const startTime = Date.now();
  try {
    logger.info(`Executing scheduled task: ${task.name}`, { cron: task.cron });
    await task.handler(env);
    const duration = Date.now() - startTime;
    logger.info(`Scheduled task completed: ${task.name}`, { duration: `${duration}ms` });
    integrationMonitor.recordScheduledTaskExecution(task.name, true, duration);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Scheduled task failed: ${task.name}`, { error: errorMessage, duration: `${duration}ms` });
    integrationMonitor.recordScheduledTaskExecution(task.name, false, duration);
  }
}

export async function handleScheduled(controller: ScheduledController, env: Env): Promise<void> {
  const cron = controller.cron;
  logger.info('Scheduled event received', { cron });

  const matchingTasks = SCHEDULED_TASKS.filter(task => task.cron === cron);

  if (matchingTasks.length === 0) {
    logger.warn('No matching tasks for cron expression', { cron });
    return;
  }

  for (const task of matchingTasks) {
    await executeTask(task, env);
  }
}

export { type ScheduledTask, type ScheduledTaskConfig };
