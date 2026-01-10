import type { ImmediatePayload, ErrorContext, ConsoleNative, WrappedConsoleFn } from './types';
import { categorizeError, formatConsoleArgs } from './utils';
import { globalDeduplication } from './deduplication';
import { ApiTimeout, RetryDelay, RetryCount } from '../../config/time';
import { withRetry } from '../resilience/Retry';

const createImmediateErrorPayload = (
  message: string,
  level: "warning" | "error"
): ImmediatePayload => ({
  message,
  stack: new Error().stack,
  url: window.location.href,
  timestamp: new Date().toISOString(),
  level,
  category: categorizeError(message),
});

const shouldReportImmediate = (context: ErrorContext): boolean => {
  const { message, stack, level } = context;

  if (message.includes("[ErrorReporter]")) return false;

  const futurePatterns = [
    /React Router Future Flag Warning/i,
    /future flag to opt-in early/i,
    /reactrouter\.com.*upgrading.*future/i,
    /v7_\w+.*future flag/i,
  ];
  if (futurePatterns.some((pattern) => pattern.test(message))) return false;

  const deprecatedPatterns = [
    /componentWillReceiveProps/,
    /componentWillMount/,
    /componentWillUpdate/,
    /UNSAFE_componentWill/,
  ];
  if (
    level === "warning" &&
    deprecatedPatterns.some((pattern) => pattern.test(message))
  )
    return false;

  const hasSourceCode = stack
    ? stack
        .split("\n")
        .some(
          (line) =>
            /\.tsx?$/.test(line) || /\.jsx?$/.test(line) || /\/src\//.test(line)
        )
    : false;

  if (level === "error" && message.includes("Uncaught Error") && !hasSourceCode)
    return false;

  if (message.includes("Maximum update depth exceeded") && !hasSourceCode)
    return false;

  const deduplicationResult = globalDeduplication.shouldReport(context, true);
  return deduplicationResult.shouldReport;
};

const sendImmediateError = async (payload: ImmediatePayload): Promise<void> => {
  try {
    await withRetry(
      async () => {
        const response = await fetch("/api/client-errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to report immediate error: ${response.status} ${response.statusText}`
          );
        }

        return undefined;
      },
      {
        maxRetries: RetryCount.TWO,
        baseDelay: RetryDelay.ONE_SECOND,
        jitterMs: RetryDelay.ONE_SECOND,
        timeout: ApiTimeout.ONE_MINUTE * 10
      }
    );
  } catch (err) {
    throw err;
  }
};

export const setupImmediateInterceptors = () => {
  if (typeof window === "undefined") return;

  const originalWarn = console.warn;
  const originalError = console.error;

  const createImmediateInterceptor = (
    original: ConsoleNative,
    prefix: string,
    defaultLevel: "warning" | "error"
  ) =>
    function (...args: unknown[]) {
      original.apply(console, args);

      try {
        const message = formatConsoleArgs(args);
        const stack = new Error().stack;
        const level = message.includes("Warning:") ? "warning" : defaultLevel;

        const context: ErrorContext = {
          message: `${prefix} ${message}`,
          stack,
          level,
          url: window.location.href,
        };

        if (shouldReportImmediate(context)) {
          const payload = createImmediateErrorPayload(context.message, level);
          sendImmediateError(payload);
        }
      } catch { // Fail silently
      }
    };

  console.warn = createImmediateInterceptor(
    originalWarn,
    "[WARNING]",
    "warning"
  ) as WrappedConsoleFn;
  (console.warn as WrappedConsoleFn).__errorReporterWrapped = true;
  console.error = createImmediateInterceptor(
    originalError,
    "[CONSOLE ERROR]",
    "error"
  ) as WrappedConsoleFn;
  (console.error as WrappedConsoleFn).__errorReporterWrapped = true;
};
