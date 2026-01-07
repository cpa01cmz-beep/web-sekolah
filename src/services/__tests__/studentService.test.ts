import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { studentService } from '../studentService';
import type { ApiResponse } from '@shared/types';

describe('StudentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch student dashboard data', async () => {
      const studentId = 'student-01';
      const mockData = {
        schedule: [
          {
            day: 'Senin',
            time: '07:30 - 09:00',
            courseId: 'math-01',
            courseName: 'Matematika',
            teacherName: 'Ibu Siti',
          },
        ],
        recentGrades: [
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

      const result = await studentService.getDashboard(studentId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/students/student-01/dashboard', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle errors when fetching dashboard', async () => {
      const studentId = 'student-01';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ error: 'Student not found' }),
      });

      await expect(studentService.getDashboard(studentId)).rejects.toThrow('Student not found');
    });
  });

  describe('getGrades', () => {
    it('should fetch student grades', async () => {
      const studentId = 'student-01';
      const mockData = [
        {
          id: 'grade-01',
          studentId: 'student-01',
          courseId: 'math-01',
          score: 95,
          feedback: 'Excellent work',
        },
        {
          id: 'grade-02',
          studentId: 'student-01',
          courseId: 'eng-01',
          score: 88,
          feedback: 'Good effort',
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

      const result = await studentService.getGrades(studentId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/students/student-01/grades', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should return empty array for student with no grades', async () => {
      const studentId = 'student-01';
      const mockData: any[] = [];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await studentService.getGrades(studentId);

      expect(result).toEqual([]);
    });
  });

  describe('getSchedule', () => {
    it('should fetch student schedule', async () => {
      const studentId = 'student-01';
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

      const result = await studentService.getSchedule(studentId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/students/student-01/schedule', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getCard', () => {
    it('should fetch student card data', async () => {
      const studentId = 'student-01';
      const mockData = {
        id: 'student-01',
        name: 'Budi Hartono',
        studentIdNumber: '2025001',
        classId: '11-A',
        className: '11-A',
        photoUrl: 'https://example.com/photo.jpg',
        validUntil: '2026-12-31',
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

      const result = await studentService.getCard(studentId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/students/student-01/card', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
});
