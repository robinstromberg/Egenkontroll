import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_ORIGIN = 'https://minegenkontroll.se';
const requiredBrandAssets = [
  'logo',
  'icon',
  'favicon',
  'appleTouchIcon',
  'openGraph',
  'pwaIcon192',
  'pwaIcon512',
  'reportIcon',
];

function normalizeNewlines(value) {
  return value.replaceAll('\r\n', '\n');
}

function replaceExactly(source, pattern, replacement, label) {
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`${label}: förväntade exakt en matchning men hittade ${matches.length}.`);
  }
  return source.replace(pattern, replacement);
}

function tokenDeclarations(tokens) {
  return Object.entries(tokens).map(([name, value]) => `  --ds-${name}: ${value};`).join('\n');
}

export function resolveThemeValue(themeContract, surface) {
  const reference = themeContract.staticSurfaces[surface];
  if (!reference) throw new Error(`Okänd statisk temayta: ${surface}.`);
  const theme = themeContract.themes[reference.theme];
  if (!theme) throw new Error(`${surface} refererar till okänt tema: ${reference.theme}.`);
  const value = theme.tokens[reference.token];
  if (!value) throw new Error(`${surface} refererar till okänt token: ${reference.token}.`);
  return value;
}

export function renderTokensCss(themeContract) {
  const light = themeContract.themes.light;
  const dark = themeContract.themes.dark;
  const lightTokensBeforeShared = Object.fromEntries(
    Object.entries(light.tokens).filter(([name]) => !name.startsWith('shadow-')),
  );
  const lightTokensAfterShared = Object.fromEntries(
    Object.entries(light.tokens).filter(([name]) => name.startsWith('shadow-')),
  );
  const lightDeclarations = tokenDeclarations({
    ...lightTokensBeforeShared,
    ...themeContract.sharedTokens,
    ...lightTokensAfterShared,
  });
  const darkDeclarations = tokenDeclarations(dark.tokens);

  return `/* Generated from packages/design-system/theme-contract.json. Run npm run visual:sync. */
:root {
  color-scheme: ${light.colorScheme};
${lightDeclarations}
}

[data-theme='dark'] {
  color-scheme: ${dark.colorScheme};
${darkDeclarations}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: ${dark.colorScheme};
${darkDeclarations.split('\n').map((line) => `  ${line}`).join('\n')}
  }
}
`;
}

export function renderAppIndexHtml(source, themeContract, brandContract) {
  const { assets, metadata } = brandContract;
  const openGraph = metadata.openGraph;
  let output = source;
  output = replaceExactly(
    output,
    /<meta name="theme-color" content="[^"]*" \/>/g,
    `<meta name="theme-color" content="${resolveThemeValue(themeContract, 'appThemeColor')}" />`,
    'apps/app/index.html theme-color',
  );
  output = replaceExactly(
    output,
    /<link rel="apple-touch-icon" href="[^"]*" \/>/g,
    `<link rel="apple-touch-icon" href="${assets.appleTouchIcon}" />`,
    'apps/app/index.html apple-touch-icon',
  );
  output = replaceExactly(
    output,
    /<meta property="og:image" content="[^"]*" \/>/g,
    `<meta property="og:image" content="${SITE_ORIGIN}${assets.openGraph}" />`,
    'apps/app/index.html og:image',
  );
  output = replaceExactly(
    output,
    /<meta property="og:image:width" content="[^"]*" \/>/g,
    `<meta property="og:image:width" content="${openGraph.width}" />`,
    'apps/app/index.html og:image:width',
  );
  output = replaceExactly(
    output,
    /<meta property="og:image:height" content="[^"]*" \/>/g,
    `<meta property="og:image:height" content="${openGraph.height}" />`,
    'apps/app/index.html og:image:height',
  );
  output = replaceExactly(
    output,
    /<meta property="og:image:alt" content="[^"]*" \/>/g,
    `<meta property="og:image:alt" content="${openGraph.alt}" />`,
    'apps/app/index.html og:image:alt',
  );
  output = replaceExactly(
    output,
    /<meta name="twitter:image" content="[^"]*" \/>/g,
    `<meta name="twitter:image" content="${SITE_ORIGIN}${assets.openGraph}" />`,
    'apps/app/index.html twitter:image',
  );
  output = replaceExactly(
    output,
    /<meta name="twitter:image:alt" content="[^"]*" \/>/g,
    `<meta name="twitter:image:alt" content="${openGraph.alt}" />`,
    'apps/app/index.html twitter:image:alt',
  );
  output = replaceExactly(
    output,
    /<link rel="icon" type="image\/png" href="[^"]*" \/>/g,
    `<link rel="icon" type="image/png" href="${assets.favicon}" />`,
    'apps/app/index.html favicon',
  );
  output = replaceExactly(
    output,
    /"logo": "https:\/\/minegenkontroll\.se\/brand\/[^"]+"/g,
    `"logo": "${SITE_ORIGIN}${assets.logo}"`,
    'apps/app/index.html JSON-LD-logo',
  );
  return output;
}

