import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appOrigin, appUrls } from '../src/config/appUrls';
import { siteOrigin, webRedirects, webRouteRegistry } from '../src/config/routes';
import { validateDocumentLinks, type LinkDocument } from './link-contract';

const webRoot = fileURLToPath(new URL('..', import.meta.url));
const distRoot = path.join(webRoot, 'dist');

export function outputFile(route: string): string {
  if (route === '/') return path.join(distRoot, 'index.html');
  if (route.endsWith('.html')) return path.join(distRoot, ...route.slice(1).split('/'));
  return path.join(distRoot, ...route.slice(1).split('/'), 'index.html');
}

function htmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(absolute) : entry.name.endsWith('.html') ? [absolute] : [];
  });
}

const errors: string[] = [];
const documents: LinkDocument[] = [];
const expectedOutputs = new Map<string, string>();

for (const route of webRouteRegistry) {
  const output = outputFile(route.path);
  const relative = path.relative(distRoot, output).replaceAll('\\', '/');
  if (expectedOutputs.has(relative)) errors.push(`Flera routes delar output ${relative}: ${expectedOutputs.get(relative)} och ${route.path}`);
  expectedOutputs.set(relative, route.path);
  if (!existsSync(output)) errors.push(`Route saknar byggd output: ${route.path}`);
  else documents.push({ route: route.path, page: route.page, html: readFileSync(output, 'utf8') });
}

const notFound = path.join(distRoot, '404.html');
if (!existsSync(notFound)) errors.push('404.html saknas.');
else documents.push({ route: '/404', page: '404', html: readFileSync(notFound, 'utf8') });

const allowedOutputs = new Set([...expectedOutputs.keys(), '404.html']);
for (const file of htmlFiles(distRoot)) {
  const relative = path.relative(distRoot, file).replaceAll('\\', '/');
  if (!allowedOutputs.has(relative)) errors.push(`Oregistrerad HTML-output: ${relative}`);
}
for (const redirect of webRedirects) {
  if (existsSync(outputFile(redirect.source))) errors.push(`Redirect har även byggd output: ${redirect.source}`);
}

const result = validateDocumentLinks(documents, {
  siteOrigin,
  appOrigin,
  appUrls: Object.values(appUrls),
  redirectSources: webRedirects.map((redirect) => redirect.source),
  routePaths: webRouteRegistry.map((route) => route.path),
});
errors.push(...result.errors);

if (errors.length > 0) throw new Error(`Länkkontraktet misslyckades:\n- ${errors.join('\n- ')}`);

const modern = webRouteRegistry.filter((route) => route.page !== 'static-seo' && !route.path.endsWith('.html')).length;
const migrated = webRouteRegistry.filter((route) => route.page !== 'static-seo' && route.path.endsWith('.html')).length;
const legacy = webRouteRegistry.filter((route) => route.page === 'static-seo').length;
console.log(`Länkkontrakt godkänt: ${result.checkedLinks} länkar över ${modern} moderna, ${migrated} migrerade och ${legacy} legacy-routes; ${result.legacyRedirectLinks} legacy-authlänkar går via registrerad 308-redirect.`);
