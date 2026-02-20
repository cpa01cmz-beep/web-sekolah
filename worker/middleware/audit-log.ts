import type { Context, Next } from 'hono';
import { logger } from '../logger';

export interface AuditLogEntry {
  timestamp: string;
  requestId: string;
  cfRay?: string;
  action: string;
  userId?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  path: string;
  method: string;
  statusCode: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

const sensitiveOperations = new Set([
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
  'CREATE_GRADE',
  'UPDATE_GRADE',
  'DELETE_GRADE',
  'LOGIN',
  'LOGOUT',
  'CREATE_CLASS',
  'UPDATE_CLASS',
  'DELETE_CLASS',
]);

export function auditLog(action: string) {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();
    const cfRay = c.req.header('CF-Ray');
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';
    const user = c.get('user');

    try {
      await next();

      const duration = Date.now() - startTime;
      const statusCode = c.res.status;
      const success = statusCode >= 200 && statusCode < 400;

      const logEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        requestId,
        cfRay,
        action,
        userId: user?.id,
        userRole: user?.role,
        ip,
        userAgent,
        path: c.req.path,
        method: c.req.method,
        statusCode,
        success,
        metadata: {
          duration: `${duration}ms`,
        },
      };

      if (sensitiveOperations.has(action) || statusCode >= 400) {
        logger.info(`[AUDIT] ${action}`, logEntry);
      }
    } catch (error) {
      const logEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        requestId,
        cfRay,
        action,
        userId: user?.id,
        userRole: user?.role,
        ip,
        userAgent,
        path: c.req.path,
        method: c.req.method,
        statusCode: 500,
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };

      logger.error(`[AUDIT] ${action} - ERROR`, error instanceof Error ? error : 'Unknown error', logEntry);
      throw error;
    }
  };
}

export function requireAuditLog() {
  return (c: Context, next: Next) => {
    const action = c.req.header('X-Action') || c.req.path.split('/').pop()?.toUpperCase() || 'UNKNOWN';
    return auditLog(action)(c, next);
  };
}
