import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const relativeBaselinePath = 'apps/web/src/config/grandfatheredGovernanceBaseline.json';
const baselinePath = path.join(repoRoot, relativeBaselinePath);
const baseIndex = process.argv.indexOf('--base-sha');
const baseSha = baseIndex >= 0 ? process.argv[baseIndex + 1] : undefined;

if (baseIndex >= 0 && !baseSha) throw new Error('--base-sha kräver en commit-SHA.');

const current = JSON.parse(await readFile(baselinePath, 'utf8'));
if (!Array.isArray(current)) throw new Error('Grandfathered-baslinjen måste vara en JSON-lista.');

const currentPaths = new Set();
for (const entry of current) {
  if (!entry?.path || !entry?.status) throw new Error('Grandfathered-baslinjen innehåller en ogiltig post.');
  if (currentPaths.has(entry.path)) throw new Error(`Grandfathered-baslinjen innehåller duplicerad route: ${entry.path}`);
  currentPaths.add(entry.path);
}

if (!baseSha || /^0+$/.test(baseSha)) {
  process.stdout.write(`Grandfathered-baslinjen är lokalt giltig: ${current.length} routes. Ingen jämförelsebas angavs.\n`);
  process.exit(0);
}

let previous;
try {
  previous = JSON.parse(execFileSync('git', ['show', `${baseSha}:${relativeBaselinePath}`], { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
} catch {
  try {
    execFileSync('git', ['cat-file', '-e', `${baseSha}^{commit}`], { cwd: repoRoot, stdio: 'ignore' });
  } catch (commitError) {
    throw new Error(`Kunde inte läsa jämförelsebasen ${baseSha}. CI måste checkouta bas-SHA med full historik.`, { cause: commitError });
  }
  process.stdout.write(`Grandfathered-baslinjen saknas i jämförelsebasen ${baseSha}; detta är den första frysta baslinjen. Shrink-only-jämförelse börjar efter merge.\n`);
  process.exit(0);
}

const previousByPath = new Map(previous.map((entry) => [entry.path, entry]));
const errors = [];
for (const entry of current) {
  const prior = previousByPath.get(entry.path);
  if (!prior) errors.push(`Grandfathered-baslinjen får inte växa: ${entry.path}`);
  else if (JSON.stringify(prior) !== JSON.stringify(entry)) errors.push(`Grandfathered-route får inte ändra status eller governance: ${entry.path}`);
}

if (errors.length > 0) throw new Error(`Grandfathered-baslinjen får endast minska mot ${baseSha}:\n- ${errors.join('\n- ')}`);
process.stdout.write(`Grandfathered-baslinjen minskar eller är oförändrad: ${previous.length} -> ${current.length} routes mot ${baseSha}.\n`);
