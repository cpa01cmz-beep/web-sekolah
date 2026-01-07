import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { teacherService } from '../teacherService';
import type { ApiResponse } from '@shared/types';

describe('TeacherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch teacher dashboard data', async () => {
      const teacherId = 'teacher-01';
      const mockData = {
        classes: [
          {
            id: 'class-01',
            name: '11-A',
            teacherId: 'teacher-01',
            studentCount: 30,
          },
        ],
        recentSubmissions: [
          {
            id: 'grade-01',
            studentId: 'student-01',
            courseId: 'math-01',
            score: 95,
            feedback: 'Excellent',
          },
        ],
        upcomingClasses: [
          {
            day: 'Senin',
            time: '07:30 - 09:00',
            courseId: 'math-01',
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

      const result = await teacherService.getDashboard(teacherId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/teachers/teacher-01/dashboard', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getClasses', () => {
    it('should fetch teacher classes', async () => {
      const teacherId = 'teacher-01';
      const mockData = [
        {
          id: 'class-01',
          name: '11-A',
          teacherId: 'teacher-01',
        },
        {
          id: 'class-02',
          name: '12-B',
          teacherId: 'teacher-01',
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

      const result = await teacherService.getClasses(teacherId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/teachers/teacher-01/classes', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('submitGrade', () => {
    it('should submit a grade', async () => {
      const gradeData = {
        studentId: 'student-01',
        courseId: 'math-01',
        score: 95,
        feedback: 'Excellent work',
      };
      const mockResult = {
        id: 'grade-01',
        ...gradeData,
      };
      const mockResponse: ApiResponse<typeof mockResult> = {
        success: true,
        data: mockResult,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await teacherService.submitGrade(gradeData);

      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        '/api/teachers/grades',
        {
          method: 'POST',
          body: JSON.stringify(gradeData),
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('should handle invalid grade scores', async () => {
      const gradeData = {
        studentId: 'student-01',
        courseId: 'math-01',
        score: 150,
        feedback: 'Invalid score',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: 'Invalid score' }),
      });

      await expect(teacherService.submitGrade(gradeData)).rejects.toThrow('Invalid score');
    });
  });

  describe('getAnnouncements', () => {
    it('should fetch teacher announcements', async () => {
      const teacherId = 'teacher-01';
      const mockData = [
        {
          id: 'ann-01',
          title: 'Ujian Semester',
          content: 'Ujian akan dilaksanakan...',
          date: '2025-01-07',
          authorId: 'teacher-01',
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

      const result = await teacherService.getAnnouncements(teacherId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/teachers/teacher-01/announcements', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('createAnnouncement', () => {
    it('should create an announcement', async () => {
      const announcement = {
        title: 'Pengumuman Baru',
        content: 'Ini adalah pengumuman baru',
      };
      const mockResult = {
        id: 'ann-01',
        ...announcement,
        authorId: 'teacher-01',
        date: '2025-01-07',
      };
      const mockResponse: ApiResponse<typeof mockResult> = {
        success: true,
        data: mockResult,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await teacherService.createAnnouncement(announcement);

      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        '/api/teachers/announcements',
        {
          method: 'POST',
          body: JSON.stringify(announcement),
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('should handle empty announcement content', async () => {
      const announcement = {
        title: '',
        content: '',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: 'Title and content are required' }),
      });

      await expect(teacherService.createAnnouncement(announcement)).rejects.toThrow(
        'Title and content are required'
      );
    });
  });
});
