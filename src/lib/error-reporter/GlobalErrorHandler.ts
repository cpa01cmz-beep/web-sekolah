import type { ErrorContext } from './types'

export class GlobalErrorHandler {
  private errorCallback: (context: ErrorContext) => void

  constructor(errorCallback: (context: ErrorContext) => void) {
    this.errorCallback = errorCallback
  }

  setupGlobalErrorHandler(): void {
    const originalHandler = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      const errorMessage = typeof message === 'string' ? message : 'Unknown error'

      const context: ErrorContext = {
        message: errorMessage,
        stack: error?.stack,
        source: source || undefined,
        level: 'error',
        url: typeof window !== 'undefined' ? window.location.href : '',
      }

      this.errorCallback(context)

      if (originalHandler) {
        return originalHandler(message, source, lineno, colno, error)
      }
      return true
    }
  }

  setupUnhandledRejectionHandler(): void {
    window.addEventListener('unhandledrejection', event => {
      const error = event.reason
      const errorMessage = error?.message || 'Unhandled Promise Rejection'

      const context: ErrorContext = {
        message: errorMessage,
        stack: error?.stack,
        level: 'error',
        url: typeof window !== 'undefined' ? window.location.href : '',
      }

      this.errorCallback(context)
    })
  }

  dispose(): void {}
}
