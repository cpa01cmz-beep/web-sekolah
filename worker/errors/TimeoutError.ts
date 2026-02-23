import { ErrorCode } from '@shared/common-types'

export class TimeoutError extends Error {
  public readonly code: ErrorCode.TIMEOUT
  public readonly timeoutMs: number

  constructor(timeoutMs: number, message: string = 'Request timeout') {
    super(message)
    this.name = 'TimeoutError'
    this.code = ErrorCode.TIMEOUT
    this.timeoutMs = timeoutMs

    Object.setPrototypeOf(this, TimeoutError.prototype)
  }

  static isTimeoutError(error: unknown): error is TimeoutError {
    return error instanceof TimeoutError
  }
}
