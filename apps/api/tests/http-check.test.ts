import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { executeHttpCheck } from '../src/services/http-check.service.js';

let server: Server;
let baseUrl = '';

beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === '/healthy') { res.writeHead(200); res.end('ok'); return; }
    if (req.url === '/slow') { setTimeout(() => { res.writeHead(200); res.end('slow'); }, 100); return; }
    res.writeHead(500); res.end('error');
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.closeAllConnections();
  server.close();
  server.unref();
});

const localResolver = async (rawUrl: string) => ({
  url: new URL(rawUrl),
  addresses: [{ address: '127.0.0.1', family: 4 }],
});

describe('HTTP monitoring checks', () => {
  it('records a successful endpoint response', async () => {
    const result = await executeHttpCheck({ url: `${baseUrl}/healthy`, httpMethod: 'GET', timeoutMs: 1_000, expectedStatusCode: 200 }, localResolver);
    expect(result.isUp).toBe(true);
    expect(result.statusCode).toBe(200);
  });

  it('classifies unexpected HTTP status codes', async () => {
    const result = await executeHttpCheck({ url: `${baseUrl}/error`, httpMethod: 'GET', timeoutMs: 1_000, expectedStatusCode: 200 }, localResolver);
    expect(result.isUp).toBe(false);
    expect(result.errorType).toBe('UNEXPECTED_STATUS');
    expect(result.statusCode).toBe(500);
  });

  it('enforces monitor timeouts', async () => {
    const result = await executeHttpCheck({ url: `${baseUrl}/slow`, httpMethod: 'GET', timeoutMs: 20, expectedStatusCode: 200 }, localResolver);
    expect(result.isUp).toBe(false);
    expect(result.errorType).toBe('TIMEOUT');
  });
});
