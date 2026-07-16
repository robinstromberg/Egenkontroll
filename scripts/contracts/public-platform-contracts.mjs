import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';

const SITE_ORIGIN = 'https://minegenkontroll.se';

export const contractKeys = [
  'publicRoutes',
  'canonicalPaths',
  'resourceHrefs',
  'sitemapPaths',
  'apiPaths',
  'apiClientPaths',
  'clientEnvVars',
  'serverEnvVars',
  'envExampleVars',
  'publicAssets',
  'assetReferences',
];

const labels = {
  publicRoutes: 'publik route',
  canonicalPaths: 'canonical path',
  resourceHrefs: 'resource href',
  sitemapPaths: 'sitemap-path',
  apiPaths: 'API-path',
  apiClientPaths: 'API-klientpath',
  clientEnvVars: 'publik klientvariabel',
  serverEnvVars: 'servervariabel',
  envExampleVars: 'variabel i .env.example',
  publicAssets: 'publik asset',
  assetReferences: 'assetreferens',
};

function matches(source, pattern, group = 1) {
  return [...source.matchAll(pattern)].map((match) => match[group]);
}

function unique(values) {
  return [...new Set(values)];
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, 'sv'));
}

async function read(repoRoot, relativePath) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

async function listFiles(repoRoot, relativeDirectory, predicate = () => true) {
  const directory = path.join(repoRoot, relativeDirectory);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory.replaceAll('\\', '/'), entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(repoRoot, relativePath, predicate));
    } else if (predicate(relativePath)) {
      files.push(relativePath);
    }
  }

  return files;
}

function sameOriginPath(url) {
  const parsed = new URL(url);
  if (parsed.origin !== SITE_ORIGIN) {
    throw new Error(`Förväntade ${SITE_ORIGIN} men hittade ${parsed.origin} i ${url}`);
  }
  return parsed.pathname;
}

function publicUrl(relativePath) {
  return `/${relativePath.replace(/^public\//, '')}`;
}

