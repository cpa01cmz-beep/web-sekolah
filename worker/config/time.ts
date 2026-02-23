export const TimeConstants = {
  SECOND_MS: 1000,
  MINUTE_MS: 1000 * 60,
  FIVE_MINUTES_MS: 1000 * 60 * 5,
  FIFTEEN_MINUTES_MS: 1000 * 60 * 15,
  THIRTY_MINUTES_MS: 1000 * 60 * 30,
  ONE_HOUR_MS: 1000 * 60 * 60,
  ONE_DAY_MS: 1000 * 60 * 60 * 24,
} as const

export const RateLimitWindow = {
  STRICT: TimeConstants.FIVE_MINUTES_MS,
  STANDARD: TimeConstants.FIFTEEN_MINUTES_MS,
  LOOSE: TimeConstants.ONE_HOUR_MS,
  AUTH: TimeConstants.FIFTEEN_MINUTES_MS,
} as const

export const RateLimitMaxRequests = {
  STRICT: 50,
  STANDARD: 100,
  LOOSE: 1000,
  AUTH: 5,
} as const

export const RateLimitStore = {
  MAX_ENTRIES: 10000,
} as const

export const IntegrationMonitor = {
  DEFAULT_WINDOW_MS: TimeConstants.FIFTEEN_MINUTES_MS,
  MAX_RECENT_ERRORS: 100,
  MAX_DELIVERY_TIMES: 1000,
} as const

export const RetryDelay = {
  ONE_SECOND_MS: 1000,
  TWO_SECONDS_MS: 1000 * 2,
  THREE_SECONDS_MS: 1000 * 3,
  THIRTY_SECONDS_MS: 1000 * 30,
  ONE_MINUTE_MS: 1000 * 60,
} as const

export const ScheduledTaskConfig = {
  DEFAULT_TIMEOUT_MS: TimeConstants.FIVE_MINUTES_MS,
} as const
