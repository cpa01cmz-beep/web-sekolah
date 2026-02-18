import { describe, it, expect } from 'vitest';
import {
  createUserSchema,
  updateUserSchema,
  createGradeSchema,
  updateGradeSchema,
  createClassSchema,
  createAnnouncementSchema,
  loginSchema,
  paramsSchema,
  queryParamsSchema,
  clientErrorSchema,
} from '../schemas';

describe('Validation Schemas', () => {
  describe('createUserSchema', () => {
    describe('happy path', () => {
      it('should accept valid user data for all roles', () => {
        const validStudent = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student' as const,
          classId: '550e8400-e29b-41d4-a716-446655440000',
          studentIdNumber: '12345',
        };

        const validTeacher = {
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'teacher' as const,
          classIds: ['550e8400-e29b-41d4-a716-446655440001'],
        };

        const validParent = {
          name: 'Parent Name',
          email: 'parent@example.com',
          role: 'parent' as const,
          childId: '550e8400-e29b-41d4-a716-446655440000',
        };

        const validAdmin = {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin' as const,
        };

        expect(() => createUserSchema.parse(validStudent)).not.toThrow();
        expect(() => createUserSchema.parse(validTeacher)).not.toThrow();
        expect(() => createUserSchema.parse(validParent)).not.toThrow();
        expect(() => createUserSchema.parse(validAdmin)).not.toThrow();
      });
    });

    describe('sad path - validation errors', () => {
      it('should reject name less than 2 characters', () => {
        const data = {
          name: 'J',
          email: 'test@example.com',
          role: 'student' as const,
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error;
          expect(error.issues[0].message).toContain('at least 2 characters');
        }
      });

      it('should reject name more than 100 characters', () => {
        const data = {
          name: 'A'.repeat(101),
          email: 'test@example.com',
          role: 'student' as const,
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('less than 100 characters');
        }
      });

      it('should reject invalid email', () => {
        const data = {
          name: 'John Doe',
          email: 'invalid-email',
          role: 'student' as const,
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid email address');
        }
      });

      it('should reject invalid role', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'invalid-role' as any,
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid role');
        }
      });

      it('should reject password less than 8 characters', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student' as const,
          password: 'short',
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 8 characters');
        }
      });

      it('should reject password without uppercase letter', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student' as const,
          password: 'lowercase123',
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('uppercase letter');
        }
      });

      it('should reject password without lowercase letter', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student' as const,
          password: 'UPPERCASE123',
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('lowercase letter');
        }
      });

      it('should reject password without number', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student' as const,
          password: 'NoNumbers',
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('number');
        }
      });
    });

    describe('edge cases', () => {
      it('should handle missing optional fields', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student' as const,
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should accept valid UUID for classId', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student' as const,
          classId: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should reject invalid UUID for classId', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student' as const,
          classId: 'not-a-uuid',
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid class ID');
        }
      });

      it('should accept empty array for classIds', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'teacher' as const,
          classIds: [],
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should reject invalid UUID in classIds array', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'teacher' as const,
          classIds: ['550e8400-e29b-41d4-a716-446655440000', 'invalid-uuid'],
        };

        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('updateUserSchema', () => {
    it('should make all fields optional', () => {
      const data = {};
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial updates', () => {
      const data = { name: 'Updated Name' };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should still validate provided fields', () => {
      const data = { email: 'invalid-email' };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('createGradeSchema', () => {
    it('should accept valid grade data', () => {
      const data = {
        studentId: '550e8400-e29b-41d4-a716-446655440000',
        courseId: '660e8400-e29b-41d4-a716-446655440001',
        score: 95,
        feedback: 'Excellent work!',
      };

      const result = createGradeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require studentId and courseId', () => {
      const data = { score: 95 };
      const result = createGradeSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject invalid UUID for studentId', () => {
      const data = {
        studentId: 'not-a-uuid',
        courseId: '660e8400-e29b-41d4-a716-446655440001',
      };

      const result = createGradeSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid student ID');
      }
    });

    it('should reject score less than 0', () => {
      const data = {
        studentId: '550e8400-e29b-41d4-a716-446655440000',
        courseId: '660e8400-e29b-41d4-a716-446655440001',
        score: -1,
      };

      const result = createGradeSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 0');
      }
    });

    it('should reject score greater than 100', () => {
      const data = {
        studentId: '550e8400-e29b-41d4-a716-446655440000',
        courseId: '660e8400-e29b-41d4-a716-446655440001',
        score: 101,
      };

      const result = createGradeSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at most 100');
      }
    });

    it('should reject feedback more than 1000 characters', () => {
      const data = {
        studentId: '550e8400-e29b-41d4-a716-446655440000',
        courseId: '660e8400-e29b-41d4-a716-446655440001',
        feedback: 'A'.repeat(1001),
      };

      const result = createGradeSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 1000 characters');
      }
    });
  });

  describe('updateGradeSchema', () => {
    it('should extend createGradeSchema with required id', () => {
      const data = {};
      const result = updateGradeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept valid grade update', () => {
      const data = {
        id: '770e8400-e29b-41d4-a716-446655440002',
        score: 98,
        feedback: 'Great work!',
      };

      const result = updateGradeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject grade update with only score', () => {
      const data = {
        id: '770e8400-e29b-41d4-a716-446655440002',
        score: 98,
      };

      const result = updateGradeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject grade update with only feedback', () => {
      const data = {
        id: '770e8400-e29b-41d4-a716-446655440002',
        feedback: 'Great work!',
      };

      const result = updateGradeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('createClassSchema', () => {
    it('should accept valid class data', () => {
      const data = {
        name: 'Class 11-A',
        gradeLevel: 11,
        teacherId: '880e8400-e29b-41d4-a716-446655440003',
        academicYear: '2025-2026',
      };

      const result = createClassSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject name less than 2 characters', () => {
      const data = {
        name: 'A',
        gradeLevel: 11,
        teacherId: '880e8400-e29b-41d4-a716-446655440003',
        academicYear: '2025-2026',
      };

      const result = createClassSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject name more than 100 characters', () => {
      const data = {
        name: 'A'.repeat(101),
        gradeLevel: 11,
        teacherId: '880e8400-e29b-41d4-a716-446655440003',
        academicYear: '2025-2026',
      };

      const result = createClassSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject gradeLevel less than 1', () => {
      const data = {
        name: 'Class 11-A',
        gradeLevel: 0,
        teacherId: '880e8400-e29b-41d4-a716-446655440003',
        academicYear: '2025-2026',
      };

      const result = createClassSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject gradeLevel greater than 12', () => {
      const data = {
        name: 'Class 11-A',
        gradeLevel: 13,
        teacherId: '880e8400-e29b-41d4-a716-446655440003',
        academicYear: '2025-2026',
      };

      const result = createClassSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer gradeLevel', () => {
      const data = {
        name: 'Class 11-A',
        gradeLevel: 11.5,
        teacherId: '880e8400-e29b-41d4-a716-446655440003',
        academicYear: '2025-2026',
      };

      const result = createClassSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid academicYear format', () => {
      const data = {
        name: 'Class 11-A',
        gradeLevel: 11,
        teacherId: '880e8400-e29b-41d4-a716-446655440003',
        academicYear: '2025',
      };

      const result = createClassSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('YYYY-YYYY');
      }
    });

    it('should reject invalid UUID for teacherId', () => {
      const data = {
        name: 'Class 11-A',
        gradeLevel: 11,
        teacherId: 'not-a-uuid',
        academicYear: '2025-2026',
      };

      const result = createClassSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('createAnnouncementSchema', () => {
    it('should accept valid announcement data', () => {
      const data = {
        title: 'Important Announcement',
        content: 'This is a detailed announcement for the school community.',
        authorId: '990e8400-e29b-41d4-a716-446655440004',
        targetRole: 'all' as const,
      };

      const result = createAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should use "all" as default targetRole', () => {
      const data = {
        title: 'Important Announcement',
        content: 'This is a detailed announcement.',
        authorId: '990e8400-e29b-41d4-a716-446655440004',
      };

      const result = createAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetRole).toBe('all');
      }
    });

    it('should reject title less than 5 characters', () => {
      const data = {
        title: 'Hi',
        content: 'This is a detailed announcement.',
        authorId: '990e8400-e29b-41d4-a716-446655440004',
      };

      const result = createAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject title more than 200 characters', () => {
      const data = {
        title: 'A'.repeat(201),
        content: 'This is a detailed announcement.',
        authorId: '990e8400-e29b-41d4-a716-446655440004',
      };

      const result = createAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject content less than 10 characters', () => {
      const data = {
        title: 'Important Announcement',
        content: 'Short',
        authorId: '990e8400-e29b-41d4-a716-446655440004',
      };

      const result = createAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject content more than 5000 characters', () => {
      const data = {
        title: 'Important Announcement',
        content: 'A'.repeat(5001),
        authorId: '990e8400-e29b-41d4-a716-446655440004',
      };

      const result = createAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept all valid targetRole values', () => {
      const validAudiences = ['all', 'students', 'teachers', 'parents'] as const;
      
      for (const audience of validAudiences) {
        const data = {
          title: 'Important Announcement',
          content: 'This is a detailed announcement.',
          authorId: '990e8400-e29b-41d4-a716-446655440004',
          targetRole: audience,
        };

        const result = createAnnouncementSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const data = {
        email: 'user@example.com',
        password: 'password123',
        role: 'student' as const,
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'not-an-email',
        password: 'password123',
        role: 'student' as const,
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email address');
      }
    });

    it('should reject empty password', () => {
      const data = {
        email: 'user@example.com',
        password: '',
        role: 'student' as const,
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Password is required');
      }
    });

    it('should reject invalid role', () => {
      const data = {
        email: 'user@example.com',
        password: 'password123',
        role: 'invalid' as any,
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid role');
      }
    });
  });

  describe('paramsSchema', () => {
    it('should accept valid UUID', () => {
      const data = { id: '550e8400-e29b-41d4-a716-446655440000' };
      const result = paramsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const data = { id: 'not-a-uuid' };
      const result = paramsSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid ID format');
      }
    });
  });

  describe('queryParamsSchema', () => {
    it('should accept all valid query params', () => {
      const data = {
        page: '1',
        limit: '10',
        sort: 'createdAt',
        order: 'asc',
      };

      const result = queryParamsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should make all fields optional', () => {
      const data = {};
      const result = queryParamsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should transform page string to number', () => {
      const data = { page: '5' };
      const result = queryParamsSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe('number');
      }
    });

    it('should reject non-numeric page', () => {
      const data = { page: 'not-a-number' };
      const result = queryParamsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid order value', () => {
      const data = { order: 'invalid' };
      const result = queryParamsSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeDefined();
      }
    });
  });

  describe('clientErrorSchema', () => {
    it('should accept valid client error data', () => {
      const data = {
        message: 'JavaScript error occurred',
        url: 'https://example.com/page',
        userAgent: 'Mozilla/5.0',
        timestamp: '2026-01-08T10:00:00.000Z',
        stack: 'Error: Something went wrong\n    at ...',
        componentStack: '...',
        errorBoundary: true,
        source: 'component.js',
        lineno: 42,
        colno: 10,
      };

      const result = clientErrorSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require message field', () => {
      const data = {};
      const result = clientErrorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject message more than 1000 characters', () => {
      const data = { message: 'A'.repeat(1001) };
      const result = clientErrorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid URL', () => {
      const data = {
        message: 'Error occurred',
        url: 'not-a-valid-url',
      };

      const result = clientErrorSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid URL');
      }
    });

    it('should reject userAgent more than 500 characters', () => {
      const data = {
        message: 'Error occurred',
        userAgent: 'A'.repeat(501),
      };

      const result = clientErrorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer lineno', () => {
      const data = {
        message: 'Error occurred',
        lineno: 'not-a-number',
      };

      const result = clientErrorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer colno', () => {
      const data = {
        message: 'Error occurred',
        colno: 'not-a-number',
      };

      const result = clientErrorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject source more than 100 characters', () => {
      const data = {
        message: 'Error occurred',
        source: 'A'.repeat(101),
      };

      const result = clientErrorSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
