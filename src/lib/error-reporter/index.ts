export { ErrorReporter } from './ErrorReporter';
export { globalDeduplication } from './deduplication';
export type {
  BaseErrorData,
  ErrorReport,
  ErrorFilterResult,
  ErrorContext,
  ErrorPrecedence,
  ImmediatePayload,
  ConsoleMethod,
  ConsoleArgs,
  ConsoleNative,
  WrappedConsoleFn,
} from './types';
export {
  REACT_WARNING_PATTERN,
  WARNING_PREFIX,
  CONSOLE_ERROR_PREFIX,
  SOURCE_FILE_PATTERNS,
  VENDOR_PATTERNS,
} from './constants';
export {
  categorizeError,
  isReactRouterFutureFlagMessage,
  isDeprecatedReactWarningMessage,
  hasRelevantSourceInStack,
  parseStackTrace,
  formatConsoleArgs,
} from './utils';
export { setupImmediateInterceptors } from './immediate-interceptors';

import { ErrorReporter } from './ErrorReporter';
import { setupImmediateInterceptors } from './immediate-interceptors';

export const errorReporter = new ErrorReporter();

setupImmediateInterceptors();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    errorReporter.dispose();
  });
}
