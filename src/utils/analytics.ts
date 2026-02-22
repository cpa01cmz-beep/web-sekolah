import type { ChartDataPoint } from '@/components/charts/types';

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 100) / 100;
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
  return Math.round(Math.sqrt(avgSquareDiff) * 100) / 100;
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
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
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
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = calculateAverage(firstHalf);
  const secondAvg = calculateAverage(secondHalf);
  
  const threshold = 2;
  
  if (secondAvg > firstAvg + threshold) return 'up';
  if (secondAvg < firstAvg - threshold) return 'down';
  return 'stable';
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
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
  maxValue: number = 100
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
  if (percentile < 0 || percentile > 100) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  
  if (percentile === 0) return sorted[0];
  if (percentile === 100) return sorted[sorted.length - 1];
  
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) return sorted[lower];
  
  const weight = index - lower;
  return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * 100) / 100;
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
  
  return Math.round((totalPoints / scores.length) * 100) / 100;
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
  const percentile = Math.round(((allScores.length - actualRank) / allScores.length) * 100);

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
  if (scores.length === 0) {
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
      gpa: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
    };
  }

  const sorted = [...scores].sort((a, b) => a - b);
  const n = scores.length;
  const min = sorted[0];
  const max = sorted[n - 1];
  const sum = scores.reduce((acc, val) => acc + val, 0);
  const average = sum / n;
  
  const distribution: GradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  let totalPoints = 0;
  
  for (const score of scores) {
    const grade = getGradeLetter(score);
    distribution[grade]++;
    totalPoints += GRADE_POINTS[grade];
  }
  
  const median = n % 2 !== 0 ? sorted[Math.floor(n / 2)] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const variance = scores.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / n;

  return {
    average: Math.round(average * 100) / 100,
    median,
    min,
    max,
    standardDeviation: Math.round(Math.sqrt(variance) * 100) / 100,
    gpa: Math.round((totalPoints / n) * 100) / 100,
    gradeDistribution: distribution,
  };
}

export interface AnomalyDetectionResult {
  outliers: number[];
  lowerBound: number;
  upperBound: number;
  iqr: number;
}

export function detectAnomalies(values: number[]): AnomalyDetectionResult {
  if (values.length < 4) {
    return { outliers: [], lowerBound: 0, upperBound: 0, iqr: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = values.filter(v => v < lowerBound || v > upperBound);

  return {
    outliers,
    lowerBound: Math.round(lowerBound * 100) / 100,
    upperBound: Math.round(upperBound * 100) / 100,
    iqr: Math.round(iqr * 100) / 100,
  };
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  slope: number;
  confidence: number;
  prediction?: number;
}

export function analyzeTrend(values: number[]): TrendAnalysis {
  if (values.length < 2) {
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
  const confidence = stdDev > 0 ? Math.min(slopeAbs / stdDev * 10, 100) : 0;

  const direction: 'up' | 'down' | 'stable' =
    slopeAbs < 0.1 ? 'stable' : slope > 0 ? 'up' : 'down';

  const prediction = values.length >= 3 ? Math.round((yMean + slope * n) * 100) / 100 : undefined;

  return {
    direction,
    slope: Math.round(slope * 100) / 100,
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

  const topPerformances = sortedByScore.slice(0, 3);
  topPerformances.forEach((perf) => {
    if (perf.score >= 85) {
      insights.push({
        type: 'strength',
        subject: perf.subject,
        message: `Excellent work in ${perf.subject}! Keep up the outstanding performance.`,
        score: perf.score,
      });
    }
  });

  const lowPerformances = sortedByScore.filter((p) => p.score < 70);
  lowPerformances.slice(0, 3).forEach((perf) => {
    if (perf.score < 60) {
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

  const goodPerformances = sortedByScore.filter((p) => p.score >= 70 && p.score < 85);
  goodPerformances.slice(0, 2).forEach((perf) => {
    insights.push({
      type: 'encouragement',
      subject: perf.subject,
      message: `Good progress in ${perf.subject}! A little more effort can push you to the next level.`,
      score: perf.score,
    });
  });

  return insights;
}
