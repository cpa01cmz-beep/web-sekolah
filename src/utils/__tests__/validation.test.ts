import { describe, it, expect } from 'vitest';
import { isValidScore, MIN_SCORE, MAX_SCORE, validateSubject, validationRules } from '@/utils/validation';

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

      it('should return false for decimal scores (integers only)', () => {
        expect(isValidScore(85.5)).toBe(false);
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
      it('should return false for decimal score just above minimum (integers only)', () => {
        expect(isValidScore(0.1)).toBe(false);
      });

      it('should return false for decimal score just below maximum (integers only)', () => {
        expect(isValidScore(99.9)).toBe(false);
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

  describe('validateSubject', () => {
    describe('valid subjects', () => {
      it('should return undefined for valid subject', () => {
        expect(validateSubject('Test Subject', true)).toBeUndefined();
      });

      it('should return undefined for subject at minimum length', () => {
        expect(validateSubject('abc', true)).toBeUndefined();
      });

      it('should return undefined for subject at maximum length', () => {
        expect(validateSubject('a'.repeat(100), true)).toBeUndefined();
      });
    });

    describe('invalid subjects', () => {
      it('should return error for empty subject', () => {
        expect(validateSubject('', true)).toBeDefined();
      });

      it('should return error for whitespace-only subject', () => {
        expect(validateSubject('   ', true)).toBeDefined();
      });

      it('should return error for subject below minimum length', () => {
        expect(validateSubject('ab', true)).toBeDefined();
      });

      it('should return error for subject above maximum length', () => {
        expect(validateSubject('a'.repeat(101), true)).toBeDefined();
      });
    });

    describe('showErrors option', () => {
      it('should return undefined when showErrors is false', () => {
        expect(validateSubject('', false)).toBeUndefined();
      });
    });

    describe('custom length options', () => {
      it('should accept custom minimum length', () => {
        expect(validateSubject('a', true, 1)).toBeUndefined();
      });

      it('should accept custom maximum length', () => {
        expect(validateSubject('test', true, 3, 10)).toBeUndefined();
      });
    });
  });

  describe('validationRules.subject', () => {
    it('should have required rule', () => {
      expect(validationRules.subject.required).toBeDefined();
      expect(validationRules.subject.required.message).toBe('Subject is required');
    });

    it('should have minLength rule factory', () => {
      const rule = validationRules.subject.minLength(5);
      expect(rule.message).toBe('Subject must be at least 5 characters');
      expect(rule.validate('test')).toBe(false);
      expect(rule.validate('testing')).toBe(true);
    });

    it('should have maxLength rule factory', () => {
      const rule = validationRules.subject.maxLength(10);
      expect(rule.message).toBe('Subject must be at most 10 characters');
      expect(rule.validate('testing testing')).toBe(false);
      expect(rule.validate('test')).toBe(true);
    });
  });
});
