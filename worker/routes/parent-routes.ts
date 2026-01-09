import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, notFound } from '../core-utils';
import { authenticate, authorize } from '../middleware/auth';
import { ParentDashboardService } from '../domain';
import { validateUserAccess } from './route-utils';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';

export function parentRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/parents/:id/dashboard', authenticate(), authorize('parent'), async (c: Context) => {
    const userId = getCurrentUserId(c);
    const requestedParentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedParentId, 'parent', 'dashboard')) {
      return;
    }

    try {
      const dashboardData = await ParentDashboardService.getDashboardData(c.env, requestedParentId);
      return ok(c, dashboardData);
    } catch (error) {
      if (error instanceof Error && error.message === 'Parent not found') {
        return notFound(c, 'Parent not found');
      }
      if (error instanceof Error && error.message === 'Child not found') {
        return notFound(c, 'Child not found');
      }
      if (error instanceof Error && error.message === 'Parent has no associated child') {
        return notFound(c, 'Parent has no associated child');
      }
      throw error;
    }
  });
}
