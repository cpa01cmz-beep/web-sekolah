import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, bad, notFound } from '../core-utils';
import { authenticate, authorize } from '../middleware/auth';
import type { TeacherDashboardData, Announcement, CreateAnnouncementData, SubmitGradeData } from "@shared/types";

import { GradeService, CommonDataService, AnnouncementService, TeacherService } from '../domain';
import { withAuth, withUserValidation, withErrorHandler, triggerWebhookSafely } from './route-utils';
import { validateBody } from '../middleware/validation';
import { createGradeSchema, createAnnouncementSchema } from '../middleware/schemas';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';

export function teacherRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/teachers/:id/classes', ...withUserValidation('teacher', 'classes'), withErrorHandler('get teacher classes')(async (c: Context) => {
    const teacherId = c.req.param('id');
    const classes = await TeacherService.getClasses(c.env, teacherId);
    return ok(c, classes);
  }));

  app.get('/api/teachers/:id/dashboard', ...withUserValidation('teacher', 'dashboard'), withErrorHandler('get teacher dashboard')(async (c: Context) => {
    const requestedTeacherId = c.req.param('id');
    const { teacher, classes: teacherClasses } = await CommonDataService.getTeacherWithClasses(c.env, requestedTeacherId);
    if (!teacher) {
      return notFound(c, 'Teacher not found');
    }

    const totalStudents = await Promise.all(
      teacherClasses.map(async (cls) => {
        return await CommonDataService.getClassStudentsCount(c.env, cls.id);
      })
    ).then(counts => counts.reduce((sum, count) => sum + count, 0));

    const recentGrades = await CommonDataService.getTeacherRecentGradesWithDetails(c.env, requestedTeacherId, 5);
    const filteredAnnouncements = await CommonDataService.getRecentAnnouncementsByRole(c.env, 'teacher', 5);

    const dashboardData: TeacherDashboardData = {
      teacherId: teacher.id,
      name: teacher.name,
      email: teacher.email,
      totalClasses: teacherClasses.length,
      totalStudents: totalStudents,
      recentGrades: recentGrades,
      recentAnnouncements: filteredAnnouncements
    };

    return ok(c, dashboardData);
  }));

  app.get('/api/teachers/:id/announcements', ...withUserValidation('teacher', 'announcements'), withErrorHandler('get teacher announcements')(async (c: Context) => {
    const filteredAnnouncements = await CommonDataService.getAnnouncementsByRole(c.env, 'teacher');
    return ok(c, filteredAnnouncements);
  }));

  app.get('/api/classes/:id/students', ...withAuth('teacher'), withErrorHandler('get class students with grades')(async (c: Context) => {
    const classId = c.req.param('id');
    const teacherId = getCurrentUserId(c);

    const studentsWithGrades = await TeacherService.getClassStudentsWithGrades(c.env, classId, teacherId);
    return ok(c, studentsWithGrades);
  }));

  app.post('/api/teachers/grades', ...withAuth('teacher'), validateBody(createGradeSchema), withErrorHandler('create grade')(async (c: Context) => {
    const gradeData = c.get('validatedBody') as SubmitGradeData;
    const newGrade = await GradeService.createGrade(c.env, gradeData);
    triggerWebhookSafely(c.env, 'grade.created', newGrade, { gradeId: newGrade.id });
    return ok(c, newGrade);
  }));

  app.post('/api/teachers/announcements', ...withAuth('teacher'), validateBody(createAnnouncementSchema), withErrorHandler('create announcement')(async (c: Context) => {
    const announcementData = c.get('validatedBody') as CreateAnnouncementData;
    const authorId = getCurrentUserId(c);
    const newAnnouncement = await AnnouncementService.createAnnouncement(c.env, announcementData, authorId);
    triggerWebhookSafely(c.env, 'announcement.created', newAnnouncement, { announcementId: newAnnouncement.id });
    return ok(c, newAnnouncement);
  }));

  app.get('/api/classes/:id/students', ...withAuth('teacher'), withErrorHandler('get class students with grades')(async (c: Context) => {
    const classId = c.req.param('id');
    const teacherId = getCurrentUserId(c);
    const students = await TeacherService.getClassStudentsWithGrades(c.env, classId, teacherId);
    return ok(c, students);
  }));
}
