import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, notFound } from '../core-utils';
import { ParentDashboardService, CommonDataService, getRoleSpecificFields } from '../domain';
import { withUserValidation } from './route-utils';
import type { Context } from 'hono';

export function parentRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/parents/:id/dashboard', ...withUserValidation('parent', 'dashboard'), async (c: Context) => {
    const requestedParentId = c.req.param('id');
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

  app.get('/api/parents/:id/schedule', ...withUserValidation('parent', 'schedule'), async (c: Context) => {
    const requestedParentId = c.req.param('id');
    const parent = await CommonDataService.getUserById(c.env, requestedParentId);

    if (!parent) {
      return notFound(c, 'Parent not found');
    }

    if (parent.role !== 'parent') {
      return notFound(c, 'Parent not found');
    }

    const roleFields = getRoleSpecificFields(parent);

    if (!roleFields.childId) {
      return notFound(c, 'Parent has no associated child');
    }

    const { schedule } = await CommonDataService.getStudentWithClassAndSchedule(c.env, roleFields.childId);

    if (!schedule) {
      return ok(c, []);
    }

    return ok(c, schedule.items || []);
  });
}
