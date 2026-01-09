import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, notFound } from '../core-utils';
import { authenticate, authorize } from '../middleware/auth';
import { AnnouncementEntity, ensureAllSeedData } from "../entities";
import { rebuildAllIndexes } from "../index-rebuilder";
import type { CreateUserData, UpdateUserData, Announcement, CreateAnnouncementData, AdminDashboardData, Settings } from "@shared/types";
import { UserService, CommonDataService } from '../domain';
import { WebhookService } from '../webhook-service';
import { toWebhookPayload } from '../webhook-types';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';

export function adminRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/admin/rebuild-indexes', authenticate(), authorize('admin'), async (c: Context) => {
    await rebuildAllIndexes(c.env);
    return ok(c, { message: 'All secondary indexes rebuilt successfully.' });
  });

  app.get('/api/admin/dashboard', authenticate(), authorize('admin'), async (c: Context) => {
    const allUsers = await CommonDataService.getAllUsers(c.env);
    const allClasses = await CommonDataService.getAllClasses(c.env);
    const allAnnouncements = await CommonDataService.getAllAnnouncements(c.env);

    const dashboardData: AdminDashboardData = {
      totalUsers: allUsers.length,
      totalStudents: allUsers.filter(u => u.role === 'student').length,
      totalTeachers: allUsers.filter(u => u.role === 'teacher').length,
      totalParents: allUsers.filter(u => u.role === 'parent').length,
      totalClasses: allClasses.length,
      recentAnnouncements: allAnnouncements.slice(-5).reverse(),
      userDistribution: {
        students: allUsers.filter(u => u.role === 'student').length,
        teachers: allUsers.filter(u => u.role === 'teacher').length,
        parents: allUsers.filter(u => u.role === 'parent').length,
        admins: allUsers.filter(u => u.role === 'admin').length
      }
    };

    return ok(c, dashboardData);
  });

  app.get('/api/admin/users', authenticate(), authorize('admin'), async (c: Context) => {
    const role = c.req.query('role');
    const classId = c.req.query('classId');
    const search = c.req.query('search');

    const allUsers = await CommonDataService.getAllUsers(c.env);

    let filteredUsers = allUsers;

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (classId) {
      filteredUsers = filteredUsers.filter(u => u.role === 'student' && 'classId' in u && u.classId === classId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    return ok(c, filteredUsers);
  });

  app.get('/api/admin/announcements', authenticate(), authorize('admin'), async (c: Context) => {
    const announcements = await CommonDataService.getAllAnnouncements(c.env);
    return ok(c, announcements);
  });

  app.post('/api/admin/announcements', authenticate(), authorize('admin'), async (c: Context) => {
    const announcementData = await c.req.json<CreateAnnouncementData>();
    const authorId = getCurrentUserId(c);

    const now = new Date().toISOString();
    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      title: announcementData.title,
      content: announcementData.content,
      date: now,
      targetRole: announcementData.targetRole || 'all',
      authorId,
      createdAt: now,
      updatedAt: now
    };

    await AnnouncementEntity.create(c.env, newAnnouncement.id, newAnnouncement);
    await WebhookService.triggerEvent(c.env, 'announcement.created', toWebhookPayload(newAnnouncement));

    return ok(c, newAnnouncement);
  });

  app.get('/api/admin/settings', authenticate(), authorize('admin'), async (c: Context) => {
    const settings: Settings = {
      schoolName: c.env.SCHOOL_NAME || 'SMA Negeri 1 Jakarta',
      academicYear: c.env.ACADEMIC_YEAR || '2024-2025',
      semester: parseInt(c.env.SEMESTER || '1'),
      allowRegistration: c.env.ALLOW_REGISTRATION === 'true',
      maintenanceMode: c.env.MAINTENANCE_MODE === 'true'
    };

    return ok(c, settings);
  });

  app.put('/api/admin/settings', authenticate(), authorize('admin'), async (c: Context) => {
    const updates = await c.req.json<Partial<Settings>>();
    const updatedSettings: Settings = {
      schoolName: updates.schoolName || c.env.SCHOOL_NAME || 'SMA Negeri 1 Jakarta',
      academicYear: updates.academicYear || c.env.ACADEMIC_YEAR || '2024-2025',
      semester: updates.semester ?? parseInt(c.env.SEMESTER || '1'),
      allowRegistration: updates.allowRegistration ?? c.env.ALLOW_REGISTRATION === 'true',
      maintenanceMode: updates.maintenanceMode ?? c.env.MAINTENANCE_MODE === 'true'
    };

    return ok(c, updatedSettings);
  });
}
