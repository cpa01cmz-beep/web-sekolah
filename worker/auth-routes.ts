import { Hono } from 'hono';
import type { Env } from './core-utils';
import { ok, bad } from './core-utils';
import { UserEntity } from './entities';
import { generateToken, verifyToken, optionalAuthenticate, AuthUser } from './middleware/auth';
import { loginSchema } from './middleware/schemas';
import { logger } from './logger';

export function authRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/auth/verify', optionalAuthenticate(), async (c) => {
    const context = c as any;
    const user = context.get('user') as AuthUser | undefined;

    if (!user) {
      return bad(c, 'Invalid or expired token');
    }

    const dbUser = await new UserEntity(c.env, user.id).getState();
    if (!dbUser) {
      return bad(c, 'User not found');
    }

    return ok(c, {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
      classId: dbUser.role === 'student' ? (dbUser as any).classId : undefined,
      classIds: dbUser.role === 'teacher' ? (dbUser as any).classIds : undefined,
      childId: dbUser.role === 'parent' ? (dbUser as any).childId : undefined,
      studentIdNumber: dbUser.role === 'student' ? (dbUser as any).studentIdNumber : undefined,
    });
  });

  app.post('/api/auth/login', async (c) => {
    try {
      const body = await c.req.json();

      const validationResult = loginSchema.safeParse(body);
      if (!validationResult.success) {
        return bad(c, validationResult.error.issues[0].message);
      }

      const { email, password, role } = validationResult.data;

      const allUsers = (await UserEntity.list(c.env)).items;
      const user = allUsers.find(u => u.email === email && u.role === role);

      if (!user) {
        logger.warn('[AUTH] Login failed - user not found', { email, role });
        return bad(c, 'Invalid credentials');
      }

      if (password.length < 1) {
        logger.warn('[AUTH] Login failed - empty password', { email, role });
        return bad(c, 'Password is required');
      }

      const secret = c.env.JWT_SECRET;
      if (!secret) {
        logger.error('[AUTH] JWT_SECRET not configured');
        return bad(c, 'Server configuration error');
      }

      const token = await generateToken(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        secret,
        '24h'
      );

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        classId: user.role === 'student' ? (user as any).classId : undefined,
        classIds: user.role === 'teacher' ? (user as any).classIds : undefined,
        childId: user.role === 'parent' ? (user as any).childId : undefined,
        studentIdNumber: user.role === 'student' ? (user as any).studentIdNumber : undefined,
      };

      logger.info('[AUTH] User logged in successfully', { userId: user.id, email: user.email, role: user.role });

      return ok(c, {
        token,
        user: userResponse,
      });
    } catch (error) {
      logger.error('[AUTH] Login error', error);
      return bad(c, 'Login failed');
    }
  });
}