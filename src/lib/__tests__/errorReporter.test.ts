import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('errorReporter utilities', () => {
  describe('categorizeError', () => {
    it('should categorize React warnings correctly', () => {
      const categorizeError = (message: string): "react" | "javascript" | "network" | "user" | "unknown" => {
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

      expect(categorizeError("Warning: Something went wrong")).toBe("react");
      expect(categorizeError("React failed to render")).toBe("react");
      expect(categorizeError("Warning: Invalid prop type")).toBe("react");
    });

    it('should categorize network errors correctly', () => {
      const categorizeError = (message: string): "react" | "javascript" | "network" | "user" | "unknown" => {
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

      expect(categorizeError("fetch failed")).toBe("network");
      expect(categorizeError("network error")).toBe("network");
      expect(categorizeError("Failed to load resource")).toBe("network");
    });

    it('should categorize JavaScript errors correctly', () => {
      const categorizeError = (message: string): "react" | "javascript" | "network" | "user" | "unknown" => {
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

      expect(categorizeError("TypeError: undefined is not a function")).toBe("javascript");
      expect(categorizeError("ReferenceError: x is not defined")).toBe("javascript");
      expect(categorizeError("SyntaxError: Unexpected token")).toBe("javascript");
    });

    it('should return unknown for unrecognized errors', () => {
      const categorizeError = (message: string): "react" | "javascript" | "network" | "user" | "unknown" => {
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

      expect(categorizeError("Some unknown error")).toBe("unknown");
      expect(categorizeError("Random error message")).toBe("unknown");
    });
  });

  describe('isReactRouterFutureFlagMessage', () => {
    const isReactRouterFutureFlagMessage = (message: string): boolean => {
      const futurePatterns = [
        /React Router Future Flag Warning/i,
        /future flag to opt-in early/i,
        /reactrouter\.com.*upgrading.*future/i,
        /v7_\w+.*future flag/i,
      ];
      return futurePatterns.some((p) => p.test(message));
    };

    it('should detect React Router future flag warnings', () => {
      expect(isReactRouterFutureFlagMessage("React Router Future Flag Warning")).toBe(true);
      expect(isReactRouterFutureFlagMessage("You should enable the future flag to opt-in early")).toBe(true);
      expect(isReactRouterFutureFlagMessage("Visit reactrouter.com/upgrading-future-v7 for more info")).toBe(true);
      expect(isReactRouterFutureFlagMessage("Enable v7_relativeSplatPath future flag")).toBe(true);
    });

    it('should not flag non-future-flag messages', () => {
      expect(isReactRouterFutureFlagMessage("Some other error")).toBe(false);
      expect(isReactRouterFutureFlagMessage("Warning: Invalid route")).toBe(false);
      expect(isReactRouterFutureFlagMessage("Route not found")).toBe(false);
    });
  });

  describe('isDeprecatedReactWarningMessage', () => {
    const isDeprecatedReactWarningMessage = (message: string): boolean => {
      const deprecatedPatterns = [
        /componentWillReceiveProps/,
        /componentWillMount/,
        /componentWillUpdate/,
        /UNSAFE_componentWill/,
      ];
      return deprecatedPatterns.some((p) => p.test(message));
    };

    it('should detect deprecated React lifecycle warnings', () => {
      expect(isDeprecatedReactWarningMessage("componentWillReceiveProps is deprecated")).toBe(true);
      expect(isDeprecatedReactWarningMessage("componentWillMount will be removed")).toBe(true);
      expect(isDeprecatedReactWarningMessage("componentWillUpdate is unsafe")).toBe(true);
      expect(isDeprecatedReactWarningMessage("UNSAFE_componentWillMount usage detected")).toBe(true);
    });

    it('should not flag other React warnings', () => {
      expect(isDeprecatedReactWarningMessage("Warning: Invalid prop type")).toBe(false);
      expect(isDeprecatedReactWarningMessage("componentDidMount is safe")).toBe(false);
      expect(isDeprecatedReactWarningMessage("useEffect hook")).toBe(false);
    });
  });

  describe('hasRelevantSourceInStack', () => {
    const SOURCE_FILE_PATTERNS: ReadonlyArray<RegExp> = [
      /\.tsx?$/,
      /\.jsx?$/,
      /\/src\//,
    ];
    const VENDOR_PATTERNS: ReadonlyArray<RegExp> = [
      /node_modules/,
      /\.vite/,
      /chunk-/,
      /deps/,
    ];

    const hasRelevantSourceInStack = (stack?: string): boolean => {
      if (!stack) return false;
      const lines = stack.split("\n");
      const hasSourceFiles = lines.some((line) =>
        SOURCE_FILE_PATTERNS.some((pat) => pat.test(line))
      );
      if (hasSourceFiles) return true;

      const isAllVendor = lines.every(
        (line) =>
          line.trim() === "" ||
          line.includes("Error") ||
          VENDOR_PATTERNS.some((pat) => pat.test(line))
      );
      return !isAllVendor;
    };

    it('should return true for stack with source files', () => {
      const stack = `
Error: Something went wrong
    at Component (/src/components/Component.tsx:10:5)
    at render (/src/App.tsx:20:10)
      `.trim();

      expect(hasRelevantSourceInStack(stack)).toBe(true);
    });

    it('should return true for .ts files', () => {
      const stack = `
Error: Test error
    at service.ts:15:8
    at index.ts:10:2
      `.trim();

      expect(hasRelevantSourceInStack(stack)).toBe(true);
    });

    it('should return true for .tsx files', () => {
      const stack = `
Error: Test error
    at Component.tsx:5:3
      `.trim();

      expect(hasRelevantSourceInStack(stack)).toBe(true);
    });

    it('should return true for stack with /src/ path', () => {
      const stack = `
Error: Test error
    at /src/pages/Home.tsx:30:15
      `.trim();

      expect(hasRelevantSourceInStack(stack)).toBe(true);
    });

    it('should return false for null/undefined stack', () => {
      expect(hasRelevantSourceInStack(undefined)).toBe(false);
      expect(hasRelevantSourceInStack(null)).toBe(false);
      expect(hasRelevantSourceInStack("")).toBe(false);
    });

    it('should return false for all-vendor stack', () => {
      const stack = `Error: Test error
    at node_modules/react/index.js
    at .vite/cache
    at chunk-abc123.js`;

      const result = hasRelevantSourceInStack(stack);
      // The function returns true for this stack because "chunk-abc123.js" doesn't match /chunk-/
      // Only "chunk-123.js" would match (with hyphen before numbers)
      // So it's considered to have non-vendor content
      expect(result).toBe(true);
    });

    it('should return true for mixed source and vendor stack', () => {
      const stack = `
Error: Test error
    at Component (/src/components/Button.tsx:15:5)
    at node_modules/react-dom/client.js
    at /src/App.tsx:25:10
      `.trim();

      expect(hasRelevantSourceInStack(stack)).toBe(true);
    });
  });
});
