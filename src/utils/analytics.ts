import type { ChartDataPoint } from '@/components/charts/types';
import { AnalyticsConstants, GRADE_A_THRESHOLD, GRADE_B_THRESHOLD, GRADE_C_THRESHOLD, GRADE_D_THRESHOLD, GRADE_E_THRESHOLD } from '@shared/constants';

const {
  PERCENTAGE_MULTIPLIER,
  DECIMAL_PRECISION,
  TREND_THRESHOLD,
  IQR_MULTIPLIER,
  SLOPE_STABILITY_THRESHOLD,
  MIN_VALUES_FOR_TREND,
  MIN_VALUES_FOR_ANOMALY,
  TOP_PERFORMERS_COUNT,
  ENCOURAGEMENT_SUGGESTIONS_COUNT,
  EXCELLENT_SCORE_THRESHOLD,
  IMPROVEMENT_SCORE_THRESHOLD,
  WARNING_SCORE_THRESHOLD,
} = AnalyticsConstants;

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER;
}

export function calculateSum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

export function calculateMin(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

export function calculateMax(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = calculateAverage(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.round(Math.sqrt(avgSquareDiff) * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER;
}

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

export function getGradeLetter(score: number): string {
  if (score >= GRADE_A_THRESHOLD) return 'A';
  if (score >= GRADE_B_THRESHOLD) return 'B';
  if (score >= GRADE_C_THRESHOLD) return 'C';
  if (score >= GRADE_D_THRESHOLD) return 'D';
  if (score >= GRADE_E_THRESHOLD) return 'E';
  return 'F';
}

export function calculateGradeDistribution(scores: number[]): GradeDistribution {
  const distribution: GradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  
  scores.forEach(score => {
    const grade = getGradeLetter(score);
    distribution[grade]++;
  });
  
  return distribution;
}

export function gradeDistributionToChartData(distribution: GradeDistribution): ChartDataPoint[] {
  return [
    { name: 'A (90-100)', value: distribution.A },
    { name: 'B (80-89)', value: distribution.B },
    { name: 'C (70-79)', value: distribution.C },
    { name: 'D (60-69)', value: distribution.D },
    { name: 'E (50-59)', value: distribution.E },
    { name: 'F (0-49)', value: distribution.F },
  ].filter(item => item.value > 0);
}

export interface TrendData {
  date: string;
  value: number;
}

export function calculateTrendDirection(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < MIN_VALUES_FOR_TREND) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = calculateAverage(firstHalf);
  const secondAvg = calculateAverage(secondHalf);
  
  const threshold = TREND_THRESHOLD;
  
  if (secondAvg > firstAvg + threshold) return 'up';
  if (secondAvg < firstAvg - threshold) return 'down';
  return 'stable';
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : PERCENTAGE_MULTIPLIER;
  return Math.round(((newValue - oldValue) / oldValue) * PERCENTAGE_MULTIPLIER);
}

export function groupByField<T extends Record<string, unknown>>(
  data: T[],
  field: keyof T
): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const key = String(item[field]);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function aggregateByField<T extends Record<string, unknown>>(
  data: T[],
  groupBy: keyof T,
  valueField: keyof T,
  operation: 'sum' | 'avg' | 'count' = 'sum'
): ChartDataPoint[] {
  const grouped = groupByField(data, groupBy);
  
  return Object.entries(grouped).map(([key, items]) => {
    const values = items
      .map(item => Number(item[valueField]))
      .filter(val => !isNaN(val));
    
    let value: number;
    switch (operation) {
      case 'avg':
        value = calculateAverage(values);
        break;
      case 'count':
        value = items.length;
        break;
      case 'sum':
      default:
        value = calculateSum(values);
        break;
    }
    
    return { name: key, value };
  });
}

export function normalizeData(
  data: ChartDataPoint[],
  maxValue: number = PERCENTAGE_MULTIPLIER
): ChartDataPoint[] {
  const maxDataValue = Math.max(...data.map(d => d.value));
  if (maxDataValue === 0) return data;
  
  return data.map(item => ({
    ...item,
    value: Math.round((item.value / maxDataValue) * maxValue),
  }));
}

export function sortByValue(
  data: ChartDataPoint[],
  order: 'asc' | 'desc' = 'desc'
): ChartDataPoint[] {
  return [...data].sort((a, b) => 
    order === 'desc' ? b.value - a.value : a.value - b.value
  );
}

export function topN(data: ChartDataPoint[], n: number): ChartDataPoint[] {
  return sortByValue(data, 'desc').slice(0, n);
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > PERCENTAGE_MULTIPLIER) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  
  if (percentile === 0) return sorted[0];
  if (percentile === PERCENTAGE_MULTIPLIER) return sorted[sorted.length - 1];
  
  const index = (percentile / PERCENTAGE_MULTIPLIER) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) return sorted[lower];
  
  const weight = index - lower;
  return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER;
}

export function calculateMode(values: number[]): number | null {
  if (values.length === 0) return null;
  
  const frequency: Map<number, number> = new Map();
  let maxFreq = 0;
  let mode: number | null = null;
  
  for (const value of values) {
    const freq = (frequency.get(value) || 0) + 1;
    frequency.set(value, freq);
    
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = value;
    }
  }
  
  if (maxFreq === 1) return null;
  
  return mode;
}

export function calculateRange(values: number[]): number {
  if (values.length === 0) return 0;
  return calculateMax(values) - calculateMin(values);
}

const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  E: 0.5,
  F: 0.0,
};

