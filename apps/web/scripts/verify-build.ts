import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandAssets } from '@min-egenkontroll/brand';
import { siteOrigin, webModernRoutes, webSitemapRoutes, webStaticSeoRoutes } from '../src/config/routes';

const webRoot = fileURLToPath(new URL('..', import.meta.url));
const distRoot = path.join(webRoot, 'dist');
const errors: string[] = [];

function hash(file: string): string {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function builtFile(pathname: string): string {
  if (pathname === '/') return path.join(distRoot, 'index.html');
  if (pathname.endsWith('.html')) return path.join(distRoot, ...pathname.slice(1).split('/'));
  return path.join(distRoot, ...pathname.slice(1).split('/'), 'index.html');
}

function decodeHtml(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function extract(html: string, pattern: RegExp): string | null {
  const value = html.match(pattern)?.[1];
  return value ? decodeHtml(value.trim()) : null;
}

for (const route of webModernRoutes) {
  const output = builtFile(route.path);
  if (!existsSync(output)) {
    errors.push(`Byggd route saknas: ${route.path} (${path.relative(webRoot, output)})`);
    continue;
  }
  const html = readFileSync(output, 'utf8');
  const title = extract(html, /<title>([^<]+)<\/title>/i);
  const description = extract(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = extract(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (title !== route.title) errors.push(`Fel title för ${route.path}: ${title ?? 'saknas'}`);
  if (description !== route.description) errors.push(`Fel description för ${route.path}: ${description ?? 'saknas'}`);
  const expectedCanonical = route.canonicalPath ? `${siteOrigin}${route.canonicalPath}` : null;
  if (canonical !== expectedCanonical) errors.push(`Fel canonical för ${route.path}: ${canonical ?? 'saknas'}`);
}

for (const route of webStaticSeoRoutes) {
  const source = path.join(webRoot, route.source);
  const output = builtFile(route.path);
  if (!existsSync(output)) errors.push(`Statisk SEO-output saknas: ${route.path}`);
  else if (hash(source) !== hash(output)) errors.push(`Statisk SEO-fil ändrades i output: ${route.path}`);
}

const sitemapFile = path.join(distRoot, 'sitemap.xml');
if (!existsSync(sitemapFile)) {
  errors.push('Byggd sitemap.xml saknas.');
} else {
  const sitemap = readFileSync(sitemapFile, 'utf8');
  const actualPaths = [...sitemap.matchAll(/<loc>https:\/\/minegenkontroll\.se([^<]*)<\/loc>/g)].map((match) => match[1] || '/');
  const expectedPaths = webSitemapRoutes.map((route) => route.path);
  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) errors.push('Byggd sitemap avviker från det typade route-registret.');
}

for (const asset of [...Object.values(brandAssets), '/robots.txt', '/seo-guides.css']) {
  const output = path.join(distRoot, ...asset.slice(1).split('/'));
  if (!existsSync(output)) errors.push(`Publik webbasset saknas: ${asset}`);
}
if (!existsSync(path.join(distRoot, '404.html'))) errors.push('Byggd 404.html saknas.');
if (existsSync(path.join(distRoot, 'login', 'index.html'))) errors.push('/login får inte byggas i web-workspacen.');
if (existsSync(path.join(distRoot, 'signup', 'index.html'))) errors.push('/signup får inte byggas i web-workspacen.');

if (errors.length > 0) throw new Error(`Astro-output bryter byggkontraktet:\n- ${errors.join('\n- ')}`);
console.log(`Astro-output verifierad: ${webModernRoutes.length} moderna routes, ${webStaticSeoRoutes.length} byte-identiska SEO-sidor, ${webSitemapRoutes.length} sitemap-URL:er och 404.`);
