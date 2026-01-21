import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, notFound } from '../core-utils';
import type { StudentDashboardData, StudentCardData } from "@shared/types";
import { GRADE_A_THRESHOLD, GRADE_B_THRESHOLD, GRADE_C_THRESHOLD, PASSING_SCORE_THRESHOLD, GRADE_PRECISION_FACTOR } from '../constants';
import { GradeService, CommonDataService, StudentDashboardService } from '../domain';
import { withUserValidation, withErrorHandler } from './route-utils';
import type { Context } from 'hono';

export function studentRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/students/:id/dashboard', ...withUserValidation('student', 'dashboard'), withErrorHandler('get student dashboard')(async (c: Context) => {
    const requestedStudentId = c.req.param('id');
    try {
      const dashboardData = await StudentDashboardService.getDashboardData(c.env, requestedStudentId);
      return ok(c, dashboardData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found')) {
        return notFound(c, errorMessage);
      }
      throw error;
    }
  }));

  app.get('/api/students/:id/schedule', ...withUserValidation('student', 'schedule'), withErrorHandler('get student schedule')(async (c: Context) => {
    const requestedStudentId = c.req.param('id');
    const { student, classData, schedule } = await CommonDataService.getStudentWithClassAndSchedule(c.env, requestedStudentId);
    if (!student || !student.classId || !classData || !schedule) {
      return notFound(c, 'Student or class not found');
    }
    return ok(c, schedule?.items || []);
  }));

  app.get('/api/students/:id/card', ...withUserValidation('student', 'card'), withErrorHandler('get student card')(async (c: Context) => {
    const requestedStudentId = c.req.param('id');
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
      averageScore: Math.round(averageScore * GRADE_PRECISION_FACTOR) / GRADE_PRECISION_FACTOR,
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
  }));
}
