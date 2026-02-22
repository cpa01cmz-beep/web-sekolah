import { describe, it, expect } from 'vitest';
import { HttpHeader, ContentType, AuthPrefix, HttpStatusCode, HttpStatusRange } from '@shared/http-constants';

describe('http-constants', () => {
  describe('HttpHeader', () => {
    it('should define Content-Type header', () => {
      expect(HttpHeader.CONTENT_TYPE).toBe('Content-Type');
    });

    it('should define Authorization header', () => {
      expect(HttpHeader.AUTHORIZATION).toBe('Authorization');
    });

    it('should define X-Request-ID header', () => {
      expect(HttpHeader.X_REQUEST_ID).toBe('X-Request-ID');
    });
  });

  describe('ContentType', () => {
    it('should define JSON content type', () => {
      expect(ContentType.JSON).toBe('application/json');
    });

    it('should define HTML content type', () => {
      expect(ContentType.HTML).toBe('text/html');
    });

    it('should define TEXT content type', () => {
      expect(ContentType.TEXT).toBe('text/plain');
    });
  });

  describe('AuthPrefix', () => {
    it('should define Bearer prefix', () => {
      expect(AuthPrefix.BEARER).toBe('Bearer');
    });
  });

  describe('HttpStatusCode', () => {
    it('should define success status codes', () => {
      expect(HttpStatusCode.OK).toBe(200);
      expect(HttpStatusCode.CREATED).toBe(201);
      expect(HttpStatusCode.NO_CONTENT).toBe(204);
    });

    it('should define client error status codes', () => {
      expect(HttpStatusCode.BAD_REQUEST).toBe(400);
      expect(HttpStatusCode.UNAUTHORIZED).toBe(401);
      expect(HttpStatusCode.FORBIDDEN).toBe(403);
      expect(HttpStatusCode.NOT_FOUND).toBe(404);
      expect(HttpStatusCode.CONFLICT).toBe(409);
      expect(HttpStatusCode.TOO_MANY_REQUESTS).toBe(429);
    });

    it('should define server error status codes', () => {
      expect(HttpStatusCode.INTERNAL_SERVER_ERROR).toBe(500);
      expect(HttpStatusCode.SERVICE_UNAVAILABLE).toBe(503);
    });
  });

  describe('HttpStatusRange', () => {
    describe('isSuccess', () => {
      it('should return true for 2xx status codes', () => {
        expect(HttpStatusRange.isSuccess(200)).toBe(true);
        expect(HttpStatusRange.isSuccess(201)).toBe(true);
        expect(HttpStatusRange.isSuccess(299)).toBe(true);
      });

      it('should return false for non-2xx status codes', () => {
        expect(HttpStatusRange.isSuccess(199)).toBe(false);
        expect(HttpStatusRange.isSuccess(300)).toBe(false);
        expect(HttpStatusRange.isSuccess(400)).toBe(false);
        expect(HttpStatusRange.isSuccess(500)).toBe(false);
      });
    });

    describe('isClientError', () => {
      it('should return true for 4xx status codes', () => {
        expect(HttpStatusRange.isClientError(400)).toBe(true);
        expect(HttpStatusRange.isClientError(404)).toBe(true);
        expect(HttpStatusRange.isClientError(499)).toBe(true);
      });

      it('should return false for non-4xx status codes', () => {
        expect(HttpStatusRange.isClientError(399)).toBe(false);
        expect(HttpStatusRange.isClientError(500)).toBe(false);
        expect(HttpStatusRange.isClientError(200)).toBe(false);
      });
    });

    describe('isServerError', () => {
      it('should return true for 5xx status codes', () => {
        expect(HttpStatusRange.isServerError(500)).toBe(true);
        expect(HttpStatusRange.isServerError(503)).toBe(true);
        expect(HttpStatusRange.isServerError(599)).toBe(true);
      });

      it('should return false for non-5xx status codes', () => {
        expect(HttpStatusRange.isServerError(499)).toBe(false);
        expect(HttpStatusRange.isServerError(600)).toBe(false);
        expect(HttpStatusRange.isServerError(200)).toBe(false);
      });
    });
  });
});
