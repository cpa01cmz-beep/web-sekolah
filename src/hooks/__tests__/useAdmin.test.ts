import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useAdminDashboard,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAnnouncements,
  useCreateAnnouncement,
  useSettings,
  useUpdateSettings
} from '../useAdmin';
import { resetCircuitBreaker } from '../../lib/api-client';

describe('useAdmin Hooks', () => {
  let testQueryClient: QueryClient;

  const createWrapper = () => {
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
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
    global.fetch = vi.fn() as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetCircuitBreaker();
  });

  describe('useAdminDashboard', () => {
    it('should return query result object', async () => {
      const mockData = { totalUsers: 10, totalClasses: 5, totalAnnouncements: 3 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockData })
      });

      const { result } = renderHook(() => useAdminDashboard(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should handle loading state', async () => {
      let resolveFetch: any;
      (global.fetch as any).mockImplementationOnce(() => new Promise(resolve => {
        resolveFetch = resolve;
      }));

      const { result } = renderHook(() => useAdminDashboard(), {
        wrapper: createWrapper()
      });

      expect(result.current.isLoading).toBe(true);

      resolveFetch({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValue({ success: true, data: {} })
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle error state', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAdminDashboard(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useUsers', () => {
    it('should return users array', async () => {
      const mockUsers = [{ id: '1', name: 'User 1' } as any];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockUsers })
      });

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUsers);
    });

    it('should accept filters parameter', async () => {
      const filters = { role: 'student' as any };

      const { result } = renderHook(() => useUsers(filters), {
        wrapper: createWrapper()
      });

      expect(result.current).toBeDefined();
    });
  });

  describe('useCreateUser', () => {
    it('should return mutation object', () => {
      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper()
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isIdle).toBe(true);
    });

    it('should call API on mutate', async () => {
      const userData = { name: 'Test', email: 'test@example.com', password: 'pass', role: 'student' as any };
      const mockUser = { id: '123', ...userData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockUser })
      });

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync(userData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should handle successful mutation', async () => {
      const userData = { name: 'Test', email: 'test@example.com', password: 'pass', role: 'student' as any };
      const mockUser = { id: '123', ...userData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockUser })
      });

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync(userData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
    });
  });

  describe('useUpdateUser', () => {
    it('should return mutation object', () => {
      const { result } = renderHook(() => useUpdateUser('user-123'), {
        wrapper: createWrapper()
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isIdle).toBe(true);
    });

    it('should call API on mutate', async () => {
      const userData = { name: 'Updated', email: 'updated@example.com', role: 'teacher' as any };
      const mockUser = { id: 'user-123', ...userData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockUser })
      });

      const { result } = renderHook(() => useUpdateUser('user-123'), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync(userData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });
  });

  describe('useDeleteUser', () => {
    it('should return mutation object', () => {
      const { result } = renderHook(() => useDeleteUser('user-123'), {
        wrapper: createWrapper()
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isIdle).toBe(true);
    });

    it('should call DELETE API', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: null })
      });

      const { result } = renderHook(() => useDeleteUser('user-123'), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('useAnnouncements', () => {
    it('should return announcements array', async () => {
      const mockAnnouncements = [{ id: '1', title: 'Test' } as any];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockAnnouncements })
      });

      const { result } = renderHook(() => useAnnouncements(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAnnouncements);
    });
  });

  describe('useCreateAnnouncement', () => {
    it('should return mutation object', () => {
      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper()
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isIdle).toBe(true);
    });

    it('should call API on mutate', async () => {
      const announcementData = { title: 'New', content: 'Content', targetRole: 'all' as any };
      const mockAnnouncement = { id: 'ann-1', ...announcementData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockAnnouncement })
      });

      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync(announcementData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should handle successful mutation', async () => {
      const announcementData = { title: 'New', content: 'Content', targetRole: 'all' as any };
      const mockAnnouncement = { id: 'ann-1', ...announcementData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockAnnouncement })
      });

      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync(announcementData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAnnouncement);
    });
  });

  describe('useSettings', () => {
    it('should return settings object', async () => {
      const mockSettings = { schoolName: 'Test' } as any;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockSettings })
      });

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSettings);
    });
  });

  describe('useUpdateSettings', () => {
    it('should return mutation object', () => {
      const { result } = renderHook(() => useUpdateSettings(), {
        wrapper: createWrapper()
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isIdle).toBe(true);
    });

    it('should call API on mutate', async () => {
      const mockSettings = { schoolName: 'Test' } as any;
      const settingsData = { schoolName: 'Updated' } as any;
      const updatedSettings = { ...mockSettings, ...settingsData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: updatedSettings })
      });

      const { result } = renderHook(() => useUpdateSettings(), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync(settingsData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });

    it('should handle partial settings update', async () => {
      const mockSettings = { schoolName: 'Test' } as any;
      const partialData = { schoolName: 'Updated' } as any;
      const updatedSettings = { ...mockSettings, ...partialData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: updatedSettings })
      });

      const { result } = renderHook(() => useUpdateSettings(), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync(partialData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveProperty('schoolName', 'Updated');
    });
  });

  describe('error handling', () => {
    it('should handle network errors in queries', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAdminDashboard(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should handle network errors in mutations', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper()
      });

      try {
        await result.current.mutateAsync({ name: 'Test', email: 'test@example.com', password: 'pass', role: 'student' as any });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('loading states', () => {
    it('should show loading state during query fetch', async () => {
      let resolveFetch: any;
      (global.fetch as any).mockImplementationOnce(() => new Promise(resolve => {
        resolveFetch = resolve;
      }));

      const { result } = renderHook(() => useAdminDashboard(), {
        wrapper: createWrapper()
      });

      expect(result.current.isLoading).toBe(true);

      resolveFetch({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValue({ success: true, data: {} })
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should show loading state during mutation', async () => {
      let resolveFetch: any;
      (global.fetch as any).mockImplementationOnce(() => new Promise(resolve => {
        resolveFetch = resolve;
      }));

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper()
      });

      const userData = { name: 'Test', email: 'test@example.com', password: 'pass', role: 'student' as any };
      const mockUser = { id: '123', ...userData };

      const mutationPromise = result.current.mutateAsync(userData);

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      resolveFetch({
        ok: true,
        status: 201,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockUser })
      });

      await mutationPromise;

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe('mutation options', () => {
    it('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useCreateUser({ onSuccess }), {
        wrapper: createWrapper()
      });

      const userData = { name: 'Test', email: 'test@example.com', password: 'pass', role: 'student' as any };
      const mockUser = { id: '123', ...userData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockUser })
      });

      await result.current.mutateAsync(userData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call onError callback on failure', async () => {
      const onError = vi.fn();

      const { result } = renderHook(() => useCreateUser({ onError }), {
        wrapper: createWrapper()
      });

      (global.fetch as any).mockRejectedValueOnce(new Error('Failed'));

      try {
        await result.current.mutateAsync({ name: 'Test', email: 'test@example.com', password: 'pass', role: 'student' as any });
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(onError).toHaveBeenCalled();
    });
  });
});
