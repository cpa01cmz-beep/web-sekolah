import type { Context, Next } from 'hono'
import { gatewayTimeout } from '../core-utils'
import { EndpointTimeout } from '../config/endpoint-timeout'

interface TimeoutOptions {
  timeoutMs: number
}

const DEFAULT_TIMEOUT = EndpointTimeout.ADMIN.STANDARD

const TIMEOUT_ERROR = Symbol('timeout')
const CLIENT_DISCONNECT_ERROR = Symbol('client-disconnect')

export function timeout(options: TimeoutOptions) {
  const { timeoutMs } = options

  return async (c: Context, next: Next) => {
    const timeoutSignal = AbortSignal.timeout(timeoutMs)
    const requestSignal = c.req.raw?.signal

    const timeoutPromise = new Promise<never>((_, reject) => {
      const handler = () => reject(TIMEOUT_ERROR)
      timeoutSignal.addEventListener('abort', handler, { once: true })
    })

    const disconnectPromise = requestSignal
      ? new Promise<never>((_, reject) => {
          const handler = () => reject(CLIENT_DISCONNECT_ERROR)
          requestSignal.addEventListener('abort', handler, { once: true })
        })
      : null

    const promises: Promise<unknown>[] = [next(), timeoutPromise]
    if (disconnectPromise) {
      promises.push(disconnectPromise)
    }

    try {
      await Promise.race(promises)
    } catch (error) {
      if (error === TIMEOUT_ERROR) {
        return gatewayTimeout(c, 'Request processing timeout')
      }
      if (error === CLIENT_DISCONNECT_ERROR) {
        return new Response(null, { status: 499 })
      }
      throw error
    }
  }
}

export function createTimeoutMiddleware(defaultTimeout: number = DEFAULT_TIMEOUT) {
  return (customTimeout?: number) => {
    return timeout({ timeoutMs: customTimeout || defaultTimeout })
  }
}

export const defaultTimeout = createTimeoutMiddleware(EndpointTimeout.ADMIN.STANDARD)
export const shortTimeout = createTimeoutMiddleware(EndpointTimeout.QUERY.STANDARD)
export const longTimeout = createTimeoutMiddleware(EndpointTimeout.ADMIN.COMPLEX)
export const veryLongTimeout = createTimeoutMiddleware(EndpointTimeout.SYSTEM.REBUILD_INDEXES)
