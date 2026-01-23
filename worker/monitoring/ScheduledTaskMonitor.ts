import { IMonitor, type MonitorStats } from './IMonitor';

interface ScheduledTaskStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalDuration: number;
  lastExecution?: string;
  lastSuccess?: string;
  lastFailure?: string;
  taskExecutions: Map<string, TaskExecutionStats>;
}

interface TaskExecutionStats {
  name: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalDuration: number;
  lastExecution?: string;
  lastSuccess?: string;
  lastFailure?: string;
}

export class ScheduledTaskMonitor implements IMonitor {
  private stats: ScheduledTaskStats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalDuration: 0,
    taskExecutions: new Map(),
  };

  recordExecution(name: string, success: boolean, duration: number): void {
    const now = new Date().toISOString();
    
    this.stats.totalExecutions++;
    this.stats.totalDuration += duration;
    this.stats.lastExecution = now;

    if (success) {
      this.stats.successfulExecutions++;
      this.stats.lastSuccess = now;
    } else {
      this.stats.failedExecutions++;
      this.stats.lastFailure = now;
    }

    let taskStats = this.stats.taskExecutions.get(name);
    if (!taskStats) {
      taskStats = {
        name,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalDuration: 0,
      };
      this.stats.taskExecutions.set(name, taskStats);
    }

    taskStats.totalExecutions++;
    taskStats.totalDuration += duration;
    taskStats.lastExecution = now;

    if (success) {
      taskStats.successfulExecutions++;
      taskStats.lastSuccess = now;
    } else {
      taskStats.failedExecutions++;
      taskStats.lastFailure = now;
    }
  }

  getStats(): ScheduledTaskStats {
    return {
      totalExecutions: this.stats.totalExecutions,
      successfulExecutions: this.stats.successfulExecutions,
      failedExecutions: this.stats.failedExecutions,
      totalDuration: this.stats.totalDuration,
      lastExecution: this.stats.lastExecution,
      lastSuccess: this.stats.lastSuccess,
      lastFailure: this.stats.lastFailure,
      taskExecutions: new Map(this.stats.taskExecutions),
    };
  }

  getSuccessRate(): number {
    if (this.stats.totalExecutions === 0) return 100;
    return (this.stats.successfulExecutions / this.stats.totalExecutions) * 100;
  }

  reset(): void {
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalDuration: 0,
      taskExecutions: new Map(),
    };
  }
}

export type { ScheduledTaskStats, TaskExecutionStats };
