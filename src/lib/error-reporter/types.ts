export interface BaseErrorData {
  url: string
  timestamp: string
}

export interface ErrorReport extends BaseErrorData {
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: boolean
  errorBoundaryProps?: Record<string, unknown>
  source?: string
  lineno?: number
  colno?: number
  error?: unknown
  level: 'error' | 'warning' | 'info'
  parsedStack?: string
  category?: 'react' | 'javascript' | 'network' | 'user' | 'unknown'
}

export interface ErrorFilterResult {
  shouldReport: boolean
  reason?: string
}

export interface ErrorContext {
  message: string
  stack?: string
  source?: string
  url?: string
  level: 'error' | 'warning' | 'info'
}

export interface ErrorPrecedence {
  hasSourceCode: boolean
  isWarning: boolean
  stackDepth: number
  timestamp: number
}

type ConsoleMethod = 'warn' | 'error'
type ConsoleArgs = unknown[]
type ConsoleNative = (...args: unknown[]) => void

export type { ConsoleMethod, ConsoleArgs, ConsoleNative }

interface WrappedConsoleFn extends ConsoleNative {
  __errorReporterWrapped?: boolean
}

export type { WrappedConsoleFn }

export type ImmediatePayload = Pick<
  ErrorReport,
  'message' | 'stack' | 'url' | 'timestamp' | 'level' | 'category'
>
