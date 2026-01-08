import type { ErrorReport, ErrorContext } from './types';

export const categorizeError = (message: string): ErrorReport["category"] => {
  if (message.includes("Warning:") || message.includes("React")) return "react";
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("Failed to load")
  )
    return "network";
  if (
    message.includes("TypeError") ||
    message.includes("ReferenceError") ||
    message.includes("SyntaxError")
  )
    return "javascript";
  return "unknown";
};

export const isReactRouterFutureFlagMessage = (message: string): boolean => {
  const futurePatterns = [
    /React Router Future Flag Warning/i,
    /future flag to opt-in early/i,
    /reactrouter\.com.*upgrading.*future/i,
    /v7_\w+.*future flag/i,
  ];
  return futurePatterns.some((p) => p.test(message));
};

export const isDeprecatedReactWarningMessage = (message: string): boolean => {
  const deprecatedPatterns = [
    /componentWillReceiveProps/,
    /componentWillMount/,
    /componentWillUpdate/,
    /UNSAFE_componentWill/,
  ];
  return deprecatedPatterns.some((p) => p.test(message));
};

export const hasRelevantSourceInStack = (stack?: string): boolean => {
  if (!stack) return false;
  const lines = stack.split("\n");
  const hasSourceFiles = lines.some((line) =>
    [ /\.tsx?$/, /\.jsx?$/, /\/src\//].some((pat) => pat.test(line))
  );
  if (hasSourceFiles) return true;

  const VENDOR_PATTERNS = [
    /node_modules/,
    /\.vite/,
    /chunk-/,
    /deps/,
  ];
  const isAllVendor = lines.every(
    (line) =>
      line.trim() === "" ||
      line.includes("Error") ||
      VENDOR_PATTERNS.some((pat) => pat.test(line))
  );
  return !isAllVendor;
};

export const parseStackTrace = (stack?: string): string => {
  if (!stack) return "";

  try {
    const lines = stack.split("\n");
    const parsedLines: string[] = [];

    for (const line of lines) {
      if (line.includes("Error") && !line.includes("at ")) continue;

      let parsedLine = line.trim();

      const componentMatch = line.match(
        /at (\w+) \(.*?\/src\/(.*?):(\d+):(\d+)\)/
      );
      if (componentMatch) {
        const [, componentName, filePath, lineNum, colNum] = componentMatch;
        parsedLine = `    at ${componentName} (${filePath}:${lineNum}:${colNum})`;
      } else {
        const srcMatch = line.match(/at.*?\/src\/(.*?):(\d+):(\d+)/);
        if (srcMatch) {
          const [, filePath, lineNum, colNum] = srcMatch;
          parsedLine = `    at ${filePath}:${lineNum}:${colNum}`;
        } else {
          const functionMatch = line.match(/at\s+(\w+)\s+\(/);
          if (functionMatch) {
            parsedLine = line;
          }
        }
      }

      if (parsedLine) {
        parsedLines.push(parsedLine);
      }
    }

    return parsedLines.join("\n");
  } catch {
    return stack;
  }
};

export const formatConsoleArgs = (args: unknown[]): string => {
  return args
    .map((arg) =>
      typeof arg === "string"
        ? arg
        : typeof arg === "object" && arg
        ? JSON.stringify(arg, null, 2)
        : String(arg)
    )
    .join(" ");
};
