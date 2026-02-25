import type { Context, Next } from 'hono'
import type { Env } from '../core-utils'
import { logger } from '../logger'
import { forbidden, serverError, bad, notFound, conflict } from '../core-utils'
import { authenticate, authorize } from '../middleware/auth'
import { getCurrentUserId } from '../type-guards'
import { WebhookService } from '../webhook-service'
import { toWebhookPayload } from '../webhook-types'
import { DomainError, NotFoundError, ValidationError, ConflictError } from '../errors'
import { ErrorCode } from '@shared/common-types'

export function validateUserAccess(
  c: Context,
  userId: string,
  requestedId: string,
  role: string,
  resourceType: string = 'data'
): boolean {
  if (userId !== requestedId) {
    logger.warn(`[AUTH] ${role} accessing another ${role} ${resourceType}`, { userId, requestedId })
    forbidden(c, `Access denied: Cannot access another ${role} ${resourceType}`)
    return false
  }
  return true
}

export function withAuth(role: 'student' | 'teacher' | 'parent' | 'admin') {
  return [authenticate(), authorize(role)] as const
}

export function withUserValidation(
  role: 'student' | 'teacher' | 'parent',
  resourceName: string = 'data'
) {
  return [
    authenticate(),
    authorize(role),
    async (c: Context, next: Next) => {
      const userId = getCurrentUserId(c)
      const requestedId = c.req.param('id')

      if (!validateUserAccess(c, userId, requestedId, role, resourceName)) {
        return
      }

      await next()
    },
  ] as const
}

export function withErrorHandler(operationName: string) {
  return <T extends Context>(handler: (c: T) => Promise<Response>) => {
    return async (c: T): Promise<Response> => {
      try {
        return await handler(c)
      } catch (error) {
        if (error instanceof NotFoundError) {
          logger.warn(`Not found during ${operationName}: ${error.message}`)
          return notFound(c, error.message)
        }
        if (error instanceof ValidationError) {
          logger.warn(`Validation error during ${operationName}: ${error.message}`)
          return bad(c, error.message)
        }
        if (error instanceof ConflictError) {
          logger.warn(`Conflict during ${operationName}: ${error.message}`)
          return conflict(c, error.message)
        }
        if (error instanceof DomainError) {
          logger.error(`Domain error during ${operationName}`, error)
          return bad(c, error.message, ErrorCode.BAD_REQUEST)
        }
        logger.error(`Failed to ${operationName}`, error)
        return serverError(c, `Failed to ${operationName}`)
      }
    }
  }
}

export function triggerWebhookSafely(
  env: Env,
  eventType: string,
  payload: unknown,
  context?: Record<string, unknown>
): void {
  WebhookService.triggerEvent(env, eventType, toWebhookPayload(payload)).catch(err => {
    logger.error(`Failed to trigger ${eventType} webhook`, { err, ...context })
  })
}
