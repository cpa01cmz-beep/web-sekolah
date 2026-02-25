import { ErrorCode } from '@shared/common-types'

export class DomainError extends Error {
  public readonly code: ErrorCode

  constructor(code: ErrorCode, message: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    Object.setPrototypeOf(this, DomainError.prototype)
  }

  static isDomainError(error: unknown): error is DomainError {
    return error instanceof DomainError
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.NOT_FOUND, message)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.VALIDATION_ERROR, message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.CONFLICT, message)
    this.name = 'ConflictError'
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}
