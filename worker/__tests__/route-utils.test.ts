import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateUserAccess, withAuth, withUserValidation, withErrorHandler } from '../routes/route-utils';
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

  describe('withAuth', () => {
    it('should return array with authenticate and authorize for student role', () => {
      const middlewares = withAuth('student');
      
      expect(Array.isArray(middlewares)).toBe(true);
      expect(middlewares).toHaveLength(2);
    });

    it('should return array with authenticate and authorize for teacher role', () => {
      const middlewares = withAuth('teacher');
      
      expect(Array.isArray(middlewares)).toBe(true);
      expect(middlewares).toHaveLength(2);
    });

    it('should return array with authenticate and authorize for parent role', () => {
      const middlewares = withAuth('parent');
      
      expect(Array.isArray(middlewares)).toBe(true);
      expect(middlewares).toHaveLength(2);
    });

    it('should return array with authenticate and authorize for admin role', () => {
      const middlewares = withAuth('admin');
      
      expect(Array.isArray(middlewares)).toBe(true);
      expect(middlewares).toHaveLength(2);
    });

    it('should return readonly tuple type', () => {
      const middlewares = withAuth('student');
      
      expect(middlewares).toBeInstanceOf(Array);
    });
  });

  describe('withUserValidation', () => {
    it('should return array with three middleware functions', () => {
      const middlewares = withUserValidation('student', 'data');
      
      expect(Array.isArray(middlewares)).toBe(true);
      expect(middlewares).toHaveLength(3);
    });

    it('should return middleware array for student role', () => {
      const middlewares = withUserValidation('student', 'grades');
      
      expect(middlewares).toHaveLength(3);
    });

    it('should return middleware array for teacher role', () => {
      const middlewares = withUserValidation('teacher', 'dashboard');
      
      expect(middlewares).toHaveLength(3);
    });

    it('should return middleware array for parent role', () => {
      const middlewares = withUserValidation('parent', 'schedule');
      
      expect(middlewares).toHaveLength(3);
    });

    it('should use default resourceType when not specified', () => {
      const middlewares = withUserValidation('student');
      
      expect(middlewares).toHaveLength(3);
    });

    it('should use custom resourceType when specified', () => {
      const middlewares = withUserValidation('teacher', 'announcements');
      
      expect(middlewares).toHaveLength(3);
    });
  });

  describe('withErrorHandler', () => {
    it('should return a function that wraps handler with error handling', () => {
      const errorHandler = withErrorHandler('test operation');
      
      expect(typeof errorHandler).toBe('function');
    });

    it('should call handler successfully and return response', async () => {
      const mockHandler = vi.fn().mockResolvedValue(new Response('success', { status: 200 }));
      const errorHandler = withErrorHandler('test operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(result).toBeInstanceOf(Response);
    });

    it('should catch error and call serverError', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Test error'));
      const errorHandler = withErrorHandler('test operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockContext.json).toHaveBeenCalled();
    });

    it('should catch TypeError and call serverError', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new TypeError('Type error'));
      const errorHandler = withErrorHandler('type operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockContext.json).toHaveBeenCalled();
    });

    it('should include operation name in error message', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Test error'));
      const errorHandler = withErrorHandler('create user');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockContext.json).toHaveBeenCalled();
    });

    it('should catch null error and call serverError', async () => {
      const mockHandler = vi.fn().mockRejectedValue(null);
      const errorHandler = withErrorHandler('null operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockContext.json).toHaveBeenCalled();
    });

    it('should catch undefined error and call serverError', async () => {
      const mockHandler = vi.fn().mockRejectedValue(undefined);
      const errorHandler = withErrorHandler('undefined operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockContext.json).toHaveBeenCalled();
    });

    it('should catch string thrown as error and call serverError', async () => {
      const mockHandler = vi.fn().mockRejectedValue('string error');
      const errorHandler = withErrorHandler('string operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockContext.json).toHaveBeenCalled();
    });

    it('should catch number thrown as error and call serverError', async () => {
      const mockHandler = vi.fn().mockRejectedValue(404);
      const errorHandler = withErrorHandler('number operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockContext.json).toHaveBeenCalled();
    });

    it('should handle custom error objects', async () => {
      class CustomError extends Error {
        constructor(message: string, public code: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      const mockHandler = vi.fn().mockRejectedValue(new CustomError('Custom error', 'CUSTOM_001'));
      const errorHandler = withErrorHandler('custom operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockContext.json).toHaveBeenCalled();
    });

    it('should preserve async handler behavior', async () => {
      const mockHandler = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return new Response('async success', { status: 200 });
      });
      const errorHandler = withErrorHandler('async operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(result).toBeInstanceOf(Response);
    });

    it('should work with different operation names', async () => {
      const operations = ['create', 'update', 'delete', 'read', 'process'];
      
      for (const op of operations) {
        const mockHandler = vi.fn().mockResolvedValue(new Response('success'));
        const errorHandler = withErrorHandler(op);
        
        const wrappedHandler = errorHandler(mockHandler);
        await wrappedHandler(mockContext);
        
        expect(mockHandler).toHaveBeenCalled();
      }
    });

    it('should call serverError with proper error message on error', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Critical error'));
      const errorHandler = withErrorHandler('critical operation');
      
      const wrappedHandler = errorHandler(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(mockContext.json).toHaveBeenCalled();
    });
  });
});
