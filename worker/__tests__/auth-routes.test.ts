import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { authRoutes } from '../auth-routes';
import type { Env } from '../types';

describe('Auth Routes - Integration Testing', () => {
  let app: Hono<{ Bindings: Env }>;
  let mockEnv: Env;

  beforeEach(() => {
    app = new Hono<{ Bindings: Env }>();
    mockEnv = {
      GlobalDurableObject: {} as any,
      JWT_SECRET: 'test-secret-key-for-testing',
      ALLOWED_ORIGINS: 'http://localhost:3000',
      ENVIRONMENT: 'development',
    };
    authRoutes(app);
  });

  describe('POST /api/auth/login', () => {
    describe('Happy Path - Successful Login', () => {
      it('should return token and user data for valid credentials', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(200);
        const data = await res.json() as { success: boolean; data: { token: string; user: any } };
        expect(data.success).toBe(true);
        expect(data.data.token).toBeDefined();
        expect(typeof data.data.token).toBe('string');
        expect(data.data.user).toBeDefined();
        expect(data.data.user.id).toBeDefined();
        expect(data.data.user.email).toBe(loginData.email);
        expect(data.data.user.role).toBe(loginData.role);
        expect(data.data.user.passwordHash).toBeUndefined();
      });

      it('should return role-specific fields for student', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await res.json() as { success: boolean; data: { user: any } };
        expect(data.data.user.role).toBe('student');
        expect(data.data.user.studentIdNumber).toBeDefined();
      });

      it('should return role-specific fields for teacher', async () => {
        const loginData = {
          email: 'teacher@example.com',
          password: 'password123',
          role: 'teacher',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await res.json() as { success: boolean; data: { user: any } };
        expect(data.data.user.role).toBe('teacher');
        expect(data.data.user.classIds).toBeDefined();
        expect(Array.isArray(data.data.user.classIds)).toBe(true);
      });

      it('should return role-specific fields for parent', async () => {
        const loginData = {
          email: 'parent@example.com',
          password: 'password123',
          role: 'parent',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await res.json() as { success: boolean; data: { user: any } };
        expect(data.data.user.role).toBe('parent');
        expect(data.data.user.childId).toBeDefined();
      });

      it('should return role-specific fields for admin', async () => {
        const loginData = {
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await res.json() as { success: boolean; data: { user: any } };
        expect(data.data.user.role).toBe('admin');
        expect(data.data.user.classId).toBeUndefined();
        expect(data.data.user.classIds).toBeUndefined();
        expect(data.data.user.childId).toBeUndefined();
        expect(data.data.user.studentIdNumber).toBeUndefined();
      });
    });

    describe('Validation - Request Body Validation', () => {
      it('should reject missing email field', async () => {
        const loginData = {
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('email');
      });

      it('should reject invalid email format', async () => {
        const loginData = {
          email: 'invalid-email',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('email');
      });

      it('should reject missing password field', async () => {
        const loginData = {
          email: 'student@example.com',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('password');
      });

      it('should reject empty password', async () => {
        const loginData = {
          email: 'student@example.com',
          password: '',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('password');
      });

      it('should reject missing role field', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'password123',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('role');
      });

      it('should reject invalid role', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'password123',
          role: 'invalid-role',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('role');
      });

      it('should reject malformed JSON', async () => {
        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{ invalid json }',
        });

        expect(res.status).toBe(500);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
      });
    });

    describe('Sad Path - Authentication Failures', () => {
      it('should return 400 for non-existent user with correct format', async () => {
        const loginData = {
          email: 'nonexistent@example.com',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('email or role');
      });

      it('should return 400 for wrong password', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'wrongpassword',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('email, role, or password');
      });

      it('should return 400 for correct email with wrong role', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'password123',
          role: 'teacher',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('email or role');
      });
    });

    describe('Edge Cases - Configuration Issues', () => {
      it('should return 500 when JWT_SECRET is not configured', async () => {
        app = new Hono<{ Bindings: Env }>();
        const envWithoutSecret: Env = {
          GlobalDurableObject: {} as any,
          ALLOWED_ORIGINS: 'http://localhost:3000',
          ENVIRONMENT: 'development',
        };

        authRoutes(app);

        const loginData = {
          email: 'student@example.com',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(500);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('configuration error');
      });

      it('should handle user without password hash gracefully', async () => {
        const loginData = {
          email: 'user-no-password@example.com',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.status).toBe(400);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('not properly configured');
      });
    });

    describe('Security - Password Hash Not Exposed', () => {
      it('should never return passwordHash in response', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await res.json() as { success: boolean; data: any };
        expect(data.data.user.passwordHash).toBeUndefined();
        expect(data.data.user.password).toBeUndefined();
        expect(JSON.stringify(data.data.user)).not.toContain('password');
      });
    });

    describe('Request/Response Format', () => {
      it('should return correct JSON structure', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await res.json() as any;
        expect(data.success).toBeDefined();
        expect(data.data).toBeDefined();
        expect(data.requestId).toBeDefined();
      });

      it('should set correct Content-Type header', async () => {
        const loginData = {
          email: 'student@example.com',
          password: 'password123',
          role: 'student',
        };

        const res = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        expect(res.headers.get('Content-Type')).toContain('application/json');
      });
    });
  });

  describe('GET /api/auth/verify', () => {
    describe('Happy Path - Valid Token', () => {
      it('should return user data for valid token', async () => {
        const loginRes = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'student@example.com',
            password: 'password123',
            role: 'student',
          }),
        });

        const loginData = await loginRes.json() as { data: { token: string } };

        const verifyRes = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`,
          },
        });

        expect(verifyRes.status).toBe(200);
        const data = await verifyRes.json() as { success: boolean; data: any };
        expect(data.success).toBe(true);
        expect(data.data.id).toBeDefined();
        expect(data.data.email).toBe('student@example.com');
        expect(data.data.role).toBe('student');
        expect(data.data.name).toBeDefined();
        expect(data.data.passwordHash).toBeUndefined();
      });

      it('should include all role-specific fields', async () => {
        const loginRes = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'teacher@example.com',
            password: 'password123',
            role: 'teacher',
          }),
        });

        const loginData = await loginRes.json() as { data: { token: string } };

        const verifyRes = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`,
          },
        });

        const data = await verifyRes.json() as { data: any };
        expect(data.data.classIds).toBeDefined();
        expect(Array.isArray(data.data.classIds)).toBe(true);
      });
    });

    describe('Sad Path - Invalid/Expired Token', () => {
      it('should return 401 for missing Authorization header', async () => {
        const res = await app.request('/api/auth/verify');

        expect(res.status).toBe(401);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid or expired token');
      });

      it('should return 401 for invalid token format', async () => {
        const res = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': 'Invalid token',
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid or expired token');
      });

      it('should return 401 for malformed token', async () => {
        const res = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': 'Bearer invalid-token-string',
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid or expired token');
      });

      it('should return 401 for expired token', async () => {
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleHBpcmVkIiwiZW1haWwiOiJleHBpcmVkQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid';

        const res = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${expiredToken}`,
          },
        });

        expect(res.status).toBe(401);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid or expired token');
      });
    });

    describe('Edge Cases - User Not Found', () => {
      it('should return 404 for valid token but user deleted', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZWxldGVkLXVzZXIiLCJlbWFpbCI6ImRlbGV0ZWRAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTYwMDAwMDAwMH0.invalid';

        const res = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        expect(res.status).toBe(404);
        const data = await res.json() as { success: boolean; error: string };
        expect(data.success).toBe(false);
        expect(data.error).toContain('User not found');
      });
    });

    describe('Security - Password Hash Not Exposed', () => {
      it('should never return passwordHash in verify response', async () => {
        const loginRes = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'student@example.com',
            password: 'password123',
            role: 'student',
          }),
        });

        const loginData = await loginRes.json() as { data: { token: string } };

        const verifyRes = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`,
          },
        });

        const data = await verifyRes.json() as { data: any };
        expect(data.data.passwordHash).toBeUndefined();
        expect(data.data.password).toBeUndefined();
        expect(JSON.stringify(data.data)).not.toContain('password');
      });
    });

    describe('Request/Response Format', () => {
      it('should return correct JSON structure', async () => {
        const loginRes = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'student@example.com',
            password: 'password123',
            role: 'student',
          }),
        });

        const loginData = await loginRes.json() as { data: { token: string } };

        const verifyRes = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`,
          },
        });

        const data = await verifyRes.json() as any;
        expect(data.success).toBeDefined();
        expect(data.data).toBeDefined();
        expect(data.requestId).toBeDefined();
      });

      it('should set correct Content-Type header', async () => {
        const loginRes = await app.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'student@example.com',
            password: 'password123',
            role: 'student',
          }),
        });

        const loginData = await loginRes.json() as { data: { token: string } };

        const verifyRes = await app.request('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`,
          },
        });

        expect(verifyRes.headers.get('Content-Type')).toContain('application/json');
      });
    });
  });
});
