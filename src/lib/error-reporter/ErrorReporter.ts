import { logger } from '../logger';
import type { ErrorReport, ErrorContext, BaseErrorData } from './types';
import { ERROR_REPORTER_CONFIG } from './constants';
import { categorizeError, parseStackTrace } from './utils';
import { ErrorFilter } from './ErrorFilter';
import { ErrorQueue } from './ErrorQueue';
import { ConsoleInterceptor } from './ConsoleInterceptor';
import { GlobalErrorHandler } from './GlobalErrorHandler';
import { ErrorSender } from './ErrorSender';

class ErrorReporter {
  private errorFilter!: ErrorFilter;
  private errorQueue!: ErrorQueue;
  private consoleInterceptor!: ConsoleInterceptor;
  private globalErrorHandler!: GlobalErrorHandler;
  private errorSender!: ErrorSender;
  private isInitialized = false;

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    this.errorFilter = new ErrorFilter();
    this.errorSender = new ErrorSender(
      '/api/client-errors',
      ERROR_REPORTER_CONFIG.MAX_RETRIES,
      ERROR_REPORTER_CONFIG.BASE_RETRY_DELAY_MS,
      ERROR_REPORTER_CONFIG.REQUEST_TIMEOUT_MS
    );

    this.errorQueue = new ErrorQueue(
      ERROR_REPORTER_CONFIG.MAX_QUEUE_SIZE,
      this.processQueueCallback.bind(this)
    );

    this.consoleInterceptor = new ConsoleInterceptor(this.handleError.bind(this));

    this.globalErrorHandler = new GlobalErrorHandler(this.handleError.bind(this));

    try {
      this.setup();
      this.isInitialized = true;
    } catch (err) {
      logger.error('[ErrorReporter] Failed to initialize', err);
    }
  }

  private setup(): void {
    this.consoleInterceptor.setupConsoleInterceptors();
    this.globalErrorHandler.setupGlobalErrorHandler();
    this.globalErrorHandler.setupUnhandledRejectionHandler();
  }

  private handleError(context: ErrorContext): void {
    const filterResult = this.errorFilter.filterError(context);
    if (!filterResult.shouldReport) {
      return;
    }

    const payload = this.createErrorPayload(context);
    this.errorQueue.report(payload);
  }

  private createErrorPayload(context: ErrorContext): ErrorReport {
    const baseData = this.createBaseErrorData();
    return {
      ...baseData,
      level: context.level,
      category: categorizeError(context.message),
      message: context.message,
      stack: context.stack,
      parsedStack: parseStackTrace(context.stack),
    };
  }

  private createBaseErrorData(): BaseErrorData {
    return {
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: new Date().toISOString(),
    };
  }

  private async processQueueCallback(errors: ErrorReport[]): Promise<void> {
    for (const error of errors) {
      await this.errorSender.sendError(error);
    }
  }

  public report(error: ErrorReport): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      this.errorQueue.report(error);
    } catch (err) {
      /* empty */
    }
  }

  public dispose(): void {
    this.consoleInterceptor.dispose();
    this.globalErrorHandler.dispose();
    this.errorQueue.dispose();
    this.isInitialized = false;
  }
}

export { ErrorReporter };
