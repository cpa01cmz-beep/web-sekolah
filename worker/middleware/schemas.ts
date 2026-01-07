import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['student', 'teacher', 'parent', 'admin'], {
    message: 'Invalid role. Must be student, teacher, parent, or admin',
  }),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  classId: z.string().uuid('Invalid class ID').optional(),
  classIds: z.array(z.string().uuid()).optional(),
  childId: z.string().uuid('Invalid child ID').optional(),
  studentIdNumber: z.string().min(3).max(20).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const createGradeSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  courseId: z.string().uuid('Invalid course ID'),
  score: z.number().min(0, 'Score must be at least 0').max(100, 'Score must be at most 100').optional(),
  feedback: z.string().max(1000, 'Feedback must be less than 1000 characters').optional(),
});

export const updateGradeSchema = createGradeSchema.partial().extend({
  id: z.string().uuid('Invalid grade ID'),
});

export const createClassSchema = z.object({
  name: z.string().min(2).max(100),
  gradeLevel: z.number().int().min(1).max(12),
  teacherId: z.string().uuid('Invalid teacher ID'),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(5000),
  authorId: z.string().uuid('Invalid author ID'),
  targetAudience: z.enum(['all', 'students', 'teachers', 'parents']).default('all'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'teacher', 'parent', 'admin'], {
    message: 'Invalid role. Must be student, teacher, parent, or admin',
  }),
});

export const paramsSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const clientErrorSchema = z.object({
  message: z.string().min(1, 'Error message is required').max(1000),
  url: z.string().url('Invalid URL').optional(),
  userAgent: z.string().max(500).optional(),
  timestamp: z.string().optional(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  errorBoundary: z.boolean().optional(),
  source: z.string().max(100).optional(),
  lineno: z.number().int().optional(),
  colno: z.number().int().optional(),
});
