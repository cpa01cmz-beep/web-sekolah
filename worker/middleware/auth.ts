import type { Context, Next, Env as HonoEnv } from 'hono';
import { jwtVerify, SignJWT } from 'jose';
import type { JWTPayload } from 'jose';
import { logger } from '../logger';

export interface AuthContext {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'teacher' | 'parent' | 'admin';
  };
}

export interface JwtPayload extends JWTPayload {
  sub: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}

async function getSecretKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function generateToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string = '1h'
): Promise<string> {
  const key = await getSecretKey(secret);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
  return token;
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<JwtPayload | null> {
  try {
    const key = await getSecretKey(secret);
    const { payload } = await jwtVerify(token, key);
    return payload as JwtPayload;
  } catch (error) {
    logger.error('[AUTH] Token verification failed', error);
    return null;
  }
}

export function authenticate(secretEnvVar: string = 'JWT_SECRET') {
  return async (c: Context<{ Bindings: { [key: string]: string } }>, next: Next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json(
        {
          success: false,
          error: 'Missing authorization header',
          code: 'UNAUTHORIZED',
        },
        401
      );
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return c.json(
        {
          success: false,
          error: 'Invalid authorization format',
          code: 'UNAUTHORIZED',
        },
        401
      );
    }

    const token = parts[1];
    const secret = c.env[secretEnvVar] || '';

    if (!secret) {
      logger.error('[AUTH] JWT_SECRET not configured');
      return c.json(
        {
          success: false,
          error: 'Server configuration error',
          code: 'INTERNAL_SERVER_ERROR',
        },
        500
      );
    }

    const payload = await verifyToken(token, secret);
    if (!payload) {
      return c.json(
        {
          success: false,
          error: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
        },
        401
      );
    }

    (c as any).set('user', {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    await next();
  };
}

export function authorize(...allowedRoles: ('student' | 'teacher' | 'parent' | 'admin')[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        401
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          success: false,
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
        },
        403
      );
    }

    await next();
  };
}

export function optionalAuthenticate(secretEnvVar: string = 'JWT_SECRET') {
  return async (c: Context<{ Bindings: { [key: string]: string } }>, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      await next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      await next();
      return;
    }

    const token = parts[1];
    const secret = c.env[secretEnvVar] || '';

    if (!secret) {
      await next();
      return;
    }

    const payload = await verifyToken(token, secret);
    if (payload) {
      (c as any).set('user', {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      });
    }

    await next();
  };
}
