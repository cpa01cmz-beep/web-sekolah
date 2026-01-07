import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useStudentDashboard, useStudentGrades, useStudentSchedule, useStudentCard } from '../useStudent';
import type { StudentDashboardData, Grade, ScheduleItem, StudentCardData } from '@shared/types';

describe('useStudent Hooks', () => {
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
  });

  describe('useStudentDashboard', () => {
    it('should return query object with correct data', async () => {
      const mockDashboardData: StudentDashboardData = {
        schedule: [
          {
            day: 'Senin',
            time: '08:00 - 09:30',
            courseId: 'math-11',
            courseName: 'Mathematics',
            teacherName: 'Ibu Siti'
          }
        ],
        recentGrades: [],
        announcements: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((name: string) => name === 'X-Request-ID' ? 'test-request-id' : null)
        },
        json: vi.fn().mockResolvedValueOnce({
          success: true,
          data: mockDashboardData,
          requestId: 'test-request-id'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentDashboard('student-01'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockDashboardData);
    });

    it('should not execute query when studentId is empty', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentDashboard(''), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not execute query when studentId is null', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentDashboard(null as any), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle query errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentDashboard('student-01'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });

    it('should allow custom options override', async () => {
      const customOptions = { staleTime: 60000, queryKey: ['custom', 'key'] };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((name: string) => name === 'X-Request-ID' ? 'test-request-id' : null)
        },
        json: vi.fn().mockResolvedValueOnce({
          success: true,
          data: { schedule: [], recentGrades: [], announcements: [] },
          requestId: 'test-request-id'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useStudentDashboard('student-01', customOptions),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should construct correct query key', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentDashboard('student-123'), { wrapper });
      expect(testQueryClient.getQueryCache().find({ queryKey: ['students', 'student-123', 'dashboard'] })).toBeDefined();
    });
  });

  describe('useStudentGrades', () => {
    it('should return query object with correct data', async () => {
      const mockGrades: Grade[] = [
        {
          id: 'g-01',
          studentId: 'student-01',
          courseId: 'math-11',
          score: 95,
          feedback: 'Excellent work!',
          createdAt: '2026-01-07T10:00:00.000Z',
          updatedAt: '2026-01-07T10:00:00.000Z'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((name: string) => name === 'X-Request-ID' ? 'test-request-id' : null)
        },
        json: vi.fn().mockResolvedValueOnce({
          success: true,
          data: mockGrades,
          requestId: 'test-request-id'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentGrades('student-01'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockGrades);
    });

    it('should not execute query when studentId is empty', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentGrades(''), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle empty grades array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((name: string) => name === 'X-Request-ID' ? 'test-request-id' : null)
        },
        json: vi.fn().mockResolvedValueOnce({
          success: true,
          data: [],
          requestId: 'test-request-id'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentGrades('student-01'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('should construct correct query key', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentGrades('student-456'), { wrapper });
      expect(testQueryClient.getQueryCache().find({ queryKey: ['students', 'student-456', 'grades'] })).toBeDefined();
    });
  });

  describe('useStudentSchedule', () => {
    it('should return query object with correct data', async () => {
      const mockSchedule: ScheduleItem[] = [
        {
          day: 'Senin',
          time: '08:00 - 09:30',
          courseId: 'math-11'
        },
        {
          day: 'Senin',
          time: '09:45 - 11:15',
          courseId: 'eng-11'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((name: string) => name === 'X-Request-ID' ? 'test-request-id' : null)
        },
        json: vi.fn().mockResolvedValueOnce({
          success: true,
          data: mockSchedule,
          requestId: 'test-request-id'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentSchedule('student-01'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockSchedule);
    });

    it('should not execute query when studentId is empty', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentSchedule(''), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle empty schedule array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((name: string) => name === 'X-Request-ID' ? 'test-request-id' : null)
        },
        json: vi.fn().mockResolvedValueOnce({
          success: true,
          data: [],
          requestId: 'test-request-id'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentSchedule('student-01'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('should construct correct query key', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentSchedule('student-789'), { wrapper });
      expect(testQueryClient.getQueryCache().find({ queryKey: ['students', 'student-789', 'schedule'] })).toBeDefined();
    });
  });

  describe('useStudentCard', () => {
    it('should return query object with correct data', async () => {
      const mockCardData: StudentCardData = {
        id: 'student-01',
        name: 'Budi Hartono',
        studentIdNumber: '12345',
        classId: '11-A',
        className: 'Class 11-A',
        photoUrl: 'https://example.com/photo.jpg',
        validUntil: '2026-12-31T23:59:59.000Z'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((name: string) => name === 'X-Request-ID' ? 'test-request-id' : null)
        },
        json: vi.fn().mockResolvedValueOnce({
          success: true,
          data: mockCardData,
          requestId: 'test-request-id'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentCard('student-01'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockCardData);
    });

    it('should not execute query when studentId is empty', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentCard(''), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentCard('student-01'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });

    it('should construct correct query key', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentCard('student-999'), { wrapper });
      expect(testQueryClient.getQueryCache().find({ queryKey: ['students', 'student-999', 'card'] })).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null studentId gracefully', () => {
      const wrapper = createWrapper();
      const { result: dashboard } = renderHook(() => useStudentDashboard(null as any), { wrapper });
      const { result: grades } = renderHook(() => useStudentGrades(null as any), { wrapper });
      const { result: schedule } = renderHook(() => useStudentSchedule(null as any), { wrapper });
      const { result: card } = renderHook(() => useStudentCard(null as any), { wrapper });

      expect(dashboard.current.fetchStatus).toBe('idle');
      expect(grades.current.fetchStatus).toBe('idle');
      expect(schedule.current.fetchStatus).toBe('idle');
      expect(card.current.fetchStatus).toBe('idle');
    });

    it('should handle undefined studentId gracefully', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentDashboard(undefined as any), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle special characters in studentId', async () => {
      const specialId = 'student-01@test!#$';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((name: string) => name === 'X-Request-ID' ? 'test-request-id' : null)
        },
        json: vi.fn().mockResolvedValueOnce({
          success: true,
          data: { schedule: [], recentGrades: [], announcements: [] },
          requestId: 'test-request-id'
        })
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useStudentDashboard(specialId), { wrapper });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(testQueryClient.getQueryCache().find({ queryKey: ['students', specialId, 'dashboard'] })).toBeDefined();
    });
  });
});
