import { describe, expect, it } from 'vitest';
import { reachedFailureThreshold } from '../src/services/incident-rules.js';

describe('reachedFailureThreshold', () => {
  it('requires three consecutive failures', () => {
    expect(reachedFailureThreshold([{ isUp: false }, { isUp: false }])).toBe(false);
    expect(reachedFailureThreshold([{ isUp: false }, { isUp: false }, { isUp: false }])).toBe(true);
  });

  it('does not open an incident when a success interrupts the sequence', () => {
    expect(reachedFailureThreshold([{ isUp: false }, { isUp: true }, { isUp: false }])).toBe(false);
  });
});
