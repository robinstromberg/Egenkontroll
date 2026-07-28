import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath, URL } from 'node:url';
import {
  collectWebVisualSources,
  isWebProductionSource,
  loadWebVisualAllowlist,
  validateWebVisualAccessibilityContracts,
  validateWebVisualGuardrails,
} from './web-visual-guardrails.mjs';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const baselineSources = await collectWebVisualSources(repoRoot);
const baselineAllowlist = await loadWebVisualAllowlist(repoRoot);

function withFixture(relativePath, source) {
  return { ...baselineSources, [relativePath]: source };
}

function cloneAllowlist() {
  return JSON.parse(JSON.stringify(baselineAllowlist));
}

test('hela webbens produktionsyta följer den centrala exakta allowlisten', () => {
  assert.deepEqual(validateWebVisualGuardrails(baselineSources, baselineAllowlist), []);
});

test('collectorn omfattar Astro men exkluderar test-, fixture- och byggfiler', () => {
  assert.equal(isWebProductionSource('apps/web/src/pages/example.astro'), true);
  assert.equal(isWebProductionSource('apps/web/src/example.test.ts'), false);
  assert.equal(isWebProductionSource('apps/web/src/__fixtures__/Raw.css'), false);
  assert.equal(isWebProductionSource('apps/web/dist/example.css'), false);
  assert.ok('apps/web/src/layouts/PublicLayout.astro' in baselineSources);
});

test('negativ fixture stoppar nya råa färger i både äldre och moderna CSS-funktioner', () => {
  const errors = validateWebVisualGuardrails(
    withFixture(
      'apps/web/src/components/RawColorNegativeFixture.css',
      `.fixture {
        color: #123456;
        background: rgb(1 2 3);
        border-color: hsl(10 20% 30%);
        outline-color: oklch(50% .2 30);
        text-decoration-color: color(display-p3 1 0 0);
        caret-color: color-mix(in srgb, red, blue);
      }`,
    ),
    baselineAllowlist,
  );
  assert.ok(errors.filter((error) => error.includes('raw-color')).length >= 6);
});

test('negativa fixtures stoppar lokal temamedia, temaselektor och tokenpalett', () => {
  const errors = validateWebVisualGuardrails(
    withFixture(
      'apps/web/src/components/LocalPaletteNegativeFixture.css',
      `
        [data-theme='dark'] .fixture { --ds-canvas: var(--ds-surface); }
        @media (prefers-color-scheme: dark) { .fixture { color: var(--ds-text); } }
      `,
    ),
    baselineAllowlist,
  );
  assert.ok(errors.some((error) => error.includes('local-theme-media')));
  assert.ok(errors.some((error) => error.includes('local-theme-selector')));
  assert.ok(errors.some((error) => error.includes('local-token-definition')));
});

test('råa brand- och UI-iconpaths stoppas medan brandpaketet tillåts', () => {
  const rawErrors = validateWebVisualGuardrails(
    withFixture(
      'apps/web/src/components/RawAssetNegativeFixture.tsx',
      `export const paths = ['/brand/egen-logo.png', '/ui-icons/egen-ikon.png'];`,
    ),
    baselineAllowlist,
  );
  assert.ok(rawErrors.some((error) => error.includes('raw-brand-path')));
  assert.ok(rawErrors.some((error) => error.includes('raw-ui-icon-path')));

  assert.deepEqual(
    validateWebVisualGuardrails(
      withFixture(
        'apps/web/src/components/BrandImportFixture.tsx',
        `import { brandAssets } from '@min-egenkontroll/brand'; export const logo = brandAssets.logo;`,
      ),
      baselineAllowlist,
    ),
    [],
  );
});

