import { vi } from 'vitest';
import type { ApiResponse } from '@shared/types';

export const mockFetch = (data: any, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  });
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  } as Storage;
};

export const createMockApiResponse = <T>(data: T, success = true): ApiResponse<T> => ({
  success,
  data,
  error: success ? undefined : 'Error occurred',
});

export const createMockError = (message: string, status?: number) => {
  const error = new Error(message) as Error & { status?: number };
  if (status) error.status = status;
  return error;
};

export const resetAllMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};
