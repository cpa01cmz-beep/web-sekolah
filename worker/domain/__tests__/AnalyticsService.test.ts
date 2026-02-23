import { describe, it, expect } from 'vitest'
import { AnalyticsService } from '../AnalyticsService'
import type { Grade } from '@shared/types'

const createGrade = (score: number, id: string = crypto.randomUUID()): Grade => ({
  id,
  studentId: 'student-1',
  courseId: 'course-1',
  score,
  feedback: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
})

describe('AnalyticsService', () => {
  describe('calculateGradeDistribution', () => {
    it('should return zero distribution for empty grades array', () => {
      const result = AnalyticsService.calculateGradeDistribution([])

      expect(result).toEqual({ A: 0, B: 0, C: 0, D: 0, F: 0 })
    })

    it('should correctly distribute grades by threshold', () => {
      const grades = [
        createGrade(95),
        createGrade(92),
        createGrade(85),
        createGrade(82),
        createGrade(75),
        createGrade(72),
        createGrade(65),
        createGrade(62),
        createGrade(55),
        createGrade(45),
      ]

      const result = AnalyticsService.calculateGradeDistribution(grades)

      expect(result.A).toBe(2)
      expect(result.B).toBe(2)
      expect(result.C).toBe(2)
      expect(result.D).toBe(2)
      expect(result.F).toBe(2)
    })

    it('should handle boundary scores correctly', () => {
      const grades = [
        createGrade(90),
        createGrade(80),
        createGrade(70),
        createGrade(60),
        createGrade(59),
      ]

      const result = AnalyticsService.calculateGradeDistribution(grades)

      expect(result.A).toBe(1)
      expect(result.B).toBe(1)
      expect(result.C).toBe(1)
      expect(result.D).toBe(1)
      expect(result.F).toBe(1)
    })

    it('should handle zero and 100 scores', () => {
      const grades = [createGrade(100), createGrade(0)]

      const result = AnalyticsService.calculateGradeDistribution(grades)

      expect(result.A).toBe(1)
      expect(result.F).toBe(1)
    })
  })

  describe('calculateAverageScore', () => {
    it('should return 0 for empty grades array', () => {
      const result = AnalyticsService.calculateAverageScore([])

      expect(result).toBe(0)
    })

    it('should calculate average correctly', () => {
      const grades = [createGrade(80), createGrade(90), createGrade(70)]

      const result = AnalyticsService.calculateAverageScore(grades)

      expect(result).toBe(80)
    })

    it('should round to one decimal place', () => {
      const grades = [createGrade(85), createGrade(86)]

      const result = AnalyticsService.calculateAverageScore(grades)

      expect(result).toBe(85.5)
    })

    it('should handle single grade', () => {
      const grades = [createGrade(75)]

      const result = AnalyticsService.calculateAverageScore(grades)

      expect(result).toBe(75)
    })
  })

  describe('calculateGradeStatistics', () => {
    it('should return zero statistics for empty grades array', () => {
      const result = AnalyticsService.calculateGradeStatistics([])

      expect(result).toEqual({
        averageScore: 0,
        totalGrades: 0,
        distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        highestScore: 0,
        lowestScore: 0,
      })
    })

    it('should calculate complete statistics correctly', () => {
      const grades = [
        createGrade(95),
        createGrade(85),
        createGrade(75),
        createGrade(65),
        createGrade(55),
      ]

      const result = AnalyticsService.calculateGradeStatistics(grades)

      expect(result.averageScore).toBe(75)
      expect(result.totalGrades).toBe(5)
      expect(result.distribution.A).toBe(1)
      expect(result.distribution.B).toBe(1)
      expect(result.distribution.C).toBe(1)
      expect(result.distribution.D).toBe(1)
      expect(result.distribution.F).toBe(1)
      expect(result.highestScore).toBe(95)
      expect(result.lowestScore).toBe(55)
    })

    it('should find correct highest and lowest scores', () => {
      const grades = [createGrade(45), createGrade(98), createGrade(72)]

      const result = AnalyticsService.calculateGradeStatistics(grades)

      expect(result.highestScore).toBe(98)
      expect(result.lowestScore).toBe(45)
    })
  })

  describe('calculatePassRate', () => {
    it('should return 0 for empty grades array', () => {
      const result = AnalyticsService.calculatePassRate([])

      expect(result).toBe(0)
    })

    it('should calculate pass rate correctly', () => {
      const grades = [
        createGrade(90),
        createGrade(85),
        createGrade(70),
        createGrade(55),
        createGrade(45),
      ]

      const result = AnalyticsService.calculatePassRate(grades)

      expect(result).toBe(60)
    })

    it('should return 100 when all pass', () => {
      const grades = [createGrade(90), createGrade(85), createGrade(70)]

      const result = AnalyticsService.calculatePassRate(grades)

      expect(result).toBe(100)
    })

    it('should return 0 when all fail', () => {
      const grades = [createGrade(45), createGrade(30), createGrade(55)]

      const result = AnalyticsService.calculatePassRate(grades)

      expect(result).toBe(0)
    })
  })
})
