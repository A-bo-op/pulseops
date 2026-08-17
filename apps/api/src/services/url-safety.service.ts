import type { LookupAddress } from 'node:dns';
import dns from 'node:dns/promises';
import net from 'node:net';
import { AppError } from '../utils/app-error.js';

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

function isUnsafeIpv4(address: string) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part))) return true;
  const [a = 0, b = 0] = octets;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0) ||
    a >= 224
  );
}

function isUnsafeIpv6(address: string) {
  const normalized = address.toLowerCase().split('%')[0] ?? '';
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (/^fe[89ab]/.test(normalized)) return true;

  const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return mapped ? isUnsafeIpv4(mapped) : false;
}

export function isUnsafeIp(address: string) {
  const version = net.isIP(address);
  if (version === 4) return isUnsafeIpv4(address);
  if (version === 6) return isUnsafeIpv6(address);
  return true;
}

export async function resolveSafeUrl(rawUrl: string): Promise<{
  url: URL;
  addresses: LookupAddress[];
}> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('The monitor URL is invalid');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new UnsafeUrlError('Only HTTP and HTTPS URLs are allowed');
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError('Credentials are not allowed inside monitor URLs');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new UnsafeUrlError('Localhost destinations are not allowed');
  }

  let addresses: LookupAddress[];
  if (net.isIP(hostname)) {
    addresses = [{ address: hostname, family: net.isIPv4(hostname) ? 4 : 6 }];
  } else {
    try {
      addresses = await dns.lookup(hostname, { all: true, verbatim: true });
    } catch {
      throw new UnsafeUrlError('The monitor hostname could not be resolved');
    }
  }

  if (addresses.length === 0 || addresses.some(({ address }) => isUnsafeIp(address))) {
    throw new UnsafeUrlError('Private, local, reserved, and metadata destinations are blocked');
  }

  return { url, addresses };
}

export async function assertSafeUrl(rawUrl: string) {
  try {
    await resolveSafeUrl(rawUrl);
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      throw new AppError(400, 'UNSAFE_MONITOR_URL', error.message);
    }
    throw error;
  }
}
