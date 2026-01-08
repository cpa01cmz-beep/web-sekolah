import { describe, it, expect } from 'vitest';
import { WEBHOOK_CONFIG } from '../webhook-constants';

describe('Webhook Retry Logic', () => {
  it('should schedule retries with exponential backoff', () => {
    expect(WEBHOOK_CONFIG.RETRY_DELAYS_MS[0]).toBe(60000);
    expect(WEBHOOK_CONFIG.RETRY_DELAYS_MS[1]).toBe(300000);
    expect(WEBHOOK_CONFIG.RETRY_DELAYS_MS[2]).toBe(900000);
    expect(WEBHOOK_CONFIG.RETRY_DELAYS_MS[3]).toBe(1800000);
    expect(WEBHOOK_CONFIG.RETRY_DELAYS_MS[4]).toBe(3600000);
    expect(WEBHOOK_CONFIG.RETRY_DELAYS_MS[5]).toBe(7200000);
  });

  it('should stop retrying after max retries', () => {
    expect(WEBHOOK_CONFIG.MAX_RETRIES).toBe(6);
  });

  it('should use retry delays that follow exponential backoff pattern', () => {
    const retryDelays = WEBHOOK_CONFIG.RETRY_DELAYS_MINUTES;

    for (let i = 1; i < retryDelays.length; i++) {
      const currentDelay = retryDelays[i];
      const previousDelay = retryDelays[i - 1];
      expect(currentDelay).toBeGreaterThan(previousDelay);
    }
  });
});