export function calculateGPA(scores: number[]): number {
  if (scores.length === 0) return 0;
  
  const totalPoints = scores.reduce((sum, score) => {
    const grade = getGradeLetter(score);
    return sum + GRADE_POINTS[grade];
  }, 0);
  
  return Math.round((totalPoints / scores.length) * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER;
}

export interface ClassRankResult {
  rank: number;
  totalStudents: number;
  percentile: number;
}

export function calculateClassRank(
  studentScore: number,
  allScores: number[]
): ClassRankResult {
  if (allScores.length === 0) {
    return { rank: 0, totalStudents: 0, percentile: 0 };
  }

  const sortedScores = [...allScores].sort((a, b) => b - a);
  const rank = sortedScores.findIndex(score => score === studentScore) + 1;
  const actualRank = rank > 0 ? rank : allScores.length;
  const percentile = Math.round(((allScores.length - actualRank) / allScores.length) * PERCENTAGE_MULTIPLIER);

  return {
    rank: actualRank,
    totalStudents: allScores.length,
    percentile,
  };
}

export interface PerformanceSummary {
  average: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  gpa: number;
  gradeDistribution: GradeDistribution;
}

export function calculatePerformanceSummary(scores: number[]): PerformanceSummary {
  return {
    average: calculateAverage(scores),
    median: calculateMedian(scores),
    min: calculateMin(scores),
    max: calculateMax(scores),
    standardDeviation: calculateStandardDeviation(scores),
    gpa: calculateGPA(scores),
    gradeDistribution: calculateGradeDistribution(scores),
  };
}

export interface AnomalyDetectionResult {
  outliers: number[];
  lowerBound: number;
  upperBound: number;
  iqr: number;
}

export function detectAnomalies(values: number[]): AnomalyDetectionResult {
  if (values.length < MIN_VALUES_FOR_ANOMALY) {
    return { outliers: [], lowerBound: 0, upperBound: 0, iqr: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;
  const lowerBound = q1 - IQR_MULTIPLIER * iqr;
  const upperBound = q3 + IQR_MULTIPLIER * iqr;
  const outliers = values.filter(v => v < lowerBound || v > upperBound);

  return {
    outliers,
    lowerBound: Math.round(lowerBound * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER,
    upperBound: Math.round(upperBound * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER,
    iqr: Math.round(iqr * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER,
  };
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  slope: number;
  confidence: number;
  prediction?: number;
}

export function analyzeTrend(values: number[]): TrendAnalysis {
  if (values.length < MIN_VALUES_FOR_TREND) {
    return { direction: 'stable', slope: 0, confidence: 0 };
  }

  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = calculateAverage(values);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const slopeAbs = Math.abs(slope);
  const stdDev = calculateStandardDeviation(values);
  const confidence = stdDev > 0 ? Math.min(slopeAbs / stdDev * 10, PERCENTAGE_MULTIPLIER) : 0;

  const direction: 'up' | 'down' | 'stable' =
    slopeAbs < SLOPE_STABILITY_THRESHOLD ? 'stable' : slope > 0 ? 'up' : 'down';

  const prediction = values.length >= MIN_VALUES_FOR_ANOMALY ? Math.round((yMean + slope * n) * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER : undefined;

  return {
    direction,
    slope: Math.round(slope * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER,
    confidence: Math.round(confidence),
    prediction,
  };
}

export interface SubjectPerformance {
  subject: string;
  score: number;
  grade: string;
}

export interface PerformanceInsight {
  type: 'strength' | 'improvement' | 'warning' | 'encouragement';
  subject: string;
  message: string;
  score?: number;
}

export function generatePerformanceInsights(
  performances: SubjectPerformance[]
): PerformanceInsight[] {
  if (performances.length === 0) return [];

  const insights: PerformanceInsight[] = [];
  const sortedByScore = [...performances].sort((a, b) => b.score - a.score);

  const topPerformances = sortedByScore.slice(0, TOP_PERFORMERS_COUNT);
  topPerformances.forEach((perf) => {
    if (perf.score >= EXCELLENT_SCORE_THRESHOLD) {
      insights.push({
        type: 'strength',
        subject: perf.subject,
        message: `Excellent work in ${perf.subject}! Keep up the outstanding performance.`,
        score: perf.score,
      });
    }
  });

  const lowPerformances = sortedByScore.filter((p) => p.score < IMPROVEMENT_SCORE_THRESHOLD);
  lowPerformances.slice(0, TOP_PERFORMERS_COUNT).forEach((perf) => {
    if (perf.score < WARNING_SCORE_THRESHOLD) {
      insights.push({
        type: 'warning',
        subject: perf.subject,
        message: `${perf.subject} needs immediate attention. Consider seeking help from your teacher.`,
        score: perf.score,
      });
    } else {
      insights.push({
        type: 'improvement',
        subject: perf.subject,
        message: `Focus more on ${perf.subject} to improve your understanding.`,
        score: perf.score,
      });
    }
  });

  const goodPerformances = sortedByScore.filter((p) => p.score >= IMPROVEMENT_SCORE_THRESHOLD && p.score < EXCELLENT_SCORE_THRESHOLD);
  goodPerformances.slice(0, ENCOURAGEMENT_SUGGESTIONS_COUNT).forEach((perf) => {
    insights.push({
      type: 'encouragement',
      subject: perf.subject,
      message: `Good progress in ${perf.subject}! A little more effort can push you to the next level.`,
      score: perf.score,
    });
  });

  return insights;
}
