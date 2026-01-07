export const REACT_WARNING_PATTERN = "Warning:" as const;
export const WARNING_PREFIX = "[WARNING]" as const;
export const CONSOLE_ERROR_PREFIX = "[CONSOLE ERROR]" as const;

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
