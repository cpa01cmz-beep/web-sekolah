import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, bad, notFound } from '../core-utils';
import { authenticate, authorize } from '../middleware/auth';
import type { TeacherDashboardData, Announcement, CreateAnnouncementData, SubmitGradeData, Grade } from "@shared/types";

import { GradeService, CommonDataService, AnnouncementService } from '../domain';
import { WebhookService } from '../webhook-service';
import { toWebhookPayload } from '../webhook-types';
import { validateUserAccess } from './route-utils';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';

export function teacherRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/teachers/:id/dashboard', authenticate(), authorize('teacher'), async (c: Context) => {
    const userId = getCurrentUserId(c);
    const requestedTeacherId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedTeacherId, 'teacher', 'dashboard')) {
      return;
    }

    const { teacher, classes: teacherClasses } = await CommonDataService.getTeacherWithClasses(c.env, requestedTeacherId);
    if (!teacher) {
      return notFound(c, 'Teacher not found');
    }

    const totalStudents = await Promise.all(
      teacherClasses.map(async (cls) => {
        const students = await CommonDataService.getClassStudents(c.env, cls.id);
        return students.length;
      })
    ).then(counts => counts.reduce((sum, count) => sum + count, 0));

    const recentGrades = await GradeService.getCourseGrades(c.env, teacherClasses[0]?.id || '');
    const filteredAnnouncements = await CommonDataService.getRecentAnnouncementsByRole(c.env, 'teacher', 5);

    const dashboardData: TeacherDashboardData = {
      teacherId: teacher.id,
      name: teacher.name,
      email: teacher.email,
      totalClasses: teacherClasses.length,
      totalStudents: totalStudents,
      recentGrades: recentGrades.slice(-5).reverse(),
      recentAnnouncements: filteredAnnouncements
    };

    return ok(c, dashboardData);
  });

  app.get('/api/teachers/:id/announcements', authenticate(), authorize('teacher'), async (c: Context) => {
    const userId = getCurrentUserId(c);
    const requestedTeacherId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedTeacherId, 'teacher', 'announcements')) {
      return;
    }

    const filteredAnnouncements = await CommonDataService.getAnnouncementsByRole(c.env, 'teacher');

    return ok(c, filteredAnnouncements);
  });

  app.post('/api/teachers/grades', authenticate(), authorize('teacher'), async (c: Context) => {
    const gradeData = await c.req.json<SubmitGradeData>();

    try {
      const newGrade = await GradeService.createGrade(c.env, gradeData);
      await WebhookService.triggerEvent(c.env, 'grade.created', toWebhookPayload(newGrade));
      return ok(c, newGrade);
    } catch (error) {
      if (error instanceof Error) {
        return bad(c, error.message);
      }
      throw error;
    }
  });

  app.post('/api/teachers/announcements', authenticate(), authorize('teacher'), async (c: Context) => {
    const announcementData = await c.req.json<CreateAnnouncementData>();
    const authorId = getCurrentUserId(c);

    try {
      const newAnnouncement = await AnnouncementService.createAnnouncement(c.env, announcementData, authorId);
      await WebhookService.triggerEvent(c.env, 'announcement.created', toWebhookPayload(newAnnouncement));
      return ok(c, newAnnouncement);
    } catch (error) {
      if (error instanceof Error) {
        return bad(c, error.message);
      }
      throw error;
    }
  });
}
