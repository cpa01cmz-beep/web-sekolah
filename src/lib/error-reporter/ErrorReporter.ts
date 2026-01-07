import { logger } from '../logger';
import type {
  ErrorReport,
  ErrorFilterResult,
  ErrorContext,
  BaseErrorData,
  ConsoleMethod,
  ConsoleNative,
  WrappedConsoleFn
} from './types';
import { REACT_WARNING_PATTERN, WARNING_PREFIX, CONSOLE_ERROR_PREFIX } from './constants';
import { categorizeError, isReactRouterFutureFlagMessage, isDeprecatedReactWarningMessage, hasRelevantSourceInStack, parseStackTrace } from './utils';
import { VENDOR_PATTERNS } from './constants';
import { globalDeduplication } from './deduplication';
import { ConsoleArgs } from './types';

class ErrorReporter {
  private errorQueue: ErrorReport[] = [];
  private isReporting = false;
  private readonly maxQueueSize = 10;
  private readonly reportingEndpoint = "/api/client-errors";
  private originalConsoleWarn: typeof console.warn | null = null;
  private originalConsoleError: typeof console.error | null = null;
  private isInitialized = false;
  private readonly maxRetries = 3;
  private readonly baseRetryDelay = 1000;
  private readonly requestTimeout = 10000;

  constructor() {
    if (typeof window === "undefined") return;

    try {
      this.setupConsoleInterceptors();
      this.setupGlobalErrorHandler();
      this.setupUnhandledRejectionHandler();

      this.isInitialized = true;
    } catch (err) {
      logger.error("[ErrorReporter] Failed to initialize", err);
    }
  }

