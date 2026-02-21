import { IntegrationMonitor as IntegrationMonitorConfig, TimeConstants } from '../config/time';
import { logger } from '../logger';
import type { IMonitor } from './IMonitor';

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
  errorRate: {
    perMinute: number;
    perHour: number;
  };
}

export class ApiErrorMonitor implements IMonitor {
  private stats: ApiErrorStats = {
    totalErrors: 0,
    errorsByCode: {},
    errorsByStatus: {},
    recentErrors: [],
    errorRate: { perMinute: 0, perHour: 0 },
  };

  private readonly maxRecentErrors: number = IntegrationMonitorConfig.MAX_RECENT_ERRORS;
  private readonly oneMinuteMs: number = TimeConstants.MINUTE_MS;
  private readonly oneHourMs: number = TimeConstants.ONE_HOUR_MS;

  private calculateErrorRate(): { perMinute: number; perHour: number } {
    const now = Date.now();
    const oneMinuteAgo = now - this.oneMinuteMs;
    const oneHourAgo = now - this.oneHourMs;

    const errorsLastMinute = this.stats.recentErrors.filter(
      (e) => e.timestamp >= oneMinuteAgo
    ).length;
    const errorsLastHour = this.stats.recentErrors.filter((e) => e.timestamp >= oneHourAgo).length;

    return {
      perMinute: errorsLastMinute,
      perHour: errorsLastHour,
    };
  }

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
      errorRate: this.calculateErrorRate(),
    };
  }

  reset(): void {
    this.stats = {
      totalErrors: 0,
      errorsByCode: {},
      errorsByStatus: {},
      recentErrors: [],
      errorRate: { perMinute: 0, perHour: 0 },
    };
    logger.debug('API error monitor reset');
  }
}
