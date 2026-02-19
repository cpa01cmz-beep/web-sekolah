export const PasswordConfig = {
  PBKDF2_ITERATIONS: 100000,
  SALT_LENGTH: 16,
  HASH_LENGTH: 32,
  ALGORITHM: 'PBKDF2',
  HASH_ALGORITHM: 'SHA-256',
} as const;

export const HealthCheckConfig = {
  DEFAULT_TIMEOUT_MS: 5000,
  MAX_CONSECUTIVE_FAILURES: 5,
} as const;
