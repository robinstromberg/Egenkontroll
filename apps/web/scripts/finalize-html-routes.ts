import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webMigratedKnowledgeArticleRoutes } from '../src/config/routes';

const webRoot = fileURLToPath(new URL('..', import.meta.url));
const distRoot = path.join(webRoot, 'dist');
const htmlRoutes = webMigratedKnowledgeArticleRoutes;

for (const route of htmlRoutes) {
  const target = path.resolve(distRoot, ...route.path.slice(1).split('/'));
  const generatedIndex = path.join(target, 'index.html');
  if (!target.startsWith(`${distRoot}${path.sep}`)) throw new Error(`HTML-routen ligger utanför dist: ${route.path}`);
  if (!existsSync(generatedIndex)) throw new Error(`Genererad Astro-output saknas för HTML-routen: ${route.path}`);

  const html = readFileSync(generatedIndex);
  rmSync(target, { recursive: true });
  writeFileSync(target, html);
}

console.log(`Slutförde ${htmlRoutes.length} migrerade HTML-route${htmlRoutes.length === 1 ? '' : 'r'} som exakta filer.`);
