import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandAssets } from '@min-egenkontroll/brand';
import { migratedKnowledgeArticles } from '../src/config/migratedKnowledgeArticles';
import { siteOrigin, webMigratedKnowledgeArticleRoutes, webModernRoutes, webOriginalSeoRoutes, webRedirects, webSitemapRoutes, webStaticSeoRoutes } from '../src/config/routes';

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
  const ogTitle = extract(html, /<meta\s+property="og:title"\s+content="([^"]*)"/i);
  const ogDescription = extract(html, /<meta\s+property="og:description"\s+content="([^"]*)"/i);
  const ogUrl = extract(html, /<meta\s+property="og:url"\s+content="([^"]*)"/i);
  const ogType = extract(html, /<meta\s+property="og:type"\s+content="([^"]*)"/i);
  if (title !== route.title) errors.push(`Fel title för ${route.path}: ${title ?? 'saknas'}`);
  if (description !== route.description) errors.push(`Fel description för ${route.path}: ${description ?? 'saknas'}`);
  const expectedCanonical = route.canonicalPath ? `${siteOrigin}${route.canonicalPath}` : null;
  if (canonical !== expectedCanonical) errors.push(`Fel canonical för ${route.path}: ${canonical ?? 'saknas'}`);
  if (ogTitle !== route.title) errors.push(`Fel Open Graph-title för ${route.path}: ${ogTitle ?? 'saknas'}`);
  if (ogDescription !== route.description) errors.push(`Fel Open Graph-description för ${route.path}: ${ogDescription ?? 'saknas'}`);
  if (ogUrl !== (expectedCanonical ?? `${siteOrigin}/`)) errors.push(`Fel Open Graph-URL för ${route.path}: ${ogUrl ?? 'saknas'}`);
  const expectedOgType = route.structuredData?.kind === 'article' ? 'article' : 'website';
  if (ogType !== expectedOgType) errors.push(`Fel Open Graph-typ för ${route.path}: ${ogType ?? 'saknas'}`);
  if (route.structuredData?.kind === 'article') {
    const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis)]
      .flatMap((match) => {
        try { return [JSON.parse(match[1]) as { '@graph'?: Array<Record<string, unknown>> }]; }
        catch { errors.push(`Ogiltig JSON-LD för ${route.path}`); return []; }
      });
    const article = jsonLd.flatMap((item) => item['@graph'] ?? []).find((item) => item['@type'] === 'Article');
    if (!article) errors.push(`Article JSON-LD saknas för ${route.path}`);
    else if (article.citation !== route.structuredData.citation) errors.push(`Fel JSON-LD-citation för ${route.path}`);
  }
}

for (const route of webStaticSeoRoutes) {
  const source = path.join(webRoot, route.source);
  const output = builtFile(route.path);
  if (!existsSync(output)) errors.push(`Statisk SEO-output saknas: ${route.path}`);
  else if (hash(source) !== hash(output)) errors.push(`Statisk SEO-fil ändrades i output: ${route.path}`);
}

const originalSeoOutputs = webOriginalSeoRoutes.map((route) => builtFile(route.path));
if (new Set(originalSeoOutputs).size !== 55) errors.push('De 55 ursprungliga SEO-rutterna byggs inte till exakt 55 unika filer.');
for (const output of originalSeoOutputs) if (!existsSync(output)) errors.push(`Ursprunglig SEO-output saknas: ${path.relative(webRoot, output)}`);

const migratedArticleOutputs = migratedKnowledgeArticles.map((article) => builtFile(article.canonicalPath));
if (new Set(migratedArticleOutputs).size !== migratedKnowledgeArticles.length) {
  errors.push('Migrerade kunskapsartiklar byggs inte till unika output-paths.');
}
for (const article of migratedKnowledgeArticles) {
  const routeMatches = webMigratedKnowledgeArticleRoutes.filter((route) => route.path === article.canonicalPath);
  if (routeMatches.length !== 1) {
    errors.push(`Migrerad artikel saknar exakt en modern route: ${article.canonicalPath} (${routeMatches.length})`);
    continue;
  }
  const [route] = routeMatches;
  if (route.page !== 'fact-page' || route.canonicalPath !== article.canonicalPath || route.title !== article.title || route.description !== article.description || route.structuredData?.citation !== article.source.url) {
    errors.push(`Migrerad artikel och modern route avviker: ${article.canonicalPath}`);
  }
  const output = builtFile(article.canonicalPath);
  const directoryOutput = path.join(output, 'index.html');
  const outputVariants = [output, directoryOutput].filter((candidate) => existsSync(candidate));
  if (outputVariants.length !== 1) errors.push(`Migrerad artikel ska ha exakt en byggd output: ${article.canonicalPath} (${outputVariants.length})`);
  else if (outputVariants[0] !== output || !statSync(output).isFile()) errors.push(`Migrerad artikel byggdes inte som faktisk .html-fil: ${article.canonicalPath}`);
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
for (const redirect of webRedirects) {
  if (existsSync(builtFile(redirect.source))) errors.push(`${redirect.source} är en redirect och får inte byggas i web-workspacen.`);
}

if (errors.length > 0) throw new Error(`Astro-output bryter byggkontraktet:\n- ${errors.join('\n- ')}`);
console.log(`Astro-output verifierad: ${webModernRoutes.length} moderna routes, ${webStaticSeoRoutes.length} byte-identiska legacy-sidor, 55 ursprungliga SEO-rutter, ${webSitemapRoutes.length} sitemap-URL:er och 404.`);
