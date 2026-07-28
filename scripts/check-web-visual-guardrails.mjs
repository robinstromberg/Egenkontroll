import console from 'node:console';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import {
  collectWebVisualSources,
  loadWebVisualAllowlist,
  validateWebVisualAccessibilityContracts,
  validateWebVisualGuardrails,
} from './contracts/web-visual-guardrails.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const sources = await collectWebVisualSources(repoRoot);
const allowlist = await loadWebVisualAllowlist(repoRoot);
const errors = [
  ...validateWebVisualGuardrails(sources, allowlist),
  ...validateWebVisualAccessibilityContracts(sources),
];

if (errors.length > 0) {
  console.error('Webbens visuella guardrails bröts:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Webbens visuella guardrails godkända för ${Object.keys(sources).length} produktionsfiler: `
  + 'tema, brand/UI-assets, typografi, radius, skuggor, fokus, reduced motion och 320 px.',
);
