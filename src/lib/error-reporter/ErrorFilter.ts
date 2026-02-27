import type { ErrorContext, ErrorFilterResult } from './types'
import {
  isReactRouterFutureFlagMessage,
  isDeprecatedReactWarningMessage,
  hasRelevantSourceInStack,
} from './utils'
import { REACT_WARNING_PATTERN, VENDOR_PATTERNS } from './constants'
import { globalDeduplication } from './deduplication'

export class ErrorFilter {
  filterError(context: ErrorContext): ErrorFilterResult {
    const { message, stack, level, source } = context

    if (this.isInternalDebugMessage(message)) {
      return { shouldReport: false, reason: 'internal_debug' }
    }

    if (this.isReactRouterFutureFlag(message)) {
      return { shouldReport: false, reason: 'react_router_future_flag' }
    }

    if (this.isDeprecatedReactWarning(level, message)) {
      return { shouldReport: false, reason: 'deprecated_react_warning' }
    }

    if (this.isUncaughtErrorWithoutRelevantSource(level, message, stack)) {
      return { shouldReport: false, reason: 'no_relevant_source' }
    }

    if (this.isVendorOnlyError(level, source, stack)) {
      return { shouldReport: false, reason: 'vendor_only_error' }
    }

    const deduplicationResult = globalDeduplication.shouldReport(context, false)
    if (!deduplicationResult.shouldReport) {
      return { shouldReport: false, reason: deduplicationResult.reason }
    }

    return { shouldReport: true }
  }

  private isInternalDebugMessage(message: string): boolean {
    return message.includes('[ErrorReporter]')
  }

  private isReactRouterFutureFlag(message: string): boolean {
    return isReactRouterFutureFlagMessage(message)
  }

  private isDeprecatedReactWarning(level: 'error' | 'warning' | 'info', message: string): boolean {
    return level === 'warning' && isDeprecatedReactWarningMessage(message)
  }

  private isUncaughtErrorWithoutRelevantSource(
    level: 'error' | 'warning' | 'info',
    message: string,
    stack?: string
  ): boolean {
    return (
      level === 'error' && message.includes('Uncaught Error') && !hasRelevantSourceInStack(stack)
    )
  }

  private isVendorOnlyError(
    level: 'error' | 'warning' | 'info',
    source?: string,
    stack?: string
  ): boolean {
    return (
      level === 'error' &&
      source !== undefined &&
      VENDOR_PATTERNS.some(pattern => pattern.test(source)) &&
      !hasRelevantSourceInStack(stack)
    )
  }
}
