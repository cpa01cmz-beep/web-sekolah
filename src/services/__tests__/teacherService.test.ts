import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTeacherService } from '../teacherService';
import { MockRepository } from '@/test/utils/mocks';

describe('TeacherService', () => {
  let mockRepository: MockRepository;

  beforeEach(() => {
    mockRepository = new MockRepository();
  });

  afterEach(() => {
    mockRepository.reset();
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

      mockRepository.setMockData(`/api/teachers/${teacherId}/dashboard`, mockData);
      const teacherService = createTeacherService(mockRepository);

      const result = await teacherService.getDashboard(teacherId);

      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching dashboard', async () => {
      const teacherId = 'teacher-01';
      const mockError = new Error('Teacher not found');
      mockError.name = 'ApiError';
      (mockError as any).status = 404;

      mockRepository.setMockError(`/api/teachers/${teacherId}/dashboard`, mockError);
      const teacherService = createTeacherService(mockRepository);

      await expect(teacherService.getDashboard(teacherId)).rejects.toThrow('Teacher not found');
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

      mockRepository.setMockData(`/api/teachers/${teacherId}/classes`, mockData);
      const teacherService = createTeacherService(mockRepository);

      const result = await teacherService.getClasses(teacherId);

      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });

    it('should handle empty classes list', async () => {
      const teacherId = 'teacher-01';
      const mockData: any[] = [];

      mockRepository.setMockData(`/api/teachers/${teacherId}/classes`, mockData);
      const teacherService = createTeacherService(mockRepository);

      const result = await teacherService.getClasses(teacherId);

      expect(result).toEqual([]);
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

      mockRepository.setMockData('/api/teachers/grades', mockResult);
      const teacherService = createTeacherService(mockRepository);

      const result = await teacherService.submitGrade(gradeData);

      expect(result).toEqual(mockResult);
    });

    it('should handle invalid grade scores', async () => {
      const gradeData = {
        studentId: 'student-01',
        courseId: 'math-01',
        score: 150,
        feedback: 'Invalid score',
      };
      const mockError = new Error('Invalid score');
      mockError.name = 'ApiError';
      (mockError as any).status = 400;

      mockRepository.setMockError('/api/teachers/grades', mockError);
      const teacherService = createTeacherService(mockRepository);

      await expect(teacherService.submitGrade(gradeData)).rejects.toThrow('Invalid score');
    });

    it('should handle missing student ID', async () => {
      const gradeData = {
        courseId: 'math-01',
        score: 95,
        feedback: 'Excellent work',
      } as any;
      const mockError = new Error('Student ID is required');
      mockError.name = 'ApiError';
      (mockError as any).status = 400;

      mockRepository.setMockError('/api/teachers/grades', mockError);
      const teacherService = createTeacherService(mockRepository);

      await expect(teacherService.submitGrade(gradeData)).rejects.toThrow('Student ID is required');
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

      mockRepository.setMockData(`/api/teachers/${teacherId}/announcements`, mockData);
      const teacherService = createTeacherService(mockRepository);

      const result = await teacherService.getAnnouncements(teacherId);

      expect(result).toEqual(mockData);
    });

    it('should handle empty announcements list', async () => {
      const teacherId = 'teacher-01';
      const mockData: any[] = [];

      mockRepository.setMockData(`/api/teachers/${teacherId}/announcements`, mockData);
      const teacherService = createTeacherService(mockRepository);

      const result = await teacherService.getAnnouncements(teacherId);

      expect(result).toEqual([]);
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

      mockRepository.setMockData('/api/teachers/announcements', mockResult);
      const teacherService = createTeacherService(mockRepository);

      const result = await teacherService.createAnnouncement(announcement);

      expect(result).toEqual(mockResult);
      expect(result.title).toBe('Pengumuman Baru');
    });

    it('should handle empty announcement content', async () => {
      const announcement = {
        title: '',
        content: '',
      };
      const mockError = new Error('Title and content are required');
      mockError.name = 'ApiError';
      (mockError as any).status = 400;

      mockRepository.setMockError('/api/teachers/announcements', mockError);
      const teacherService = createTeacherService(mockRepository);

      await expect(teacherService.createAnnouncement(announcement)).rejects.toThrow(
        'Title and content are required'
      );
    });
  });
});
