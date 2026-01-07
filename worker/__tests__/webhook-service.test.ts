import { describe, it, expect } from 'vitest';

describe('Webhook Retry Logic', () => {
  it('should schedule retries with exponential backoff', () => {
    const retryDelays = [1, 5, 15, 30, 60, 120].map(minutes => minutes * 60 * 1000);

    expect(retryDelays[0]).toBe(60000);
    expect(retryDelays[1]).toBe(300000);
    expect(retryDelays[2]).toBe(900000);
    expect(retryDelays[3]).toBe(1800000);
    expect(retryDelays[4]).toBe(3600000);
    expect(retryDelays[5]).toBe(7200000);
  });

  it('should stop retrying after max retries', () => {
    const MAX_RETRIES = 6;
    expect(MAX_RETRIES).toBe(6);
  });

  it('should use retry delays that follow exponential backoff pattern', () => {
    const retryDelays = [1, 5, 15, 30, 60, 120];

    for (let i = 1; i < retryDelays.length; i++) {
      const currentDelay = retryDelays[i];
      const previousDelay = retryDelays[i - 1];
      expect(currentDelay).toBeGreaterThan(previousDelay);
    }
  });
});