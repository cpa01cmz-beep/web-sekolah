import { logger } from '../logger';

export class UptimeMonitor {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  reset(): void {
    this.startTime = Date.now();
    logger.debug('Uptime monitor reset');
  }
}
