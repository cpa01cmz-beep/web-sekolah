import { describe, it, expect } from 'vitest';
import { isValidScore, MIN_SCORE, MAX_SCORE } from '@/utils/validation';

describe('Validation Utilities', () => {
  describe('isValidScore', () => {
    describe('valid scores', () => {
      it('should return true for minimum valid score (0)', () => {
        expect(isValidScore(0)).toBe(true);
      });

      it('should return true for maximum valid score (100)', () => {
        expect(isValidScore(100)).toBe(true);
      });

      it('should return true for typical passing scores', () => {
        expect(isValidScore(85)).toBe(true);
      });

      it('should return true for mid-range scores', () => {
        expect(isValidScore(50)).toBe(true);
      });

      it('should return true for decimal scores', () => {
        expect(isValidScore(85.5)).toBe(true);
      });
    });

    describe('invalid scores', () => {
      it('should return false for score below minimum (-1)', () => {
        expect(isValidScore(-1)).toBe(false);
      });

      it('should return false for large negative score', () => {
        expect(isValidScore(-100)).toBe(false);
      });

      it('should return false for score above maximum (101)', () => {
        expect(isValidScore(101)).toBe(false);
      });

      it('should return false for large positive score', () => {
        expect(isValidScore(150)).toBe(false);
      });

      it('should return false for null values', () => {
        expect(isValidScore(null)).toBe(false);
      });

      it('should return false for undefined values', () => {
        expect(isValidScore(undefined)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return true for score just above minimum (0.1)', () => {
        expect(isValidScore(0.1)).toBe(true);
      });

      it('should return true for score just below maximum (99.9)', () => {
        expect(isValidScore(99.9)).toBe(true);
      });

      it('should return false for NaN', () => {
        expect(isValidScore(NaN)).toBe(false);
      });

      it('should return false for Infinity', () => {
        expect(isValidScore(Infinity)).toBe(false);
      });

      it('should return false for negative Infinity', () => {
        expect(isValidScore(-Infinity)).toBe(false);
      });
    });

    describe('type predicate', () => {
      it('should narrow type to number when true', () => {
        const score: number | null = 85;
        if (isValidScore(score)) {
          expect(typeof score).toBe('number');
        }
      });
    });
  });

  describe('Constants', () => {
    it('should define MIN_SCORE constant', () => {
      expect(MIN_SCORE).toBeDefined();
      expect(typeof MIN_SCORE).toBe('number');
    });

    it('should define MAX_SCORE constant', () => {
      expect(MAX_SCORE).toBeDefined();
      expect(typeof MAX_SCORE).toBe('number');
    });

    it('should have correct MIN_SCORE value', () => {
      expect(MIN_SCORE).toBe(0);
    });

    it('should have correct MAX_SCORE value', () => {
      expect(MAX_SCORE).toBe(100);
    });
  });
});
