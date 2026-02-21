import { describe, it, expect } from 'vitest';
import { getGradeLetter, getGradeColorClass, getGradeBadgeVariant, calculateAverageScore, getGradeDistribution, getPassingGradeCount, getPassingRate } from '../grades';

describe('Grade Utility Functions', () => {
  describe('getGradeLetter', () => {
    it('should return A for scores >= 90', () => {
      expect(getGradeLetter(90)).toBe('A');
      expect(getGradeLetter(95)).toBe('A');
      expect(getGradeLetter(100)).toBe('A');
    });

    it('should return B for scores >= 80 and < 90', () => {
      expect(getGradeLetter(80)).toBe('B');
      expect(getGradeLetter(85)).toBe('B');
      expect(getGradeLetter(89)).toBe('B');
    });

    it('should return C for scores >= 70 and < 80', () => {
      expect(getGradeLetter(70)).toBe('C');
      expect(getGradeLetter(75)).toBe('C');
      expect(getGradeLetter(79)).toBe('C');
    });

    it('should return D for scores >= 60 and < 70', () => {
      expect(getGradeLetter(60)).toBe('D');
      expect(getGradeLetter(65)).toBe('D');
      expect(getGradeLetter(69)).toBe('D');
    });

    it('should return F for scores < 60', () => {
      expect(getGradeLetter(0)).toBe('F');
      expect(getGradeLetter(30)).toBe('F');
      expect(getGradeLetter(59)).toBe('F');
    });

    it('should handle boundary values correctly', () => {
      expect(getGradeLetter(90)).toBe('A');
      expect(getGradeLetter(80)).toBe('B');
      expect(getGradeLetter(70)).toBe('C');
      expect(getGradeLetter(60)).toBe('D');
      expect(getGradeLetter(59)).toBe('F');
    });
  });

  describe('getGradeColorClass', () => {
    it('should return green color class for A grades (score >= 90)', () => {
      expect(getGradeColorClass(90)).toBe('bg-green-500 hover:bg-green-600');
      expect(getGradeColorClass(95)).toBe('bg-green-500 hover:bg-green-600');
    });

    it('should return blue color class for B grades (80 <= score < 90)', () => {
      expect(getGradeColorClass(80)).toBe('bg-blue-500 hover:bg-blue-600');
      expect(getGradeColorClass(85)).toBe('bg-blue-500 hover:bg-blue-600');
      expect(getGradeColorClass(89)).toBe('bg-blue-500 hover:bg-blue-600');
    });

    it('should return yellow color class for C grades (70 <= score < 80)', () => {
      expect(getGradeColorClass(70)).toBe('bg-yellow-500 hover:bg-yellow-600');
      expect(getGradeColorClass(75)).toBe('bg-yellow-500 hover:bg-yellow-600');
      expect(getGradeColorClass(79)).toBe('bg-yellow-500 hover:bg-yellow-600');
    });

    it('should return red color class for D/F grades (score < 70)', () => {
      expect(getGradeColorClass(0)).toBe('bg-red-500 hover:bg-red-600');
      expect(getGradeColorClass(50)).toBe('bg-red-500 hover:bg-red-600');
      expect(getGradeColorClass(69)).toBe('bg-red-500 hover:bg-red-600');
    });

    it('should handle boundary values correctly', () => {
      expect(getGradeColorClass(90)).toBe('bg-green-500 hover:bg-green-600');
      expect(getGradeColorClass(80)).toBe('bg-blue-500 hover:bg-blue-600');
      expect(getGradeColorClass(70)).toBe('bg-yellow-500 hover:bg-yellow-600');
      expect(getGradeColorClass(69)).toBe('bg-red-500 hover:bg-red-600');
    });
  });

  describe('getGradeBadgeVariant', () => {
    it('should return default variant for A grades (score >= 90)', () => {
      const variant = getGradeBadgeVariant(90);
      expect(variant).toBe('default');
    });

    it('should return secondary variant for B grades (80 <= score < 90)', () => {
      const variant = getGradeBadgeVariant(85);
      expect(variant).toBe('secondary');
    });

    it('should return outline variant for C grades (70 <= score < 80)', () => {
      const variant = getGradeBadgeVariant(75);
      expect(variant).toBe('outline');
    });

    it('should return destructive variant for D/F grades (score < 70)', () => {
      const variant = getGradeBadgeVariant(65);
      expect(variant).toBe('destructive');
    });

    it('should handle boundary values correctly', () => {
      expect(getGradeBadgeVariant(90)).toBe('default');
      expect(getGradeBadgeVariant(80)).toBe('secondary');
      expect(getGradeBadgeVariant(70)).toBe('outline');
      expect(getGradeBadgeVariant(69)).toBe('destructive');
    });
  });

  describe('calculateAverageScore', () => {
    it('should calculate average score correctly', () => {
      const grades = [
        { score: 90 },
        { score: 80 },
        { score: 70 }
      ];
      expect(calculateAverageScore(grades)).toBe('80.00');
    });

    it('should handle decimal averages correctly', () => {
      const grades = [
        { score: 85 },
        { score: 87 },
        { score: 90 }
      ];
      expect(calculateAverageScore(grades)).toBe('87.33');
    });

    it('should return "0.00" for empty array', () => {
      const grades: { score: number }[] = [];
      expect(calculateAverageScore(grades)).toBe('0.00');
    });

    it('should return "0.00" for single zero score', () => {
      const grades = [{ score: 0 }];
      expect(calculateAverageScore(grades)).toBe('0.00');
    });

    it('should handle single grade correctly', () => {
      const grades = [{ score: 95 }];
      expect(calculateAverageScore(grades)).toBe('95.00');
    });

    it('should format to 2 decimal places', () => {
      const grades = [
        { score: 85.333 },
        { score: 84.666 }
      ];
      expect(calculateAverageScore(grades)).toBe('85.00');
    });
  });

  describe('getGradeDistribution', () => {
    it('should return correct distribution for mixed grades', () => {
      const grades = [
        { score: 95 },
        { score: 85 },
        { score: 75 },
        { score: 65 },
        { score: 55 }
      ];
      expect(getGradeDistribution(grades)).toEqual({ A: 1, B: 1, C: 1, D: 1, F: 1 });
    });

    it('should return all zeros for empty array', () => {
      expect(getGradeDistribution([])).toEqual({ A: 0, B: 0, C: 0, D: 0, F: 0 });
    });

    it('should handle all A grades', () => {
      const grades = [
        { score: 90 },
        { score: 95 },
        { score: 100 }
      ];
      expect(getGradeDistribution(grades)).toEqual({ A: 3, B: 0, C: 0, D: 0, F: 0 });
    });

    it('should handle boundary values correctly', () => {
      const grades = [
        { score: 90 },
        { score: 80 },
        { score: 70 },
        { score: 60 },
        { score: 59 }
      ];
      expect(getGradeDistribution(grades)).toEqual({ A: 1, B: 1, C: 1, D: 1, F: 1 });
    });
  });

  describe('getPassingGradeCount', () => {
    it('should return count of passing grades (A, B, C, D)', () => {
      const distribution = { A: 2, B: 3, C: 1, D: 1, F: 2 };
      expect(getPassingGradeCount(distribution)).toBe(7);
    });

    it('should return 0 for all F grades', () => {
      const distribution = { A: 0, B: 0, C: 0, D: 0, F: 5 };
      expect(getPassingGradeCount(distribution)).toBe(0);
    });

    it('should return total for all passing grades', () => {
      const distribution = { A: 5, B: 0, C: 0, D: 0, F: 0 };
      expect(getPassingGradeCount(distribution)).toBe(5);
    });
  });

  describe('getPassingRate', () => {
    it('should calculate passing rate correctly', () => {
      const grades = [
        { score: 90 },
        { score: 80 },
        { score: 70 },
        { score: 50 },
        { score: 55 }
      ];
      expect(getPassingRate(grades)).toBe('60.0');
    });

    it('should return 100.0 for all passing grades', () => {
      const grades = [
        { score: 90 },
        { score: 80 },
        { score: 70 }
      ];
      expect(getPassingRate(grades)).toBe('100.0');
    });

    it('should return 0.0 for all failing grades', () => {
      const grades = [
        { score: 50 },
        { score: 55 },
        { score: 30 }
      ];
      expect(getPassingRate(grades)).toBe('0.0');
    });

    it('should return 0.00 for empty array', () => {
      expect(getPassingRate([])).toBe('0.00');
    });

    it('should handle boundary at 60', () => {
      const grades = [{ score: 60 }];
      expect(getPassingRate(grades)).toBe('100.0');
    });

    it('should handle boundary at 59', () => {
      const grades = [{ score: 59 }];
      expect(getPassingRate(grades)).toBe('0.0');
    });
  });
});
