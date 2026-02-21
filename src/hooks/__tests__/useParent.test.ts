import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useParentDashboard, useChildSchedule } from '../useParent';
import type { ParentDashboardData, ScheduleItem } from '@shared/types';

describe('useParent Hooks', () => {
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

  describe('useParentDashboard', () => {
    it('should return parent dashboard data', async () => {
      const mockDashboardData: ParentDashboardData = {
        child: {
          id: 'student-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          classId: 'class-1',
          studentIdNumber: '12345',
          avatarUrl: 'https://example.com/avatar.jpg',
          className: '11-A',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        childSchedule: [
          {
            day: 'Senin',
            time: '08:00 - 09:30',
            courseId: 'math-11',
            courseName: 'Mathematics',
            teacherName: 'Ibu Siti',
          },
        ],
        childGrades: [
          {
            id: 'grade-1',
            studentId: 'student-1',
            courseId: 'course-1',
            score: 85,
            feedback: 'Good work',
            courseName: 'Mathematics',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        announcements: [
          {
            id: 'ann-1',
            title: 'Midterm Exam',
            content: 'Midterm exam will be held next week',
            authorId: 'teacher-1',
            targetRole: 'student',
            date: new Date().toISOString(),
            authorName: 'John Teacher',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockDashboardData }),
      });

      const { result } = renderHook(() => useParentDashboard('parent-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDashboardData);
    });

    it('should not execute query when parentId is empty', () => {
      const { result } = renderHook(() => useParentDashboard(''), {
        wrapper: createWrapper(),
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not execute query when parentId is null', () => {
      const { result } = renderHook(() => useParentDashboard(null as any), {
        wrapper: createWrapper(),
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle loading state', async () => {
      let resolveFetch: any;
      (global.fetch as any).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      );

      const { result } = renderHook(() => useParentDashboard('parent-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      resolveFetch({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValue({ success: true, data: {} }),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle error state', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useParentDashboard('parent-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle dashboard with no grades', async () => {
      const mockDashboardData: ParentDashboardData = {
        child: {
          id: 'student-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          classId: 'class-1',
          studentIdNumber: '12345',
          avatarUrl: 'https://example.com/avatar.jpg',
          className: '11-A',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        childSchedule: [],
        childGrades: [],
        announcements: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockDashboardData }),
      });

      const { result } = renderHook(() => useParentDashboard('parent-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.childGrades).toEqual([]);
      expect(result.current.data?.childSchedule).toEqual([]);
      expect(result.current.data?.announcements).toEqual([]);
    });

    it('should handle dashboard with multiple announcements', async () => {
      const mockDashboardData: ParentDashboardData = {
        child: {
          id: 'student-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          classId: 'class-1',
          studentIdNumber: '12345',
          avatarUrl: 'https://example.com/avatar.jpg',
          className: '11-A',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        childSchedule: [],
        childGrades: [],
        announcements: [
          {
            id: 'ann-1',
            title: 'Midterm Exam',
            content: 'Midterm exam will be held next week',
            authorId: 'teacher-1',
            targetRole: 'student',
            date: new Date().toISOString(),
            authorName: 'John Teacher',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'ann-2',
            title: 'Field Trip',
            content: 'Annual field trip next month',
            authorId: 'teacher-2',
            targetRole: 'student',
            date: new Date().toISOString(),
            authorName: 'Jane Teacher',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockDashboardData }),
      });

      const { result } = renderHook(() => useParentDashboard('parent-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.announcements?.length).toBe(2);
    });

    it('should handle dashboard with schedule items', async () => {
      const mockDashboardData: ParentDashboardData = {
        child: {
          id: 'student-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          classId: 'class-1',
          studentIdNumber: '12345',
          avatarUrl: 'https://example.com/avatar.jpg',
          className: '11-A',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        childSchedule: [
          {
            day: 'Senin',
            time: '08:00 - 09:30',
            courseId: 'math-11',
            courseName: 'Mathematics',
            teacherName: 'Ibu Siti',
          },
          {
            day: 'Senin',
            time: '09:45 - 11:15',
            courseId: 'physics-11',
            courseName: 'Physics',
            teacherName: 'Pak Budi',
          },
          {
            day: 'Selasa',
            time: '08:00 - 09:30',
            courseId: 'english-11',
            courseName: 'English',
            teacherName: 'Ms. Smith',
          },
        ],
        childGrades: [],
        announcements: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockDashboardData }),
      });

      const { result } = renderHook(() => useParentDashboard('parent-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.childSchedule?.length).toBe(3);
      expect(result.current.data?.childSchedule?.[0].day).toBe('Senin');
      expect(result.current.data?.childSchedule?.[2].day).toBe('Selasa');
    });

    it('should handle dashboard with recent grades for multiple courses', async () => {
      const mockDashboardData: ParentDashboardData = {
        child: {
          id: 'student-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          classId: 'class-1',
          studentIdNumber: '12345',
          avatarUrl: 'https://example.com/avatar.jpg',
          className: '11-A',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        childSchedule: [],
        childGrades: [
          {
            id: 'grade-1',
            studentId: 'student-1',
            courseId: 'course-1',
            score: 85,
            feedback: 'Good work',
            courseName: 'Mathematics',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'grade-2',
            studentId: 'student-1',
            courseId: 'course-2',
            score: 92,
            feedback: 'Excellent',
            courseName: 'Physics',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'grade-3',
            studentId: 'student-1',
            courseId: 'course-3',
            score: 78,
            feedback: 'Needs improvement',
            courseName: 'English',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        announcements: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockDashboardData }),
      });

      const { result } = renderHook(() => useParentDashboard('parent-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.childGrades?.length).toBe(3);
      expect(result.current.data?.childGrades?.[0].score).toBe(85);
      expect(result.current.data?.childGrades?.[1].score).toBe(92);
      expect(result.current.data?.childGrades?.[2].score).toBe(78);
    });
  });

  describe('useChildSchedule', () => {
    it('should return child schedule', async () => {
      const mockSchedule: ScheduleItem[] = [
        {
          day: 'Senin',
          time: '08:00 - 09:30',
          courseId: 'math-11',
        },
        {
          day: 'Senin',
          time: '09:45 - 11:15',
          courseId: 'physics-11',
        },
        {
          day: 'Selasa',
          time: '08:00 - 09:30',
          courseId: 'english-11',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockSchedule }),
      });

      const { result } = renderHook(() => useChildSchedule('student-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSchedule);
    });

    it('should not execute query when childId is empty', () => {
      const { result } = renderHook(() => useChildSchedule(''), {
        wrapper: createWrapper(),
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not execute query when childId is null', () => {
      const { result } = renderHook(() => useChildSchedule(null as any), {
        wrapper: createWrapper(),
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle empty schedule array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: [] }),
      });

      const { result } = renderHook(() => useChildSchedule('student-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle loading state', async () => {
      let resolveFetch: any;
      (global.fetch as any).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      );

      const { result } = renderHook(() => useChildSchedule('student-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      resolveFetch({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValue({ success: true, data: [] }),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle error state', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useChildSchedule('student-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle schedule with all weekdays', async () => {
      const mockSchedule: ScheduleItem[] = [
        { day: 'Senin', time: '08:00 - 09:30', courseId: 'math-11' },
        { day: 'Selasa', time: '08:00 - 09:30', courseId: 'english-11' },
        { day: 'Rabu', time: '08:00 - 09:30', courseId: 'physics-11' },
        { day: 'Kamis', time: '08:00 - 09:30', courseId: 'biology-11' },
        { day: 'Jumat', time: '08:00 - 09:30', courseId: 'chemistry-11' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockSchedule }),
      });

      const { result } = renderHook(() => useChildSchedule('student-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.length).toBe(5);
      expect(result.current.data?.[0].day).toBe('Senin');
      expect(result.current.data?.[4].day).toBe('Jumat');
    });

    it('should handle schedule with multiple items per day', async () => {
      const mockSchedule: ScheduleItem[] = [
        { day: 'Senin', time: '08:00 - 09:30', courseId: 'math-11' },
        { day: 'Senin', time: '09:45 - 11:15', courseId: 'physics-11' },
        { day: 'Senin', time: '11:30 - 13:00', courseId: 'english-11' },
        { day: 'Selasa', time: '08:00 - 09:30', courseId: 'chemistry-11' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockSchedule }),
      });

      const { result } = renderHook(() => useChildSchedule('student-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const mondayItems = result.current.data?.filter((item) => item.day === 'Senin');
      expect(mondayItems?.length).toBe(3);
    });
  });
});
