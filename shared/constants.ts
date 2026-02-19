export const GRADE_A_THRESHOLD = 90;

export const GRADE_B_THRESHOLD = 80;

export const GRADE_C_THRESHOLD = 70;

export const GRADE_D_THRESHOLD = 60;

export const PASSING_SCORE_THRESHOLD = 60;

export const GRADE_PRECISION_FACTOR = 10;

export const RETRY_CONFIG = {
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_BASE_DELAY_MS: 1000,
  DEFAULT_JITTER_MS: 0,
} as const;

export const AVATAR_BASE_URL = 'https://i.pravatar.cc/150';

export const getAvatarUrl = (userId: string): string => {
  return `${AVATAR_BASE_URL}?u=${encodeURIComponent(userId)}`;
};