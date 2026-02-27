import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debug, info, warn, error, createChildLogger, resetLogger, logger } from '../logger'
import pino from 'pino'

vi.mock('pino')

describe('Logger (Frontend)', () => {
  let mockPinoLogger: any
  let mockConsoleLog: any
  let mockConsoleWarn: any
  let mockConsoleError: any

  beforeEach(() => {
    mockConsoleLog = vi.fn()
    mockConsoleWarn = vi.fn()
    mockConsoleError = vi.fn()

    vi.stubGlobal('console', {
      log: mockConsoleLog,
      warn: mockConsoleWarn,
      error: mockConsoleError,
    })

    mockPinoLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnValue({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      }),
    }

    vi.mocked(pino).mockReturnValue(mockPinoLogger)
    resetLogger()

    vi.stubGlobal('import', {
      meta: {
        env: {
          DEV: true,
          VITE_LOG_LEVEL: 'debug',
        },
      },
    })
  })

  afterEach(() => {
    resetLogger()
    vi.unstubAllGlobals()
  })

  describe('debug', () => {
    it('should log debug messages', () => {
      debug('Test debug message', { userId: '123' })

      expect(mockPinoLogger.debug).toHaveBeenCalledWith({ userId: '123' }, 'Test debug message')
    })

    it('should log debug messages without context', () => {
      debug('Test debug message')

      expect(mockPinoLogger.debug).toHaveBeenCalledWith({}, 'Test debug message')
    })

    it('should handle context with multiple fields', () => {
      debug('Test message', { userId: '123', action: 'login', timestamp: '2026-01-07' })

      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        { userId: '123', action: 'login', timestamp: '2026-01-07' },
        'Test message'
      )
    })
  })

  describe('info', () => {
    it('should log info messages', () => {
      info('User logged in', { userId: '123', email: 'user@example.com' })

      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { userId: '123', email: 'user@example.com' },
        'User logged in'
      )
    })

    it('should log info messages without context', () => {
      info('Application started')

      expect(mockPinoLogger.info).toHaveBeenCalledWith({}, 'Application started')
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      warn('Cache miss', { key: 'user:123' })

      expect(mockPinoLogger.warn).toHaveBeenCalledWith({ key: 'user:123' }, 'Cache miss')
    })

    it('should log warning messages without context', () => {
      warn('Deprecated API usage')

      expect(mockPinoLogger.warn).toHaveBeenCalledWith({}, 'Deprecated API usage')
    })
  })

  describe('error', () => {
    it('should log error messages with Error object', () => {
      const testError = new Error('Test error')
      error('API request failed', testError, { endpoint: '/api/users' })

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        {
          endpoint: '/api/users',
          error: {
            message: 'Test error',
            stack: testError.stack,
            name: 'Error',
          },
        },
        'API request failed'
      )
    })

    it('should log error messages without error object', () => {
      error('Something went wrong', undefined, { userId: '123' })

      expect(mockPinoLogger.error).toHaveBeenCalledWith({ userId: '123' }, 'Something went wrong')
    })

    it('should log error messages without context', () => {
      const testError = new Error('Test error')
      error('Failed to fetch', testError)

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Test error',
            stack: testError.stack,
            name: 'Error',
          },
        },
        'Failed to fetch'
      )
    })

    it('should handle non-Error error objects', () => {
      error('Error occurred', { customError: 'Custom error message' })

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        {
          error: { customError: 'Custom error message' },
        },
        'Error occurred'
      )
    })

    it('should handle null error value', () => {
      error('Error occurred', null, { userId: '123' })

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { userId: '123', error: null },
        'Error occurred'
      )
    })

    it('should combine error object and context', () => {
      const testError = new Error('Database connection failed')
      error('Database error', testError, { query: 'SELECT * FROM users' })

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        {
          query: 'SELECT * FROM users',
          error: {
            message: 'Database connection failed',
            stack: testError.stack,
            name: 'Error',
          },
        },
        'Database error'
      )
    })
  })

  describe('createChildLogger', () => {
    it('should create child logger with context', () => {
      const childLogger = createChildLogger({ requestId: 'req-123', userId: 'user-456' })

      expect(mockPinoLogger.child).toHaveBeenCalledWith({
        requestId: 'req-123',
        userId: 'user-456',
      })
    })

    it('should use child logger for debug messages', () => {
      const childLogger = createChildLogger({ requestId: 'req-123' })
      childLogger.debug('Processing request')

      const childInstance = mockPinoLogger.child.mock.results[0].value
      expect(childInstance.debug).toHaveBeenCalledWith({}, 'Processing request')
    })

    it('should use child logger for info messages', () => {
      const childLogger = createChildLogger({ requestId: 'req-123' })
      childLogger.info('Request completed')

      const childInstance = mockPinoLogger.child.mock.results[0].value
      expect(childInstance.info).toHaveBeenCalledWith({}, 'Request completed')
    })

    it('should use child logger for warn messages', () => {
      const childLogger = createChildLogger({ requestId: 'req-123' })
      childLogger.warn('Slow request')

      const childInstance = mockPinoLogger.child.mock.results[0].value
      expect(childInstance.warn).toHaveBeenCalledWith({}, 'Slow request')
    })

    it('should use child logger for error messages with Error object', () => {
      const childLogger = createChildLogger({ requestId: 'req-123' })
      const testError = new Error('Processing failed')
      childLogger.error('Request failed', testError)

      const childInstance = mockPinoLogger.child.mock.results[0].value
      expect(childInstance.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Processing failed',
            stack: testError.stack,
            name: 'Error',
          },
        },
        'Request failed'
      )
    })

    it('should allow child logger to add additional context', () => {
      const childLogger = createChildLogger({ requestId: 'req-123' })
      childLogger.info('Processing', { step: 'validation' })

      const childInstance = mockPinoLogger.child.mock.results[0].value
      expect(childInstance.info).toHaveBeenCalledWith({ step: 'validation' }, 'Processing')
    })

    it('should allow child logger error to add additional context', () => {
      const childLogger = createChildLogger({ requestId: 'req-123' })
      const testError = new Error('Step failed')
      childLogger.error('Step error', testError, { step: 'validation' })

      const childInstance = mockPinoLogger.child.mock.results[0].value
      expect(childInstance.error).toHaveBeenCalledWith(
        {
          step: 'validation',
          error: {
            message: 'Step failed',
            stack: testError.stack,
            name: 'Error',
          },
        },
        'Step error'
      )
    })

    it('should create independent child loggers', () => {
      const childLogger1 = createChildLogger({ requestId: 'req-123' })
      const childLogger2 = createChildLogger({ requestId: 'req-456' })

      expect(mockPinoLogger.child).toHaveBeenCalledTimes(2)
      expect(mockPinoLogger.child).toHaveBeenNthCalledWith(1, { requestId: 'req-123' })
      expect(mockPinoLogger.child).toHaveBeenNthCalledWith(2, { requestId: 'req-456' })
    })
  })

  describe('resetLogger', () => {
    it('should reset logger instance', () => {
      vi.clearAllMocks()

      debug('First message')

      resetLogger()

      debug('Second message after reset')

      expect(pino).toHaveBeenCalledTimes(2)
    })
  })

  describe('logger export', () => {
    it('should export logger object with all methods', () => {
      expect(logger).toBeDefined()
      expect(logger.debug).toBe(debug)
      expect(logger.info).toBe(info)
      expect(logger.warn).toBe(warn)
      expect(logger.error).toBe(error)
    })

    it('should allow using logger object', () => {
      logger.debug('Debug via logger')
      logger.info('Info via logger')
      logger.warn('Warn via logger')
      logger.error('Error via logger')

      expect(mockPinoLogger.debug).toHaveBeenCalled()
      expect(mockPinoLogger.info).toHaveBeenCalled()
      expect(mockPinoLogger.warn).toHaveBeenCalled()
      expect(mockPinoLogger.error).toHaveBeenCalled()
    })
  })

  describe('log level filtering', () => {
    it('should create new logger instance after reset in different environment context', () => {
      vi.stubGlobal('window', {})

      vi.clearAllMocks()
      resetLogger()

      debug('Test message')

      expect(pino).toHaveBeenCalled()

      vi.unstubAllGlobals()
    })
  })

  describe('edge cases', () => {
    it('should handle empty context object', () => {
      debug('Test message', {})

      expect(mockPinoLogger.debug).toHaveBeenCalledWith({}, 'Test message')
    })

    it('should handle context with null values', () => {
      debug('Test message', { userId: null, action: undefined })

      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        { userId: null, action: undefined },
        'Test message'
      )
    })

    it('should handle context with nested objects', () => {
      const context = {
        user: { id: '123', name: 'John' },
        meta: { timestamp: '2026-01-07', source: 'web' },
      }
      info('Complex context', context)

      expect(mockPinoLogger.info).toHaveBeenCalledWith(context, 'Complex context')
    })

    it('should handle error with missing stack property', () => {
      const errorWithoutStack = new Error('Test error')
      delete (errorWithoutStack as any).stack

      error('Error without stack', errorWithoutStack)

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Test error',
            stack: undefined,
            name: 'Error',
          },
        },
        'Error without stack'
      )
    })

    it('should handle Error subclasses', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const customError = new CustomError('Custom error occurred')
      error('Custom error', customError)

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Custom error occurred',
            stack: customError.stack,
            name: 'CustomError',
          },
        },
        'Custom error'
      )
    })

    it('should handle error with undefined stack', () => {
      const errorWithUndefinedStack = new Error('Test error')
      ;(errorWithUndefinedStack as any).stack = undefined

      error('Error with undefined stack', errorWithUndefinedStack)

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Test error',
            stack: undefined,
            name: 'Error',
          },
        },
        'Error with undefined stack'
      )
    })
  })

  describe('browser integration', () => {
    it('should use browser write function when window is defined', () => {
      vi.stubGlobal('window', {})
      vi.stubGlobal('import', {
        meta: {
          env: {
            DEV: true,
            VITE_LOG_LEVEL: 'debug',
          },
        },
      })

      resetLogger()

      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({
          browser: expect.any(Object),
        })
      )

      vi.unstubAllGlobals()
    })
  })
})
