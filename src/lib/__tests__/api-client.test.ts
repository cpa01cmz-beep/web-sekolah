import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../api-client';
import type { ApiResponse } from '@shared/types';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('success cases', () => {
    it('should return data on successful response', async () => {
      const mockData = { id: '1', name: 'Test User' };
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient('/api/test');

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/test', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle custom request init options', async () => {
      const mockData = { id: '1' };
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient('/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/test', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });
    });
  });

  describe('error cases', () => {
    it('should throw error on non-ok response', async () => {
      const errorJson = { error: 'Not found' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue(errorJson),
      });

      await expect(apiClient('/api/test')).rejects.toThrow('Not found');
    });

    it('should throw error with status code in error object', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      });

      try {
        await apiClient('/api/test');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.status).toBe(500);
      }
    });

    it('should throw error when success is false', async () => {
      const mockResponse: ApiResponse<unknown> = {
        success: false,
        error: 'API error',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await expect(apiClient('/api/test')).rejects.toThrow('API error');
    });

    it('should throw error when data is undefined', async () => {
      const mockResponse: ApiResponse<unknown> = {
        success: true,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await expect(apiClient('/api/test')).rejects.toThrow('API request failed');
    });

    it('should handle JSON parse errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(apiClient('/api/test')).rejects.toThrow('Request failed');
    });
  });

  describe('request headers', () => {
    it('should merge headers with default Content-Type', async () => {
      const mockData = { id: '1' };
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await apiClient('/api/test', {
        headers: { 'Authorization': 'Bearer token' },
      });

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Authorization': 'Bearer token',
          'Content-Type': 'application/json',
        },
      });
    });
  });
});
