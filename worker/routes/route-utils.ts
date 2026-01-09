import type { Context } from 'hono';
import { logger } from '../logger';
import { forbidden } from '../core-utils';

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
