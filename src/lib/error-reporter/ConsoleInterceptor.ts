import type { ConsoleMethod, ConsoleNative, WrappedConsoleFn, ErrorContext } from './types';
import { REACT_WARNING_PATTERN, WARNING_PREFIX, CONSOLE_ERROR_PREFIX } from './constants';

export class ConsoleInterceptor {
  private originalConsoleWarn: typeof console.warn | null = null;
  private originalConsoleError: typeof console.error | null = null;
  private readonly errorCallback: (context: ErrorContext) => void;

  constructor(errorCallback: (context: ErrorContext) => void) {
    this.errorCallback = errorCallback;
  }

  setupConsoleInterceptors(): void {
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
      'error',
      this.originalConsoleError!,
      CONSOLE_ERROR_PREFIX
    ) as WrappedConsoleFn;
    console.warn = this.createConsoleInterceptor(
      'warn',
      this.originalConsoleWarn!,
      WARNING_PREFIX
    ) as WrappedConsoleFn;
  }

  private createConsoleInterceptor(
    method: ConsoleMethod,
    original: ConsoleNative,
    prefix: string
  ): ConsoleNative {
    return (...args: unknown[]) => {
      original.apply(console, args);

      try {
        const message = args
          .map((arg) =>
            typeof arg === 'string'
              ? arg
              : typeof arg === 'object' && arg
              ? JSON.stringify(arg, null, 2)
              : String(arg)
          )
          .join(' ');
        const stack = new Error().stack;
        const level =
          method === 'warn' && message.includes(REACT_WARNING_PATTERN)
            ? 'warning'
            : 'error';

        const context: ErrorContext = {
          message: `${prefix} ${message}`,
          stack,
          level,
          url: typeof window !== 'undefined' ? window.location.href : '',
        };

        this.errorCallback(context);
      } catch {
        /* empty */
      }
    };
  }

  dispose(): void {
    if (this.originalConsoleWarn) {
      console.warn = this.originalConsoleWarn;
    }
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
    this.originalConsoleWarn = null;
    this.originalConsoleError = null;
  }
}