  private setupGlobalErrorHandler() {
    const originalHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const errorMessage =
        typeof message === "string" ? message : "Unknown error";

      const context: ErrorContext = {
        message: errorMessage,
        stack: error?.stack,
        source: source || undefined,
        level: "error",
        url: window.location.href,
      };

      const filterResult = this.filterError(context);
      if (!filterResult.shouldReport) {
        if (originalHandler) {
          return originalHandler(message, source, lineno, colno, error);
        }
        return true;
      }

      const payload = this.createErrorPayload({
        message: errorMessage,
        stack: error?.stack,
        parsedStack: parseStackTrace(error?.stack),
        source: source || undefined,
        lineno: lineno || undefined,
        colno: colno || undefined,
        error: error,
      });

      this.report(payload);

      if (originalHandler) {
        return originalHandler(message, source, lineno, colno, error);
      }
      return true;
    };
  }

  private setupUnhandledRejectionHandler() {
    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason;
      const errorMessage = error?.message || "Unhandled Promise Rejection";

      const context: ErrorContext = {
        message: errorMessage,
        stack: error?.stack,
        level: "error",
        url: window.location.href,
      };

      const filterResult = this.filterError(context);
      if (!filterResult.shouldReport) return;

      const payload = this.createErrorPayload({
        message: errorMessage,
        stack: error?.stack,
        parsedStack: parseStackTrace(error?.stack),
        error: error,
      });

      this.report(payload);
    });
  }

  private createConsoleInterceptor(
    method: ConsoleMethod,
    original: ConsoleNative,
    prefix: string
  ) {
    return (...args: ConsoleArgs) => {
      original.apply(console, args);

      try {
        const message = args
          .map((arg) =>
            typeof arg === "string"
              ? arg
              : typeof arg === "object" && arg
              ? JSON.stringify(arg, null, 2)
              : String(arg)
          )
          .join(" ");
        const stack = new Error().stack;
        const level =
          method === "warn" && message.includes(REACT_WARNING_PATTERN)
            ? "warning"
            : "error";

        const context: ErrorContext = {
          message: `${prefix} ${message}`,
          stack,
          level,
          url: window.location.href,
        };

        const filterResult = this.filterError(context);
        if (!filterResult.shouldReport) return;

        const payload = this.createErrorPayload({
          message: context.message,
          stack,
          parsedStack: parseStackTrace(stack),
          level,
        });

        this.report(payload);
      } catch { // Fail silently
      }
    };
  }

  private setupConsoleInterceptors() {
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;

    const currentWarn = console.warn as WrappedConsoleFn;
    const currentError = console.error as WrappedConsoleFn;
    if (
      currentWarn.__errorReporterWrapped &&
      currentError.__errorReporterWrapped
    ) {
      return;
    }

    console.error = this.createConsoleInterceptor(
      "error",
      this.originalConsoleError!,
      CONSOLE_ERROR_PREFIX
    );
    console.warn = this.createConsoleInterceptor(
      "warn",
      this.originalConsoleWarn!,
      WARNING_PREFIX
    );
  }

  private createBaseErrorData(): BaseErrorData {
    return {
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }

  private createErrorPayload(
    data: Partial<ErrorReport> & { message: string }
  ): ErrorReport {
    const baseData = this.createBaseErrorData();
    return {
      ...baseData,
      level: (data.level ?? "error") as "error" | "warning" | "info",
      category: categorizeError(data.message),
      ...data,
    };
  }

  private filterError(context: ErrorContext): ErrorFilterResult {
    const { message, stack, level, source } = context;

    if (message.includes("[ErrorReporter]")) {
      return { shouldReport: false, reason: "internal_debug" };
    }

    if (isReactRouterFutureFlagMessage(message)) {
      return { shouldReport: false, reason: "react_router_future_flag" };
    }

    if (level === "warning" && isDeprecatedReactWarningMessage(message)) {
      return { shouldReport: false, reason: "deprecated_react_warning" };
    }

    if (
      level === "error" &&
      message.includes("Uncaught Error") &&
      !hasRelevantSourceInStack(stack)
    ) {
      return { shouldReport: false, reason: "no_relevant_source" };
    }

    if (
      level === "error" &&
      source &&
      VENDOR_PATTERNS.some((pattern) => pattern.test(source)) &&
      !hasRelevantSourceInStack(stack)
    ) {
      return { shouldReport: false, reason: "vendor_only_error" };
    }

    const deduplicationResult = globalDeduplication.shouldReport(
      context,
      false
    );
    if (!deduplicationResult.shouldReport)
      return { shouldReport: false, reason: deduplicationResult.reason };

    return { shouldReport: true };
  }

  public report(error: ErrorReport): void {
    if (!this.isInitialized || typeof window === "undefined") {
      return;
    }

    try {
      this.errorQueue.push(error);

      if (this.errorQueue.length > this.maxQueueSize) {
        this.errorQueue.shift();
      }

      this.processQueue();
    } catch (err) { // Swallow reporting errors in client
    }
  }

  private async processQueue() {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;
    const errorsToReport = [...this.errorQueue];
    this.errorQueue = [];

    try {
      for (const error of errorsToReport) {
        await this.sendError(error);
      }
    } catch (err) {
      logger.error("[ErrorReporter] Failed to report errors", err);
      this.errorQueue.unshift(...errorsToReport);
    } finally {
      this.isReporting = false;
    }
  }

  private async sendError(error: ErrorReport) {
    let lastError: Error | unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      let timeoutId: NodeJS.Timeout;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

        const response = await fetch(this.reportingEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(error),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
          throw new Error(result.error || "Unknown error occurred");
        }

        logger.debug("[ErrorReporter] Error reported successfully", { message: error.message });
        return;
      } catch (err) {
        lastError = err;
        clearTimeout(timeoutId);

        if (attempt < this.maxRetries) {
          const delay = this.baseRetryDelay * Math.pow(2, attempt) + Math.random() * 1000;
          logger.debug("[ErrorReporter] Retrying error report", {
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delay: Math.round(delay),
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logger.error("[ErrorReporter] Failed to send error after retries", lastError);
    throw lastError;
  }

  public dispose(): void {
    if (this.originalConsoleWarn) {
      console.warn = this.originalConsoleWarn;
    }
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
    this.isInitialized = false;
  }
}

export { ErrorReporter };
