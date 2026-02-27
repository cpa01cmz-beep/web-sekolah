type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const DEFAULT_LOG_LEVEL: LogLevel = 'info'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: string
  timestamp: string
  message: string
  context?: LogContext
}

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel = DEFAULT_LOG_LEVEL
const currentLevelValue = logLevels[currentLevel]

function shouldLog(level: LogLevel): boolean {
  return logLevels[level] >= currentLevelValue
}

function formatTimestamp(): string {
  return new Date().toISOString()
}

function formatLogEntry(level: string, message: string, context?: LogContext): LogEntry {
  const entry: LogEntry = {
    level,
    timestamp: formatTimestamp(),
    message,
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }

  return entry
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) {
    return
  }

  const entry = formatLogEntry(level, message, context)
  const logString = JSON.stringify(entry)

  switch (level) {
    case 'debug':
      console.debug(logString)
      break
    case 'info':
      console.log(logString)
      break
    case 'warn':
      console.warn(logString)
      break
    case 'error':
      console.error(logString)
      break
  }
}

export function debug(message: string, context?: LogContext): void {
  log('debug', message, context)
}

export function info(message: string, context?: LogContext): void {
  log('info', message, context)
}

export function warn(message: string, context?: LogContext): void {
  log('warn', message, context)
}

function formatErrorContext(err: Error | unknown, context?: LogContext): LogContext {
  const errorContext: LogContext = { ...context }

  if (err instanceof Error) {
    errorContext.error = {
      message: err.message,
      stack: err.stack,
      name: err.name,
    }
  } else if (err !== undefined) {
    errorContext.error = err
  }

  return errorContext
}

export function error(message: string, error?: Error | unknown, context?: LogContext): void {
  log('error', message, formatErrorContext(error, context))
}

export function createChildLogger(context: LogContext): {
  debug: (message: string, additionalContext?: LogContext) => void
  info: (message: string, additionalContext?: LogContext) => void
  warn: (message: string, additionalContext?: LogContext) => void
  error: (message: string, error?: Error | unknown, additionalContext?: LogContext) => void
} {
  const baseContext = context

  return {
    debug: (message: string, additionalContext?: LogContext) => {
      const mergedContext = { ...baseContext, ...additionalContext }
      debug(message, mergedContext)
    },
    info: (message: string, additionalContext?: LogContext) => {
      const mergedContext = { ...baseContext, ...additionalContext }
      info(message, mergedContext)
    },
    warn: (message: string, additionalContext?: LogContext) => {
      const mergedContext = { ...baseContext, ...additionalContext }
      warn(message, mergedContext)
    },
    error: (message: string, err?: Error | unknown, additionalContext?: LogContext) => {
      const mergedContext = { ...baseContext, ...additionalContext }
      error(message, err, mergedContext)
    },
  }
}

export const logger = {
  debug,
  info,
  warn,
  error,
}

let testResetCount = 0
export function resetForTesting(): void {
  testResetCount++
}
