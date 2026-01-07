import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, forbidden } from './core-utils';
import {
  UserEntity,
  ensureAllSeedData
} from "./entities";
import { rebuildAllIndexes } from "./index-rebuilder";
import { authenticate, authorize } from './middleware/auth';
import type { Grade, CreateUserData, UpdateUserData } from "@shared/types";
import { logger } from './logger';
import { WebhookService } from './webhook-service';
import { StudentDashboardService } from './domain';
import { TeacherService } from './domain';
import { GradeService } from './domain';
import { UserService } from './domain';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/seed', async (c) => {
    await ensureAllSeedData(c.env);
    return ok(c, { message: 'Database seeded successfully.' });
  });

  app.post('/api/admin/rebuild-indexes', authenticate(), authorize('admin'), async (c) => {
    await rebuildAllIndexes(c.env);
    return ok(c, { message: 'All secondary indexes rebuilt successfully.' });
  });

  app.get('/api/students/:id/dashboard', authenticate(), authorize('student'), async (c) => {
    const context = c as any;
    const userId = context.get('user').id;
    const requestedStudentId = c.req.param('id');

    if (userId !== requestedStudentId) {
      logger.warn('[AUTH] Student accessing another student dashboard', { userId, requestedStudentId });
      return forbidden(c, 'Access denied: Cannot access another student data');
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

  app.get('/api/teachers/:id/classes', authenticate(), authorize('teacher'), async (c) => {
    const context = c as any;
    const userId = context.get('user').id;
    const requestedTeacherId = c.req.param('id');

    if (userId !== requestedTeacherId) {
      logger.warn('[AUTH] Teacher accessing another teacher data', { userId, requestedTeacherId });
      return forbidden(c, 'Access denied: Cannot access another teacher data');
    }

    const classes = await TeacherService.getClasses(c.env, requestedTeacherId);
    return ok(c, classes);
  });

  app.get('/api/classes/:id/students', authenticate(), authorize('teacher'), async (c) => {
    const classId = c.req.param('id');
    const context = c as any;
    const teacherId = context.get('user').id;

    try {
      const studentsWithGrades = await TeacherService.getClassStudentsWithGrades(c.env, classId, teacherId);
      return ok(c, studentsWithGrades);
    } catch (error) {
      if (error instanceof Error && error.message === 'Class not found') {
        return notFound(c, 'Class not found');
      }
      if (error instanceof Error && error.message === 'Teacher not assigned to this class') {
        return forbidden(c, 'Access denied: Teacher not assigned to this class');
      }
      throw error;
    }
  });

  app.put('/api/grades/:id', authenticate(), authorize('teacher'), async (c) => {
    const gradeId = c.req.param('id');
    const { score, feedback } = await c.req.json<{ score: number; feedback: string }>();

    try {
      const updatedGrade = await GradeService.updateGrade(c.env, gradeId, { score, feedback });

      await WebhookService.triggerEvent(c.env, 'grade.updated', updatedGrade as any);

      return ok(c, updatedGrade);
    } catch (error) {
      if (error instanceof Error && error.message === 'Grade not found') {
        return notFound(c, 'Grade not found');
      }
      throw error;
    }
  });

  app.post('/api/grades', authenticate(), authorize('teacher'), async (c) => {
    const gradeData = await c.req.json<Partial<Grade> & { studentId: string; courseId: string }>();

    try {
      const newGrade = await GradeService.createGrade(c.env, gradeData);

      await WebhookService.triggerEvent(c.env, 'grade.created', newGrade as any);

      return ok(c, newGrade);
    } catch (error) {
      if (error instanceof Error) {
        return bad(c, error.message);
      }
      throw error;
    }
  });

  app.get('/api/users', authenticate(), authorize('admin'), async (c) => {
    const users = await UserService.getAllUsers(c.env);
    return ok(c, users);
  });

  app.post('/api/users', authenticate(), authorize('admin'), async (c) => {
    const userData = await c.req.json<CreateUserData>();

    const newUser = await UserService.createUser(c.env, userData);

    await WebhookService.triggerEvent(c.env, 'user.created', newUser as unknown as Record<string, unknown>);

    return ok(c, newUser);
  });

  app.put('/api/users/:id', authenticate(), authorize('admin'), async (c) => {
    const userId = c.req.param('id');
    const userData = await c.req.json<UpdateUserData>();

    try {
      const updatedUser = await UserService.updateUser(c.env, userId, userData);

      await WebhookService.triggerEvent(c.env, 'user.updated', updatedUser as unknown as Record<string, unknown>);

      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      return ok(c, userWithoutPassword);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return notFound(c, 'User not found');
      }
      throw error;
    }
  });

  app.delete('/api/users/:id', authenticate(), authorize('admin'), async (c) => {
    const userId = c.req.param('id');

    const user = await new UserEntity(c.env, userId).getState();
    const result = await UserService.deleteUser(c.env, userId);

    if (result.deleted && user) {
      await WebhookService.triggerEvent(c.env, 'user.deleted', { id: userId, role: user.role } as Record<string, unknown>);
    }

    return ok(c, result);
  });
}
