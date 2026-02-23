import { describe, it, expect } from 'vitest'
import { TimeoutError } from '../errors/TimeoutError'
import { ErrorCode } from '@shared/common-types'

describe('TimeoutError', () => {
  describe('constructor', () => {
    it('should create an error with default message', () => {
      const error = new TimeoutError(5000)

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(TimeoutError)
      expect(error.name).toBe('TimeoutError')
      expect(error.message).toBe('Request timeout')
      expect(error.code).toBe(ErrorCode.TIMEOUT)
      expect(error.timeoutMs).toBe(5000)
    })

    it('should create an error with custom message', () => {
      const error = new TimeoutError(10000, 'Custom timeout message')

      expect(error.message).toBe('Custom timeout message')
      expect(error.timeoutMs).toBe(10000)
    })

    it('should have correct prototype chain', () => {
      const error = new TimeoutError(5000)

      expect(Object.getPrototypeOf(error)).toBe(TimeoutError.prototype)
    })
  })

  describe('isTimeoutError', () => {
    it('should return true for TimeoutError instances', () => {
      const error = new TimeoutError(5000)

      expect(TimeoutError.isTimeoutError(error)).toBe(true)
    })

    it('should return false for regular Error instances', () => {
      const error = new Error('Some error')

      expect(TimeoutError.isTimeoutError(error)).toBe(false)
    })

    it('should return false for non-error values', () => {
      expect(TimeoutError.isTimeoutError(null)).toBe(false)
      expect(TimeoutError.isTimeoutError(undefined)).toBe(false)
      expect(TimeoutError.isTimeoutError('error')).toBe(false)
      expect(TimeoutError.isTimeoutError(123)).toBe(false)
      expect(TimeoutError.isTimeoutError({})).toBe(false)
    })

    it('should work with instanceof operator', () => {
      const error = new TimeoutError(5000)

      expect(error instanceof TimeoutError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })
})
