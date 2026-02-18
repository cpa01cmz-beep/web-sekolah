import { vi } from 'vitest';
import type { ApiResponse } from '@shared/types';
import type { IRepository, ApiRequestOptions } from '@/repositories/IRepository';

export class MockRepository implements IRepository {
  private mockData: Record<string, unknown> = {};
  private mockErrors: Record<string, Error> = {};
  private delay: number = 0;

  setMockData<T>(path: string, data: T): void {
    this.mockData[path] = data;
  }

  setMockError(path: string, error: Error): void {
    this.mockErrors[path] = error;
  }

  setDelay(ms: number): void {
    this.delay = ms;
  }

  reset(): void {
    this.mockData = {};
    this.mockErrors = {};
    this.delay = 0;
  }

  private async execute<T>(path: string): Promise<T> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    if (this.mockErrors[path]) {
      throw this.mockErrors[path];
    }

    if (this.mockData[path] !== undefined) {
      return this.mockData[path] as T;
    }

    throw new Error(`No mock data for path: ${path}`);
  }

  async get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path);
  }

  async post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path);
  }

  async put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path);
  }

  async delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path);
  }

  async patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.execute<T>(path);
  }
}

export const mockFetch = <T>(data: T, status = 200) => {
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
