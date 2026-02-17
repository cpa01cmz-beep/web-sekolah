import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createParentService } from '../parentService';
import { MockRepository } from '@/test/utils/mocks';

describe('ParentService', () => {
  let mockRepository: MockRepository;

  beforeEach(() => {
    mockRepository = new MockRepository();
  });

  afterEach(() => {
    mockRepository.reset();
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

      mockRepository.setMockData(`/api/parents/${parentId}/dashboard`, mockData);
      const parentService = createParentService(mockRepository);

      const result = await parentService.getDashboard(parentId);

      expect(result).toEqual(mockData);
      expect(result.child.name).toBe('Budi Hartono');
    });

    it('should handle parent with no children', async () => {
      const parentId = 'parent-01';
      const mockError = new Error('No children found');
      mockError.name = 'ApiError';
      (mockError as any).status = 404;

      mockRepository.setMockError(`/api/parents/${parentId}/dashboard`, mockError);
      const parentService = createParentService(mockRepository);

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

      mockRepository.setMockData(`/api/parents/${childId}/schedule`, mockData);
      const parentService = createParentService(mockRepository);

      const result = await parentService.getChildSchedule(childId);

      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });

    it('should handle empty schedule', async () => {
      const childId = 'student-01';
      const mockData: any[] = [];

      mockRepository.setMockData(`/api/parents/${childId}/schedule`, mockData);
      const parentService = createParentService(mockRepository);

      const result = await parentService.getChildSchedule(childId);

      expect(result).toEqual([]);
    });

    it('should handle invalid child ID', async () => {
      const childId = 'invalid-child';
      const mockError = new Error('Child not found');
      mockError.name = 'ApiError';
      (mockError as any).status = 404;

      mockRepository.setMockError(`/api/parents/${childId}/schedule`, mockError);
      const parentService = createParentService(mockRepository);

      await expect(parentService.getChildSchedule(childId)).rejects.toThrow('Child not found');
    });
  });
});
