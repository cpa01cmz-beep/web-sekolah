import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, bad, notFound } from '../core-utils';
import type { CreateUserData, UpdateUserData, Grade } from "@shared/types";
import { UserService, CommonDataService, GradeService } from '../domain';
import { withAuth, withErrorHandler, triggerWebhookSafely } from './route-utils';
import { validateBody } from '../middleware/validation';
import { createUserSchema, updateUserSchema, createGradeSchema, updateGradeSchema } from '../middleware/schemas';
import type { Context } from 'hono';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/users', ...withAuth('admin'), async (c: Context) => {
    const users = await UserService.getAllUsers(c.env);
    return ok(c, users);
  });

  app.post('/api/users', ...withAuth('admin'), validateBody(createUserSchema), async (c: Context) => {
    const userData = c.get('validatedBody') as CreateUserData;
    const newUser = await UserService.createUser(c.env, userData);
    triggerWebhookSafely(c.env, 'user.created', newUser, { userId: newUser.id });
    return ok(c, newUser);
  });

  app.put('/api/users/:id', ...withAuth('admin'), validateBody(updateUserSchema), withErrorHandler('update user')(async (c: Context) => {
    const userId = c.req.param('id');
    const userData = c.get('validatedBody') as UpdateUserData;
    const updatedUser = await UserService.updateUser(c.env, userId, userData);
    triggerWebhookSafely(c.env, 'user.updated', updatedUser, { userId });
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return ok(c, userWithoutPassword);
  }));

  app.delete('/api/users/:id', ...withAuth('admin'), async (c: Context) => {
    const userId = c.req.param('id');
    const user = await CommonDataService.getUserById(c.env, userId);
    const result = await UserService.deleteUser(c.env, userId);
    if (result.deleted && user) {
      triggerWebhookSafely(c.env, 'user.deleted', { id: userId, role: user.role }, { userId });
    }
    return ok(c, result);
  });

  app.put('/api/grades/:id', ...withAuth('teacher'), validateBody(updateGradeSchema), withErrorHandler('update grade')(async (c: Context) => {
    const gradeId = c.req.param('id');
    const validatedData = c.get('validatedBody') as { score: number; feedback: string };
    const updatedGrade = await GradeService.updateGrade(c.env, gradeId, { score: validatedData.score, feedback: validatedData.feedback });
    triggerWebhookSafely(c.env, 'grade.updated', updatedGrade, { gradeId });
    return ok(c, updatedGrade);
  }));

  app.post('/api/grades', ...withAuth('teacher'), validateBody(createGradeSchema), withErrorHandler('create grade')(async (c: Context) => {
    const validatedData = c.get('validatedBody') as typeof createGradeSchema._output;
    const newGrade = await GradeService.createGrade(c.env, validatedData);
    triggerWebhookSafely(c.env, 'grade.created', newGrade, { gradeId: newGrade.id });
    return ok(c, newGrade);
  }));
}
