import { logger } from '../logger';
import type { ErrorReport } from './types';
import { withRetry } from '../resilience/Retry';
import { ERROR_REPORTER_CONFIG } from './constants';

export class ErrorSender {
  private readonly reportingEndpoint: string;
  private readonly maxRetries: number;
  private readonly baseRetryDelay: number;
  private readonly requestTimeout: number;

  constructor(
    reportingEndpoint: string,
    maxRetries: number,
    baseRetryDelay: number,
    requestTimeout: number
  ) {
    this.reportingEndpoint = reportingEndpoint;
    this.maxRetries = maxRetries;
    this.baseRetryDelay = baseRetryDelay;
    this.requestTimeout = requestTimeout;
  }

  async sendError(error: ErrorReport): Promise<void> {
    await withRetry(
      async () => {
        const response = await fetch(this.reportingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(error),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to report error: ${response.status} ${response.statusText}`
          );
        }

        const result = (await response.json()) as {
          success: boolean;
          error?: string;
        };

        if (!result.success) {
          throw new Error(result.error || 'Unknown error occurred');
        }

        logger.debug('[ErrorSender] Error reported successfully', {
          message: error.message,
        });
      },
      {
        maxRetries: this.maxRetries,
        baseDelay: this.baseRetryDelay,
        jitterMs: ERROR_REPORTER_CONFIG.JITTER_DELAY_MS,
        timeout: this.requestTimeout,
      }
    );
  }
}
