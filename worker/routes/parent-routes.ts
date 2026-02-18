import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, notFound } from '../core-utils';
import { ParentDashboardService, CommonDataService, getRoleSpecificFields } from '../domain';
import { withAuth, withUserValidation, withErrorHandler } from './route-utils';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';

export function parentRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/parents/:id/dashboard', ...withUserValidation('parent', 'dashboard'), withErrorHandler('get parent dashboard')(async (c: Context) => {
    const requestedParentId = c.req.param('id');
    try {
      const dashboardData = await ParentDashboardService.getDashboardData(c.env, requestedParentId);
      return ok(c, dashboardData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('no associated child')) {
        return notFound(c, errorMessage);
      }
      throw error;
    }
  }));

  app.get('/api/parents/me/schedule', ...withAuth('parent'), withErrorHandler('get parent schedule')(async (c: Context) => {
    const parentId = getCurrentUserId(c);
    const parent = await CommonDataService.getUserById(c.env, parentId);

    if (!parent) {
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
  }));

  app.get('/api/parents/:id/schedule', ...withUserValidation('parent', 'schedule'), withErrorHandler('get parent schedule')(async (c: Context) => {
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
  }));
}
