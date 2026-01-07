import { Hono } from 'hono';
import type { Env } from './core-utils';
import { ok, bad, unauthorized, notFound, serverError } from './core-utils';
import { UserEntity } from './entities';
import { generateToken, verifyToken, optionalAuthenticate, AuthUser } from './middleware/auth';
import { loginSchema } from './middleware/schemas';
import { logger } from './logger';
import { verifyPassword } from './password-utils';
import { getRoleSpecificFields } from './type-guards';

export function authRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/auth/verify', optionalAuthenticate(), async (c) => {
    const context = c as any;
    const user = context.get('user') as AuthUser | undefined;

    if (!user) {
      return unauthorized(c, 'Invalid or expired token');
    }

    const dbUser = await new UserEntity(c.env, user.id).getState();
    if (!dbUser) {
      return notFound(c, 'User not found');
    }

    const roleFields = getRoleSpecificFields(dbUser);

    return ok(c, {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
      classId: roleFields.classId,
      classIds: roleFields.classIds,
      childId: roleFields.childId,
      studentIdNumber: roleFields.studentIdNumber,
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
        return bad(c, 'Invalid email or role combination');
      }

      if (!user.passwordHash) {
        logger.warn('[AUTH] Login failed - user has no password hash set', { email, role });
        return bad(c, 'User account not properly configured. Please contact administrator.');
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        logger.warn('[AUTH] Login failed - invalid password', { email, role });
        return bad(c, 'Invalid email, role, or password');
      }

      const secret = c.env.JWT_SECRET;
      if (!secret) {
        logger.error('[AUTH] JWT_SECRET not configured');
        return serverError(c, 'Server configuration error');
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

      const roleFields = getRoleSpecificFields(user);

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        classId: roleFields.classId,
        classIds: roleFields.classIds,
        childId: roleFields.childId,
        studentIdNumber: roleFields.studentIdNumber,
      };

      logger.info('[AUTH] User logged in successfully', { userId: user.id, email: user.email, role: user.role });

      return ok(c, {
        token,
        user: userResponse,
      });
    } catch (error) {
      logger.error('[AUTH] Login error', error);
      return serverError(c, 'Login failed due to server error');
    }
  });
}
