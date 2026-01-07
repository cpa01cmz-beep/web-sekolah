import type { Context, Next } from 'hono';
import { gatewayTimeout } from '../core-utils';

interface TimeoutOptions {
  timeoutMs: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export function timeout(options: TimeoutOptions) {
  const { timeoutMs } = options;

  return async (c: Context, next: Next) => {
    let isComplete = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        if (!isComplete) {
          reject(new Error('Request timeout'));
        }
      }, timeoutMs);
    });

    try {
      await Promise.race([next(), timeoutPromise]);
      isComplete = true;
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timeout') {
        return gatewayTimeout(c, 'Request processing timeout');
      }
      throw error;
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };
}

export function createTimeoutMiddleware(defaultTimeout: number = DEFAULT_TIMEOUT) {
  return (customTimeout?: number) => {
    return timeout({ timeoutMs: customTimeout || defaultTimeout });
  };
}

export const defaultTimeout = createTimeoutMiddleware(30000); // 30 seconds
export const shortTimeout = createTimeoutMiddleware(10000); // 10 seconds
export const longTimeout = createTimeoutMiddleware(60000); // 60 seconds
export const veryLongTimeout = createTimeoutMiddleware(120000); // 2 minutes
