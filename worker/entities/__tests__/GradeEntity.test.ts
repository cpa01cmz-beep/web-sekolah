import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GradeEntity } from '../GradeEntity'
import type { Env } from '../../types'
import type { Grade } from '@shared/types'

describe('GradeEntity', () => {
  let mockEnv: Env
  let mockStub: any

  const createMockGrade = (overrides: Partial<Grade> = {}): Grade => ({
    id: 'grade-1',
    studentId: 'student-1',
    courseId: 'course-1',
    score: 95,
    feedback: 'Great work!',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
    deletedAt: null,
    ...overrides,
  })

  beforeEach(() => {
    mockStub = {
      getDoc: vi.fn(),
      casPut: vi.fn(),
      del: vi.fn(),
      has: vi.fn(),
      listPrefix: vi.fn(),
      indexAddBatch: vi.fn(),
      indexRemoveBatch: vi.fn(),
    }

    mockEnv = {
      GlobalDurableObject: {
        idFromName: vi.fn().mockReturnValue('test-do-id'),
        get: vi.fn().mockReturnValue(mockStub),
      },
    } as unknown as Env
  })

  describe('getByStudentId', () => {
    it('should return grades for the given student', async () => {
      const grades = [
        createMockGrade({ id: 'grade-1', studentId: 'student-1' }),
        createMockGrade({ id: 'grade-2', studentId: 'student-1' }),
      ]

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:student-1:entity:grade-1', 'field:student-1:entity:grade-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: grades[0] })
        .mockResolvedValueOnce({ v: 1, data: grades[1] })

      const result = await GradeEntity.getByStudentId(mockEnv, 'student-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('grade-1')
      expect(result[1].id).toBe('grade-2')
    })

    it('should return empty array when no grades found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.getByStudentId(mockEnv, 'student-nonexistent')

      expect(result).toHaveLength(0)
    })

    it('should filter out soft-deleted grades', async () => {
      const deletedGrade = createMockGrade({
        id: 'grade-1',
        deletedAt: '2024-01-02T00:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:student-1:entity:grade-1'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: deletedGrade })

      const result = await GradeEntity.getByStudentId(mockEnv, 'student-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('getByCourseId', () => {
    it('should return grades for the given course', async () => {
      const grades = [
        createMockGrade({ id: 'grade-1', courseId: 'course-1' }),
        createMockGrade({ id: 'grade-2', courseId: 'course-1' }),
      ]

      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:course-1:entity:grade-1', 'field:course-1:entity:grade-2'],
      })
      mockStub.has.mockResolvedValue(true)
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: grades[0] })
        .mockResolvedValueOnce({ v: 1, data: grades[1] })

      const result = await GradeEntity.getByCourseId(mockEnv, 'course-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('grade-1')
    })

    it('should return empty array when no grades found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.getByCourseId(mockEnv, 'course-nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('countByStudentId', () => {
    it('should return count of grades for student', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:student-1:entity:grade-1', 'field:student-1:entity:grade-2'],
      })

      const result = await GradeEntity.countByStudentId(mockEnv, 'student-1')

      expect(result).toBe(2)
    })

    it('should return 0 when no grades found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.countByStudentId(mockEnv, 'student-nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('existsByStudentId', () => {
    it('should return true when student has grades', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:student-1:entity:grade-1'],
      })

      const result = await GradeEntity.existsByStudentId(mockEnv, 'student-1')

      expect(result).toBe(true)
    })

    it('should return false when student has no grades', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.existsByStudentId(mockEnv, 'student-nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('countByCourseId', () => {
    it('should return count of grades for course', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:course-1:entity:grade-1', 'field:course-1:entity:grade-2'],
      })

      const result = await GradeEntity.countByCourseId(mockEnv, 'course-1')

      expect(result).toBe(2)
    })

    it('should return 0 when no grades found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.countByCourseId(mockEnv, 'course-nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('existsByCourseId', () => {
    it('should return true when course has grades', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:course-1:entity:grade-1'],
      })

      const result = await GradeEntity.existsByCourseId(mockEnv, 'course-1')

      expect(result).toBe(true)
    })

    it('should return false when course has no grades', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.existsByCourseId(mockEnv, 'course-nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('getByStudentIdAndCourseId', () => {
    it('should return grade when found', async () => {
      const grade = createMockGrade({ id: 'grade-1', studentId: 'student-1', courseId: 'course-1' })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['index:student-1:course-1:entity:grade-1'],
      })
      mockStub.getDoc.mockResolvedValue({ v: 1, data: grade })

      const result = await GradeEntity.getByStudentIdAndCourseId(mockEnv, 'student-1', 'course-1')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('grade-1')
    })

    it('should return null when no grade found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.getByStudentIdAndCourseId(mockEnv, 'student-1', 'course-1')

      expect(result).toBeNull()
    })

    it('should return null when grade is soft-deleted', async () => {
      const deletedGrade = createMockGrade({
        id: 'grade-1',
        deletedAt: '2024-01-02T00:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['index:student-1:course-1:entity:grade-1'],
      })
      mockStub.getDoc.mockResolvedValue({ v: 1, data: deletedGrade })

      const result = await GradeEntity.getByStudentIdAndCourseId(mockEnv, 'student-1', 'course-1')

      expect(result).toBeNull()
    })
  })

  describe('getRecentForStudent', () => {
    it('should return recent grades for student', async () => {
      const grades = [
        createMockGrade({ id: 'grade-1', createdAt: '2024-01-01T10:00:00.000Z' }),
        createMockGrade({ id: 'grade-2', createdAt: '2024-01-02T10:00:00.000Z' }),
      ]

      mockStub.listPrefix.mockResolvedValueOnce({
        keys: [
          'date:2024-01-02T10:00:00.000Z:entity:grade-2',
          'date:2024-01-01T10:00:00.000Z:entity:grade-1',
        ],
      })
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: grades[1] })
        .mockResolvedValueOnce({ v: 1, data: grades[0] })

      const result = await GradeEntity.getRecentForStudent(mockEnv, 'student-1', 10)

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no grades found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.getRecentForStudent(mockEnv, 'student-1', 10)

      expect(result).toHaveLength(0)
    })

    it('should filter out soft-deleted grades', async () => {
      const deletedGrade = createMockGrade({
        id: 'grade-1',
        deletedAt: '2024-01-02T00:00:00.000Z',
      })

      mockStub.listPrefix.mockResolvedValue({
        keys: ['date:2024-01-01T10:00:00.000Z:entity:grade-1'],
      })
      mockStub.getDoc.mockResolvedValue({ v: 1, data: deletedGrade })

      const result = await GradeEntity.getRecentForStudent(mockEnv, 'student-1', 10)

      expect(result).toHaveLength(0)
    })
  })

  describe('createWithAllIndexes', () => {
    it('should create grade with all indexes', async () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

      const grade = createMockGrade({ id: 'grade-1' })

      mockStub.getDoc.mockResolvedValue(null)
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 })
      mockStub.listPrefix.mockResolvedValue({ keys: [] })

      const result = await GradeEntity.createWithAllIndexes(mockEnv, grade)

      expect(result.id).toBe('grade-1')

      vi.useRealTimers()
    })
  })

  describe('deleteWithAllIndexes', () => {
    it('should delete grade and remove indexes', async () => {
      const grade = createMockGrade({ id: 'grade-1' })

      mockStub.getDoc.mockResolvedValue({ v: 1, data: grade })
      mockStub.del.mockResolvedValue(true)
      mockStub.indexRemoveBatch.mockResolvedValue(undefined)

      const result = await GradeEntity.deleteWithAllIndexes(mockEnv, 'grade-1')

      expect(result).toBe(true)
      expect(mockStub.indexRemoveBatch).toHaveBeenCalled()
    })
  })
})
