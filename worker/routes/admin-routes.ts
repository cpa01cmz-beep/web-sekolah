import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, bad, notFound } from '../core-utils';
import { AnnouncementEntity, ensureAllSeedData } from "../entities";
import { rebuildAllIndexes } from "../index-rebuilder";
import type { CreateUserData, UpdateUserData, Announcement, CreateAnnouncementData, AdminDashboardData, Settings, SchoolUser, UserRole } from "@shared/types";
import { UserService, CommonDataService, AnnouncementService } from '../domain';
import { withAuth, withErrorHandler, triggerWebhookSafely } from './route-utils';
import { validateBody, validateQuery } from '../middleware/validation';
import { createAnnouncementSchema, updateSettingsSchema, adminUsersQuerySchema, updateAnnouncementSchema } from '../middleware/schemas';
import { logger } from '../logger';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';

export function adminRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/admin/rebuild-indexes', ...withAuth('admin'), withErrorHandler('rebuild indexes')(async (c: Context) => {
    await rebuildAllIndexes(c.env);
    return ok(c, { message: 'All secondary indexes rebuilt successfully.' });
  }));

  app.get('/api/admin/dashboard', ...withAuth('admin'), withErrorHandler('get admin dashboard')(async (c: Context) => {
    const [totalStudents, totalTeachers, totalParents, totalAdmins, recentAnnouncements] = await Promise.all([
      CommonDataService.getUserCountByRole(c.env, 'student'),
      CommonDataService.getUserCountByRole(c.env, 'teacher'),
      CommonDataService.getUserCountByRole(c.env, 'parent'),
      CommonDataService.getUserCountByRole(c.env, 'admin'),
      CommonDataService.getRecentAnnouncementsByRole(c.env, 'all', 5)
    ]);

    const allClasses = await CommonDataService.getAllClasses(c.env);

    const dashboardData: AdminDashboardData = {
      totalUsers: totalStudents + totalTeachers + totalParents + totalAdmins,
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses: allClasses.length,
      recentAnnouncements,
      userDistribution: {
        students: totalStudents,
        teachers: totalTeachers,
        parents: totalParents,
        admins: totalAdmins
      }
    };

    return ok(c, dashboardData);
  }));

  app.get('/api/admin/users', ...withAuth('admin'), validateQuery(adminUsersQuerySchema), withErrorHandler('get admin users')(async (c: Context) => {
    const { role, classId, search } = c.get('validatedQuery') as { role?: UserRole; classId?: string; search?: string };

    const users = await CommonDataService.getUsersWithFilters(c.env, { role, classId, search });

    return ok(c, users);
  }));

  app.get('/api/admin/announcements', ...withAuth('admin'), withErrorHandler('get admin announcements')(async (c: Context) => {
    const announcements = await CommonDataService.getAllAnnouncements(c.env);
    return ok(c, announcements);
  }));

  app.post('/api/admin/announcements', ...withAuth('admin'), validateBody(createAnnouncementSchema), withErrorHandler('create announcement')(async (c: Context) => {
    const announcementData = c.get('validatedBody') as CreateAnnouncementData;
    const authorId = getCurrentUserId(c);
    const newAnnouncement = await AnnouncementService.createAnnouncement(c.env, announcementData, authorId);
    triggerWebhookSafely(c.env, 'announcement.created', newAnnouncement, { announcementId: newAnnouncement.id });
    return ok(c, newAnnouncement);
  }));

  app.put('/api/admin/announcements/:id', ...withAuth('admin'), validateBody(updateAnnouncementSchema), withErrorHandler('update announcement')(async (c: Context) => {
    const announcementId = c.req.param('id');
    const updates = c.get('validatedBody') as Partial<CreateAnnouncementData>;
    const updatedAnnouncement = await AnnouncementService.updateAnnouncement(c.env, announcementId, updates);
    triggerWebhookSafely(c.env, 'announcement.updated', updatedAnnouncement, { announcementId: updatedAnnouncement.id });
    return ok(c, updatedAnnouncement);
  }));

  app.get('/api/admin/settings', ...withAuth('admin'), withErrorHandler('get admin settings')(async (c: Context) => {
    const settings = await c.env.STORAGE.get('settings');
    if (!settings) {
      return ok(c, {});
    }
    try {
      return ok(c, JSON.parse(settings));
    } catch (error) {
      logger.error('Failed to parse settings', error);
      return ok(c, {});
    }
  }));

  app.put('/api/admin/settings', ...withAuth('admin'), validateBody(updateSettingsSchema), withErrorHandler('update admin settings')(async (c: Context) => {
    const settingsData = c.get('validatedBody') as Partial<Settings>;
    const currentSettingsJson = await c.env.STORAGE.get('settings');
    let currentSettings = {};
    if (currentSettingsJson) {
      try {
        currentSettings = JSON.parse(currentSettingsJson);
      } catch (error) {
        logger.error('Failed to parse current settings', error);
      }
    }
    const updatedSettings = { ...currentSettings, ...settingsData };
    await c.env.STORAGE.put('settings', JSON.stringify(updatedSettings));
    return ok(c, updatedSettings);
  }));
}
