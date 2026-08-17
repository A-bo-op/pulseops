import type { HttpMethod, Monitor } from '@prisma/client';
import { Agent, request } from 'undici';
import type { LookupFunction } from 'node:net';
import { performance } from 'node:perf_hooks';
import { resolveSafeUrl, UnsafeUrlError } from './url-safety.service.js';

export interface HttpCheckOutcome {
  statusCode: number | null;
  responseTimeMs: number;
  isUp: boolean;
  errorType: string | null;
  errorMessage: string | null;
  checkedAt: Date;
}

function classifyError(error: unknown) {
  const value = error as NodeJS.ErrnoException & { name?: string };
  const code = typeof value.code === 'string' ? value.code : '';
  const message = value.message || 'Endpoint check failed';

  if (error instanceof UnsafeUrlError) return { type: 'SSRF_BLOCKED', message };
  if (
    value.name === 'AbortError' ||
    value.name === 'TimeoutError' ||
    code.includes('TIMEOUT') ||
    message.toLowerCase().includes('timeout')
  ) {
    return { type: 'TIMEOUT', message };
  }
  if (['ENOTFOUND', 'EAI_AGAIN'].includes(code))
    return { type: 'DNS_FAILURE', message };
  if (code === 'ECONNREFUSED') return { type: 'CONNECTION_REFUSED', message };
  if (
    code.startsWith('ERR_TLS') ||
    message.toLowerCase().includes('certificate')
  ) {
    return { type: 'TLS_ERROR', message };
  }
  return { type: 'NETWORK_ERROR', message };
}

function createPinnedAgent(
  addresses: Array<{ address: string; family: number }>
) {
  let index = 0;

  const pinnedLookup = ((
    _hostname: string,
    options: unknown,
    callback: (
      error: NodeJS.ErrnoException | null,
      address: string | Array<{ address: string; family: number }>,
      family?: number
    ) => void
  ) => {
    const lookupOptions =
      typeof options === 'object' && options !== null
        ? (options as { all?: boolean; family?: number })
        : { family: typeof options === 'number' ? options : 0 };

    const matchingAddresses =
      lookupOptions.family === 4 || lookupOptions.family === 6
        ? addresses.filter(({ family }) => family === lookupOptions.family)
        : addresses;

    const selected = matchingAddresses[index++ % matchingAddresses.length];

    if (!selected) {
      const error = Object.assign(
        new Error('No validated address is available'),
        { code: 'ENOTFOUND' }
      );

      callback(error, lookupOptions.all ? [] : '', 4);
      return;
    }

    if (lookupOptions.all) {
      callback(null, matchingAddresses);
      return;
    }

    callback(null, selected.address, selected.family);
  }) as LookupFunction;

  return new Agent({
    connect: {
      lookup: pinnedLookup,
    },
  });
}

export async function executeHttpCheck(
  monitor: Pick<
    Monitor,
    'url' | 'httpMethod' | 'timeoutMs' | 'expectedStatusCode'
  >,
  resolveTarget = resolveSafeUrl
): Promise<HttpCheckOutcome> {
  const startedAt = performance.now();
  const checkedAt = new Date();
  let currentUrl = monitor.url;

  try {
    for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
      const safeTarget = await resolveTarget(currentUrl);
      const dispatcher = createPinnedAgent(safeTarget.addresses);

      try {
        const response = await request(safeTarget.url, {
          method: monitor.httpMethod as HttpMethod,
          dispatcher,
          headersTimeout: monitor.timeoutMs,
          bodyTimeout: monitor.timeoutMs,
          signal: AbortSignal.timeout(monitor.timeoutMs),
          headers: { 'user-agent': 'PulseOps-Monitor/1.0' },
        });
        await response.body.dump();

        if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
          const rawLocation = response.headers.location;
          const location = Array.isArray(rawLocation)
            ? rawLocation[0]
            : rawLocation;
          if (!location)
            throw new Error('Redirect response did not include a location');
          if (redirectCount === 3)
            throw new Error('Monitor exceeded the redirect limit');
          currentUrl = new URL(location, safeTarget.url).toString();
          continue;
        }

        const responseTimeMs = Math.max(
          0,
          Math.round(performance.now() - startedAt)
        );
        const isUp = response.statusCode === monitor.expectedStatusCode;
        return {
          statusCode: response.statusCode,
          responseTimeMs,
          isUp,
          errorType: isUp ? null : 'UNEXPECTED_STATUS',
          errorMessage: isUp
            ? null
            : `Expected HTTP ${monitor.expectedStatusCode}, received ${response.statusCode}`,
          checkedAt,
        };
      } finally {
        await dispatcher.destroy();
      }
    }

    throw new Error('Monitor check did not complete');
  } catch (error) {
    const classified = classifyError(error);
    return {
      statusCode: null,
      responseTimeMs: Math.max(0, Math.round(performance.now() - startedAt)),
      isUp: false,
      errorType: classified.type,
      errorMessage: classified.message.slice(0, 500),
      checkedAt,
    };
  }
}
