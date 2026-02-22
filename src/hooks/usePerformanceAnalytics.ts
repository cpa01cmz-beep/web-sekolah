import { useMemo } from 'react';
import {
  calculateGPA,
  calculateAverage,
  calculateMin,
  calculateMax,
  calculateMedian,
  calculateStandardDeviation,
  calculateGradeDistribution,
  calculatePerformanceSummary,
  analyzeTrend,
  generatePerformanceInsights,
  type PerformanceSummary,
  type GradeDistribution,
  type TrendAnalysis,
  type PerformanceInsight,
  type SubjectPerformance,
} from '@/utils/analytics';

export interface GradeData {
  score: number;
  subject?: string;
  courseName?: string;
}

export interface PerformanceAnalyticsResult {
  gpa: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  medianScore: number;
  standardDeviation: number;
  gradeDistribution: GradeDistribution;
  summary: PerformanceSummary;
  trend: TrendAnalysis;
  insights: PerformanceInsight[];
  totalGrades: number;
  hasData: boolean;
}

const EMPTY_GRADE_DISTRIBUTION: GradeDistribution = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  E: 0,
  F: 0,
};

const EMPTY_TREND: TrendAnalysis = {
  direction: 'stable',
  slope: 0,
  confidence: 0,
};

const EMPTY_SUMMARY: PerformanceSummary = {
  average: 0,
  median: 0,
  min: 0,
  max: 0,
  standardDeviation: 0,
  gpa: 0,
  gradeDistribution: EMPTY_GRADE_DISTRIBUTION,
};

export function usePerformanceAnalytics(grades: GradeData[]): PerformanceAnalyticsResult {
  return useMemo(() => {
    if (!grades || grades.length === 0) {
      return {
        gpa: 0,
        averageScore: 0,
        minScore: 0,
        maxScore: 0,
        medianScore: 0,
        standardDeviation: 0,
        gradeDistribution: EMPTY_GRADE_DISTRIBUTION,
        summary: EMPTY_SUMMARY,
        trend: EMPTY_TREND,
        insights: [],
        totalGrades: 0,
        hasData: false,
      };
    }

    const scores = grades.map((g) => g.score);
    const subjectPerformances: SubjectPerformance[] = grades.map((g) => ({
      subject: g.subject || g.courseName || 'Unknown',
      score: g.score,
      grade: g.score >= 90 ? 'A' : g.score >= 80 ? 'B' : g.score >= 70 ? 'C' : g.score >= 60 ? 'D' : g.score >= 50 ? 'E' : 'F',
    }));

    return {
      gpa: calculateGPA(scores),
      averageScore: calculateAverage(scores),
      minScore: calculateMin(scores),
      maxScore: calculateMax(scores),
      medianScore: calculateMedian(scores),
      standardDeviation: calculateStandardDeviation(scores),
      gradeDistribution: calculateGradeDistribution(scores),
      summary: calculatePerformanceSummary(scores),
      trend: analyzeTrend(scores),
      insights: generatePerformanceInsights(subjectPerformances),
      totalGrades: grades.length,
      hasData: true,
    };
  }, [grades]);
}
