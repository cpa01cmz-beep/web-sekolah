import { logger } from '../logger';
import type { IMonitor } from './IMonitor';

export class UptimeMonitor implements IMonitor {
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
