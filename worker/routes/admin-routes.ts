import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, bad, notFound } from '../core-utils';
import { AnnouncementEntity, ensureAllSeedData } from "../entities";
import { rebuildAllIndexes } from "../index-rebuilder";
import type { CreateUserData, UpdateUserData, Announcement, CreateAnnouncementData, AdminDashboardData, Settings } from "@shared/types";
import { UserService, CommonDataService, AnnouncementService } from '../domain';
import { withAuth, withErrorHandler, triggerWebhookSafely } from './route-utils';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';

export function adminRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/admin/rebuild-indexes', ...withAuth('admin'), async (c: Context) => {
    await rebuildAllIndexes(c.env);
    return ok(c, { message: 'All secondary indexes rebuilt successfully.' });
  });

  app.get('/api/admin/dashboard', ...withAuth('admin'), async (c: Context) => {
    const allClasses = await CommonDataService.getAllClasses(c.env);
    const allAnnouncements = await CommonDataService.getAllAnnouncements(c.env);

    const [totalStudents, totalTeachers, totalParents, totalAdmins] = await Promise.all([
      CommonDataService.getUserCountByRole(c.env, 'student'),
      CommonDataService.getUserCountByRole(c.env, 'teacher'),
      CommonDataService.getUserCountByRole(c.env, 'parent'),
      CommonDataService.getUserCountByRole(c.env, 'admin')
    ]);

    const dashboardData: AdminDashboardData = {
      totalUsers: totalStudents + totalTeachers + totalParents + totalAdmins,
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses: allClasses.length,
      recentAnnouncements: allAnnouncements.slice(-5).reverse(),
      userDistribution: {
        students: totalStudents,
        teachers: totalTeachers,
        parents: totalParents,
        admins: totalAdmins
      }
    };

    return ok(c, dashboardData);
  });

  app.get('/api/admin/users', ...withAuth('admin'), async (c: Context) => {
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

  app.get('/api/admin/announcements', ...withAuth('admin'), async (c: Context) => {
    const announcements = await CommonDataService.getAllAnnouncements(c.env);
    return ok(c, announcements);
  });

  app.post('/api/admin/announcements', ...withAuth('admin'), withErrorHandler('create announcement')(async (c: Context) => {
    const announcementData = await c.req.json<CreateAnnouncementData>();
    const authorId = getCurrentUserId(c);
    const newAnnouncement = await AnnouncementService.createAnnouncement(c.env, announcementData, authorId);
    triggerWebhookSafely(c.env, 'announcement.created', newAnnouncement, { announcementId: newAnnouncement.id });
    return ok(c, newAnnouncement);
  }));

  app.get('/api/admin/settings', ...withAuth('admin'), async (c: Context) => {
    const settings: Settings = {
      schoolName: c.env.SCHOOL_NAME || 'SMA Negeri 1 Jakarta',
      academicYear: c.env.ACADEMIC_YEAR || '2024-2025',
      semester: parseInt(c.env.SEMESTER || '1'),
      allowRegistration: c.env.ALLOW_REGISTRATION === 'true',
      maintenanceMode: c.env.MAINTENANCE_MODE === 'true'
    };

    return ok(c, settings);
  });

  app.put('/api/admin/settings', ...withAuth('admin'), async (c: Context) => {
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
