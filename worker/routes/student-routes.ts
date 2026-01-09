import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, notFound } from '../core-utils';
import { authenticate, authorize } from '../middleware/auth';
import type { StudentDashboardData, StudentCardData } from "@shared/types";
import { GRADE_A_THRESHOLD, GRADE_B_THRESHOLD, GRADE_C_THRESHOLD, PASSING_SCORE_THRESHOLD } from '../constants';
import { GradeService, CommonDataService, StudentDashboardService } from '../domain';
import { validateUserAccess } from './route-utils';
import { getCurrentUserId } from '../type-guards';
import type { Context } from 'hono';

export function studentRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/students/:id/grades', authenticate(), authorize('student'), async (c: Context) => {
    const userId = getCurrentUserId(c);
    const requestedStudentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedStudentId, 'student', 'grades')) {
      return;
    }

    const grades = await GradeService.getStudentGrades(c.env, requestedStudentId);
    return ok(c, grades);
  });

  app.get('/api/students/:id/schedule', authenticate(), authorize('student'), async (c: Context) => {
    const userId = getCurrentUserId(c);
    const requestedStudentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedStudentId, 'student', 'schedule')) {
      return;
    }

    const { student, classData, schedule } = await CommonDataService.getStudentWithClassAndSchedule(c.env, requestedStudentId);
    if (!student || !student.classId || !classData || !schedule) {
      return notFound(c, 'Student or class not found');
    }

    return ok(c, schedule?.items || []);
  });

  app.get('/api/students/:id/card', authenticate(), authorize('student'), async (c: Context) => {
    const userId = getCurrentUserId(c);
    const requestedStudentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedStudentId, 'student', 'card')) {
      return;
    }

    const { student, classData } = await CommonDataService.getStudentForGrades(c.env, requestedStudentId);
    if (!student || student.role !== 'student') {
      return notFound(c, 'Student not found');
    }

    const grades = await GradeService.getStudentGrades(c.env, requestedStudentId);
    const averageScore = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
      : 0;

    const cardData: StudentCardData = {
      studentId: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatarUrl || '',
      className: classData?.name || 'N/A',
      averageScore: Math.round(averageScore * 10) / 10,
      totalGrades: grades.length,
      gradeDistribution: {
        A: grades.filter(g => g.score >= GRADE_A_THRESHOLD).length,
        B: grades.filter(g => g.score >= GRADE_B_THRESHOLD && g.score < GRADE_A_THRESHOLD).length,
        C: grades.filter(g => g.score >= GRADE_C_THRESHOLD && g.score < GRADE_B_THRESHOLD).length,
        D: grades.filter(g => g.score >= PASSING_SCORE_THRESHOLD && g.score < GRADE_C_THRESHOLD).length,
        F: grades.filter(g => g.score < PASSING_SCORE_THRESHOLD).length,
      },
      recentGrades: grades.slice(-5).reverse()
    };

    return ok(c, cardData);
  });

  app.get('/api/students/:id/dashboard', authenticate(), authorize('student'), async (c: Context) => {
    const userId = getCurrentUserId(c);
    const requestedStudentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedStudentId, 'student', 'dashboard')) {
      return;
    }

    try {
      const dashboardData = await StudentDashboardService.getDashboardData(c.env, requestedStudentId);
      return ok(c, dashboardData);
    } catch (error) {
      if (error instanceof Error && error.message === 'Student not found') {
        return notFound(c, 'Student not found');
      }
      throw error;
    }
  });
}
