import type { Context, Next } from 'hono'
import { gatewayTimeout } from '../core-utils'
import { EndpointTimeout } from '../config/endpoint-timeout'
import { TimeoutError } from '../errors/TimeoutError'

interface TimeoutOptions {
  timeoutMs: number
}

const DEFAULT_TIMEOUT = EndpointTimeout.ADMIN.STANDARD

export function timeout(options: TimeoutOptions) {
  const { timeoutMs } = options

  return async (c: Context, next: Next) => {
    let isComplete = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        if (!isComplete) {
          reject(new TimeoutError(timeoutMs))
        }
      }, timeoutMs)
    })

    try {
      await Promise.race([next(), timeoutPromise])
      isComplete = true
    } catch (error) {
      if (TimeoutError.isTimeoutError(error)) {
        return gatewayTimeout(c, 'Request processing timeout')
      }
      throw error
    } finally {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }
}

export function createTimeoutMiddleware(defaultTimeout: number = DEFAULT_TIMEOUT) {
  return (customTimeout?: number) => {
    return timeout({ timeoutMs: customTimeout || defaultTimeout })
  }
}

export const defaultTimeout = createTimeoutMiddleware(EndpointTimeout.ADMIN.STANDARD) // 15 seconds
export const shortTimeout = createTimeoutMiddleware(EndpointTimeout.QUERY.STANDARD) // 5 seconds
export const longTimeout = createTimeoutMiddleware(EndpointTimeout.ADMIN.COMPLEX) // 30 seconds
export const veryLongTimeout = createTimeoutMiddleware(EndpointTimeout.SYSTEM.REBUILD_INDEXES) // 60 seconds
