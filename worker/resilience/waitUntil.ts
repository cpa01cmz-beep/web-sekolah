import type { Context } from 'hono';
import { logger } from '../logger';

type BackgroundTask = () => Promise<void>;

export function waitUntil(c: Context, task: BackgroundTask): void {
  const executionCtx = c.executionCtx;

  if (!executionCtx || typeof executionCtx.waitUntil !== 'function') {
    logger.warn('waitUntil not available, executing task synchronously');
    task().catch((error) => {
      logger.error('Background task failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });
    return;
  }

  executionCtx.waitUntil(
    task().catch((error) => {
      logger.error('Background task failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    })
  );
}

export function waitUntilWithTimeout(c: Context, task: BackgroundTask, timeoutMs: number): void {
  waitUntil(c, async () => {
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error(`Task timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    try {
      await Promise.race([task(), timeoutPromise]);
    } catch (error) {
      logger.error('Background task with timeout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timeoutMs,
      });
    }
  });
}

export type { BackgroundTask };
