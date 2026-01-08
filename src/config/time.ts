export const CachingTime = {
  FIVE_MINUTES: 1000 * 60 * 5,
  THIRTY_MINUTES: 1000 * 60 * 30,
  ONE_HOUR: 1000 * 60 * 60,
  TWENTY_FOUR_HOURS: 1000 * 60 * 60 * 24,
  SEVEN_DAYS: 1000 * 60 * 60 * 24 * 7,
};

export const ErrorReportingTime = {
  FIVE_SECONDS: 1000 * 5,
  ONE_MINUTE: 1000 * 60,
  FIVE_MINUTES: 1000 * 60 * 5,
};

export const ApiTimeout = {
  THIRTY_SECONDS: 1000 * 30,
  ONE_MINUTE: 1000 * 60,
  FIVE_MINUTES: 1000 * 60 * 5,
  ONE_HOUR: 1000 * 60 * 60,
};

export const RetryDelay = {
  ONE_SECOND: 1000,
  TWO_SECONDS: 1000 * 2,
  THREE_SECONDS: 1000 * 3,
  THIRTY_SECONDS: 1000 * 30,
};

export const RetryCount = {
  TWO: 2,
  THREE: 3,
  SIX: 6,
};

export const CircuitBreakerConfig = {
  FAILURE_THRESHOLD: 5,
  TIMEOUT_MS: 1000 * 60,
  RESET_TIMEOUT_MS: 1000 * 30,
};