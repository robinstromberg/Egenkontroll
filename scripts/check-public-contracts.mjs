import console from 'node:console';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import {
  baselineFromSnapshot,
  collectPublicContracts,
  contractKeys,
  validatePublicContracts,
} from './contracts/public-platform-contracts.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const baselinePath = path.join(repoRoot, 'scripts/contracts/public-platform-baseline.json');
const updateBaseline = process.argv.includes('--update');
const printSnapshot = process.argv.includes('--print');

const snapshot = await collectPublicContracts(repoRoot);

if (printSnapshot) {
  console.log(`${JSON.stringify(baselineFromSnapshot(snapshot), null, 2)}\n`);
  process.exit(0);
}

if (updateBaseline) {
  const intrinsicErrors = validatePublicContracts(snapshot);
  if (intrinsicErrors.length > 0) {
    console.error('Baseline uppdaterades inte eftersom aktuellt repo bryter grundkontrakten:');
    for (const error of intrinsicErrors) console.error(`- ${error}`);
    process.exit(1);
  }

  await writeFile(baselinePath, `${JSON.stringify(baselineFromSnapshot(snapshot), null, 2)}\n`, 'utf8');
  console.log(`Uppdaterade ${path.relative(repoRoot, baselinePath)}. Granska alltid diffen.`);
  process.exit(0);
}

const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
const missingKeys = contractKeys.filter((key) => !Array.isArray(baseline[key]));
if (missingKeys.length > 0) {
  console.error(`Baseline saknar obligatoriska listor: ${missingKeys.join(', ')}`);
  process.exit(1);
}

const errors = validatePublicContracts(snapshot, baseline);
if (errors.length > 0) {
  console.error('Publika plattformskontrakt bröts:');
  for (const error of errors) console.error(`- ${error}`);
  console.error('\nOm ändringen är avsiktlig: kör npm run contracts:update och granska baseline-diffen.');
  process.exit(1);
}

console.log(
  `Publika plattformskontrakt godkända: ${snapshot.publicRoutes.length} routes, `
  + `${snapshot.canonicalPaths.length} canonicals, ${snapshot.resourceHrefs.length} resurser, `
  + `${snapshot.apiPaths.length} API-paths och ${snapshot.publicAssets.length} assets.`,
);
