import type { Context, Next } from 'hono';
import { logger } from '../logger';
import { forbidden } from '../core-utils';
import { authenticate, authorize } from '../middleware/auth';
import { getCurrentUserId } from '../type-guards';

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
