import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath, URL } from 'node:url';
import {
  collectAppVisualSources,
  loadAppVisualAllowlist,
  validateAppVisualGuardrails,
  validateRemovedLegacyCss,
  validateThemeContrast,
  validateVisualAccessibilityContracts,
} from './app-visual-guardrails.mjs';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const baselineSources = await collectAppVisualSources(repoRoot);
const baselineAllowlist = await loadAppVisualAllowlist(repoRoot);
const baselineThemeContract = JSON.parse(baselineSources['packages/design-system/theme-contract.json']);

function withFixture(relativePath, source) {
  return { ...baselineSources, [relativePath]: source };
}

test('hela appens produktionsyta följer den centrala visuella allowlisten', () => {
  assert.deepEqual(validateAppVisualGuardrails(baselineSources, baselineAllowlist), []);
});

test('negativ fixture stoppar en ny rå färg utan att ändra produktionskod', () => {
  const errors = validateAppVisualGuardrails(
    withFixture('apps/app/src/components/RawColorNegativeFixture.css', '.fixture { color: #123456; }'),
    baselineAllowlist,
  );
  assert.ok(errors.some((error) => error.includes('raw-color #123456')));
});

test('negativa fixtures stoppar lokal temamedia, temaselektor och tokenpalett', () => {
  const sources = withFixture(
    'apps/app/src/components/LocalPaletteNegativeFixture.css',
    `
      [data-theme='dark'] .fixture { --ds-canvas: var(--ds-surface); }
      @media (prefers-color-scheme: dark) { .fixture { color: var(--ds-text); } }
    `,
  );
  const errors = validateAppVisualGuardrails(sources, baselineAllowlist);
  assert.ok(errors.some((error) => error.includes('local-theme-media')));
  assert.ok(errors.some((error) => error.includes('local-theme-selector')));
  assert.ok(errors.some((error) => error.includes('local-token-definition')));
});

test('negativa fixtures stoppar råa brand- och UI-iconpaths', () => {
  const sources = withFixture(
    'apps/app/src/components/RawAssetNegativeFixture.tsx',
    `export const paths = ['/brand/egen-logo.png', '/ui-icons/egen-ikon.png'];`,
  );
  const errors = validateAppVisualGuardrails(sources, baselineAllowlist);
  assert.ok(errors.some((error) => error.includes('raw-brand-path')));
  assert.ok(errors.some((error) => error.includes('raw-ui-icon-path')));
});

test('en extra förekomst i en baselinad fil stoppar allowlist-tillväxt', () => {
  const relativePath = 'apps/app/src/components/SharingView.css';
  const errors = validateAppVisualGuardrails(
    { ...baselineSources, [relativePath]: `${baselineSources[relativePath]}\n.fixture { color: #111827; }\n` },
    baselineAllowlist,
  );
  assert.ok(errors.some((error) => (
    error.includes(relativePath) && error.includes('#111827') && error.includes('förväntat 1')
  )));
});

test('HTML-entiteter feltolkas inte som råa färger', () => {
  assert.deepEqual(
    validateAppVisualGuardrails(
      withFixture('apps/app/src/services/HtmlEntityFixture.ts', `export const apostrophe = '&#039;';`),
      baselineAllowlist,
    ),
    [],
  );
});

test('light- och dark-kontraktets text, status, fokus och gränser klarar kontrastkraven', () => {
  assert.deepEqual(validateThemeContrast(baselineThemeContract), []);
});

test('kontrastguardrailen stoppar ett otillräckligt nytt tokenvärde', () => {
  const contract = JSON.parse(JSON.stringify(baselineThemeContract));
  contract.themes.light.tokens.text = contract.themes.light.tokens.canvas;
  const errors = validateThemeContrast(contract);
  assert.ok(errors.some((error) => error.includes('light: text/canvas')));
});

test('320 px, focus-visible, reduced motion och showcase-tillstånd är kontraktsskyddade', () => {
  assert.deepEqual(validateVisualAccessibilityContracts(baselineSources), []);
});

test('verifierat död legacy-CSS förblir borttagen', () => {
  assert.deepEqual(validateRemovedLegacyCss(baselineSources), []);
});
