import pino, { Logger as PinoLogger } from 'pino';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

let instance: PinoLogger | null = null;

function getLogLevel(): LogLevel {
  if (import.meta.env.DEV) {
    return (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'debug';
  }
  return (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';
}

function createLogger(): PinoLogger {
  const level = getLogLevel();
  
  if (typeof window !== 'undefined') {
    return pino({
      level,
      browser: {
        write: (obj: { level: number; msg?: string; time?: number; [key: string]: unknown }) => {
          const { level: logLevel, time, ...rest } = obj;
          const prefix = `[${new Date(time || Date.now()).toISOString()}]`;
          
          if (logLevel >= pino.levels.error) {
            console.error(prefix, rest);
          } else if (logLevel >= pino.levels.warn) {
            console.warn(prefix, rest);
          } else {
            console.log(prefix, rest);
          }
        }
      }
    });
  }
  
  return pino({
    level,
    transport: import.meta.env.VITE_LOGGER_TYPE === 'json' 
      ? undefined 
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
  });
}

function getInstance(): PinoLogger {
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

export function error(message: string, error?: Error | unknown, context?: LogContext): void {
  const errorContext: LogContext = { ...context };
  
  if (error instanceof Error) {
    errorContext.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  } else if (error !== undefined) {
    errorContext.error = error;
  }
  
  getInstance().error(errorContext, message);
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
      const errorContext: LogContext = { ...additionalContext };
      
      if (err instanceof Error) {
        errorContext.error = {
          message: err.message,
          stack: err.stack,
          name: err.name
        };
      } else if (err !== undefined) {
        errorContext.error = err;
      }
      
      child.error(errorContext, message);
    }
  };
}

export function resetLogger(): void {
  instance = null;
}

export const logger = {
  debug,
  info,
  warn,
  error
};
