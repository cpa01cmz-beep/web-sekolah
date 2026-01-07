import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../authService';
import type { BaseUser, UserRole } from '@shared/types';

describe('AuthService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should successfully login a student', async () => {
      const credentials = {
        email: 'student@example.com',
        password: 'password123',
        role: 'student' as UserRole,
      };

      const promise = AuthService.login(credentials);
      
      vi.advanceTimersByTime(500);
      
      const result = await promise;

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(result.user.role).toBe('student');
      expect(result.user.id).toBe('student-01');
      expect(result.token).toBeDefined();
      expect(result.token).toContain('mock-jwt-token');
    });

    it('should successfully login a teacher', async () => {
      const credentials = {
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher' as UserRole,
      };

      const promise = AuthService.login(credentials);
      vi.advanceTimersByTime(500);
      const result = await promise;

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(result.user.role).toBe('teacher');
      expect(result.user.id).toBe('teacher-01');
    });

    it('should successfully login a parent', async () => {
      const credentials = {
        email: 'parent@example.com',
        password: 'password123',
        role: 'parent' as UserRole,
      };

      const promise = AuthService.login(credentials);
      vi.advanceTimersByTime(500);
      const result = await promise;

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(result.user.role).toBe('parent');
      expect(result.user.id).toBe('parent-01');
    });

    it('should successfully login an admin', async () => {
      const credentials = {
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin' as UserRole,
      };

      const promise = AuthService.login(credentials);
      vi.advanceTimersByTime(500);
      const result = await promise;

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(result.user.role).toBe('admin');
      expect(result.user.id).toBe('admin-01');
    });

    it('should throw error when email is missing', async () => {
      const credentials = {
        email: '',
        password: 'password123',
        role: 'student' as UserRole,
      };

      await expect(AuthService.login(credentials)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should throw error when password is missing', async () => {
      const credentials = {
        email: 'student@example.com',
        password: '',
        role: 'student' as UserRole,
      };

      await expect(AuthService.login(credentials)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should use the provided email in the response', async () => {
      const customEmail = 'custom.student@test.com';
      const credentials = {
        email: customEmail,
        password: 'password123',
        role: 'student' as UserRole,
      };

      const promise = AuthService.login(credentials);
      vi.advanceTimersByTime(500);
      const result = await promise;

      expect(result.user.email).toBe(customEmail);
    });

    it('should return unique token for each login', async () => {
      const credentials = {
        email: 'student@example.com',
        password: 'password123',
        role: 'student' as UserRole,
      };

      const promise1 = AuthService.login(credentials);
      vi.advanceTimersByTime(500);
      const result1 = await promise1;
      
      vi.advanceTimersByTime(100);
      
      const promise2 = AuthService.login(credentials);
      vi.advanceTimersByTime(500);
      const result2 = await promise2;

      expect(result1.token).not.toBe(result2.token);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const promise = AuthService.logout();
      vi.advanceTimersByTime(500);
      await expect(promise).resolves.not.toThrow();
    });

    it('should resolve to undefined', async () => {
      const promise = AuthService.logout();
      vi.advanceTimersByTime(500);
      const result = await promise;
      expect(result).toBeUndefined();
    });

    it('should simulate API delay', async () => {
      const promise = AuthService.logout();
      
      vi.advanceTimersByTime(499);
      let resolved = false;
      promise.then(() => { resolved = true; });
      
      expect(resolved).toBe(false);
      
      vi.advanceTimersByTime(1);
      await promise;
      
      expect(resolved).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when token is not provided', async () => {
      const result = await AuthService.getCurrentUser('');
      expect(result).toBeNull();
    });

    it('should return null for invalid token format', async () => {
      const invalidToken = 'invalid-token';
      const result = await AuthService.getCurrentUser(invalidToken);
      expect(result).toBeNull();
    });

    it('should return student user for student token', async () => {
      const studentToken = 'mock-jwt-token-student01-1234567890';
      
      const promise = AuthService.getCurrentUser(studentToken);
      vi.advanceTimersByTime(500);
      const result = await promise;
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('student-01');
      expect(result!.role).toBe('student');
      expect(result!.email).toBe('budi@example.com');
    });

    it('should return teacher user for teacher token', async () => {
      const teacherToken = 'mock-jwt-token-teacher01-1234567890';
      
      const promise = AuthService.getCurrentUser(teacherToken);
      vi.advanceTimersByTime(500);
      const result = await promise;
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('teacher-01');
      expect(result!.role).toBe('teacher');
      expect(result!.email).toBe('siti@example.com');
    });

    it('should return parent user for parent token', async () => {
      const parentToken = 'mock-jwt-token-parent01-1234567890';
      
      const promise = AuthService.getCurrentUser(parentToken);
      vi.advanceTimersByTime(500);
      const result = await promise;
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('parent-01');
      expect(result!.role).toBe('parent');
      expect(result!.email).toBe('ayah.budi@example.com');
    });

    it('should return admin user for admin token', async () => {
      const adminToken = 'mock-jwt-token-admin01-1234567890';
      
      const promise = AuthService.getCurrentUser(adminToken);
      vi.advanceTimersByTime(500);
      const result = await promise;
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('admin-01');
      expect(result!.role).toBe('admin');
      expect(result!.email).toBe('admin@example.com');
    });

    it('should include avatar URL for all user types', async () => {
      const studentToken = 'mock-jwt-token-student-01-1234567890';
      
      const promise = AuthService.getCurrentUser(studentToken);
      vi.advanceTimersByTime(500);
      const result = await promise;
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('student-01');
      expect(result!.role).toBe('student');
      expect(result!.email).toBe('budi@example.com');
      expect(result!.avatarUrl).toBeDefined();
      expect(result!.avatarUrl).toContain('pravatar.cc');
    });
  });
});
