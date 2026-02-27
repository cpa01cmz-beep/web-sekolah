import type { ErrorContext, ErrorPrecedence } from './types'
import { ErrorReportingTime } from '@/config/time'

class GlobalErrorDeduplication {
  private reportedErrors = new Map<
    string,
    { timestamp: number; precedence: ErrorPrecedence; reported: boolean }
  >()
  private readonly ERROR_DEDUPLICATION_WINDOW_MS = ErrorReportingTime.FIVE_SECONDS
  private readonly CLEANUP_INTERVAL_MS = ErrorReportingTime.ONE_MINUTE
  private readonly ERROR_RETENTION_MS = ErrorReportingTime.FIVE_MINUTES
  private lastCleanup = Date.now()

  private calculateErrorPrecedence(context: ErrorContext): ErrorPrecedence {
    const hasSourceCode = this.hasRelevantSourceCode(context.stack)
    const isWarning = context.level === 'warning'
    const stackDepth = context.stack ? context.stack.split('\n').length : 0

    return {
      hasSourceCode,
      isWarning,
      stackDepth,
      timestamp: Date.now(),
    }
  }

  private hasRelevantSourceCode(stack?: string): boolean {
    if (!stack) return false
    return stack
      .split('\n')
      .some(line => /\.tsx?$/.test(line) || /\.jsx?$/.test(line) || /\/src\//.test(line))
  }

  private isHigherPrecedence(
    newPrecedence: ErrorPrecedence,
    existingPrecedence: ErrorPrecedence
  ): boolean {
    if (newPrecedence.hasSourceCode !== existingPrecedence.hasSourceCode) {
      return newPrecedence.hasSourceCode
    }

    if (newPrecedence.isWarning !== existingPrecedence.isWarning) {
      return newPrecedence.isWarning
    }

    if (newPrecedence.stackDepth !== existingPrecedence.stackDepth) {
      return newPrecedence.stackDepth > existingPrecedence.stackDepth
    }

    return newPrecedence.timestamp > existingPrecedence.timestamp
  }

  private generateErrorSignature(context: ErrorContext): string {
    let messageCore = context.message
      .replace(/\[CONSOLE ERROR\]|\[WARNING\]/g, '')
      .replace(/^Uncaught Error:\s*/i, '')
      .replace(/^Error:\s*/i, '')
      .replace(/%s.*?\n/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (messageCore.includes('Maximum update depth exceeded')) {
      messageCore = 'Maximum update depth exceeded'
    } else if (messageCore.includes('The result of getSnapshot should be cached')) {
      messageCore = 'The result of getSnapshot should be cached'
    } else if (messageCore.includes('React Router caught the following error')) {
      messageCore = 'React Router caught error'
    }

    return messageCore
  }

  shouldReport(
    context: ErrorContext,
    immediate = false
  ): { shouldReport: boolean; reason?: string } {
    this.maybeCleanup()

    const signature = this.generateErrorSignature(context)
    const precedence = this.calculateErrorPrecedence(context)
    const existing = this.reportedErrors.get(signature)
    const now = Date.now()

    if (!existing) {
      if (immediate && !precedence.hasSourceCode) {
        return { shouldReport: false, reason: 'no_source_code' }
      }
      this.reportedErrors.set(signature, {
        timestamp: now,
        precedence,
        reported: true,
      })
      return { shouldReport: true }
    }

    if (this.isHigherPrecedence(precedence, existing.precedence)) {
      if (precedence.hasSourceCode && !existing.precedence.hasSourceCode) {
        existing.precedence = precedence
        existing.timestamp = now
        existing.reported = true
        return { shouldReport: true }
      }
    }

    if (now - existing.timestamp < this.ERROR_DEDUPLICATION_WINDOW_MS) {
      return { shouldReport: false, reason: 'duplicate_in_window' }
    }

    if (immediate && !precedence.hasSourceCode) {
      return { shouldReport: false, reason: 'no_source_code' }
    }

    existing.timestamp = now
    existing.precedence = precedence
    existing.reported = true
    return { shouldReport: true }
  }

  private maybeCleanup() {
    const now = Date.now()
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL_MS) {
      const cutoff = now - this.ERROR_RETENTION_MS
      for (const [signature, data] of this.reportedErrors.entries()) {
        if (data.timestamp < cutoff) {
          this.reportedErrors.delete(signature)
        }
      }
      this.lastCleanup = now
    }
  }
}

export const globalDeduplication = new GlobalErrorDeduplication()
