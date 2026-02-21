import { describe, it, expect, vi } from 'vitest';
import { FallbackHandler, withFallback, type FallbackOptions } from '../fallback';

describe('Fallback Handler', () => {
  describe('withFallback', () => {
    it('should return primary function result when successful', async () => {
      const primaryFn = vi.fn(() => Promise.resolve('primary result'));
      const fallbackFn = vi.fn(() => Promise.resolve('fallback result'));

      const result = await withFallback(primaryFn, { fallback: fallbackFn });

      expect(result).toBe('primary result');
      expect(primaryFn).toHaveBeenCalledTimes(1);
      expect(fallbackFn).not.toHaveBeenCalled();
    });

    it('should call fallback when primary fails', async () => {
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));
      const fallbackFn = vi.fn(() => Promise.resolve('fallback result'));

      const result = await withFallback(primaryFn, { fallback: fallbackFn });

      expect(result).toBe('fallback result');
      expect(primaryFn).toHaveBeenCalledTimes(1);
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });

    it('should call onFallback callback when fallback is used', async () => {
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));
      const fallbackFn = vi.fn(() => Promise.resolve('fallback result'));
      const onFallbackCallback = vi.fn();

      await withFallback(primaryFn, { fallback: fallbackFn, onFallback: onFallbackCallback });

      expect(onFallbackCallback).toHaveBeenCalledTimes(1);
      expect(onFallbackCallback).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should not call onFallback when primary succeeds', async () => {
      const primaryFn = vi.fn(() => Promise.resolve('primary result'));
      const onFallbackCallback = vi.fn();

      await withFallback(primaryFn, { onFallback: onFallbackCallback });

      expect(onFallbackCallback).not.toHaveBeenCalled();
    });

    it('should respect shouldFallback function', async () => {
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));
      const fallbackFn = vi.fn(() => Promise.resolve('fallback result'));

      const shouldFallback = vi.fn((error: Error) => {
        return error.message.includes('fallback allowed');
      });

      const result1 = withFallback(primaryFn, {
        fallback: fallbackFn,
        shouldFallback,
      });

      await expect(result1).rejects.toThrow('Primary failed');
      expect(fallbackFn).not.toHaveBeenCalled();

      const primaryFn2 = vi.fn(() => Promise.reject(new Error('fallback allowed')));
      const result2 = await withFallback(primaryFn2, {
        fallback: fallbackFn,
        shouldFallback,
      });

      expect(result2).toBe('fallback result');
      expect(fallbackFn).toHaveBeenCalled();
    });

    it('should throw error when no fallback provided', async () => {
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));

      await expect(withFallback(primaryFn)).rejects.toThrow('Primary failed');
    });

    it('should handle synchronous fallback functions', async () => {
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));
      const fallbackFn = vi.fn(() => 'fallback result');

      const result = await withFallback(primaryFn, { fallback: fallbackFn });

      expect(result).toBe('fallback result');
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });

    it('should handle async fallback functions', async () => {
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));
      const fallbackFn = vi.fn(() => Promise.resolve('async fallback result'));

      const result = await withFallback(primaryFn, { fallback: fallbackFn });

      expect(result).toBe('async fallback result');
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });

    it('should handle non-Error errors', async () => {
      const primaryFn = vi.fn(() => Promise.reject('string error'));
      const fallbackFn = vi.fn(() => Promise.resolve('fallback result'));

      const result = await withFallback(primaryFn, { fallback: fallbackFn });

      expect(result).toBe('fallback result');
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('FallbackHandler.createStaticFallback', () => {
    it('should create a static fallback function', async () => {
      const fallback = FallbackHandler.createStaticFallback('static value');
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));

      const result = await FallbackHandler.withFallback(primaryFn, { fallback });

      expect(result).toBe('static value');
      expect(typeof fallback).toBe('function');
    });
  });

  describe('FallbackHandler.createNullFallback', () => {
    it('should create a null fallback function', async () => {
      const fallback = FallbackHandler.createNullFallback<string>();
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));

      const result = await FallbackHandler.withFallback(primaryFn, { fallback });

      expect(result).toBeNull();
    });
  });

  describe('FallbackHandler.createEmptyArrayFallback', () => {
    it('should create an empty array fallback function', async () => {
      const fallback = FallbackHandler.createEmptyArrayFallback<string>();
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));

      const result = await FallbackHandler.withFallback(primaryFn, { fallback });

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('FallbackHandler.createEmptyObjectFallback', () => {
    it('should create an empty object fallback function', async () => {
      const fallback = FallbackHandler.createEmptyObjectFallback<{ name: string }>();
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));

      const result = await FallbackHandler.withFallback(primaryFn, { fallback });

      expect(result).toEqual({});
      expect(typeof result).toBe('object');
      expect(Array.isArray(result)).toBe(false);
    });
  });

  describe('Complex scenarios', () => {
    it('should chain multiple fallbacks', async () => {
      const primaryFn = vi.fn(() => Promise.reject(new Error('Primary failed')));
      const firstFallback = vi.fn(() => Promise.reject(new Error('First fallback failed')));
      const secondFallback = vi.fn(() => Promise.resolve('second fallback result'));

      let error: Error | null = null;

      const result = await FallbackHandler.withFallback(primaryFn, {
        fallback: () =>
          FallbackHandler.withFallback(firstFallback, {
            fallback: secondFallback,
            onFallback: (err) => {
              error = err;
            },
          }),
        onFallback: (err) => {
          error = err;
        },
      });

      expect(result).toBe('second fallback result');
      expect(primaryFn).toHaveBeenCalledTimes(1);
      expect(firstFallback).toHaveBeenCalledTimes(1);
      expect(secondFallback).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors with fallback', async () => {
      const primaryFn = vi.fn(
        () =>
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 100))
      );
      const fallbackFn = vi.fn(() => Promise.resolve('cached data'));

      const result = await FallbackHandler.withFallback(primaryFn, {
        fallback: fallbackFn,
        shouldFallback: (error) => error.message.includes('timeout'),
      });

      expect(result).toBe('cached data');
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });

    it('should not fallback on validation errors', async () => {
      const primaryFn = vi.fn(() => Promise.reject(new Error('Validation error')));
      const fallbackFn = vi.fn(() => Promise.resolve('fallback result'));

      await expect(
        FallbackHandler.withFallback(primaryFn, {
          fallback: fallbackFn,
          shouldFallback: (error) => !error.message.includes('Validation'),
        })
      ).rejects.toThrow('Validation error');

      expect(fallbackFn).not.toHaveBeenCalled();
    });
  });
});
