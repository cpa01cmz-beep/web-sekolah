import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePerformanceAnalytics } from '../usePerformanceAnalytics'
import type { GradeData } from '../usePerformanceAnalytics'

describe('usePerformanceAnalytics', () => {
  describe('empty data handling', () => {
    it('should return default values for empty array', () => {
      const { result } = renderHook(() => usePerformanceAnalytics([]))

      expect(result.current.hasData).toBe(false)
      expect(result.current.totalGrades).toBe(0)
      expect(result.current.gpa).toBe(0)
      expect(result.current.averageScore).toBe(0)
      expect(result.current.minScore).toBe(0)
      expect(result.current.maxScore).toBe(0)
      expect(result.current.medianScore).toBe(0)
      expect(result.current.standardDeviation).toBe(0)
      expect(result.current.insights).toEqual([])
    })

    it('should return default values for undefined input', () => {
      const { result } = renderHook(() =>
        usePerformanceAnalytics(undefined as unknown as GradeData[])
      )

      expect(result.current.hasData).toBe(false)
      expect(result.current.totalGrades).toBe(0)
    })

    it('should return default values for null input', () => {
      const { result } = renderHook(() => usePerformanceAnalytics(null as unknown as GradeData[]))

      expect(result.current.hasData).toBe(false)
      expect(result.current.totalGrades).toBe(0)
    })
  })

  describe('basic calculations', () => {
    it('should calculate GPA correctly', () => {
      const grades: GradeData[] = [
        { score: 95, subject: 'Math' },
        { score: 85, subject: 'Science' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.gpa).toBe(3.5)
    })

    it('should calculate average score correctly', () => {
      const grades: GradeData[] = [
        { score: 80, subject: 'Math' },
        { score: 90, subject: 'Science' },
        { score: 70, subject: 'History' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.averageScore).toBe(80)
    })

    it('should calculate min and max scores', () => {
      const grades: GradeData[] = [
        { score: 95, subject: 'Math' },
        { score: 65, subject: 'Science' },
        { score: 80, subject: 'History' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.minScore).toBe(65)
      expect(result.current.maxScore).toBe(95)
    })

    it('should calculate median score correctly', () => {
      const grades: GradeData[] = [
        { score: 90, subject: 'Math' },
        { score: 70, subject: 'Science' },
        { score: 80, subject: 'History' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.medianScore).toBe(80)
    })

    it('should calculate standard deviation', () => {
      const grades: GradeData[] = [
        { score: 85, subject: 'Math' },
        { score: 85, subject: 'Science' },
        { score: 85, subject: 'History' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.standardDeviation).toBe(0)
    })
  })

  describe('grade distribution', () => {
    it('should calculate grade distribution correctly', () => {
      const grades: GradeData[] = [
        { score: 95, subject: 'Math' },
        { score: 85, subject: 'Science' },
        { score: 75, subject: 'History' },
        { score: 65, subject: 'English' },
        { score: 55, subject: 'Art' },
        { score: 45, subject: 'PE' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.gradeDistribution.A).toBe(1)
      expect(result.current.gradeDistribution.B).toBe(1)
      expect(result.current.gradeDistribution.C).toBe(1)
      expect(result.current.gradeDistribution.D).toBe(1)
      expect(result.current.gradeDistribution.E).toBe(1)
      expect(result.current.gradeDistribution.F).toBe(1)
    })

    it('should handle all A grades', () => {
      const grades: GradeData[] = [
        { score: 95, subject: 'Math' },
        { score: 98, subject: 'Science' },
        { score: 92, subject: 'History' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.gradeDistribution.A).toBe(3)
      expect(result.current.gradeDistribution.B).toBe(0)
    })
  })

  describe('trend analysis', () => {
    it('should detect upward trend', () => {
      const grades: GradeData[] = [
        { score: 60, subject: 'Math' },
        { score: 70, subject: 'Science' },
        { score: 80, subject: 'History' },
        { score: 90, subject: 'English' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.trend.direction).toBe('up')
      expect(result.current.trend.slope).toBeGreaterThan(0)
    })

    it('should detect downward trend', () => {
      const grades: GradeData[] = [
        { score: 90, subject: 'Math' },
        { score: 80, subject: 'Science' },
        { score: 70, subject: 'History' },
        { score: 60, subject: 'English' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.trend.direction).toBe('down')
      expect(result.current.trend.slope).toBeLessThan(0)
    })

    it('should detect stable trend', () => {
      const grades: GradeData[] = [
        { score: 75, subject: 'Math' },
        { score: 75, subject: 'Science' },
        { score: 75, subject: 'History' },
        { score: 75, subject: 'English' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.trend.direction).toBe('stable')
    })
  })

  describe('performance insights', () => {
    it('should generate strength insights for high scores', () => {
      const grades: GradeData[] = [
        { score: 95, subject: 'Math' },
        { score: 98, subject: 'Science' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.insights.length).toBeGreaterThan(0)
      expect(result.current.insights.some(i => i.type === 'strength')).toBe(true)
    })

    it('should generate warning insights for very low scores', () => {
      const grades: GradeData[] = [
        { score: 45, subject: 'History' },
        { score: 90, subject: 'Math' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      const warning = result.current.insights.find(i => i.type === 'warning')
      expect(warning).toBeDefined()
      expect(warning?.subject).toBe('History')
    })

    it('should generate improvement insights for moderate low scores', () => {
      const grades: GradeData[] = [
        { score: 65, subject: 'Physics' },
        { score: 90, subject: 'Math' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      const improvement = result.current.insights.find(i => i.type === 'improvement')
      expect(improvement).toBeDefined()
    })
  })

  describe('summary object', () => {
    it('should return complete summary', () => {
      const grades: GradeData[] = [
        { score: 85, subject: 'Math' },
        { score: 90, subject: 'Science' },
        { score: 75, subject: 'History' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.summary).toBeDefined()
      expect(result.current.summary.average).toBe(83.33)
      expect(result.current.summary.gpa).toBeDefined()
      expect(result.current.summary.gradeDistribution).toBeDefined()
    })
  })

  describe('total grades count', () => {
    it('should count total grades correctly', () => {
      const grades: GradeData[] = [
        { score: 85, subject: 'Math' },
        { score: 90, subject: 'Science' },
        { score: 75, subject: 'History' },
        { score: 80, subject: 'English' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.totalGrades).toBe(4)
      expect(result.current.hasData).toBe(true)
    })
  })

  describe('with courseName instead of subject', () => {
    it('should work with courseName field', () => {
      const grades: GradeData[] = [
        { score: 90, courseName: 'Mathematics' },
        { score: 80, courseName: 'Physics' },
      ]

      const { result } = renderHook(() => usePerformanceAnalytics(grades))

      expect(result.current.hasData).toBe(true)
      expect(result.current.averageScore).toBe(85)
      expect(result.current.insights.length).toBeGreaterThan(0)
    })
  })

  describe('memoization', () => {
    it('should return same result for same input', () => {
      const grades: GradeData[] = [
        { score: 85, subject: 'Math' },
        { score: 90, subject: 'Science' },
      ]

      const { result, rerender } = renderHook(() => usePerformanceAnalytics(grades))

      const firstResult = result.current
      rerender()
      expect(result.current).toBe(firstResult)
    })

    it('should update when grades change', () => {
      const { result, rerender } = renderHook(({ grades }) => usePerformanceAnalytics(grades), {
        initialProps: {
          grades: [{ score: 80, subject: 'Math' }] as GradeData[],
        },
      })

      expect(result.current.averageScore).toBe(80)

      rerender({
        grades: [
          { score: 90, subject: 'Math' },
          { score: 90, subject: 'Science' },
        ],
      })

      expect(result.current.averageScore).toBe(90)
    })
  })
})
