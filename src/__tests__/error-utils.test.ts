import { describe, it, expect } from 'vitest';
import { mapStatusToErrorCode } from '@shared/error-utils';

describe('Error Utils - mapStatusToErrorCode', () => {
  describe('Happy Path - Standard Status Codes', () => {
    it.each([
      [400, 'VALIDATION_ERROR'],
      [401, 'UNAUTHORIZED'],
      [403, 'FORBIDDEN'],
      [404, 'NOT_FOUND'],
      [408, 'TIMEOUT'],
      [409, 'CONFLICT'],
      [422, 'BAD_REQUEST'],
      [429, 'RATE_LIMIT_EXCEEDED'],
      [503, 'SERVICE_UNAVAILABLE'],
      [504, 'TIMEOUT'],
    ])('should map %i to %s', (code, expectedCode) => {
      const result = mapStatusToErrorCode(code);
      expect(result).toBe(expectedCode);
    });
  });

  describe('Edge Cases - Boundary Values', () => {
    it('should map 100 (Continue) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(100);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 200 (OK) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(200);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 300 (Multiple Choices) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(300);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 500 (Internal Server Error) to INTERNAL_SERVER_ERROR', () => {
      const result = mapStatusToErrorCode(500);
      expect(result).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should map 599 to INTERNAL_SERVER_ERROR', () => {
      const result = mapStatusToErrorCode(599);
      expect(result).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should map 410 (Gone) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(410);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Edge Cases - 5xx Server Errors', () => {
    it.each([
      [501, 'Not Implemented'],
      [502, 'Bad Gateway'],
      [505, 'HTTP Version Not Supported'],
      [511, 'Network Authentication Required'],
    ])('should map %i (%s) to INTERNAL_SERVER_ERROR', (code, _description) => {
      const result = mapStatusToErrorCode(code);
      expect(result).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('Edge Cases - 4xx Client Errors (Unmapped)', () => {
    it.each([
      [402, 'Payment Required'],
      [405, 'Method Not Allowed'],
      [406, 'Not Acceptable'],
      [413, 'Payload Too Large'],
      [418, "I'm a Teapot"],
      [451, 'Unavailable For Legal Reasons'],
    ])('should map %i (%s) to NETWORK_ERROR', (code, _description) => {
      const result = mapStatusToErrorCode(code);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Edge Cases - Extreme Values', () => {
    it('should map 0 to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(0);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 99 to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(99);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 999 to INTERNAL_SERVER_ERROR (5xx range)', () => {
      const result = mapStatusToErrorCode(999);
      expect(result).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should map -1 to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(-1);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map -100 to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(-100);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Edge Cases - Informational Status Codes (1xx)', () => {
    it.each([
      [101, 'Switching Protocols'],
      [102, 'Processing'],
      [103, 'Early Hints'],
    ])('should map %i (%s) to NETWORK_ERROR', (code, _description) => {
      const result = mapStatusToErrorCode(code);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Edge Cases - Redirection Status Codes (3xx)', () => {
    it.each([
      [301, 'Moved Permanently'],
      [302, 'Found'],
      [304, 'Not Modified'],
      [307, 'Temporary Redirect'],
      [308, 'Permanent Redirect'],
    ])('should map %i (%s) to NETWORK_ERROR', (code, _description) => {
      const result = mapStatusToErrorCode(code);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Edge Cases - Success Status Codes (2xx)', () => {
    it.each([
      [200, 'OK'],
      [201, 'Created'],
      [202, 'Accepted'],
      [204, 'No Content'],
      [206, 'Partial Content'],
    ])('should map %i (%s) to NETWORK_ERROR', (code, _description) => {
      const result = mapStatusToErrorCode(code);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Consistency - Return Type', () => {
    it('should return string for all inputs', () => {
      const testCodes = [0, 100, 200, 300, 400, 401, 403, 404, 408, 409, 422, 429, 500, 503, 504, 999, -1];
      
      testCodes.forEach(code => {
        const result = mapStatusToErrorCode(code);
        expect(typeof result).toBe('string');
      });
    });

    it('should not return undefined or null', () => {
      const testCodes = [0, 100, 200, 300, 400, 401, 403, 404, 408, 409, 422, 429, 500, 503, 504, 999, -1];
      
      testCodes.forEach(code => {
        const result = mapStatusToErrorCode(code);
        expect(result).not.toBeUndefined();
        expect(result).not.toBeNull();
      });
    });
  });

  describe('Integration - Error Code Enum Consistency', () => {
    it('should return valid error codes matching ErrorCode enum values', () => {
      const testCases: [number, string][] = [
        [400, 'VALIDATION_ERROR'],
        [401, 'UNAUTHORIZED'],
        [403, 'FORBIDDEN'],
        [404, 'NOT_FOUND'],
        [408, 'TIMEOUT'],
        [409, 'CONFLICT'],
        [422, 'BAD_REQUEST'],
        [429, 'RATE_LIMIT_EXCEEDED'],
        [503, 'SERVICE_UNAVAILABLE'],
        [504, 'TIMEOUT'],
        [500, 'INTERNAL_SERVER_ERROR'],
        [502, 'INTERNAL_SERVER_ERROR'],
        [402, 'NETWORK_ERROR'],
        [200, 'NETWORK_ERROR'],
      ];

      testCases.forEach(([status, expectedCode]) => {
        const result = mapStatusToErrorCode(status);
        expect(result).toBe(expectedCode);
      });
    });

    it('should handle both timeout status codes consistently', () => {
      const timeout408 = mapStatusToErrorCode(408);
      const timeout504 = mapStatusToErrorCode(504);
      
      expect(timeout408).toBe('TIMEOUT');
      expect(timeout504).toBe('TIMEOUT');
      expect(timeout408).toBe(timeout504);
    });
  });

  describe('Performance - Deterministic Behavior', () => {
    it('should return same result for same input', () => {
      const testCode = 404;
      const firstResult = mapStatusToErrorCode(testCode);
      const secondResult = mapStatusToErrorCode(testCode);
      const thirdResult = mapStatusToErrorCode(testCode);

      expect(firstResult).toBe(secondResult);
      expect(secondResult).toBe(thirdResult);
    });

    it('should handle multiple different inputs without side effects', () => {
      const results: string[] = [];
      
      const testCodes = [400, 401, 403, 404, 408, 409, 422, 429, 500, 503, 504];
      testCodes.forEach(code => {
        results.push(mapStatusToErrorCode(code));
      });

      const reversedResults = [...testCodes].reverse().map(code => mapStatusToErrorCode(code));

      results.forEach((result, index) => {
        expect(result).toBe(results[index]);
      });

      reversedResults.forEach((result, index) => {
        const expectedIndex = results.length - 1 - index;
        expect(result).toBe(results[expectedIndex]);
      });
    });
  });

  describe('Sad Path - Special Characters and Unicode', () => {
    it('should handle special numeric values', () => {
      const specialCodes = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
      
      specialCodes.forEach(code => {
        const result = mapStatusToErrorCode(code);
        expect(typeof result).toBe('string');
        expect(result).not.toBeUndefined();
      });
    });
  });
});
