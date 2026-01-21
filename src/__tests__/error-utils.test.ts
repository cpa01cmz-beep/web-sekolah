import { describe, it, expect } from 'vitest';
import { mapStatusToErrorCode } from '@shared/error-utils';

describe('Error Utils - mapStatusToErrorCode', () => {
  describe('Happy Path - Standard Status Codes', () => {
    it('should map 400 to VALIDATION_ERROR', () => {
      const result = mapStatusToErrorCode(400);
      expect(result).toBe('VALIDATION_ERROR');
    });

    it('should map 401 to UNAUTHORIZED', () => {
      const result = mapStatusToErrorCode(401);
      expect(result).toBe('UNAUTHORIZED');
    });

    it('should map 403 to FORBIDDEN', () => {
      const result = mapStatusToErrorCode(403);
      expect(result).toBe('FORBIDDEN');
    });

    it('should map 404 to NOT_FOUND', () => {
      const result = mapStatusToErrorCode(404);
      expect(result).toBe('NOT_FOUND');
    });

    it('should map 408 to TIMEOUT', () => {
      const result = mapStatusToErrorCode(408);
      expect(result).toBe('TIMEOUT');
    });

    it('should map 429 to RATE_LIMIT_EXCEEDED', () => {
      const result = mapStatusToErrorCode(429);
      expect(result).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should map 503 to SERVICE_UNAVAILABLE', () => {
      const result = mapStatusToErrorCode(503);
      expect(result).toBe('SERVICE_UNAVAILABLE');
    });

    it('should map 504 to TIMEOUT', () => {
      const result = mapStatusToErrorCode(504);
      expect(result).toBe('TIMEOUT');
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

    it('should map 422 (Unprocessable Entity) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(422);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Edge Cases - 5xx Server Errors', () => {
    it('should map 501 (Not Implemented) to INTERNAL_SERVER_ERROR', () => {
      const result = mapStatusToErrorCode(501);
      expect(result).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should map 502 (Bad Gateway) to INTERNAL_SERVER_ERROR', () => {
      const result = mapStatusToErrorCode(502);
      expect(result).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should map 505 (HTTP Version Not Supported) to INTERNAL_SERVER_ERROR', () => {
      const result = mapStatusToErrorCode(505);
      expect(result).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should map 511 (Network Authentication Required) to INTERNAL_SERVER_ERROR', () => {
      const result = mapStatusToErrorCode(511);
      expect(result).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('Edge Cases - 4xx Client Errors (Unmapped)', () => {
    it('should map 402 (Payment Required) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(402);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 405 (Method Not Allowed) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(405);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 406 (Not Acceptable) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(406);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 413 (Payload Too Large) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(413);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 418 (I\'m a Teapot) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(418);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 451 (Unavailable For Legal Reasons) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(451);
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
    it('should map 101 (Switching Protocols) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(101);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 102 (Processing) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(102);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 103 (Early Hints) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(103);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Edge Cases - Redirection Status Codes (3xx)', () => {
    it('should map 301 (Moved Permanently) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(301);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 302 (Found) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(302);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 304 (Not Modified) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(304);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 307 (Temporary Redirect) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(307);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 308 (Permanent Redirect) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(308);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Edge Cases - Success Status Codes (2xx)', () => {
    it('should map 200 (OK) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(200);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 201 (Created) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(201);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 202 (Accepted) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(202);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 204 (No Content) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(204);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should map 206 (Partial Content) to NETWORK_ERROR', () => {
      const result = mapStatusToErrorCode(206);
      expect(result).toBe('NETWORK_ERROR');
    });
  });

  describe('Consistency - Return Type', () => {
    it('should return string for all inputs', () => {
      const testCodes = [0, 100, 200, 300, 400, 401, 403, 404, 408, 429, 500, 503, 504, 999, -1];
      
      testCodes.forEach(code => {
        const result = mapStatusToErrorCode(code);
        expect(typeof result).toBe('string');
      });
    });

    it('should not return undefined or null', () => {
      const testCodes = [0, 100, 200, 300, 400, 401, 403, 404, 408, 429, 500, 503, 504, 999, -1];
      
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
      
      const testCodes = [400, 401, 403, 404, 408, 429, 500, 503, 504];
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
