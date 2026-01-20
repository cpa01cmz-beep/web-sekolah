import { IntegrationMonitor as IntegrationMonitorConfig } from '../config/time';
import { logger } from '../logger';

export interface ApiErrorStats {
  totalErrors: number;
  errorsByCode: Record<string, number>;
  errorsByStatus: Record<number, number>;
  recentErrors: Array<{
    code: string;
    status: number;
    timestamp: number;
    endpoint: string;
  }>;
}

export class ApiErrorMonitor {
  private stats: ApiErrorStats = {
    totalErrors: 0,
    errorsByCode: {},
    errorsByStatus: {},
    recentErrors: [],
  };

  private readonly maxRecentErrors: number = IntegrationMonitorConfig.MAX_RECENT_ERRORS;

  recordError(code: string, status: number, endpoint: string): void {
    this.stats.totalErrors++;
    this.stats.errorsByCode[code] = (this.stats.errorsByCode[code] || 0) + 1;
    this.stats.errorsByStatus[status] = (this.stats.errorsByStatus[status] || 0) + 1;

    this.stats.recentErrors.unshift({
      code,
      status,
      timestamp: Date.now(),
      endpoint,
    });

    if (this.stats.recentErrors.length > this.maxRecentErrors) {
      this.stats.recentErrors.pop();
    }

    logger.warn('API error recorded', {
      code,
      status,
      endpoint,
      totalErrors: this.stats.totalErrors,
    });
  }

  getStats(): ApiErrorStats {
    return {
      totalErrors: this.stats.totalErrors,
      errorsByCode: { ...this.stats.errorsByCode },
      errorsByStatus: { ...this.stats.errorsByStatus },
      recentErrors: [...this.stats.recentErrors],
    };
  }

  reset(): void {
    this.stats = {
      totalErrors: 0,
      errorsByCode: {},
      errorsByStatus: {},
      recentErrors: [],
    };
    logger.debug('API error monitor reset');
  }
}
