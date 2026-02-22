import { withRetry as sharedWithRetry, RetryOptions } from '@shared/resilience/Retry';
import { logger } from '../logger';

export type { RetryOptions };

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return sharedWithRetry(fn, options, logger);
}
