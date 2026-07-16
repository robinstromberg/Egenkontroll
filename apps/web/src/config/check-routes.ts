import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertWebRouteRegistry, webModernRoutes, webRouteRegistry, webStaticSeoRoutes } from './routes';

const webRoot = fileURLToPath(new URL('../..', import.meta.url));
const appRoot = path.resolve(webRoot, '..', 'app');
const forbidden = [
  ['Supabase-paket', /@supabase\//],
  ['appservice', /(?:^|\/)services\//],
  ['appens databasdomäntyper', /types\/database/],
  ['Supabaseklient', /supabaseClient/],
  ['serverhemlighet eller Supabase-env', /\b(?:SUPABASE_|RESEND_|VITE_SUPABASE_)/],
] as const;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolutePath);
    return /\.(astro|ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
  });
}

assertWebRouteRegistry();
const errors: string[] = [];
for (const file of sourceFiles(path.join(webRoot, 'src'))) {
  if (file.endsWith(`${path.sep}config${path.sep}check-routes.ts`)) continue;
  const source = readFileSync(file, 'utf8');
  const relativePath = path.relative(webRoot, file).replaceAll('\\', '/');
  for (const [label, pattern] of forbidden) {
    if (pattern.test(source)) errors.push(`${relativePath} innehåller förbjuden webbgräns: ${label}`);
  }
}

const packageJson = JSON.parse(readFileSync(path.join(webRoot, 'package.json'), 'utf8')) as { dependencies?: Record<string, string> };
if (packageJson.dependencies?.['@supabase/supabase-js']) errors.push('Webbpaketet får inte bero på @supabase/supabase-js.');

function hash(file: string): string {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

const byteIdenticalFiles = [
  'public/robots.txt',
  'public/seo-guides.css',
  'src/config/businessPages.ts',
  'src/config/factPages.ts',
  'src/config/haccpTopicContent.ts',
  'src/config/publicResources.ts',
  'src/config/templatePages.ts',
  'src/config/toolPages.ts',
  'src/types/publicTools.ts',
  ...webStaticSeoRoutes.map((route) => route.source),
];
for (const relativePath of byteIdenticalFiles) {
  const webFile = path.join(webRoot, relativePath);
  const appFile = path.join(appRoot, relativePath);
  if (hash(webFile) !== hash(appFile)) errors.push(`Migrerat innehåll avviker från apps/app: ${relativePath}`);
}

if (errors.length > 0) throw new Error(`Webbgränsen är inte ren:\n- ${errors.join('\n- ')}`);

console.log(`Astro-routekontrakt godkänt: ${webRouteRegistry.length} routes, ${webModernRoutes.length} moderna routes, ${webStaticSeoRoutes.length} statiska SEO-sidor och 75 canonicals.`);
