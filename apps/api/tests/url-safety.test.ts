import { describe, expect, it } from 'vitest';
import { isUnsafeIp } from '../src/services/url-safety.service.js';

describe('SSRF IP filtering', () => {
  it.each(['127.0.0.1', '10.0.0.4', '172.20.0.1', '192.168.1.10', '169.254.169.254'])('blocks %s', (address) => {
    expect(isUnsafeIp(address)).toBe(true);
  });

  it.each(['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111'])('allows public address %s', (address) => {
    expect(isUnsafeIp(address)).toBe(false);
  });
});
