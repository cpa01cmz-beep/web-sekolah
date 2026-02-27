import type { Context, Next } from 'hono'
import { integrationMonitor } from '../integration-monitor'
import { logger } from '../logger'
import { mapStatusToErrorCode } from '../../shared/error-utils'

interface ErrorWithCode extends Error {
  code?: string
}

export function errorMonitoring() {
  return async (c: Context, next: Next) => {
    try {
      await next()
    } catch (error) {
      const status = c.res.status || 500
      let code = 'INTERNAL_SERVER_ERROR'
      if (error instanceof Error && 'code' in error) {
        const err = error as ErrorWithCode
        code = err.code ?? code
      }
      const endpoint = c.req.path

      integrationMonitor.recordApiError(code, status, endpoint)
      throw error
    }
  }
}

export function responseErrorMonitoring() {
  return async (c: Context, next: Next) => {
    await next()

    const status = c.res.status
    if (status >= 400) {
      const code = mapStatusToErrorCode(status)
      const endpoint = c.req.path

      integrationMonitor.recordApiError(code, status, endpoint)
      logger.debug('HTTP error response recorded', {
        status,
        code,
        endpoint,
      })
    }
  }
}