export async function collectPublicContracts(repoRoot) {
  const appRoot = path.join(repoRoot, 'apps', 'app');
  const dispatcher = await read(appRoot, 'src/components/PublicLandingPageWithKnowledgeBase.tsx');
  const app = await read(appRoot, 'src/App.tsx');
  const seoLanding = await read(appRoot, 'src/components/SeoLandingPage.tsx');
  const publicResources = await read(appRoot, 'src/config/publicResources.ts');
  const sitemap = await read(appRoot, 'public/sitemap.xml');
  const envExample = await read(repoRoot, '.env.example');
  const indexHtml = await read(appRoot, 'index.html');
  const manifestSource = await read(appRoot, 'public/manifest.webmanifest');
  const manifest = JSON.parse(manifestSource);
  const mainSource = await read(appRoot, 'src/main.tsx');

  const dispatcherRoutes = matches(dispatcher, /normalizedPath === '([^']+)'/g);
  const appPublicRoutes = matches(app, /window\.location\.pathname === '([^']+)'/g)
    .filter((route) => route !== '/utveckling/designsystem');
  const seoRoutes = matches(seoLanding, /slug: '([^']+)'/g).map((slug) => `/${slug}`);
  const activeSeoRoutes = seoRoutes.filter((route) => !dispatcherRoutes.includes(route));
  const seoFiles = await listFiles(appRoot, 'public/seo', (file) => file.endsWith('.html'));
  const staticSeoRoutes = seoFiles.map(publicUrl);

  const canonicalConfigFiles = [
    'src/config/factPages.ts',
    'src/config/templatePages.ts',
    'src/config/toolPages.ts',
    'src/config/businessPages.ts',
  ];
  const configuredCanonicals = [];
  for (const file of canonicalConfigFiles) {
    configuredCanonicals.push(...matches(await read(appRoot, file), /canonicalPath: '([^']+)'/g));
  }

  const canonicalComponentFiles = [
    'src/components/Homepage.tsx',
    'src/components/KnowledgeBasePageV2.tsx',
    'src/components/SearchResultsPage.tsx',
    'src/components/HaccpTopicHub.tsx',
  ];
  const componentCanonicals = [];
  for (const file of canonicalComponentFiles) {
    const source = await read(appRoot, file);
    componentCanonicals.push(...matches(source, /canonical\.href\s*=\s*'(https:\/\/minegenkontroll\.se[^']*)'/g)
      .map(sameOriginPath));
  }

  const staticCanonicals = [];
  for (const file of seoFiles) {
    const source = await read(appRoot, file);
    staticCanonicals.push(...matches(source, /<link\s+rel="canonical"\s+href="([^"]+)"/g)
      .map(sameOriginPath));
  }

  const apiFiles = await listFiles(appRoot, 'api', (file) => file.endsWith('.js'));
  const apiPaths = apiFiles.map((file) => publicUrl(file).replace(/\.js$/, ''));
  const sourceFiles = await listFiles(appRoot, 'src', (file) => /\.(ts|tsx)$/.test(file));
  const sourceContents = await Promise.all(sourceFiles.map((file) => read(appRoot, file)));
  const combinedSource = sourceContents.join('\n');
  const apiClientPaths = matches(combinedSource, /(?:window\.)?fetch\(\s*['"](\/api\/[^'"]+)['"]/g);
  const clientEnvVars = matches(combinedSource, /import\.meta\.env\.(VITE_[A-Z0-9_]+)/g);
  const clientForbiddenEnvReferences = matches(
    combinedSource,
    /\b(SUPABASE_(?:SERVICE_ROLE_KEY|SECRET_KEY)|RESEND_(?:API_KEY|FROM_EMAIL))\b/g,
  );

  const apiSources = await Promise.all(apiFiles.map((file) => read(appRoot, file)));
  const combinedApiSource = apiSources.join('\n');
  const serverEnvVars = [
    ...matches(combinedApiSource, /process\.env\.([A-Z][A-Z0-9_]+)/g),
    ...matches(combinedApiSource, /readEnv\(\s*'([A-Z][A-Z0-9_]*)'/g),
    ...matches(combinedApiSource, /readEnv\(\s*'[A-Z][A-Z0-9_]*'\s*,\s*'([A-Z][A-Z0-9_]*)'/g),
  ];

  const brandAssets = await listFiles(
    appRoot,
    'public/brand',
    (file) => /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file),
  );
  const pwaOnboardingAssets = await listFiles(
    appRoot,
    'public/pwa-onboarding',
    (file) => /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file),
  );
  const publicAssets = [
    ...brandAssets.map(publicUrl),
    ...pwaOnboardingAssets.map(publicUrl),
    '/manifest.webmanifest',
    '/service-worker.js',
    '/robots.txt',
    '/sitemap.xml',
    '/seo-guides.css',
    ...staticSeoRoutes,
  ];

  const assetReferenceSources = [
    indexHtml,
    manifestSource,
    mainSource,
    await read(repoRoot, 'packages/brand/src/index.ts'),
    ...await Promise.all(seoFiles.map((file) => read(appRoot, file))),
  ].join('\n');
  const assetReferences = matches(
    assetReferenceSources,
    /['"](\/(?:brand\/[^'"?#]+|pwa-onboarding\/[^'"?#]+|manifest\.webmanifest|service-worker\.js|seo-guides\.css))['"]/g,
  );
  assetReferences.push(...matches(
    assetReferenceSources,
    /https:\/\/minegenkontroll\.se(\/brand\/[^'"?#<]+)/g,
  ));
  assetReferences.push(...manifest.icons.map((icon) => icon.src));

  return {
    publicRoutes: sorted([
      '/',
      ...dispatcherRoutes,
      ...appPublicRoutes,
      ...activeSeoRoutes,
      ...staticSeoRoutes,
    ]),
    canonicalPaths: sorted([
      ...componentCanonicals,
      ...configuredCanonicals,
      ...activeSeoRoutes,
      ...staticCanonicals,
    ]),
    resourceHrefs: sorted(matches(publicResources, /href: '([^']+)'/g)),
    sitemapPaths: sorted(matches(sitemap, /<loc>([^<]+)<\/loc>/g).map(sameOriginPath)),
    apiPaths: sorted(apiPaths),
    apiClientPaths: sorted(unique(apiClientPaths)),
    clientEnvVars: sorted(unique(clientEnvVars)),
    serverEnvVars: sorted(unique(serverEnvVars)),
    envExampleVars: sorted(matches(envExample, /^([A-Z][A-Z0-9_]*)=/gm)),
    publicAssets: sorted(unique(publicAssets)),
    assetReferences: sorted(unique(assetReferences)),
    clientForbiddenEnvReferences: sorted(unique(clientForbiddenEnvReferences)),
  };
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return sorted(repeated);
}

function compareWithBaseline(errors, key, actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const label = labels[key];

  for (const value of expected) {
    if (!actualSet.has(value)) errors.push(`Saknad ${label}: ${value}`);
  }
  for (const value of actual) {
    if (!expectedSet.has(value)) errors.push(`Ny ${label} saknas i baseline: ${value}`);
  }
}

export function validatePublicContracts(actual, baseline = null) {
  const errors = [];
  const uniqueKeys = ['publicRoutes', 'canonicalPaths', 'resourceHrefs', 'sitemapPaths'];

  for (const key of uniqueKeys) {
    for (const value of duplicates(actual[key])) {
      errors.push(`Duplicerad ${labels[key]}: ${value}`);
    }
  }

  const routeSet = new Set(actual.publicRoutes);
  const canonicalSet = new Set(actual.canonicalPaths);
  const apiSet = new Set(actual.apiPaths);
  const assetSet = new Set(actual.publicAssets);

  for (const href of actual.resourceHrefs) {
    if (!routeSet.has(href)) errors.push(`Resource href saknar publik route: ${href}`);
  }
  for (const canonical of actual.canonicalPaths) {
    if (!routeSet.has(canonical)) errors.push(`Canonical saknar publik route: ${canonical}`);
  }
  for (const sitemapPath of actual.sitemapPaths) {
    if (!routeSet.has(sitemapPath)) errors.push(`Sitemap-path saknar publik route: ${sitemapPath}`);
    if (!canonicalSet.has(sitemapPath)) errors.push(`Sitemap-path saknar canonical: ${sitemapPath}`);
  }
  for (const apiPath of actual.apiClientPaths) {
    if (!apiSet.has(apiPath)) errors.push(`API-klientpath saknar serverless-fil: ${apiPath}`);
  }
  for (const asset of actual.assetReferences) {
    if (!assetSet.has(asset)) errors.push(`Assetreferens saknar fil i public: ${asset}`);
  }
  for (const envName of actual.clientForbiddenEnvReferences ?? []) {
    errors.push(`Serverhemlighet refereras i klientkod: ${envName}`);
  }
  for (const envName of actual.clientEnvVars) {
    if (!envName.startsWith('VITE_')) errors.push(`Klientvariabel saknar VITE_-prefix: ${envName}`);
  }

  if (baseline) {
    for (const key of contractKeys) {
      compareWithBaseline(errors, key, actual[key], baseline[key]);
    }
  }

  return errors;
}

export function baselineFromSnapshot(snapshot) {
  return Object.fromEntries(contractKeys.map((key) => [key, snapshot[key]]));
}