export function renderAppManifest(source, themeContract, brandContract) {
  const manifest = JSON.parse(source);
  manifest.background_color = resolveThemeValue(themeContract, 'appPwaBackgroundColor');
  manifest.theme_color = resolveThemeValue(themeContract, 'appPwaThemeColor');
  if (!Array.isArray(manifest.icons) || manifest.icons.length !== 2) {
    throw new Error('apps/app/public/manifest.webmanifest ska ha exakt två PWA-ikoner.');
  }
  manifest.icons[0].src = brandContract.assets.pwaIcon192;
  manifest.icons[1].src = brandContract.assets.pwaIcon512;
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function renderStaticSeoHtml(source, brandContract) {
  return source.replace(
    /(<img\s+src=")\/brand\/[^"]+("\s+alt="Min Egenkontroll")/g,
    `$1${brandContract.assets.logo}$2`,
  );
}

async function listStaticSeoFiles(repoRoot) {
  const files = [];
  for (const app of ['app', 'web']) {
    const directory = path.join(repoRoot, 'apps', app, 'public', 'seo');
    const entries = await readdir(directory, { withFileTypes: true });
    files.push(...entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => path.posix.join('apps', app, 'public', 'seo', entry.name)));
  }
  return files;
}

async function readText(repoRoot, relativePath) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

export async function collectVisualContracts(repoRoot) {
  const themeContract = JSON.parse(await readText(repoRoot, 'packages/design-system/theme-contract.json'));
  const brandContract = JSON.parse(await readText(repoRoot, 'packages/brand/brand-contract.json'));
  const seoFiles = await listStaticSeoFiles(repoRoot);
  const seoSources = Object.fromEntries(await Promise.all(seoFiles.map(async (file) => [
    file,
    await readText(repoRoot, file),
  ])));
  const masterBrandFiles = await readdir(path.join(repoRoot, 'packages', 'brand', 'assets'));

  return {
    themeContract,
    brandContract,
    masterBrandFiles,
    tokensCss: await readText(repoRoot, 'packages/design-system/styles/tokens.css'),
    appIndexHtml: await readText(repoRoot, 'apps/app/index.html'),
    appManifest: await readText(repoRoot, 'apps/app/public/manifest.webmanifest'),
    webLayout: await readText(repoRoot, 'apps/web/src/layouts/PublicLayout.astro'),
    inspectorReportPdf: await readText(repoRoot, 'apps/app/src/reports/inspectorReportPdf.js'),
    reportService: await readText(repoRoot, 'apps/app/src/services/reportService.ts'),
    sharedRunList: await readText(repoRoot, 'apps/app/src/components/SharedRunList.tsx'),
    seoSources,
  };
}

function validateContracts(snapshot, errors) {
  const { themeContract, brandContract } = snapshot;
  if (themeContract.version !== 1) errors.push('Temakontraktet ska ha version 1.');
  if (brandContract.version !== 1) errors.push('Brandkontraktet ska ha version 1.');

  const lightKeys = Object.keys(themeContract.themes?.light?.tokens ?? {});
  const darkKeys = Object.keys(themeContract.themes?.dark?.tokens ?? {});
  if (JSON.stringify(lightKeys) !== JSON.stringify(darkKeys)) {
    errors.push('Light och dark ska ha samma ordnade semantiska tokennycklar.');
  }

  for (const surface of [
    'appThemeColor',
    'appPwaBackgroundColor',
    'appPwaThemeColor',
    'webThemeColor',
  ]) {
    try {
      resolveThemeValue(themeContract, surface);
    } catch (error) {
      errors.push(error.message);
    }
  }

  for (const asset of requiredBrandAssets) {
    const assetUrl = brandContract.assets?.[asset];
    if (typeof assetUrl !== 'string' || !assetUrl.startsWith('/brand/')) {
      errors.push(`Brandasset ${asset} ska vara en publik /brand/-URL.`);
      continue;
    }
    if (!snapshot.masterBrandFiles.includes(path.posix.basename(assetUrl))) {
      errors.push(`Brandasset ${asset} saknar masterfil: ${assetUrl}.`);
    }
  }
}

function compareGenerated(errors, label, actual, expected) {
  if (normalizeNewlines(actual) !== normalizeNewlines(expected)) {
    errors.push(`${label} avviker från det maskinläsbara visuella kontraktet.`);
  }
}

export function validateVisualContracts(snapshot) {
  const errors = [];
  validateContracts(snapshot, errors);
  if (errors.length > 0) return errors;

  const { themeContract, brandContract } = snapshot;
  compareGenerated(errors, 'packages/design-system/styles/tokens.css', snapshot.tokensCss, renderTokensCss(themeContract));
  compareGenerated(
    errors,
    'apps/app/index.html',
    snapshot.appIndexHtml,
    renderAppIndexHtml(snapshot.appIndexHtml, themeContract, brandContract),
  );
  compareGenerated(
    errors,
    'apps/app/public/manifest.webmanifest',
    snapshot.appManifest,
    renderAppManifest(snapshot.appManifest, themeContract, brandContract),
  );

  for (const [file, source] of Object.entries(snapshot.seoSources)) {
    compareGenerated(errors, file, source, renderStaticSeoHtml(source, brandContract));
  }

  const webRequirements = [
    ["resolveStaticThemeValue('webThemeColor')", 'Webbens theme-color ska lösas från temakontraktet.'],
    ['brandAssets.openGraph', 'Webbens Open Graph-bild ska använda brandkontraktet.'],
    ['brandAssets.favicon', 'Webbens favicon ska använda brandkontraktet.'],
    ['brandMetadata.openGraph', 'Webbens Open Graph-metadata ska använda brandkontraktet.'],
  ];
  for (const [required, message] of webRequirements) {
    if (!snapshot.webLayout.includes(required)) errors.push(message);
  }
  if (/<meta name="theme-color" content="#[0-9a-f]+"/i.test(snapshot.webLayout)) {
    errors.push('Webbens theme-color får inte vara en rå färgliteral.');
  }

  if (!snapshot.inspectorReportPdf.includes('brandAssets.reportIcon')) {
    errors.push('PDF-rapporten ska använda brandAssets.reportIcon.');
  }
  if (/public\/brand\/|\/brand\/min-egenkontroll/i.test(snapshot.inspectorReportPdf)) {
    errors.push('PDF-rapporten innehåller en rå brandasset-sökväg.');
  }
  if (!snapshot.reportService.includes('brandAssets.reportIcon')) {
    errors.push('Rapporttjänsten ska använda brandAssets.reportIcon.');
  }
  if (!snapshot.sharedRunList.includes('brandAssets.reportIcon')) {
    errors.push('Inspektörens utskriftsyta ska använda brandAssets.reportIcon.');
  }

  return errors;
}

export async function synchronizeVisualContracts(repoRoot, snapshot) {
  const { themeContract, brandContract } = snapshot;
  const outputs = {
    'packages/design-system/styles/tokens.css': renderTokensCss(themeContract),
    'apps/app/index.html': renderAppIndexHtml(snapshot.appIndexHtml, themeContract, brandContract),
    'apps/app/public/manifest.webmanifest': renderAppManifest(snapshot.appManifest, themeContract, brandContract),
  };
  for (const [file, source] of Object.entries(snapshot.seoSources)) {
    outputs[file] = renderStaticSeoHtml(source, brandContract);
  }
  await Promise.all(Object.entries(outputs).map(([file, source]) => (
    writeFile(path.join(repoRoot, file), normalizeNewlines(source), 'utf8')
  )));
  return Object.keys(outputs);
}
