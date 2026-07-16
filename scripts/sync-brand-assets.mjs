import console from 'node:console';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceDirectory = path.join(repoRoot, 'packages', 'brand', 'assets');
const publicDirectories = [
  path.join(repoRoot, 'apps', 'app', 'public', 'brand'),
  path.join(repoRoot, 'apps', 'web', 'public', 'brand'),
];
const expectedTargets = new Set(['apps/app/public/brand', 'apps/web/public/brand']);

for (const publicDirectory of publicDirectories) {
  const relativeTarget = path.relative(repoRoot, publicDirectory).replaceAll('\\', '/');
  if (!expectedTargets.has(relativeTarget)) {
    throw new Error(`Vägrar synka brandassets till oväntad sökväg: ${publicDirectory}`);
  }

  await rm(publicDirectory, { force: true, recursive: true });
  await mkdir(publicDirectory, { recursive: true });
  await cp(sourceDirectory, publicDirectory, { recursive: true });
}

console.log('Synkade packages/brand/assets till apps/app/public/brand och apps/web/public/brand.');
