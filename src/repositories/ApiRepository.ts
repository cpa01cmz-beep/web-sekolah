import { apiClient } from '@/lib/api-client';
import type { IRepository, ApiRequestOptions } from './IRepository';

export class ApiRepository implements IRepository {
  async get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return apiClient<T>(path, { method: 'GET', ...options });
  }

  async post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return apiClient<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return apiClient<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return apiClient<T>(path, { method: 'DELETE', ...options });
  }

  async patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return apiClient<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }
}

export const apiRepository = new ApiRepository();
