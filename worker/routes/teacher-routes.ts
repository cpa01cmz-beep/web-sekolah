import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, bad, notFound } from '../core-utils';
import { authenticate, authorize } from '../middleware/auth';
import type { TeacherDashboardData, Announcement, CreateAnnouncementData, SubmitGradeData, Grade } from "@shared/types";

import { GradeService, CommonDataService, AnnouncementService } from '../domain';
import { WebhookService } from '../webhook-service';
import { toWebhookPayload } from '../webhook-types';
import { withAuth, withUserValidation } from './route-utils';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';
import { logger } from '../logger';

export function teacherRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/teachers/:id/dashboard', ...withUserValidation('teacher', 'dashboard'), async (c: Context) => {
    const requestedTeacherId = c.req.param('id');
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

  app.get('/api/teachers/:id/announcements', ...withUserValidation('teacher', 'announcements'), async (c: Context) => {
    const filteredAnnouncements = await CommonDataService.getAnnouncementsByRole(c.env, 'teacher');
    return ok(c, filteredAnnouncements);
  });

  app.post('/api/teachers/grades', ...withAuth('teacher'), async (c: Context) => {
    const gradeData = await c.req.json<SubmitGradeData>();
    try {
      const newGrade = await GradeService.createGrade(c.env, gradeData);
      WebhookService.triggerEvent(c.env, 'grade.created', toWebhookPayload(newGrade)).catch(err => {
        logger.error('Failed to trigger grade.created webhook', { err, gradeId: newGrade.id });
      });
      return ok(c, newGrade);
    } catch (error) {
      if (error instanceof Error) {
        return bad(c, error.message);
      }
      throw error;
    }
  });

  app.post('/api/teachers/announcements', ...withAuth('teacher'), async (c: Context) => {
    const announcementData = await c.req.json<CreateAnnouncementData>();
    const authorId = getCurrentUserId(c);
    try {
      const newAnnouncement = await AnnouncementService.createAnnouncement(c.env, announcementData, authorId);
      WebhookService.triggerEvent(c.env, 'announcement.created', toWebhookPayload(newAnnouncement)).catch(err => {
        logger.error('Failed to trigger announcement.created webhook', { err, announcementId: newAnnouncement.id });
      });
      return ok(c, newAnnouncement);
    } catch (error) {
      if (error instanceof Error) {
        return bad(c, error.message);
      }
      throw error;
    }
  });
}
