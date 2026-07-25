import console from 'node:console';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import {
  collectVisualContracts,
  synchronizeVisualContracts,
  validateVisualContracts,
} from './contracts/visual-contracts.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const synchronize = process.argv.includes('--write');
let snapshot = await collectVisualContracts(repoRoot);

if (synchronize) {
  const files = await synchronizeVisualContracts(repoRoot, snapshot);
  console.log(`Synkade ${files.length} visuella kontraktsytor.`);
  snapshot = await collectVisualContracts(repoRoot);
}

const errors = validateVisualContracts(snapshot);
if (errors.length > 0) {
  console.error('Visuella tema- och brandkontrakt bröts:');
  for (const error of errors) console.error(`- ${error}`);
  if (!synchronize) {
    console.error('\nÄndra kanoniska kontrakt och kör npm run visual:sync för genererade ytor.');
  }
  process.exit(1);
}

console.log(
  'Visuella kontrakt godkända: packages/design-system/theme-contract.json, '
  + 'packages/brand/brand-contract.json och statiska konsumentytor.',
);
