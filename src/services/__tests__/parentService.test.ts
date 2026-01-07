import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parentService } from '../parentService';
import type { ApiResponse } from '@shared/types';

describe('ParentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch parent dashboard data', async () => {
      const parentId = 'parent-01';
      const mockData = {
        child: {
          id: 'student-01',
          name: 'Budi Hartono',
          email: 'budi@example.com',
          role: 'student' as const,
          avatarUrl: 'https://example.com/avatar.jpg',
          classId: '11-A',
          studentIdNumber: '2025001',
          className: '11-A',
        },
        childSchedule: [
          {
            day: 'Senin',
            time: '07:30 - 09:00',
            courseId: 'math-01',
            courseName: 'Matematika',
            teacherName: 'Ibu Siti',
          },
        ],
        childGrades: [
          {
            id: 'grade-01',
            studentId: 'student-01',
            courseId: 'math-01',
            score: 95,
            feedback: 'Excellent work',
            courseName: 'Matematika',
          },
        ],
        announcements: [
          {
            id: 'ann-01',
            title: 'Ujian Semester',
            content: 'Ujian akan dilaksanakan...',
            date: '2025-01-07',
            authorId: 'teacher-01',
            authorName: 'Ibu Siti',
          },
        ],
      };
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await parentService.getDashboard(parentId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/parents/parent-01/dashboard', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle parent with no children', async () => {
      const parentId = 'parent-01';
      const mockResponse: ApiResponse<any> = {
        success: false,
        error: 'No children found',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await expect(parentService.getDashboard(parentId)).rejects.toThrow('No children found');
    });
  });

  describe('getChildSchedule', () => {
    it('should fetch child schedule', async () => {
      const childId = 'student-01';
      const mockData = [
        {
          day: 'Senin',
          time: '07:30 - 09:00',
          courseId: 'math-01',
        },
        {
          day: 'Senin',
          time: '09:15 - 10:45',
          courseId: 'eng-01',
        },
      ];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await parentService.getChildSchedule(childId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/students/student-01/schedule', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle invalid child ID', async () => {
      const childId = 'invalid-child';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ error: 'Child not found' }),
      });

      await expect(parentService.getChildSchedule(childId)).rejects.toThrow('Child not found');
    });
  });
});
