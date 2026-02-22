import { RETRY_CONFIG } from '@shared/constants';
import { logger } from '../logger';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  jitterMs?: number;
  timeout?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const DEFAULT_MAX_RETRIES = RETRY_CONFIG.DEFAULT_MAX_RETRIES;
const DEFAULT_BASE_DELAY_MS = RETRY_CONFIG.DEFAULT_BASE_DELAY_MS;
const DEFAULT_JITTER_MS = RETRY_CONFIG.DEFAULT_JITTER_MS;
const MAX_DELAY_MS = RETRY_CONFIG.MAX_DELAY_MS;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, baseDelay: number, jitterMs: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, MAX_DELAY_MS);
  const jitter = Math.random() * jitterMs;
  return cappedDelay + jitter;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    baseDelay = DEFAULT_BASE_DELAY_MS,
    jitterMs = DEFAULT_JITTER_MS,
    timeout,
    shouldRetry
  } = options;

  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (timeout) {
        const timeoutPromise = new Promise<T>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });
        return await Promise.race([fn(), timeoutPromise]);
      }

      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      if (shouldRetry && !shouldRetry(error, attempt)) {
        break;
      }

      const delay = calculateDelay(attempt, baseDelay, jitterMs);
      await sleep(delay).catch((error) => {
        logger.error('Retry sleep delay failed', error);
      });
    }
  }

  throw lastError;
}
