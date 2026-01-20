import type { Context, Next } from 'hono';
import type { Env } from '../core-utils';
import { logger } from '../logger';
import { forbidden, serverError } from '../core-utils';
import { authenticate, authorize } from '../middleware/auth';
import { getCurrentUserId } from '../type-guards';
import { WebhookService } from '../webhook-service';
import { toWebhookPayload } from '../webhook-types';

export function validateUserAccess(
  c: Context,
  userId: string,
  requestedId: string,
  role: string,
  resourceType: string = 'data'
): boolean {
  if (userId !== requestedId) {
    logger.warn(`[AUTH] ${role} accessing another ${role} ${resourceType}`, { userId, requestedId });
    forbidden(c, `Access denied: Cannot access another ${role} ${resourceType}`);
    return false;
  }
  return true;
}

export function withAuth(role: 'student' | 'teacher' | 'parent' | 'admin') {
  return [authenticate(), authorize(role)] as const;
}

export function withUserValidation(role: 'student' | 'teacher' | 'parent', resourceName: string = 'data') {
  return [
    authenticate(),
    authorize(role),
    async (c: Context, next: Next) => {
      const userId = getCurrentUserId(c);
      const requestedId = c.req.param('id');

      if (!validateUserAccess(c, userId, requestedId, role, resourceName)) {
        return;
      }

      await next();
    }
  ] as const;
}

export function withErrorHandler(operationName: string) {
  return <T extends Context>(handler: (c: T) => Promise<Response>) => {
    return async (c: T): Promise<Response> => {
      try {
        return await handler(c);
      } catch (error) {
        logger.error(`Failed to ${operationName}`, error);
        return serverError(c, `Failed to ${operationName}`);
      }
    };
  };
}

export function triggerWebhookSafely(env: Env, eventType: string, payload: unknown, context?: Record<string, unknown>): void {
  WebhookService.triggerEvent(env, eventType, toWebhookPayload(payload)).catch(err => {
    logger.error(`Failed to trigger ${eventType} webhook`, { err, ...context });
  });
}
