export const ValidationLimits = {
  USER_NAME_MIN_LENGTH: 2,
  USER_NAME_MAX_LENGTH: 100,
  GRADE_MIN_SCORE: 0,
  GRADE_MAX_SCORE: 100,
  GRADE_FEEDBACK_MAX_LENGTH: 1000,
  ANNOUNCEMENT_TITLE_MIN_LENGTH: 5,
  ANNOUNCEMENT_TITLE_MAX_LENGTH: 200,
  ANNOUNCEMENT_CONTENT_MIN_LENGTH: 10,
  ANNOUNCEMENT_CONTENT_MAX_LENGTH: 5000,
  ERROR_MESSAGE_MIN_LENGTH: 1,
  ERROR_MESSAGE_MAX_LENGTH: 1000,
  USER_AGENT_MAX_LENGTH: 500,
  ERROR_SOURCE_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 13,
  NISN_LENGTH: 10,
  MESSAGE_SUBJECT_MIN_LENGTH: 1,
  MESSAGE_SUBJECT_MAX_LENGTH: 200,
  MESSAGE_CONTENT_MIN_LENGTH: 1,
  MESSAGE_CONTENT_MAX_LENGTH: 10000,
  WEBHOOK_SECRET_MIN_LENGTH: 16,
  WEBHOOK_SECRET_MAX_LENGTH: 500,
  SEMESTER_MIN: 1,
  SEMESTER_MAX: 2,
  STUDENT_ID_MIN_LENGTH: 3,
  STUDENT_ID_MAX_LENGTH: 20,
  GRADE_LEVEL_MIN: 1,
  GRADE_LEVEL_MAX: 12,
} as const;

export const StatusCodeRanges = {
  SUCCESS_MIN: 200,
  SUCCESS_MAX: 300,
  CLIENT_ERROR_MIN: 400,
} as const;

export const GradeThresholds = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  PASSING_SCORE: 60,
  PRECISION_FACTOR: 10,
} as const;

export const GRADE_A_THRESHOLD = GradeThresholds.A;

export const GRADE_B_THRESHOLD = GradeThresholds.B;

export const GRADE_C_THRESHOLD = GradeThresholds.C;

export const GRADE_D_THRESHOLD = GradeThresholds.D;

export const PASSING_SCORE_THRESHOLD = GradeThresholds.PASSING_SCORE;

export const GRADE_PRECISION_FACTOR = GradeThresholds.PRECISION_FACTOR;

export const RETRY_CONFIG = {
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_BASE_DELAY_MS: 1000,
  DEFAULT_JITTER_MS: 0,
} as const;

export const DEFAULT_LOCALE = 'en-US' as const;

export const AVATAR_BASE_URL = 'https://i.pravatar.cc/150';

export const ErrorMessages = {
  REQUEST_TIMEOUT: 'Request timeout',
  CONCURRENT_MODIFICATION: 'Concurrent modification detected',
  USER_NOT_AUTHENTICATED: 'User not authenticated',
} as const;

export const USER_ROLES = ['student', 'teacher', 'parent', 'admin'] as const;

export const HealthThresholds = {
  WEBHOOK_SUCCESS_HEALTHY: 95,
  WEBHOOK_SUCCESS_DEGRADED: 80,
  RATE_LIMIT_BLOCK_HEALTHY: 1,
  RATE_LIMIT_BLOCK_ELEVATED: 5,
} as const;

export const getAvatarUrl = (userId: string): string => {
  return `${AVATAR_BASE_URL}?u=${encodeURIComponent(userId)}`;
};