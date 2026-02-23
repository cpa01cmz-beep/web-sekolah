import { z } from 'zod'
import { StatusCodeRanges, ValidationLimits } from '../config/validation'
import type { Context } from 'hono'
import { WEBHOOK_EVENT_TYPES } from '@shared/webhook.types'

const webhookEventTypeSchema = z.enum(WEBHOOK_EVENT_TYPES, {
  message: `Invalid event type. Must be one of: ${WEBHOOK_EVENT_TYPES.join(', ')}`,
})

export const createUserSchema = z.object({
  name: z
    .string()
    .min(ValidationLimits.USER_NAME_MIN_LENGTH, 'Name must be at least 2 characters')
    .max(ValidationLimits.USER_NAME_MAX_LENGTH, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['student', 'teacher', 'parent', 'admin'], {
    message: 'Invalid role. Must be student, teacher, parent, or admin',
  }),
  password: z
    .string()
    .min(
      ValidationLimits.PASSWORD_STRONG_MIN_LENGTH,
      `Password must be at least ${ValidationLimits.PASSWORD_STRONG_MIN_LENGTH} characters`
    )
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  classId: z.string().uuid('Invalid class ID').optional(),
  classIds: z.array(z.string().uuid()).optional(),
  childId: z.string().uuid('Invalid child ID').optional(),
  studentIdNumber: z
    .string()
    .min(ValidationLimits.STUDENT_ID_NUMBER_MIN_LENGTH)
    .max(ValidationLimits.STUDENT_ID_NUMBER_MAX_LENGTH)
    .optional(),
  avatarUrl: z.string().url().optional(),
})

export const updateUserSchema = createUserSchema.partial()

export const createGradeSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  courseId: z.string().uuid('Invalid course ID'),
  score: z
    .number()
    .min(ValidationLimits.GRADE_MIN_SCORE, 'Score must be at least 0')
    .max(ValidationLimits.GRADE_MAX_SCORE, 'Score must be at most 100')
    .optional(),
  feedback: z
    .string()
    .max(ValidationLimits.GRADE_FEEDBACK_MAX_LENGTH, 'Feedback must be less than 1000 characters')
    .optional(),
})

export const updateGradeSchema = createGradeSchema
  .partial()
  .extend({
    id: z.string().uuid('Invalid grade ID'),
  })
  .refine(data => data.score !== undefined && data.feedback !== undefined, {
    message: 'Score and feedback are required for grade update',
  })

export const createClassSchema = z.object({
  name: z
    .string()
    .min(ValidationLimits.USER_NAME_MIN_LENGTH)
    .max(ValidationLimits.USER_NAME_MAX_LENGTH),
  gradeLevel: z
    .number()
    .int()
    .min(ValidationLimits.GRADE_LEVEL_MIN)
    .max(ValidationLimits.GRADE_LEVEL_MAX),
  teacherId: z.string().uuid('Invalid teacher ID'),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'),
})

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(ValidationLimits.ANNOUNCEMENT_TITLE_MIN_LENGTH)
    .max(ValidationLimits.ANNOUNCEMENT_TITLE_MAX_LENGTH),
  content: z
    .string()
    .min(ValidationLimits.ANNOUNCEMENT_CONTENT_MIN_LENGTH)
    .max(ValidationLimits.ANNOUNCEMENT_CONTENT_MAX_LENGTH),
  authorId: z.string().uuid('Invalid author ID'),
  targetRole: z.enum(['all', 'students', 'teachers', 'parents']).default('all'),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial().omit({ authorId: true })

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'teacher', 'parent', 'admin'], {
    message: 'Invalid role. Must be student, teacher, parent, or admin',
  }),
})

export const paramsSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

export const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

