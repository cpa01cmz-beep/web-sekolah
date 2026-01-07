import pino from 'pino';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

let instance: pino.Logger | null = null;

function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL;
  if (level && ['debug', 'info', 'warn', 'error'].includes(level)) {
    return level as LogLevel;
  }
  return 'info';
}

function createLogger(): pino.Logger {
  const level = getLogLevel();
  
  return pino({
    level,
    formatters: {
      level: (label) => ({ level: label })
    },
    timestamp: pino.stdTimeFunctions.isoTime
  });
}

function getInstance(): pino.Logger {
  if (!instance) {
    instance = createLogger();
  }
  return instance;
}

export function debug(message: string, context?: LogContext): void {
  getInstance().debug(context || {}, message);
}

export function info(message: string, context?: LogContext): void {
  getInstance().info(context || {}, message);
}

export function warn(message: string, context?: LogContext): void {
  getInstance().warn(context || {}, message);
}

function formatErrorContext(err: Error | unknown, context?: LogContext): LogContext {
  const errorContext: LogContext = { ...context };

  if (err instanceof Error) {
    errorContext.error = {
      message: err.message,
      stack: err.stack,
      name: err.name
    };
  } else if (err !== undefined) {
    errorContext.error = err;
  }

  return errorContext;
}

export function error(message: string, error?: Error | unknown, context?: LogContext): void {
  getInstance().error(formatErrorContext(error, context), message);
}

export function createChildLogger(context: LogContext): {
  debug: (message: string, additionalContext?: LogContext) => void;
  info: (message: string, additionalContext?: LogContext) => void;
  warn: (message: string, additionalContext?: LogContext) => void;
  error: (message: string, error?: Error | unknown, additionalContext?: LogContext) => void;
} {
  const child = getInstance().child(context);
  
  return {
    debug: (message: string, additionalContext?: LogContext) => {
      child.debug(additionalContext || {}, message);
    },
    info: (message: string, additionalContext?: LogContext) => {
      child.info(additionalContext || {}, message);
    },
    warn: (message: string, additionalContext?: LogContext) => {
      child.warn(additionalContext || {}, message);
    },
    error: (message: string, err?: Error | unknown, additionalContext?: LogContext) => {
      child.error(formatErrorContext(err, additionalContext), message);
    }
  };
}

export const logger = {
  debug,
  info,
  warn,
  error
};
