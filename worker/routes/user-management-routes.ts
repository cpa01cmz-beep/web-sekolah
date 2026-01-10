import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, bad, notFound } from '../core-utils';
import type { CreateUserData, UpdateUserData, Grade } from "@shared/types";
import { UserService, CommonDataService, GradeService } from '../domain';
import { WebhookService } from '../webhook-service';
import { toWebhookPayload } from '../webhook-types';
import { withAuth } from './route-utils';
import type { Context } from 'hono';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/users', ...withAuth('admin'), async (c: Context) => {
    const users = await UserService.getAllUsers(c.env);
    return ok(c, users);
  });

  app.post('/api/users', ...withAuth('admin'), async (c: Context) => {
    const userData = await c.req.json<CreateUserData>();
    const newUser = await UserService.createUser(c.env, userData);
    await WebhookService.triggerEvent(c.env, 'user.created', toWebhookPayload(newUser));
    return ok(c, newUser);
  });

  app.put('/api/users/:id', ...withAuth('admin'), async (c: Context) => {
    const userId = c.req.param('id');
    const userData = await c.req.json<UpdateUserData>();
    try {
      const updatedUser = await UserService.updateUser(c.env, userId, userData);
      await WebhookService.triggerEvent(c.env, 'user.updated', toWebhookPayload(updatedUser));
      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      return ok(c, userWithoutPassword);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return notFound(c, 'User not found');
      }
      throw error;
    }
  });

  app.delete('/api/users/:id', ...withAuth('admin'), async (c: Context) => {
    const userId = c.req.param('id');
    const user = await CommonDataService.getUserById(c.env, userId);
    const result = await UserService.deleteUser(c.env, userId);
    if (result.deleted && user) {
      await WebhookService.triggerEvent(c.env, 'user.deleted', toWebhookPayload({ id: userId, role: user.role }));
    }
    return ok(c, result);
  });

  app.put('/api/grades/:id', ...withAuth('teacher'), async (c: Context) => {
    const gradeId = c.req.param('id');
    const { score, feedback } = await c.req.json<{ score: number; feedback: string }>();
    try {
      const updatedGrade = await GradeService.updateGrade(c.env, gradeId, { score, feedback });
      await WebhookService.triggerEvent(c.env, 'grade.updated', toWebhookPayload(updatedGrade));
      return ok(c, updatedGrade);
    } catch (error) {
      if (error instanceof Error && error.message === 'Grade not found') {
        return notFound(c, 'Grade not found');
      }
      throw error;
    }
  });

  app.post('/api/grades', ...withAuth('teacher'), async (c: Context) => {
    const gradeData = await c.req.json<Partial<Grade> & { studentId: string; courseId: string }>();
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
}