export const clientErrorSchema = z.object({
  message: z
    .string()
    .min(ValidationLimits.ERROR_MESSAGE_MIN_LENGTH, 'Error message is required')
    .max(ValidationLimits.ERROR_MESSAGE_MAX_LENGTH),
  url: z.string().url('Invalid URL').optional(),
  userAgent: z.string().max(ValidationLimits.USER_AGENT_MAX_LENGTH).optional(),
  timestamp: z.string().optional(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  errorBoundary: z.boolean().optional(),
  source: z.string().max(ValidationLimits.ERROR_SOURCE_MAX_LENGTH).optional(),
  lineno: z.number().int().optional(),
  colno: z.number().int().optional(),
})

export const updateSettingsSchema = z.object({
  schoolName: z
    .string()
    .min(
      ValidationLimits.SCHOOL_NAME_MIN_LENGTH,
      `School name must be at least ${ValidationLimits.SCHOOL_NAME_MIN_LENGTH} characters`
    )
    .max(
      ValidationLimits.SCHOOL_NAME_MAX_LENGTH,
      `School name must be less than ${ValidationLimits.SCHOOL_NAME_MAX_LENGTH} characters`
    )
    .optional(),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY')
    .optional(),
  semester: z
    .number()
    .int()
    .min(1, 'Semester must be 1 or 2')
    .max(2, 'Semester must be 1 or 2')
    .optional(),
  allowRegistration: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
})

export const createWebhookConfigSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(webhookEventTypeSchema).min(1, 'At least one event must be specified'),
  secret: z
    .string()
    .min(
      ValidationLimits.WEBHOOK_SECRET_MIN_LENGTH,
      `Webhook secret must be at least ${ValidationLimits.WEBHOOK_SECRET_MIN_LENGTH} characters`
    )
    .max(ValidationLimits.WEBHOOK_SECRET_MAX_LENGTH, 'Webhook secret is too long'),
  active: z.boolean().optional(),
})

export const updateWebhookConfigSchema = z.object({
  url: z.string().url('Invalid webhook URL').optional(),
  events: z.array(webhookEventTypeSchema).min(1, 'At least one event must be specified').optional(),
  secret: z
    .string()
    .min(
      ValidationLimits.WEBHOOK_SECRET_MIN_LENGTH,
      `Webhook secret must be at least ${ValidationLimits.WEBHOOK_SECRET_MIN_LENGTH} characters`
    )
    .max(ValidationLimits.WEBHOOK_SECRET_MAX_LENGTH, 'Webhook secret is too long')
    .optional(),
  active: z.boolean().optional(),
})

export const adminUsersQuerySchema = z.object({
  role: z
    .enum(['student', 'teacher', 'parent', 'admin'], {
      message: 'Invalid role. Must be student, teacher, parent, or admin',
    })
    .optional(),
  classId: z.string().uuid('Invalid class ID format').optional(),
  search: z
    .string()
    .max(
      ValidationLimits.SEARCH_QUERY_MAX_LENGTH,
      `Search query must be less than ${ValidationLimits.SEARCH_QUERY_MAX_LENGTH} characters`
    )
    .optional(),
})

export const createMessageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  subject: z
    .string()
    .min(ValidationLimits.MESSAGE_SUBJECT_MIN_LENGTH, 'Subject is required')
    .max(ValidationLimits.MESSAGE_SUBJECT_MAX_LENGTH, 'Subject must be less than 200 characters'),
  content: z
    .string()
    .min(ValidationLimits.MESSAGE_CONTENT_MIN_LENGTH, 'Content is required')
    .max(ValidationLimits.MESSAGE_CONTENT_MAX_LENGTH, 'Content must be less than 10000 characters'),
  parentMessageId: z.string().uuid('Invalid parent message ID').optional().nullable(),
})

export const messageTypeQuerySchema = z.object({
  type: z
    .enum(['inbox', 'sent'], {
      message: 'Invalid message type. Must be inbox or sent',
    })
    .default('inbox'),
})

export const newsLimitQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive number')
    .transform(val => {
      const num = parseInt(val, 10)
      return Math.min(Math.max(num, 1), 100)
    })
    .optional(),
})

const cspReportEntrySchema = z.object({
  'document-uri': z.string().max(ValidationLimits.CSP_URI_MAX_LENGTH).optional(),
  referrer: z.string().max(ValidationLimits.CSP_URI_MAX_LENGTH).optional(),
  'violated-directive': z.string().max(ValidationLimits.CSP_DIRECTIVE_MAX_LENGTH).optional(),
  'effective-directive': z.string().max(ValidationLimits.CSP_DIRECTIVE_MAX_LENGTH).optional(),
  'original-policy': z.string().max(ValidationLimits.CSP_POLICY_MAX_LENGTH).optional(),
  disposition: z.string().max(ValidationLimits.CSP_DISPOSITION_MAX_LENGTH).optional(),
  'blocked-uri': z.string().max(ValidationLimits.CSP_URI_MAX_LENGTH).optional(),
  'line-number': z.number().int().positive().optional(),
  'column-number': z.number().int().positive().optional(),
  'source-file': z.string().max(ValidationLimits.CSP_URI_MAX_LENGTH).optional(),
  'status-code': z.string().max(ValidationLimits.CSP_STATUS_CODE_MAX_LENGTH).optional(),
  'script-sample': z.string().max(ValidationLimits.CSP_SCRIPT_SAMPLE_MAX_LENGTH).optional(),
})

export const cspReportSchema = z
  .object({
    'csp-report': cspReportEntrySchema,
  })
  .strict()
