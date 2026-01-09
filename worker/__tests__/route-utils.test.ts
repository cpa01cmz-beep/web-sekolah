import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateUserAccess } from '../routes/route-utils';
import type { Context } from 'hono';

describe('route-utils', () => {
  let mockContext: Context;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockContext = {
      set: vi.fn(),
      get: vi.fn(),
      json: vi.fn((data: unknown, status?: number) => ({
        json: data,
        status: status || 200,
      })),
      status: vi.fn(() => mockContext),
      req: {
        param: vi.fn(),
        query: vi.fn(),
        header: vi.fn(),
        path: vi.fn(),
        method: vi.fn(),
      },
      res: {
        status: 200,
        headers: new Headers(),
      },
    } as unknown as Context;

    mockNext = vi.fn();
  });

  describe('validateUserAccess', () => {
    describe('Happy Path - Access Granted', () => {
      it('should return true when userId matches requestedId for student', () => {
        const userId = 'student-123';
        const requestedId = 'student-123';
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
        expect(mockContext.status).not.toHaveBeenCalled();
        expect(mockContext.json).not.toHaveBeenCalled();
      });

      it('should return true when userId matches requestedId for teacher', () => {
        const userId = 'teacher-456';
        const requestedId = 'teacher-456';
        const role = 'teacher';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
        expect(mockContext.status).not.toHaveBeenCalled();
        expect(mockContext.json).not.toHaveBeenCalled();
      });

      it('should return true when userId matches requestedId for parent', () => {
        const userId = 'parent-789';
        const requestedId = 'parent-789';
        const role = 'parent';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
        expect(mockContext.status).not.toHaveBeenCalled();
        expect(mockContext.json).not.toHaveBeenCalled();
      });

      it('should return true when userId matches requestedId for admin', () => {
        const userId = 'admin-001';
        const requestedId = 'admin-001';
        const role = 'admin';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
        expect(mockContext.status).not.toHaveBeenCalled();
        expect(mockContext.json).not.toHaveBeenCalled();
      });

      it('should use default resourceType "data" when not specified', () => {
        const userId = 'student-123';
        const requestedId = 'student-123';
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
      });

      it('should use custom resourceType when specified', () => {
        const userId = 'teacher-456';
        const requestedId = 'teacher-456';
        const role = 'teacher';
        const resourceType = 'grades';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(true);
      });
    });

    describe('Sad Path - Access Denied', () => {
      it('should return false and call forbidden() when userId does not match requestedId for student', () => {
        const userId = 'student-123';
        const requestedId = 'student-456';
        const role = 'student';
        const resourceType = 'grades';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should return false and call forbidden() when userId does not match requestedId for teacher', () => {
        const userId = 'teacher-456';
        const requestedId = 'teacher-789';
        const role = 'teacher';
        const resourceType = 'dashboard';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should return false and call forbidden() when userId does not match requestedId for parent', () => {
        const userId = 'parent-789';
        const requestedId = 'parent-999';
        const role = 'parent';
        const resourceType = 'schedule';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should return false and call forbidden() when userId does not match requestedId for admin', () => {
        const userId = 'admin-001';
        const requestedId = 'admin-002';
        const role = 'admin';
        const resourceType = 'settings';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should include both userIds in forbidden() error message context', () => {
        const userId = 'student-123';
        const requestedId = 'student-456';
        const role = 'student';
        const resourceType = 'data';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should handle cross-role access attempts (student accessing teacher data)', () => {
        const userId = 'student-123';
        const requestedId = 'teacher-456';
        const role = 'teacher';
        const resourceType = 'dashboard';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should handle empty userId', () => {
        const userId = '';
        const requestedId = 'student-123';
        const role = 'student';
        const resourceType = 'data';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should handle empty requestedId', () => {
        const userId = 'student-123';
        const requestedId = '';
        const role = 'student';
        const resourceType = 'data';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });
    });

    describe('Edge Cases', () => {
      it('should handle userId and requestedId with special characters', () => {
        const userId = 'user@domain.com';
        const requestedId = 'user@domain.com';
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
      });

      it('should handle userId and requestedId with hyphens and underscores', () => {
        const userId = 'user-id_123_special';
        const requestedId = 'user-id_123_special';
        const role = 'teacher';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
      });

      it('should handle userId and requestedId with UUID format', () => {
        const userId = '550e8400-e29b-41d4-a716-446655440000';
        const requestedId = '550e8400-e29b-41d4-a716-446655440000';
        const role = 'parent';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
      });

      it('should handle case-sensitive userId comparison', () => {
        const userId = 'Student-123';
        const requestedId = 'student-123';
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should handle whitespace in userId or requestedId', () => {
        const userId = 'student-123';
        const requestedId = ' student-123 ';
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should handle extremely long userId strings', () => {
        const longId = 'a'.repeat(1000);
        const userId = longId;
        const requestedId = longId;
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
        expect(mockContext.json).not.toHaveBeenCalled();
      });

      it('should handle different but similar userIds (one character difference)', () => {
        const userId = 'student-123';
        const requestedId = 'student-124';
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });
    });

    describe('Security Scenarios', () => {
      it('should prevent student accessing another student grades', () => {
        const userId = 'student-001';
        const requestedId = 'student-002';
        const role = 'student';
        const resourceType = 'grades';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should prevent student accessing another student schedule', () => {
        const userId = 'student-001';
        const requestedId = 'student-002';
        const role = 'student';
        const resourceType = 'schedule';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should prevent teacher accessing another teacher dashboard', () => {
        const userId = 'teacher-001';
        const requestedId = 'teacher-002';
        const role = 'teacher';
        const resourceType = 'dashboard';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should prevent teacher accessing another teacher announcements', () => {
        const userId = 'teacher-001';
        const requestedId = 'teacher-002';
        const role = 'teacher';
        const resourceType = 'announcements';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should prevent parent accessing another parent dashboard', () => {
        const userId = 'parent-001';
        const requestedId = 'parent-002';
        const role = 'parent';
        const resourceType = 'dashboard';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should prevent admin accessing another admin settings', () => {
        const userId = 'admin-001';
        const requestedId = 'admin-002';
        const role = 'admin';
        const resourceType = 'settings';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });
    });

    describe('Performance Considerations', () => {
      it('should use strict equality for comparison (===)', () => {
        const userId = '123';
        const requestedId = 123 as unknown as string;
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should not perform type coercion', () => {
        const userId = '123';
        const requestedId = '123';
        const role = 'student';

        const result = validateUserAccess(mockContext, userId, requestedId, role);

        expect(result).toBe(true);
        expect(mockContext.json).not.toHaveBeenCalled();
      });
    });

    describe('Resource Type Variations', () => {
      it('should handle custom resourceType "card"', () => {
        const userId = 'student-123';
        const requestedId = 'student-456';
        const role = 'student';
        const resourceType = 'card';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should handle custom resourceType "profile"', () => {
        const userId = 'teacher-456';
        const requestedId = 'teacher-789';
        const role = 'teacher';
        const resourceType = 'profile';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });

      it('should handle empty string resourceType', () => {
        const userId = 'student-123';
        const requestedId = 'student-456';
        const role = 'student';
        const resourceType = '';

        const result = validateUserAccess(mockContext, userId, requestedId, role, resourceType);

        expect(result).toBe(false);
        expect(mockContext.json).toHaveBeenCalled();
      });
    });
  });
});
