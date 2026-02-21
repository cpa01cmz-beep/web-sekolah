import type { ErrorReport } from './types';

export class ErrorQueue {
  private errorQueue: ErrorReport[] = [];
  private isReporting = false;
  private readonly maxQueueSize: number;
  private readonly processCallback: (errors: ErrorReport[]) => Promise<void>;

  constructor(maxQueueSize: number, processCallback: (errors: ErrorReport[]) => Promise<void>) {
    this.maxQueueSize = maxQueueSize;
    this.processCallback = processCallback;
  }

  report(error: ErrorReport): void {
    this.errorQueue.push(error);

    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;
    const errorsToReport = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.processCallback(errorsToReport);
    } catch (err) {
      this.errorQueue.unshift(...errorsToReport);
    } finally {
      this.isReporting = false;
    }
  }

  dispose(): void {
    this.errorQueue = [];
    this.isReporting = false;
  }

  getQueueSize(): number {
    return this.errorQueue.length;
  }

  isQueueEmpty(): boolean {
    return this.errorQueue.length === 0;
  }

  isProcessing(): boolean {
    return this.isReporting;
  }
}
