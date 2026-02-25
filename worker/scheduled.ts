import type { Env } from './core-utils';
import { logger } from './logger';
import { integrationMonitor } from './integration-monitor';
import { WebhookService } from './webhook-service';
import { ScheduledTaskConfig as TaskConfig } from './config/time';
import { TimeoutError } from './errors/TimeoutError';

type ScheduledTask = (env: Env) => Promise<void>;

interface ScheduledTaskConfig {
  name: string;
  cron: string;
  handler: ScheduledTask;
}

interface TaskExecutionResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}

const SCHEDULED_TASKS: ScheduledTaskConfig[] = [
  {
    name: 'process-webhook-deliveries',
    cron: '* * * * *',
    handler: async (env: Env) => {
      logger.debug('Processing pending webhook deliveries (scheduled)');
      await WebhookService.processPendingDeliveries(env);
    },
  },
];

async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  taskName: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError(timeoutMs, `Task '${taskName}' timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

async function executeTask(task: ScheduledTaskConfig, env: Env): Promise<TaskExecutionResult> {
  const startTime = Date.now();
  try {
    logger.info(`Executing scheduled task: ${task.name}`, { cron: task.cron });
    await withTimeout(
      () => task.handler(env),
      TaskConfig.DEFAULT_TIMEOUT_MS,
      task.name
    );
    const duration = Date.now() - startTime;
    logger.info(`Scheduled task completed: ${task.name}`, { duration: `${duration}ms` });
    integrationMonitor.recordScheduledTaskExecution(task.name, true, duration);
    return { name: task.name, success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error(`Scheduled task failed: ${task.name}`, { 
      error: errorMessage, 
      stack: errorStack,
      duration: `${duration}ms` 
    });
    integrationMonitor.recordScheduledTaskExecution(task.name, false, duration);
    return { name: task.name, success: false, duration, error: errorMessage };
  }
}

export async function handleScheduled(controller: ScheduledController, env: Env): Promise<void> {
  const cron = controller.cron;
  const startTime = Date.now();
  logger.info('Scheduled event received', { cron });

  const matchingTasks = SCHEDULED_TASKS.filter(task => task.cron === cron);

  if (matchingTasks.length === 0) {
    logger.warn('No matching tasks for cron expression', { cron });
    return;
  }

  const results = await Promise.allSettled(
    matchingTasks.map(task => executeTask(task, env))
  );

  const totalDuration = Date.now() - startTime;
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failureCount = results.length - successCount;

  logger.info('Scheduled batch completed', {
    cron,
    totalTasks: results.length,
    successCount,
    failureCount,
    totalDuration: `${totalDuration}ms`,
  });
}

export { type ScheduledTask, type ScheduledTaskConfig, type TaskExecutionResult };
