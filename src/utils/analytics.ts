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
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
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

  scores.forEach((score) => {
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
  ].filter((item) => item.value > 0);
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
  return data.reduce(
    (acc, item) => {
      const key = String(item[field]);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export function aggregateByField<T extends Record<string, unknown>>(
  data: T[],
  groupBy: keyof T,
  valueField: keyof T,
  operation: 'sum' | 'avg' | 'count' = 'sum'
): ChartDataPoint[] {
  const grouped = groupByField(data, groupBy);

  return Object.entries(grouped).map(([key, items]) => {
    const values = items.map((item) => Number(item[valueField])).filter((val) => !isNaN(val));

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

export function normalizeData(data: ChartDataPoint[], maxValue: number = 100): ChartDataPoint[] {
  const maxDataValue = Math.max(...data.map((d) => d.value));
  if (maxDataValue === 0) return data;

  return data.map((item) => ({
    ...item,
    value: Math.round((item.value / maxDataValue) * maxValue),
  }));
}

export function sortByValue(
  data: ChartDataPoint[],
  order: 'asc' | 'desc' = 'desc'
): ChartDataPoint[] {
  return [...data].sort((a, b) => (order === 'desc' ? b.value - a.value : a.value - b.value));
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

export function calculateClassRank(studentScore: number, allScores: number[]): ClassRankResult {
  if (allScores.length === 0) {
    return { rank: 0, totalStudents: 0, percentile: 0 };
  }

  const sortedScores = [...allScores].sort((a, b) => b - a);
  const rank = sortedScores.findIndex((score) => score === studentScore) + 1;
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
