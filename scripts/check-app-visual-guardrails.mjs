import console from 'node:console';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import {
  collectAppVisualSources,
  loadAppVisualAllowlist,
  validateAppVisualGuardrails,
  validateRemovedLegacyCss,
  validateThemeContrast,
  validateVisualAccessibilityContracts,
} from './contracts/app-visual-guardrails.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const sources = await collectAppVisualSources(repoRoot);
const allowlist = await loadAppVisualAllowlist(repoRoot);
const themeContract = JSON.parse(sources['packages/design-system/theme-contract.json']);
const errors = [
  ...validateAppVisualGuardrails(sources, allowlist),
  ...validateThemeContrast(themeContract),
  ...validateVisualAccessibilityContracts(sources),
  ...validateRemovedLegacyCss(sources),
];

if (errors.length > 0) {
  console.error('Appens visuella guardrails bröts:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Appens visuella guardrails godkända för ${Object.keys(sources).length} produktionsfiler: `
  + 'råvärden, tema, brand/UI-assets, kontrast, fokus, reduced motion och 320 px.',
);
