import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useTeacherDashboard,
  useTeacherClasses,
  useSubmitGrade,
  useTeacherAnnouncements,
  useCreateAnnouncement,
  useTeacherClassStudents
} from '../useTeacher';
import type { TeacherDashboardData, SchoolClass, Grade, Announcement, CreateAnnouncementData, SubmitGradeData } from '@shared/types';

describe('useTeacher Hooks', () => {
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

  describe('useTeacherDashboard', () => {
    it('should return teacher dashboard data', async () => {
      const mockDashboardData: TeacherDashboardData = {
        teacherId: 'teacher-1',
        name: 'John Teacher',
        email: 'john@example.com',
        totalClasses: 5,
        totalStudents: 25,
        recentGrades: [],
        recentAnnouncements: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockDashboardData })
      });

      const { result } = renderHook(() => useTeacherDashboard('teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDashboardData);
    });

    it('should not execute query when teacherId is empty', () => {
      const { result } = renderHook(() => useTeacherDashboard(''), {
        wrapper: createWrapper()
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not execute query when teacherId is null', () => {
      const { result } = renderHook(() => useTeacherDashboard(null as any), {
        wrapper: createWrapper()
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle loading state', async () => {
      let resolveFetch: any;
      (global.fetch as any).mockImplementationOnce(() => new Promise(resolve => {
        resolveFetch = resolve;
      }));

      const { result } = renderHook(() => useTeacherDashboard('teacher-1'), {
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

      const { result } = renderHook(() => useTeacherDashboard('teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useTeacherClasses', () => {
    it('should return teacher classes', async () => {
      const mockClasses: SchoolClass[] = [
        { id: 'class-1', name: 'Mathematics 101', teacherId: 'teacher-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'class-2', name: 'Physics 101', teacherId: 'teacher-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockClasses })
      });

      const { result } = renderHook(() => useTeacherClasses('teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockClasses);
    });

    it('should not execute query when teacherId is empty', () => {
      const { result } = renderHook(() => useTeacherClasses(''), {
        wrapper: createWrapper()
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle empty classes array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: [] })
      });

      const { result } = renderHook(() => useTeacherClasses('teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useSubmitGrade', () => {
    it('should successfully submit grade', async () => {
      const mockGrade: Grade = {
        id: 'grade-1',
        studentId: 'student-1',
        courseId: 'course-1',
        score: 85,
        feedback: 'Good work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const gradeData: SubmitGradeData = {
        studentId: 'student-1',
        courseId: 'course-1',
        score: 85,
        feedback: 'Good work'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockGrade })
      });

      const { result } = renderHook(() => useSubmitGrade(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const response = await result.current.mutateAsync(gradeData);
        expect(response).toEqual(mockGrade);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle submit grade errors', async () => {
      const gradeData: SubmitGradeData = {
        studentId: 'student-1',
        courseId: 'course-1',
        score: 85,
        feedback: 'Good work'
      };

      (global.fetch as any).mockRejectedValueOnce(new Error('Failed to submit grade'));

      const { result } = renderHook(() => useSubmitGrade(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await expect(result.current.mutateAsync(gradeData)).rejects.toThrow('Failed to submit grade');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle boundary score values', async () => {
      const mockGrade: Grade = {
        id: 'grade-1',
        studentId: 'student-1',
        courseId: 'course-1',
        score: 100,
        feedback: 'Perfect score',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const gradeData: SubmitGradeData = {
        studentId: 'student-1',
        courseId: 'course-1',
        score: 100,
        feedback: 'Perfect score'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockGrade })
      });

      const { result } = renderHook(() => useSubmitGrade(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const response = await result.current.mutateAsync(gradeData);
        expect(response.score).toBe(100);
      });
    });

    it('should handle minimum score value', async () => {
      const mockGrade: Grade = {
        id: 'grade-1',
        studentId: 'student-1',
        courseId: 'course-1',
        score: 0,
        feedback: 'No score',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const gradeData: SubmitGradeData = {
        studentId: 'student-1',
        courseId: 'course-1',
        score: 0,
        feedback: 'No score'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockGrade })
      });

      const { result } = renderHook(() => useSubmitGrade(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const response = await result.current.mutateAsync(gradeData);
        expect(response.score).toBe(0);
      });
    });
  });

  describe('useTeacherAnnouncements', () => {
    it('should return teacher announcements', async () => {
      const mockAnnouncements: Announcement[] = [
        {
          id: 'ann-1',
          title: 'Midterm Exam',
          content: 'Midterm exam will be held next week',
          authorId: 'teacher-1',
          targetRole: 'student',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockAnnouncements })
      });

      const { result } = renderHook(() => useTeacherAnnouncements('teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAnnouncements);
    });

    it('should not execute query when teacherId is empty', () => {
      const { result } = renderHook(() => useTeacherAnnouncements(''), {
        wrapper: createWrapper()
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle empty announcements array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: [] })
      });

      const { result } = renderHook(() => useTeacherAnnouncements('teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useCreateAnnouncement', () => {
    it('should successfully create announcement', async () => {
      const mockAnnouncement: Announcement = {
        id: 'ann-1',
        title: 'Midterm Exam',
        content: 'Midterm exam will be held next week',
        authorId: 'teacher-1',
        targetRole: 'student',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const announcementData: CreateAnnouncementData = {
        title: 'Midterm Exam',
        content: 'Midterm exam will be held next week',
        targetRole: 'student'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockAnnouncement })
      });

      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const response = await result.current.mutateAsync(announcementData);
        expect(response).toEqual(mockAnnouncement);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle create announcement errors', async () => {
      const announcementData: CreateAnnouncementData = {
        title: 'Midterm Exam',
        content: 'Midterm exam will be held next week',
        targetRole: 'student'
      };

      (global.fetch as any).mockRejectedValueOnce(new Error('Failed to create announcement'));

      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await expect(result.current.mutateAsync(announcementData)).rejects.toThrow('Failed to create announcement');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle create announcement with targetRole all', async () => {
      const mockAnnouncement: Announcement = {
        id: 'ann-1',
        title: 'School Closed',
        content: 'School will be closed tomorrow',
        authorId: 'teacher-1',
        targetRole: 'all',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const announcementData: CreateAnnouncementData = {
        title: 'School Closed',
        content: 'School will be closed tomorrow',
        targetRole: 'all'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockAnnouncement })
      });

      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const response = await result.current.mutateAsync(announcementData);
        expect(response.targetRole).toBe('all');
      });
    });

    it('should handle create announcement without targetRole (defaults to all)', async () => {
      const mockAnnouncement: Announcement = {
        id: 'ann-1',
        title: 'Important Notice',
        content: 'Check your email',
        authorId: 'teacher-1',
        targetRole: 'all',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const announcementData: CreateAnnouncementData = {
        title: 'Important Notice',
        content: 'Check your email'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockAnnouncement })
      });

      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const response = await result.current.mutateAsync(announcementData);
        expect(response).toEqual(mockAnnouncement);
      });
    });
  });

  describe('useTeacherClassStudents', () => {
    it('should return class students with grades', async () => {
      const mockStudents = [
        {
          id: 'student-1',
          name: 'John Doe',
          score: 85,
          feedback: 'Good work',
          gradeId: 'grade-1'
        },
        {
          id: 'student-2',
          name: 'Jane Smith',
          score: 90,
          feedback: 'Excellent',
          gradeId: 'grade-2'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockStudents })
      });

      const { result } = renderHook(() => useTeacherClassStudents('class-1', 'teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockStudents);
    });

    it('should not execute query when classId is empty', () => {
      const { result } = renderHook(() => useTeacherClassStudents('', 'teacher-1'), {
        wrapper: createWrapper()
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not execute query when teacherId is empty', () => {
      const { result } = renderHook(() => useTeacherClassStudents('class-1', ''), {
        wrapper: createWrapper()
      });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle students without grades', async () => {
      const mockStudents = [
        {
          id: 'student-1',
          name: 'John Doe',
          score: null,
          feedback: '',
          gradeId: null
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: mockStudents })
      });

      const { result } = renderHook(() => useTeacherClassStudents('class-1', 'teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data![0].score).toBeNull();
      expect(result.current.data![0].gradeId).toBeNull();
    });

    it('should handle empty student list', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn() },
        json: vi.fn().mockResolvedValueOnce({ success: true, data: [] })
      });

      const { result } = renderHook(() => useTeacherClassStudents('class-1', 'teacher-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });
});
