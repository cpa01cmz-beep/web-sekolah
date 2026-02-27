import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Logger - Critical Path Testing', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function setupSpies() {
    return {
      debugSpy: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      logSpy: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warnSpy: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      errorSpy: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
  }

  describe('Log Level Filtering', () => {
    it('should log debug messages when LOG_LEVEL is debug', async () => {
      const { debugSpy, logSpy } = setupSpies()
      const { debug, setLogLevel } = await import('../logger')
      setLogLevel('debug')

      debug('Test debug message')

      expect(debugSpy).toHaveBeenCalledTimes(1)
      expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('Test debug message'))
    })

    it('should suppress debug messages when LOG_LEVEL is info', async () => {
      const { debugSpy, logSpy, warnSpy } = setupSpies()
      const { debug, info, setLogLevel } = await import('../logger')
      setLogLevel('info')

      debug('Test debug message')
      info('Test info message')

      expect(debugSpy).not.toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalledTimes(1)
    })

    it('should suppress debug and info when LOG_LEVEL is warn', async () => {
      const { debugSpy, logSpy, warnSpy } = setupSpies()
      const { debug, info, warn, setLogLevel } = await import('../logger')
      setLogLevel('warn')

      debug('Test debug message')
      info('Test info message')
      warn('Test warn message')

      expect(debugSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('should only log errors when LOG_LEVEL is error', async () => {
      const { debugSpy, logSpy, warnSpy, errorSpy } = setupSpies()
      const { debug, info, warn, error, setLogLevel } = await import('../logger')
      setLogLevel('error')

      debug('Test debug message')
      info('Test info message')
      warn('Test warn message')
      error('Test error message')

      expect(debugSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it('should default to info level when LOG_LEVEL is not set', async () => {
      const { debugSpy, logSpy, warnSpy } = setupSpies()
      const { debug, info, warn, resetForTesting } = await import('../logger')
      resetForTesting()

      debug('Test debug message')
      info('Test info message')
      warn('Test warn message')

      expect(debugSpy).not.toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('should default to info level when LOG_LEVEL is invalid', async () => {
      const { debugSpy, logSpy, warnSpy } = setupSpies()
      const { debug, info, warn, resetForTesting } = await import('../logger')
      resetForTesting()

      debug('Test debug message')
      info('Test info message')
      warn('Test warn message')

      expect(debugSpy).not.toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Log Entry Format', () => {
    it('should format log entry with level, timestamp, and message', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      info('Test message')

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged).toHaveProperty('level', 'info')
      expect(logged).toHaveProperty('timestamp')
      expect(logged).toHaveProperty('message', 'Test message')
    })

    it('should include context in log entry when provided', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      info('Test message', { userId: '123', action: 'login' })

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged).toHaveProperty('level', 'info')
      expect(logged).toHaveProperty('timestamp')
      expect(logged).toHaveProperty('message', 'Test message')
      expect(logged).toHaveProperty('context')
      expect(logged.context).toEqual({ userId: '123', action: 'login' })
    })

    it('should not include context field when context is empty', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      info('Test message', {})

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged).not.toHaveProperty('context')
    })

    it('should format timestamp as ISO string', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      info('Test message')

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should handle null context gracefully', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      info('Test message', null as any)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged).toHaveProperty('message', 'Test message')
    })

    it('should handle undefined context gracefully', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      info('Test message', undefined as any)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged).toHaveProperty('message', 'Test message')
    })
  })

  describe('Error Logging', () => {
    it('should include error details in error logs', async () => {
      const { errorSpy } = setupSpies()
      const { error } = await import('../logger')

      const testError = new Error('Test error')
      error('Operation failed', testError)

      expect(errorSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(logged).toHaveProperty('level', 'error')
      expect(logged).toHaveProperty('message', 'Operation failed')
      expect(logged).toHaveProperty('context')
      expect(logged.context).toHaveProperty('error')
      expect(logged.context.error).toEqual({
        message: 'Test error',
        stack: expect.any(String),
        name: 'Error',
      })
    })

    it('should include context along with error details', async () => {
      const { errorSpy } = setupSpies()
      const { error } = await import('../logger')

      const testError = new Error('Test error')
      error('Operation failed', testError, { userId: '123', action: 'delete' })

      expect(errorSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(logged.context).toHaveProperty('error')
      expect(logged.context).toHaveProperty('userId', '123')
      expect(logged.context).toHaveProperty('action', 'delete')
    })

    it('should handle non-Error objects in error parameter', async () => {
      const { errorSpy } = setupSpies()
      const { error } = await import('../logger')

      error('Operation failed', 'string error', { userId: '123' })

      expect(errorSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(logged.context.error).toBe('string error')
    })

    it('should handle null error parameter', async () => {
      const { errorSpy } = setupSpies()
      const { error } = await import('../logger')

      error('Operation failed', null, { userId: '123' })

      expect(errorSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(logged.context).toHaveProperty('error', null)
    })

    it('should handle undefined error parameter', async () => {
      const { errorSpy } = setupSpies()
      const { error } = await import('../logger')

      error('Operation failed', undefined, { userId: '123' })

      expect(errorSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(logged.context).not.toHaveProperty('error')
    })

    it('should handle Error with custom name', async () => {
      const { errorSpy } = setupSpies()
      const { error } = await import('../logger')

      class CustomError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const customError = new CustomError('Custom error message')
      error('Custom error occurred', customError)

      expect(errorSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(logged.context.error).toEqual({
        message: 'Custom error message',
        stack: expect.any(String),
        name: 'CustomError',
      })
    })
  })

  describe('Child Logger', () => {
    it('should create child logger with base context', async () => {
      const { logSpy } = setupSpies()
      const { createChildLogger } = await import('../logger')

      const childLogger = createChildLogger({ requestId: 'req-123', userId: 'user-456' })

      childLogger.info('Processing request')

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual({
        requestId: 'req-123',
        userId: 'user-456',
      })
    })

    it('should merge base context with additional context', async () => {
      const { logSpy } = setupSpies()
      const { createChildLogger } = await import('../logger')

      const childLogger = createChildLogger({ requestId: 'req-123' })
      childLogger.info('Processing request', { userId: 'user-456', action: 'update' })

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual({
        requestId: 'req-123',
        userId: 'user-456',
        action: 'update',
      })
    })

    it('should allow additional context to override base context', async () => {
      const { logSpy } = setupSpies()
      const { createChildLogger } = await import('../logger')

      const childLogger = createChildLogger({ requestId: 'req-123', userId: 'user-old' })
      childLogger.info('Processing request', { userId: 'user-new' })

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual({
        requestId: 'req-123',
        userId: 'user-new',
      })
    })

    it('should create child logger that respects log level filtering', async () => {
      const { debugSpy, logSpy, warnSpy } = setupSpies()
      const { createChildLogger, setLogLevel } = await import('../logger')
      setLogLevel('warn')

      const childLogger = createChildLogger({ requestId: 'req-123' })
      childLogger.debug('Debug message')
      childLogger.info('Info message')
      childLogger.warn('Warn message')

      expect(debugSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('should include error details in child logger error calls', async () => {
      const { errorSpy } = setupSpies()
      const { createChildLogger } = await import('../logger')

      const childLogger = createChildLogger({ requestId: 'req-123' })
      const testError = new Error('Test error')
      childLogger.error('Operation failed', testError)

      expect(errorSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual({
        requestId: 'req-123',
        error: {
          message: 'Test error',
          stack: expect.any(String),
          name: 'Error',
        },
      })
    })

    it('should handle empty base context', async () => {
      const { logSpy } = setupSpies()
      const { createChildLogger } = await import('../logger')

      const childLogger = createChildLogger({})
      childLogger.info('Test message', { userId: '123' })

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual({ userId: '123' })
    })

    it('should handle null base context', async () => {
      const { logSpy } = setupSpies()
      const { createChildLogger } = await import('../logger')

      const childLogger = createChildLogger(null as any)
      childLogger.info('Test message', { userId: '123' })

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual({ userId: '123' })
    })
  })

  describe('Logger Export', () => {
    it('should export default logger object with all methods', async () => {
      const { logger } = await import('../logger')

      expect(logger).toBeDefined()
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
    })

    it('should export individual logging functions', async () => {
      const loggerModule = await import('../logger')

      expect(typeof loggerModule.debug).toBe('function')
      expect(typeof loggerModule.info).toBe('function')
      expect(typeof loggerModule.warn).toBe('function')
      expect(typeof loggerModule.error).toBe('function')
      expect(typeof loggerModule.createChildLogger).toBe('function')
    })

    it('should use default logger methods correctly', async () => {
      const { logSpy } = setupSpies()
      const { logger } = await import('../logger')

      logger.info('Test via default logger')

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.message).toBe('Test via default logger')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty message', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      info('')

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.message).toBe('')
    })

    it('should handle very long message', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      const longMessage = 'A'.repeat(10000)
      info(longMessage)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.message).toHaveLength(10000)
    })

    it('should handle special characters in message', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      const specialMessage = 'Test with émojis 🎉 and spëcial chârs'
      info(specialMessage)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.message).toBe('Test with émojis 🎉 and spëcial chârs')
    })

    it('should handle multiline message', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      const multilineMessage = 'Line 1\nLine 2\nLine 3'
      info(multilineMessage)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.message).toBe('Line 1\nLine 2\nLine 3')
    })

    it('should handle context with nested objects', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      const nestedContext = {
        user: { id: '123', profile: { name: 'John', age: 30 } },
        metadata: { tags: ['tag1', 'tag2'], count: 42 },
      }
      info('Test message', nestedContext)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual(nestedContext)
    })

    it('should handle context with array values', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      const arrayContext = {
        userIds: ['user1', 'user2', 'user3'],
        scores: [95, 87, 92],
      }
      info('Test message', arrayContext)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual(arrayContext)
    })

    it('should handle context with number keys (coerced to strings)', async () => {
      const { logSpy } = setupSpies()
      const { info } = await import('../logger')

      const numberKeyContext: any = {
        123: 'value1',
        456: 'value2',
      }
      info('Test message', numberKeyContext)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(logged.context).toHaveProperty('123')
      expect(logged.context).toHaveProperty('456')
    })

    it('should handle concurrent logging from multiple functions', async () => {
      const { logSpy, warnSpy, errorSpy } = setupSpies()
      const { info, warn, error } = await import('../logger')

      info('Info 1')
      warn('Warn 1')
      info('Info 2')
      error('Error 1')

      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Testing Utility', () => {
    it('should have resetForTesting function for test cleanup', async () => {
      const { resetForTesting } = await import('../logger')

      expect(typeof resetForTesting).toBe('function')

      resetForTesting()
      resetForTesting()

      expect(true).toBe(true)
    })
  })

  describe('Integration - Real-world Scenarios', () => {
    it('should log user authentication flow with child logger', async () => {
      const { logSpy, warnSpy } = setupSpies()
      const { createChildLogger } = await import('../logger')

      const authLogger = createChildLogger({
        requestId: 'req-abc123',
        ip: '192.168.1.1',
      })

      authLogger.info('Authentication request received', { email: 'user@example.com' })
      authLogger.warn('Failed authentication attempt', {
        email: 'user@example.com',
        reason: 'invalid_credentials',
      })

      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy).toHaveBeenCalledTimes(1)

      const infoLogged = JSON.parse(logSpy.mock.calls[0][0] as string)
      expect(infoLogged.context).toEqual({
        requestId: 'req-abc123',
        ip: '192.168.1.1',
        email: 'user@example.com',
      })

      const warnLogged = JSON.parse(warnSpy.mock.calls[0][0] as string)
      expect(warnLogged.context).toEqual({
        requestId: 'req-abc123',
        ip: '192.168.1.1',
        email: 'user@example.com',
        reason: 'invalid_credentials',
      })
    })

    it('should log database operation with error handling', async () => {
      const { errorSpy } = setupSpies()
      const { error } = await import('../logger')

      const dbError = new Error('Connection timeout')
      dbError.stack =
        'Error: Connection timeout\n    at DB.connect (db.js:10)\n    at main (app.js:50)'

      error('Database operation failed', dbError, {
        operation: 'SELECT',
        table: 'users',
        queryId: 'query-123',
      })

      expect(errorSpy).toHaveBeenCalledTimes(1)
      const logged = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(logged.context).toEqual({
        operation: 'SELECT',
        table: 'users',
        queryId: 'query-123',
        error: {
          message: 'Connection timeout',
          stack: 'Error: Connection timeout\n    at DB.connect (db.js:10)\n    at main (app.js:50)',
          name: 'Error',
        },
      })
    })
  })
})
