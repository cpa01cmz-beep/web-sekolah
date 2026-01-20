import { RETRY_CONFIG } from '@shared/constants';

export const REACT_WARNING_PATTERN = "Warning:" as const;
export const WARNING_PREFIX = "[WARNING]" as const;
export const CONSOLE_ERROR_PREFIX = "[CONSOLE ERROR]" as const;

export const ERROR_REPORTER_CONFIG = {
  MAX_QUEUE_SIZE: 10,
  MAX_RETRIES: RETRY_CONFIG.DEFAULT_MAX_RETRIES,
  BASE_RETRY_DELAY_MS: RETRY_CONFIG.DEFAULT_BASE_DELAY_MS,
  REQUEST_TIMEOUT_MS: 10000,
  JITTER_DELAY_MS: 1000,
} as const;

export const SOURCE_FILE_PATTERNS: ReadonlyArray<RegExp> = [
  /\.tsx?$/,
  /\.jsx?$/,
  /\/src\//,
];

export const VENDOR_PATTERNS: ReadonlyArray<RegExp> = [
  /node_modules/,
  /\.vite/,
  /chunk-/,
  /deps/,
];
