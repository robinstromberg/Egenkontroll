import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createAppRedirects, resolveAppOrigin } from '../src/config/appUrls';

export type SmokeResult = { url: string; status: number; location: string | null };

async function probe(url: string): Promise<SmokeResult> {
  const response = await fetch(url, { method: 'GET', redirect: 'manual' });
  return { url, status: response.status, location: response.headers.get('location') };
}

export async function runDeploySmoke(webOriginValue: string, appOriginValue: string): Promise<SmokeResult[]> {
  const webOrigin = resolveAppOrigin(webOriginValue);
  const appOrigin = resolveAppOrigin(appOriginValue);
  const checks = [
    { url: `${webOrigin}/`, status: 200, location: null },
    { url: `${webOrigin}/login?smoke=317`, status: 308, location: `${appOrigin}/login?smoke=317` },
    { url: `${webOrigin}/signup?smoke=317`, status: 308, location: `${appOrigin}/signup?smoke=317` },
    { url: `${appOrigin}/login`, status: 200, location: null },
    { url: `${appOrigin}/signup`, status: 200, location: null },
  ];
  const results: SmokeResult[] = [];
  const errors: string[] = [];
  for (const expected of checks) {
    const actual = await probe(expected.url);
    results.push(actual);
    if (actual.status !== expected.status) errors.push(`${actual.url}: status ${actual.status}, förväntade ${expected.status}`);
    if (actual.location !== expected.location) errors.push(`${actual.url}: Location ${actual.location ?? 'saknas'}, förväntade ${expected.location ?? 'ingen'}`);
  }
  if (errors.length > 0) throw new Error(`Deploy-smoke misslyckades:\n- ${errors.join('\n- ')}`);
  return results;
}

function listen(server: Server): Promise<string> {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => {
    const address = server.address() as AddressInfo;
    resolve(`http://127.0.0.1:${address.port}`);
  }));
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

async function selfTest(): Promise<SmokeResult[]> {
  const appServer = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end('<!doctype html><title>App</title>');
  });
  const appOrigin = await listen(appServer);
  const redirects = createAppRedirects(appOrigin);
  const webServer = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? '/', 'http://local.test');
    const redirect = redirects.find(({ source }) => source === requestUrl.pathname);
    if (redirect) {
      response.writeHead(redirect.statusCode, { location: `${redirect.destination}${requestUrl.search}` });
      response.end();
      return;
    }
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end('<!doctype html><title>Webb</title>');
  });
  const webOrigin = await listen(webServer);
  try {
    return await runDeploySmoke(webOrigin, appOrigin);
  } finally {
    await Promise.all([close(webServer), close(appServer)]);
  }
}

const selfTestRequested = process.argv.includes('--self-test');
const webOrigin = process.argv.find((argument) => argument.startsWith('--web-origin='))?.slice('--web-origin='.length) ?? process.env.SMOKE_WEB_ORIGIN;
const appOrigin = process.argv.find((argument) => argument.startsWith('--app-origin='))?.slice('--app-origin='.length) ?? process.env.SMOKE_APP_ORIGIN;

const results = selfTestRequested
  ? await selfTest()
  : webOrigin && appOrigin
    ? await runDeploySmoke(webOrigin, appOrigin)
    : (() => { throw new Error('Ange --web-origin och --app-origin (eller SMOKE_WEB_ORIGIN och SMOKE_APP_ORIGIN).'); })();

for (const result of results) console.log(`${result.status} ${result.url}${result.location ? ` -> ${result.location}` : ''}`);
