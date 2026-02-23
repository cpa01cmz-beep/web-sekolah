import type { Grade } from '@shared/types'
import { GradeThresholds } from './constants'

export interface GradeDistribution {
  A: number
  B: number
  C: number
  D: number
  F: number
}

export interface GradeStatistics {
  averageScore: number
  totalGrades: number
  distribution: GradeDistribution
  highestScore: number
  lowestScore: number
}

export class AnalyticsService {
  static calculateGradeDistribution(grades: Grade[]): GradeDistribution {
    const distribution: GradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }

    for (const grade of grades) {
      if (grade.score >= GradeThresholds.A) distribution.A++
      else if (grade.score >= GradeThresholds.B) distribution.B++
      else if (grade.score >= GradeThresholds.C) distribution.C++
      else if (grade.score >= GradeThresholds.PASSING_SCORE) distribution.D++
      else distribution.F++
    }

    return distribution
  }

  static calculateAverageScore(grades: Grade[]): number {
    if (grades.length === 0) return 0

    const sum = grades.reduce((acc, grade) => acc + grade.score, 0)
    return (
      Math.round((sum / grades.length) * GradeThresholds.PRECISION_FACTOR) /
      GradeThresholds.PRECISION_FACTOR
    )
  }

  static calculateGradeStatistics(grades: Grade[]): GradeStatistics {
    if (grades.length === 0) {
      return {
        averageScore: 0,
        totalGrades: 0,
        distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        highestScore: 0,
        lowestScore: 0,
      }
    }

    const scores = grades.map(g => g.score)
    const sum = scores.reduce((acc, score) => acc + score, 0)

    return {
      averageScore:
        Math.round((sum / grades.length) * GradeThresholds.PRECISION_FACTOR) /
        GradeThresholds.PRECISION_FACTOR,
      totalGrades: grades.length,
      distribution: this.calculateGradeDistribution(grades),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
    }
  }

  static calculatePassRate(grades: Grade[]): number {
    if (grades.length === 0) return 0

    const passingCount = grades.filter(g => g.score >= GradeThresholds.PASSING_SCORE).length
    return Math.round((passingCount / grades.length) * 100)
  }
}
