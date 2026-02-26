import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createStudentService } from '../studentService'
import { MockRepository, createMockApiError } from '@/test/utils/mocks'

describe('StudentService', () => {
  let mockRepository: MockRepository

  beforeEach(() => {
    mockRepository = new MockRepository()
  })

  afterEach(() => {
    mockRepository.reset()
  })

  describe('getDashboard', () => {
    it('should fetch student dashboard data', async () => {
      const studentId = 'student-01'
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
      }

      mockRepository.setMockData(`/api/students/${studentId}/dashboard`, mockData)
      const studentService = createStudentService(mockRepository)

      const result = await studentService.getDashboard(studentId)

      expect(result).toEqual(mockData)
    })

    it('should handle errors when fetching dashboard', async () => {
      const studentId = 'student-01'
      const mockError = createMockApiError('Student not found', 404)

      mockRepository.setMockError(`/api/students/${studentId}/dashboard`, mockError)
      const studentService = createStudentService(mockRepository)

      await expect(studentService.getDashboard(studentId)).rejects.toThrow('Student not found')
    })
  })

  describe('getGrades', () => {
    it('should fetch student grades', async () => {
      const studentId = 'student-01'
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
      ]

      mockRepository.setMockData(`/api/students/${studentId}/grades`, mockData)
      const studentService = createStudentService(mockRepository)

      const result = await studentService.getGrades(studentId)

      expect(result).toEqual(mockData)
      expect(result).toHaveLength(2)
    })

    it('should return empty array for student with no grades', async () => {
      const studentId = 'student-01'
      const mockData: any[] = []

      mockRepository.setMockData(`/api/students/${studentId}/grades`, mockData)
      const studentService = createStudentService(mockRepository)

      const result = await studentService.getGrades(studentId)

      expect(result).toEqual([])
    })

    it('should handle errors when fetching grades', async () => {
      const studentId = 'student-01'
      const mockError = createMockApiError('Failed to fetch grades', 500)

      mockRepository.setMockError(`/api/students/${studentId}/grades`, mockError)
      const studentService = createStudentService(mockRepository)

      await expect(studentService.getGrades(studentId)).rejects.toThrow('Failed to fetch grades')
    })
  })

  describe('getSchedule', () => {
    it('should fetch student schedule', async () => {
      const studentId = 'student-01'
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
      ]

      mockRepository.setMockData(`/api/students/${studentId}/schedule`, mockData)
      const studentService = createStudentService(mockRepository)

      const result = await studentService.getSchedule(studentId)

      expect(result).toEqual(mockData)
      expect(result).toHaveLength(2)
    })

    it('should handle empty schedule', async () => {
      const studentId = 'student-01'
      const mockData: any[] = []

      mockRepository.setMockData(`/api/students/${studentId}/schedule`, mockData)
      const studentService = createStudentService(mockRepository)

      const result = await studentService.getSchedule(studentId)

      expect(result).toEqual([])
    })
  })

  describe('getCard', () => {
    it('should fetch student card data', async () => {
      const studentId = 'student-01'
      const mockData = {
        id: 'student-01',
        name: 'Budi Hartono',
        studentIdNumber: '2025001',
        classId: '11-A',
        className: '11-A',
        photoUrl: 'https://example.com/photo.jpg',
        validUntil: '2026-12-31',
      }

      mockRepository.setMockData(`/api/students/${studentId}/card`, mockData)
      const studentService = createStudentService(mockRepository)

      const result = await studentService.getCard(studentId)

      expect(result).toEqual(mockData)
      expect(result.name).toBe('Budi Hartono')
    })

    it('should handle errors when fetching card data', async () => {
      const studentId = 'student-01'
      const mockError = createMockApiError('Card data not found', 404)

      mockRepository.setMockError(`/api/students/${studentId}/card`, mockError)
      const studentService = createStudentService(mockRepository)

      await expect(studentService.getCard(studentId)).rejects.toThrow('Card data not found')
    })
  })
})
