import { describe, expect, it } from 'vitest';
import { calculateUptimePercentage } from '../src/services/metrics.service.js';

describe('calculateUptimePercentage', () => {
  it('returns zero before any checks exist', () => {
    expect(calculateUptimePercentage(0, 0)).toBe(0);
  });

  it('calculates and rounds availability to two decimals', () => {
    expect(calculateUptimePercentage(3, 2)).toBe(66.67);
    expect(calculateUptimePercentage(1_000, 999)).toBe(99.9);
  });
});