test('rå typografi, radius och skugga stoppas i en ny webbyta', () => {
  const errors = validateWebVisualGuardrails(
    withFixture(
      'apps/web/src/components/RawScaleNegativeFixture.css',
      `.fixture {
        font: 17px/1.4 Arial;
        font-size: 17px;
        line-height: 1.4;
        border-radius: var(--ds-radius-md) 9px;
        box-shadow: var(--ds-shadow-sm), 0 2px 4px currentColor;
      }`,
    ),
    baselineAllowlist,
  );
  assert.ok(errors.some((error) => error.includes('raw-typography')));
  assert.ok(errors.some((error) => error.includes('raw-radius')));
  assert.ok(errors.some((error) => error.includes('raw-shadow')));

  const unknownTokenErrors = validateWebVisualGuardrails(
    withFixture(
      'apps/web/src/components/UnknownTokenNegativeFixture.css',
      `.fixture {
        font-size: var(--ds-font-size-nope);
        line-height: var(--ds-line-height-nope);
        border-radius: var(--ds-radius-nope);
        box-shadow: var(--ds-shadow-nope);
      }`,
    ),
    baselineAllowlist,
  );
  assert.ok(unknownTokenErrors.some((error) => error.includes('raw-typography')));
  assert.ok(unknownTokenErrors.some((error) => error.includes('raw-radius')));
  assert.ok(unknownTokenErrors.some((error) => error.includes('raw-shadow')));

  assert.deepEqual(
    validateWebVisualGuardrails(
      withFixture(
        'apps/web/src/components/SemanticScaleFixture.css',
        `.fixture {
          font-family: var(--ds-font-sans);
          font-size: var(--ds-font-size-base);
          line-height: var(--ds-line-height-base);
          border-radius: var(--ds-radius-md);
          box-shadow: var(--ds-shadow-sm);
        }`,
      ),
      baselineAllowlist,
    ),
    [],
  );
});

test('en extra förekomst i en baselinad fil stoppar allowlist-tillväxt', () => {
  const relativePath = 'apps/web/src/components/Homepage.css';
  const errors = validateWebVisualGuardrails(
    { ...baselineSources, [relativePath]: `${baselineSources[relativePath]}\n.fixture { color: #3f5147; }\n` },
    baselineAllowlist,
  );
  assert.ok(errors.some((error) => (
    error.includes(relativePath) && error.includes('#3f5147') && error.includes('förväntat 3')
  )));
});

test('minskad eller saknad legacy-baseline stoppas som inaktuell', () => {
  const relativePath = 'apps/web/src/components/Homepage.css';
  const reducedSources = {
    ...baselineSources,
    [relativePath]: baselineSources[relativePath].replace('#3f5147', 'var(--ds-border-strong)'),
  };
  const reducedErrors = validateWebVisualGuardrails(reducedSources, baselineAllowlist);
  assert.ok(reducedErrors.some((error) => error.includes('faktisk förekomst 2')));

  const missingSources = { ...baselineSources };
  delete missingSources[relativePath];
  const missingErrors = validateWebVisualGuardrails(missingSources, baselineAllowlist);
  assert.ok(missingErrors.some((error) => error.includes('allowlistad produktionsfil saknas')));
});

test('den grupperade legacy-SEO-brandbaselinen är exakt per fil och filantal', () => {
  const relativePath = 'apps/web/public/seo/allergeninformation-restaurang.html';
  const errors = validateWebVisualGuardrails(
    { ...baselineSources, [relativePath]: `${baselineSources[relativePath]}<img src="/brand/min-egenkontroll-logo2.png">` },
    baselineAllowlist,
  );
  assert.ok(errors.some((error) => error.includes('canonical raw-brand-path-baseline')));
});

test('HTML-entiteter feltolkas inte som råa färger', () => {
  assert.deepEqual(
    validateWebVisualGuardrails(
      withFixture('apps/web/src/components/HtmlEntityFixture.ts', `export const apostrophe = '&#039;';`),
      baselineAllowlist,
    ),
    [],
  );
});

test('felaktig allowlist stoppas innan produktionsbaselinen används', () => {
  const malformed = cloneAllowlist();
  malformed.version = 2;
  malformed.exceptions[0].allow['okänd-kind'] = { value: 0 };
  const errors = validateWebVisualGuardrails(baselineSources, malformed);
  assert.ok(errors.some((error) => error.includes('version 1')));
  assert.ok(errors.some((error) => error.includes('okänd occurrence-typ')));

  const prefixWithoutBaseline = cloneAllowlist();
  delete prefixWithoutBaseline.canonical[0].baseline;
  const prefixErrors = validateWebVisualGuardrails(baselineSources, prefixWithoutBaseline);
  assert.ok(prefixErrors.some((error) => error.includes('pathPrefix kräver en exakt baseline')));
});

test('tema, brand, 320 px, fokus och reduced motion för representativa mallar är kontraktsskyddade', () => {
  assert.deepEqual(validateWebVisualAccessibilityContracts(baselineSources), []);

  const headerPath = 'apps/web/src/components/PublicHeader.tsx';
  const withoutDocumentRoot = {
    ...baselineSources,
    [headerPath]: baselineSources[headerPath].replace(
      "document.documentElement.setAttribute('data-theme', theme);",
      '',
    ),
  };
  assert.ok(validateWebVisualAccessibilityContracts(withoutDocumentRoot).some((error) => (
    error.includes('temaväxlare') && error.includes('dokumentroten')
  )));
});
