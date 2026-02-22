import { describe, it, expect } from 'vitest';
import {
  calculateAverage,
  calculateSum,
  calculateMin,
  calculateMax,
  calculateMedian,
  calculateStandardDeviation,
  getGradeLetter,
  calculateGradeDistribution,
  gradeDistributionToChartData,
  calculateTrendDirection,
  calculatePercentageChange,
  groupByField,
  aggregateByField,
  normalizeData,
  sortByValue,
  topN,
  calculatePercentile,
  calculateMode,
  calculateRange,
  calculateGPA,
  calculateClassRank,
  calculatePerformanceSummary,
  detectAnomalies,
  analyzeTrend,
  generatePerformanceInsights,
  identifyAtRiskStudents,
  calculatePassRate,
  getTopPerformers,
} from '../analytics';

describe('Analytics Utilities', () => {
  describe('calculateAverage', () => {
    it('calculates average of numbers', () => {
      expect(calculateAverage([10, 20, 30])).toBe(20);
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it('returns 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0);
    });

    it('rounds to 2 decimal places', () => {
      expect(calculateAverage([1, 2])).toBe(1.5);
      expect(calculateAverage([1, 2, 3])).toBe(2);
    });
  });

  describe('calculateSum', () => {
    it('calculates sum of numbers', () => {
      expect(calculateSum([1, 2, 3])).toBe(6);
      expect(calculateSum([10, -5, 3])).toBe(8);
    });

    it('returns 0 for empty array', () => {
      expect(calculateSum([])).toBe(0);
    });
  });

  describe('calculateMin', () => {
    it('returns minimum value', () => {
      expect(calculateMin([5, 3, 8, 1, 9])).toBe(1);
    });

    it('returns 0 for empty array', () => {
      expect(calculateMin([])).toBe(0);
    });
  });

  describe('calculateMax', () => {
    it('returns maximum value', () => {
      expect(calculateMax([5, 3, 8, 1, 9])).toBe(9);
    });

    it('returns 0 for empty array', () => {
      expect(calculateMax([])).toBe(0);
    });
  });

  describe('calculateMedian', () => {
    it('calculates median for odd length', () => {
      expect(calculateMedian([1, 2, 3])).toBe(2);
      expect(calculateMedian([1, 5, 3])).toBe(3);
    });

    it('calculates median for even length', () => {
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    });

    it('returns 0 for empty array', () => {
      expect(calculateMedian([])).toBe(0);
    });
  });

  describe('calculateStandardDeviation', () => {
    it('calculates standard deviation', () => {
      const result = calculateStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(result).toBeCloseTo(2, 0);
    });

    it('returns 0 for empty array', () => {
      expect(calculateStandardDeviation([])).toBe(0);
    });
  });

  describe('getGradeLetter', () => {
    it('returns A for scores 90-100', () => {
      expect(getGradeLetter(90)).toBe('A');
      expect(getGradeLetter(95)).toBe('A');
      expect(getGradeLetter(100)).toBe('A');
    });

    it('returns B for scores 80-89', () => {
      expect(getGradeLetter(80)).toBe('B');
      expect(getGradeLetter(85)).toBe('B');
      expect(getGradeLetter(89)).toBe('B');
    });

    it('returns C for scores 70-79', () => {
      expect(getGradeLetter(70)).toBe('C');
      expect(getGradeLetter(75)).toBe('C');
    });

    it('returns D for scores 60-69', () => {
      expect(getGradeLetter(60)).toBe('D');
      expect(getGradeLetter(65)).toBe('D');
    });

    it('returns E for scores 50-59', () => {
      expect(getGradeLetter(50)).toBe('E');
      expect(getGradeLetter(55)).toBe('E');
    });

    it('returns F for scores below 50', () => {
      expect(getGradeLetter(0)).toBe('F');
      expect(getGradeLetter(25)).toBe('F');
      expect(getGradeLetter(49)).toBe('F');
    });
  });

  describe('calculateGradeDistribution', () => {
    it('calculates grade distribution', () => {
      const scores = [95, 85, 75, 65, 55, 45];
      const distribution = calculateGradeDistribution(scores);
      
      expect(distribution.A).toBe(1);
      expect(distribution.B).toBe(1);
      expect(distribution.C).toBe(1);
      expect(distribution.D).toBe(1);
      expect(distribution.E).toBe(1);
      expect(distribution.F).toBe(1);
    });

    it('returns zeros for empty array', () => {
      const distribution = calculateGradeDistribution([]);
      expect(distribution).toEqual({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 });
    });
  });

  describe('gradeDistributionToChartData', () => {
    it('converts distribution to chart data', () => {
      const distribution = { A: 2, B: 3, C: 1, D: 0, E: 0, F: 0 };
      const chartData = gradeDistributionToChartData(distribution);
      
      expect(chartData).toHaveLength(3);
      expect(chartData[0]).toEqual({ name: 'A (90-100)', value: 2 });
      expect(chartData[1]).toEqual({ name: 'B (80-89)', value: 3 });
      expect(chartData[2]).toEqual({ name: 'C (70-79)', value: 1 });
    });
  });

  describe('calculateTrendDirection', () => {
    it('returns up for increasing trend', () => {
      expect(calculateTrendDirection([10, 20, 30, 40])).toBe('up');
    });

    it('returns down for decreasing trend', () => {
      expect(calculateTrendDirection([40, 30, 20, 10])).toBe('down');
    });

    it('returns stable for flat trend', () => {
      expect(calculateTrendDirection([20, 20, 20, 20])).toBe('stable');
    });

    it('returns stable for single value', () => {
      expect(calculateTrendDirection([50])).toBe('stable');
    });

    it('returns stable for empty array', () => {
      expect(calculateTrendDirection([])).toBe('stable');
    });
  });

  describe('calculatePercentageChange', () => {
    it('calculates positive change', () => {
      expect(calculatePercentageChange(100, 150)).toBe(50);
    });

    it('calculates negative change', () => {
      expect(calculatePercentageChange(100, 50)).toBe(-50);
    });

    it('handles zero old value', () => {
      expect(calculatePercentageChange(0, 100)).toBe(100);
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });
  });

  describe('groupByField', () => {
    it('groups data by field', () => {
      const data = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      
      const grouped = groupByField(data, 'category');
      
      expect(grouped['A']).toHaveLength(2);
      expect(grouped['B']).toHaveLength(1);
    });
  });

  describe('aggregateByField', () => {
    it('aggregates by sum', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
        { category: 'A', value: 30 },
      ];
      
      const result = aggregateByField(data, 'category', 'value', 'sum');
      
      expect(result.find(r => r.name === 'A')?.value).toBe(40);
      expect(result.find(r => r.name === 'B')?.value).toBe(20);
    });

    it('aggregates by avg', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'A', value: 20 },
      ];
      
      const result = aggregateByField(data, 'category', 'value', 'avg');
      
      expect(result.find(r => r.name === 'A')?.value).toBe(15);
    });

    it('aggregates by count', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'A', value: 20 },
        { category: 'B', value: 30 },
      ];
      
      const result = aggregateByField(data, 'category', 'value', 'count');
      
      expect(result.find(r => r.name === 'A')?.value).toBe(2);
      expect(result.find(r => r.name === 'B')?.value).toBe(1);
    });
  });

  describe('normalizeData', () => {
    it('normalizes data to max value', () => {
      const data = [
        { name: 'A', value: 50 },
        { name: 'B', value: 100 },
      ];
      
      const normalized = normalizeData(data, 100);
      
      expect(normalized[0].value).toBe(50);
      expect(normalized[1].value).toBe(100);
    });

    it('returns data as-is when max is 0', () => {
      const data = [
        { name: 'A', value: 0 },
        { name: 'B', value: 0 },
      ];
      
      const normalized = normalizeData(data, 100);
      
      expect(normalized).toEqual(data);
    });
  });

  describe('sortByValue', () => {
    it('sorts descending by default', () => {
      const data = [
        { name: 'A', value: 10 },
        { name: 'B', value: 30 },
        { name: 'C', value: 20 },
      ];
      
      const sorted = sortByValue(data);
      
      expect(sorted[0].value).toBe(30);
      expect(sorted[1].value).toBe(20);
      expect(sorted[2].value).toBe(10);
    });

    it('sorts ascending when specified', () => {
      const data = [
        { name: 'A', value: 10 },
        { name: 'B', value: 30 },
        { name: 'C', value: 20 },
      ];
      
      const sorted = sortByValue(data, 'asc');
      
      expect(sorted[0].value).toBe(10);
      expect(sorted[1].value).toBe(20);
      expect(sorted[2].value).toBe(30);
    });
  });

  describe('topN', () => {
    it('returns top N items', () => {
      const data = [
        { name: 'A', value: 10 },
        { name: 'B', value: 30 },
        { name: 'C', value: 20 },
        { name: 'D', value: 40 },
      ];
      
      const top2 = topN(data, 2);
      
      expect(top2).toHaveLength(2);
      expect(top2[0].value).toBe(40);
      expect(top2[1].value).toBe(30);
    });
  });

  describe('calculatePercentile', () => {
    it('returns 0 for empty array', () => {
      expect(calculatePercentile([], 50)).toBe(0);
    });

    it('returns 0 for invalid percentile (negative)', () => {
      expect(calculatePercentile([1, 2, 3], -10)).toBe(0);
    });

    it('returns 0 for invalid percentile (> 100)', () => {
      expect(calculatePercentile([1, 2, 3], 150)).toBe(0);
    });

    it('returns minimum for 0th percentile', () => {
      expect(calculatePercentile([10, 20, 30, 40, 50], 0)).toBe(10);
    });

    it('returns maximum for 100th percentile', () => {
      expect(calculatePercentile([10, 20, 30, 40, 50], 100)).toBe(50);
    });

    it('calculates 50th percentile (median)', () => {
      expect(calculatePercentile([10, 20, 30, 40, 50], 50)).toBe(30);
    });

    it('calculates 25th percentile', () => {
      expect(calculatePercentile([10, 20, 30, 40, 50], 25)).toBe(20);
    });

    it('calculates 75th percentile', () => {
      expect(calculatePercentile([10, 20, 30, 40, 50], 75)).toBe(40);
    });

    it('interpolates between values', () => {
      const result = calculatePercentile([10, 20, 30, 40], 50);
      expect(result).toBe(25);
    });

    it('works with unsorted input', () => {
      expect(calculatePercentile([50, 10, 40, 20, 30], 50)).toBe(30);
    });
  });

  describe('calculateMode', () => {
    it('returns null for empty array', () => {
      expect(calculateMode([])).toBeNull();
    });

    it('returns null when all values are unique', () => {
      expect(calculateMode([1, 2, 3, 4, 5])).toBeNull();
    });

    it('returns the most frequent value', () => {
      expect(calculateMode([1, 2, 2, 3, 4])).toBe(2);
    });

    it('handles multiple modes by returning first encountered', () => {
      const result = calculateMode([1, 1, 2, 2, 3]);
      expect(result).toBe(1);
    });

    it('handles single value repeated', () => {
      expect(calculateMode([5, 5, 5, 5])).toBe(5);
    });
  });

  describe('calculateRange', () => {
    it('returns 0 for empty array', () => {
      expect(calculateRange([])).toBe(0);
    });

    it('calculates range of values', () => {
      expect(calculateRange([10, 20, 30, 40, 50])).toBe(40);
    });

    it('handles negative values', () => {
      expect(calculateRange([-10, 0, 10])).toBe(20);
    });

    it('returns 0 for single value', () => {
      expect(calculateRange([42])).toBe(0);
    });
  });

  describe('calculateGPA', () => {
    it('returns 0 for empty array', () => {
      expect(calculateGPA([])).toBe(0);
    });

    it('calculates GPA for all A grades', () => {
      expect(calculateGPA([95, 98, 92, 100])).toBe(4.0);
    });

    it('calculates GPA for mixed grades', () => {
      const result = calculateGPA([95, 85, 75, 65]);
      expect(result).toBe(2.5);
    });

    it('calculates GPA for all F grades', () => {
      expect(calculateGPA([20, 30, 40])).toBe(0);
    });

    it('handles single grade', () => {
      expect(calculateGPA([90])).toBe(4.0);
      expect(calculateGPA([80])).toBe(3.0);
    });
  });

  describe('calculateClassRank', () => {
    it('returns rank 0 for empty array', () => {
      const result = calculateClassRank(85, []);
      expect(result).toEqual({ rank: 0, totalStudents: 0, percentile: 0 });
    });

    it('calculates rank for top student', () => {
      const result = calculateClassRank(95, [85, 90, 95, 80, 75]);
      expect(result.rank).toBe(1);
      expect(result.totalStudents).toBe(5);
      expect(result.percentile).toBe(80);
    });

    it('calculates rank for middle student', () => {
      const result = calculateClassRank(85, [95, 90, 85, 80, 75]);
      expect(result.rank).toBe(3);
      expect(result.totalStudents).toBe(5);
      expect(result.percentile).toBe(40);
    });

    it('calculates rank for bottom student', () => {
      const result = calculateClassRank(70, [95, 90, 85, 80, 70]);
      expect(result.rank).toBe(5);
      expect(result.totalStudents).toBe(5);
      expect(result.percentile).toBe(0);
    });

    it('handles single student', () => {
      const result = calculateClassRank(85, [85]);
      expect(result.rank).toBe(1);
      expect(result.totalStudents).toBe(1);
      expect(result.percentile).toBe(0);
    });

    it('handles duplicate scores', () => {
      const result = calculateClassRank(85, [85, 85, 85]);
      expect(result.rank).toBe(1);
      expect(result.totalStudents).toBe(3);
    });

    it('returns last rank for score not in array', () => {
      const result = calculateClassRank(60, [95, 90, 85, 80, 75]);
      expect(result.rank).toBe(5);
      expect(result.totalStudents).toBe(5);
    });
  });

  describe('calculatePerformanceSummary', () => {
    it('returns complete summary for valid scores', () => {
      const summary = calculatePerformanceSummary([85, 90, 75, 80, 95]);
      
      expect(summary.average).toBe(85);
      expect(summary.median).toBe(85);
      expect(summary.min).toBe(75);
      expect(summary.max).toBe(95);
      expect(summary.standardDeviation).toBeCloseTo(7, 0);
      expect(summary.gpa).toBeCloseTo(3.2, 1);
      expect(summary.gradeDistribution).toBeDefined();
    });

    it('returns zeros for empty array', () => {
      const summary = calculatePerformanceSummary([]);
      
      expect(summary.average).toBe(0);
      expect(summary.median).toBe(0);
      expect(summary.min).toBe(0);
      expect(summary.max).toBe(0);
      expect(summary.standardDeviation).toBe(0);
      expect(summary.gpa).toBe(0);
      expect(summary.gradeDistribution).toEqual({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 });
    });

    it('calculates grade distribution correctly', () => {
      const summary = calculatePerformanceSummary([95, 85, 75, 65, 55]);
      
      expect(summary.gradeDistribution.A).toBe(1);
      expect(summary.gradeDistribution.B).toBe(1);
      expect(summary.gradeDistribution.C).toBe(1);
      expect(summary.gradeDistribution.D).toBe(1);
      expect(summary.gradeDistribution.E).toBe(1);
      expect(summary.gradeDistribution.F).toBe(0);
    });
  });

  describe('detectAnomalies', () => {
    it('returns empty result for arrays with less than 4 values', () => {
      expect(detectAnomalies([])).toEqual({ outliers: [], lowerBound: 0, upperBound: 0, iqr: 0 });
      expect(detectAnomalies([1])).toEqual({ outliers: [], lowerBound: 0, upperBound: 0, iqr: 0 });
      expect(detectAnomalies([1, 2])).toEqual({ outliers: [], lowerBound: 0, upperBound: 0, iqr: 0 });
      expect(detectAnomalies([1, 2, 3])).toEqual({ outliers: [], lowerBound: 0, upperBound: 0, iqr: 0 });
    });

    it('detects no outliers in normal data', () => {
      const result = detectAnomalies([10, 12, 14, 16, 18, 20]);
      expect(result.outliers).toHaveLength(0);
      expect(result.iqr).toBeGreaterThan(0);
    });

    it('detects lower outliers', () => {
      const result = detectAnomalies([10, 12, 14, 16, 18, 20, -100]);
      expect(result.outliers).toContain(-100);
    });

    it('detects upper outliers', () => {
      const result = detectAnomalies([10, 12, 14, 16, 18, 20, 100]);
      expect(result.outliers).toContain(100);
    });

    it('calculates IQR correctly', () => {
      const result = detectAnomalies([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(result.iqr).toBeGreaterThan(0);
    });

    it('returns correct bounds', () => {
      const result = detectAnomalies([10, 12, 14, 16, 18, 20]);
      expect(result.lowerBound).toBeLessThan(10);
      expect(result.upperBound).toBeGreaterThan(20);
    });
  });

  describe('analyzeTrend', () => {
    it('returns stable for arrays with less than 2 values', () => {
      expect(analyzeTrend([])).toEqual({ direction: 'stable', slope: 0, confidence: 0 });
      expect(analyzeTrend([50])).toEqual({ direction: 'stable', slope: 0, confidence: 0 });
    });

    it('detects upward trend', () => {
      const result = analyzeTrend([10, 20, 30, 40, 50]);
      expect(result.direction).toBe('up');
      expect(result.slope).toBeGreaterThan(0);
    });

    it('detects downward trend', () => {
      const result = analyzeTrend([50, 40, 30, 20, 10]);
      expect(result.direction).toBe('down');
      expect(result.slope).toBeLessThan(0);
    });

    it('detects stable trend', () => {
      const result = analyzeTrend([50, 50, 50, 50, 50]);
      expect(result.direction).toBe('stable');
      expect(Math.abs(result.slope)).toBeLessThan(0.1);
    });

    it('calculates slope correctly', () => {
      const result = analyzeTrend([0, 10, 20, 30, 40]);
      expect(result.slope).toBeCloseTo(10, 0);
    });

    it('returns confidence between 0 and 100', () => {
      const result = analyzeTrend([10, 20, 30, 40, 50]);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('provides prediction for 3+ values', () => {
      const result = analyzeTrend([10, 20, 30, 40, 50]);
      expect(result.prediction).toBeDefined();
      expect(result.prediction).toBeGreaterThan(50);
    });

    it('does not provide prediction for less than 3 values', () => {
      const result = analyzeTrend([10, 20]);
      expect(result.prediction).toBeUndefined();
    });
  });

  describe('generatePerformanceInsights', () => {
    it('returns empty array for empty input', () => {
      expect(generatePerformanceInsights([])).toEqual([]);
    });

    it('generates strength insight for high scores', () => {
      const performances = [
        { subject: 'Math', score: 95, grade: 'A' },
        { subject: 'Science', score: 92, grade: 'A' },
      ];
      const insights = generatePerformanceInsights(performances);

      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some((i) => i.type === 'strength')).toBe(true);
    });

    it('generates warning insight for very low scores', () => {
      const performances = [
        { subject: 'History', score: 45, grade: 'F' },
        { subject: 'Art', score: 88, grade: 'B' },
      ];
      const insights = generatePerformanceInsights(performances);

      const warning = insights.find((i) => i.type === 'warning');
      expect(warning).toBeDefined();
      expect(warning?.subject).toBe('History');
      expect(warning?.score).toBe(45);
    });

    it('generates improvement insight for moderate low scores', () => {
      const performances = [
        { subject: 'Physics', score: 65, grade: 'D' },
        { subject: 'Chemistry', score: 90, grade: 'A' },
      ];
      const insights = generatePerformanceInsights(performances);

      const improvement = insights.find((i) => i.type === 'improvement');
      expect(improvement).toBeDefined();
      expect(improvement?.subject).toBe('Physics');
    });

    it('generates encouragement insight for good scores', () => {
      const performances = [
        { subject: 'English', score: 75, grade: 'C' },
        { subject: 'Math', score: 95, grade: 'A' },
      ];
      const insights = generatePerformanceInsights(performances);

      const encouragement = insights.find((i) => i.type === 'encouragement');
      expect(encouragement).toBeDefined();
      expect(encouragement?.subject).toBe('English');
    });

    it('includes message in each insight', () => {
      const performances = [
        { subject: 'Math', score: 90, grade: 'A' },
        { subject: 'Science', score: 50, grade: 'F' },
      ];
      const insights = generatePerformanceInsights(performances);

      insights.forEach((insight) => {
        expect(insight.message.length).toBeGreaterThan(0);
        expect(insight.message).toContain(insight.subject);
      });
    });

    it('handles mixed performance correctly', () => {
      const performances = [
        { subject: 'Math', score: 95, grade: 'A' },
        { subject: 'Physics', score: 75, grade: 'C' },
        { subject: 'Chemistry', score: 55, grade: 'F' },
        { subject: 'Biology', score: 88, grade: 'B' },
      ];
      const insights = generatePerformanceInsights(performances);

      const types = insights.map((i) => i.type);
      expect(types).toContain('strength');
      expect(types).toContain('warning');
    });

    it('sorts subjects by score for top performers', () => {
      const performances = [
        { subject: 'Art', score: 98, grade: 'A' },
        { subject: 'Music', score: 96, grade: 'A' },
        { subject: 'PE', score: 94, grade: 'A' },
      ];
      const insights = generatePerformanceInsights(performances);

      const strengths = insights.filter((i) => i.type === 'strength');
      expect(strengths.length).toBe(3);
    });
  });

  describe('identifyAtRiskStudents', () => {
    it('returns empty array for empty input', () => {
      expect(identifyAtRiskStudents([])).toEqual([]);
    });

    it('identifies critical risk students with failing grades', () => {
      const students = [
        { studentId: '1', studentName: 'John', scores: [45, 50, 55], averageScore: 50 },
        { studentId: '2', studentName: 'Jane', scores: [75, 80, 85], averageScore: 80 },
      ];

      const atRisk = identifyAtRiskStudents(students);

      expect(atRisk).toHaveLength(1);
      expect(atRisk[0].studentId).toBe('1');
      expect(atRisk[0].riskLevel).toBe('critical');
      expect(atRisk[0].reason).toContain('below passing threshold');
    });

    it('identifies high risk students near failing threshold', () => {
      const students = [
        { studentId: '1', studentName: 'Bob', scores: [62, 65, 68], averageScore: 65 },
      ];

      const atRisk = identifyAtRiskStudents(students);

      expect(atRisk).toHaveLength(1);
      expect(atRisk[0].riskLevel).toBe('high');
      expect(atRisk[0].reason).toContain('at risk of falling below');
    });

    it('identifies moderate risk students with declining trend', () => {
      const students = [
        { studentId: '1', studentName: 'Alice', scores: [90, 85, 80, 75, 70], averageScore: 80 },
      ];

      const atRisk = identifyAtRiskStudents(students);

      expect(atRisk).toHaveLength(1);
      expect(atRisk[0].riskLevel).toBe('moderate');
      expect(atRisk[0].reason).toContain('declining');
    });

    it('does not flag students with stable or improving performance', () => {
      const students = [
        { studentId: '1', studentName: 'Good Student', scores: [80, 82, 85, 88, 90], averageScore: 85 },
      ];

      const atRisk = identifyAtRiskStudents(students);

      expect(atRisk).toHaveLength(0);
    });

    it('sorts results by average score (lowest first)', () => {
      const students = [
        { studentId: '1', studentName: 'Student A', scores: [65, 68], averageScore: 66.5 },
        { studentId: '2', studentName: 'Student B', scores: [45, 50], averageScore: 47.5 },
        { studentId: '3', studentName: 'Student C', scores: [58, 62], averageScore: 60 },
      ];

      const atRisk = identifyAtRiskStudents(students);

      expect(atRisk[0].averageScore).toBeLessThan(atRisk[1].averageScore);
      expect(atRisk[1].averageScore).toBeLessThan(atRisk[2].averageScore);
    });

    it('respects custom thresholds', () => {
      const students = [
        { studentId: '1', studentName: 'Custom', scores: [65, 68], averageScore: 66.5 },
      ];

      const atRiskDefault = identifyAtRiskStudents(students);
      const atRiskCustom = identifyAtRiskStudents(students, 70, 75);

      expect(atRiskDefault).toHaveLength(1);
      expect(atRiskDefault[0].riskLevel).toBe('high');

      expect(atRiskCustom).toHaveLength(1);
      expect(atRiskCustom[0].riskLevel).toBe('critical');
    });

    it('calculates average from scores when averageScore is 0', () => {
      const students = [
        { studentId: '1', studentName: 'Calc', scores: [50, 60, 70], averageScore: 0 },
      ];

      const atRisk = identifyAtRiskStudents(students);

      expect(atRisk).toHaveLength(1);
      expect(atRisk[0].averageScore).toBe(60);
    });
  });

  describe('calculatePassRate', () => {
    it('returns zeros for empty array', () => {
      expect(calculatePassRate([])).toEqual({
        passCount: 0,
        failCount: 0,
        totalStudents: 0,
        passRate: 0,
      });
    });

    it('calculates pass rate for all passing scores', () => {
      const result = calculatePassRate([75, 80, 85, 90, 95]);

      expect(result.passCount).toBe(5);
      expect(result.failCount).toBe(0);
      expect(result.totalStudents).toBe(5);
      expect(result.passRate).toBe(100);
    });

    it('calculates pass rate for all failing scores', () => {
      const result = calculatePassRate([30, 40, 50, 55]);

      expect(result.passCount).toBe(0);
      expect(result.failCount).toBe(4);
      expect(result.totalStudents).toBe(4);
      expect(result.passRate).toBe(0);
    });

    it('calculates pass rate for mixed scores', () => {
      const result = calculatePassRate([45, 65, 75, 55, 85]);

      expect(result.passCount).toBe(3);
      expect(result.failCount).toBe(2);
      expect(result.totalStudents).toBe(5);
      expect(result.passRate).toBe(60);
    });

    it('respects custom passing threshold', () => {
      const result = calculatePassRate([65, 70, 75], 70);

      expect(result.passCount).toBe(2);
      expect(result.failCount).toBe(1);
      expect(result.passRate).toBe(67);
    });

    it('handles exact threshold score as passing', () => {
      const result = calculatePassRate([60, 59, 61]);

      expect(result.passCount).toBe(2);
      expect(result.failCount).toBe(1);
      expect(result.passRate).toBe(67);
    });
  });

  describe('getTopPerformers', () => {
    it('returns empty array for empty input', () => {
      expect(getTopPerformers([])).toEqual([]);
    });

    it('returns top 5 performers by default', () => {
      const students = [
        { studentId: '1', studentName: 'Alice', scores: [95, 98], averageScore: 96.5 },
        { studentId: '2', studentName: 'Bob', scores: [85, 88], averageScore: 86.5 },
        { studentId: '3', studentName: 'Carol', scores: [90, 92], averageScore: 91 },
        { studentId: '4', studentName: 'Dave', scores: [75, 78], averageScore: 76.5 },
        { studentId: '5', studentName: 'Eve', scores: [80, 82], averageScore: 81 },
        { studentId: '6', studentName: 'Frank', scores: [70, 72], averageScore: 71 },
      ];

      const top = getTopPerformers(students);

      expect(top).toHaveLength(5);
      expect(top[0].studentId).toBe('1');
      expect(top[0].rank).toBe(1);
      expect(top[1].studentId).toBe('3');
      expect(top[2].studentId).toBe('2');
      expect(top[3].studentId).toBe('5');
      expect(top[4].studentId).toBe('4');
      expect(top[4].rank).toBe(5);
    });

    it('returns specified number of top performers', () => {
      const students = [
        { studentId: '1', studentName: 'Alice', scores: [95, 98], averageScore: 96.5 },
        { studentId: '2', studentName: 'Bob', scores: [85, 88], averageScore: 86.5 },
        { studentId: '3', studentName: 'Carol', scores: [90, 92], averageScore: 91 },
      ];

      const top2 = getTopPerformers(students, 2);

      expect(top2).toHaveLength(2);
      expect(top2[0].studentId).toBe('1');
      expect(top2[1].studentId).toBe('3');
    });

    it('calculates average from scores when averageScore is 0', () => {
      const students = [
        { studentId: '1', studentName: 'Calc', scores: [90, 95, 100], averageScore: 0 },
      ];

      const top = getTopPerformers(students);

      expect(top).toHaveLength(1);
      expect(top[0].averageScore).toBe(95);
    });

    it('sorts by highest average score', () => {
      const students = [
        { studentId: '1', studentName: 'Low', scores: [60, 65], averageScore: 62.5 },
        { studentId: '2', studentName: 'High', scores: [95, 98], averageScore: 96.5 },
        { studentId: '3', studentName: 'Mid', scores: [75, 80], averageScore: 77.5 },
      ];

      const top = getTopPerformers(students);

      expect(top[0].studentName).toBe('High');
      expect(top[1].studentName).toBe('Mid');
      expect(top[2].studentName).toBe('Low');
    });

    it('handles fewer students than requested count', () => {
      const students = [
        { studentId: '1', studentName: 'Only', scores: [85, 90], averageScore: 87.5 },
      ];

      const top = getTopPerformers(students, 5);

      expect(top).toHaveLength(1);
      expect(top[0].studentId).toBe('1');
    });
  });
});
