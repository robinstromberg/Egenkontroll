import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, URL } from 'node:url';
import {
  collectVisualContracts,
  renderTokensCss,
  validateVisualContracts,
} from './visual-contracts.mjs';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const baseline = await collectVisualContracts(repoRoot);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function changed(change) {
  const snapshot = clone(baseline);
  change(snapshot);
  return validateVisualContracts(snapshot);
}

test('repoets visuella kontrakt är internt konsekventa', () => {
  assert.deepEqual(validateVisualContracts(clone(baseline)), []);
});

test('tokens.css genereras deterministiskt från ett light- och dark-kontrakt', () => {
  assert.equal(
    baseline.tokensCss.replaceAll('\r\n', '\n'),
    renderTokensCss(baseline.themeContract),
  );
});

test('upptäcker drift i dark/system-tokenutdata', () => {
  const errors = changed((snapshot) => {
    snapshot.tokensCss = snapshot.tokensCss.replace('#101713', '#000000');
  });
  assert.ok(errors.some((error) => error.startsWith('packages/design-system/styles/tokens.css')));
});

test('upptäcker avvikande app-theme-color', () => {
  const errors = changed((snapshot) => {
    snapshot.appIndexHtml = snapshot.appIndexHtml.replace('content="#fffdf8"', 'content="#ffffff"');
  });
  assert.ok(errors.some((error) => error.startsWith('apps/app/index.html')));
});

test('upptäcker avvikande PWA-färger och PWA-assets', () => {
  const errors = changed((snapshot) => {
    snapshot.appManifest = snapshot.appManifest
      .replace('"theme_color": "#fffdf8"', '"theme_color": "#ffffff"')
      .replace('/brand/pwa-icon-192.png', '/brand/annan-ikon.png');
  });
  assert.ok(errors.some((error) => error.startsWith('apps/app/public/manifest.webmanifest')));
});

test('upptäcker rå eller avvikande theme-color i webbmetadata', () => {
  const errors = changed((snapshot) => {
    snapshot.webLayout = snapshot.webLayout
      .replace("resolveStaticThemeValue('webThemeColor')", "'#101713'");
  });
  assert.ok(errors.includes('Webbens theme-color ska lösas från temakontraktet.'));
});

test('upptäcker rå PDF-brandpath', () => {
  const errors = changed((snapshot) => {
    snapshot.inspectorReportPdf = snapshot.inspectorReportPdf
      .replace('brandAssets.reportIcon', "'../../public/brand/min-egenkontroll-icon.png'");
  });
  assert.ok(errors.includes('PDF-rapporten ska använda brandAssets.reportIcon.'));
  assert.ok(errors.includes('PDF-rapporten innehåller en rå brandasset-sökväg.'));
});

test('alla brandroller pekar på existerande masterfiler', () => {
  const errors = changed((snapshot) => {
    snapshot.brandContract.assets.reportIcon = '/brand/saknas.png';
  });
  assert.ok(errors.includes('Brandasset reportIcon saknar masterfil: /brand/saknas.png.'));
});

test('statiska SEO-brandpaths följer loggkontraktet', () => {
  const [firstSeoFile] = Object.keys(baseline.seoSources);
  const errors = changed((snapshot) => {
    snapshot.seoSources[firstSeoFile] = snapshot.seoSources[firstSeoFile]
      .replace('/brand/min-egenkontroll-logo2.png', '/brand/annan-logo.png');
  });
  assert.ok(errors.some((error) => error.startsWith(path.posix.dirname(firstSeoFile))));
});
