import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useQuery, useMutation, queryClient } from '../api-client';
import { renderHook, waitFor } from '@testing-library/react';
import type { ApiResponse } from '@shared/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

describe('useQuery hook', () => {
  const createWrapper = () => {
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });
    
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client: testQueryClient }, children);
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: '1', name: 'Test' };
    const mockResponse: ApiResponse<typeof mockData> = {
      success: true,
      data: mockData,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(() => useQuery(['test', 'endpoint']), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/test/endpoint', {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should handle query errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({ error: 'Not found' }),
    });

    const { result } = renderHook(() => useQuery(['test', 'endpoint']), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should accept custom options', async () => {
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

    const { result } = renderHook(
      () =>
        useQuery(['test'], {
          refetchOnWindowFocus: false,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalled();
  });

  it('should construct correct API path from query key', async () => {
    const mockData = { items: [] };
    const mockResponse: ApiResponse<typeof mockData> = {
      success: true,
      data: mockData,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(
      () => useQuery(['students', '123', 'grades']),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith('/api/students/123/grades', expect.any(Object));
  });
});

describe('useMutation hook', () => {
  const createWrapper = () => {
    const testQueryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
    
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client: testQueryClient }, children);
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should send POST request with body', async () => {
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

    const { result } = renderHook(
      () => useMutation<typeof mockData, Error, { name: string }>(['test', 'create'], { method: 'POST' }),
      {
        wrapper: createWrapper(),
      }
    );

    result.current.mutate({ name: 'Test' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith('/api/test/create', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should send PUT request with body', async () => {
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

    const { result } = renderHook(
      () => useMutation<typeof mockData, Error, { name: string }>(['test', 'update'], { method: 'PUT' }),
      {
        wrapper: createWrapper(),
      }
    );

    result.current.mutate({ name: 'Updated' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith('/api/test/update', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should not send body for GET requests', async () => {
    const mockData = [{ id: '1' }];
    const mockResponse: ApiResponse<typeof mockData> = {
      success: true,
      data: mockData,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(
      () => useMutation<typeof mockData, Error, void>(['test', 'fetch'], { method: 'GET' }),
      {
        wrapper: createWrapper(),
      }
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const fetchCall = (fetch as any).mock.calls[0];
    expect(fetchCall[1].method).toBe('GET');
    expect(fetchCall[1].body).toBeUndefined();
  });

  it('should handle mutation errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: 'Bad request' }),
    });

    const { result } = renderHook(
      () => useMutation<any, Error, { name: string }>(['test', 'create'], { method: 'POST' }),
      {
        wrapper: createWrapper(),
      }
    );

    result.current.mutate({ name: 'Test' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should default to POST method if not specified', async () => {
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

    const { result } = renderHook(() => useMutation<typeof mockData, Error, { name: string }>(['test', 'create']), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: 'Test' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('should construct correct API path from mutation key', async () => {
    const mockData = { id: '123' };
    const mockResponse: ApiResponse<typeof mockData> = {
      success: true,
      data: mockData,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(
      () => useMutation<typeof mockData, Error, { score: number }>(['students', 'grades'], { method: 'POST' }),
      {
        wrapper: createWrapper(),
      }
    );

    result.current.mutate({ score: 95 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith('/api/students/grades', expect.objectContaining({
      method: 'POST',
    }));
  });
});
