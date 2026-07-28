import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const supportedExtensions = new Set(['.css', '.html', '.js', '.jsx', '.json', '.ts', '.tsx', '.webmanifest']);
const excludedProductionFiles = new Set([
  'apps/app/src/reports/inspectorReportFixtures.js',
]);
const occurrenceKinds = new Set([
  'local-theme-media',
  'local-theme-selector',
  'local-token-definition',
  'raw-brand-path',
  'raw-color',
  'raw-ui-icon-path',
]);

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function normalizeLiteral(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function isProductionSource(relativePath) {
  const normalized = normalizePath(relativePath);
  if (excludedProductionFiles.has(normalized)) return false;
  if (/\.(?:spec|test)\.[^.]+$/i.test(normalized)) return false;
  if (normalized.includes('/__fixtures__/') || normalized.includes('/__tests__/')) return false;
  return supportedExtensions.has(path.extname(normalized));
}

async function listFiles(directory, repoRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'dist' || entry.name === 'node_modules') continue;
      files.push(...await listFiles(absolutePath, repoRoot));
    } else {
      const relativePath = normalizePath(path.relative(repoRoot, absolutePath));
      if (isProductionSource(relativePath)) files.push(relativePath);
    }
  }
  return files;
}

export async function collectAppVisualSources(repoRoot) {
  const roots = [
    path.join(repoRoot, 'apps', 'app', 'api'),
    path.join(repoRoot, 'apps', 'app', 'public'),
    path.join(repoRoot, 'apps', 'app', 'src'),
    path.join(repoRoot, 'packages', 'brand'),
    path.join(repoRoot, 'packages', 'design-system'),
  ];
  const files = ['apps/app/index.html'];
  for (const root of roots) files.push(...await listFiles(root, repoRoot));
  files.sort();
  return Object.fromEntries(await Promise.all(files.map(async (relativePath) => [
    relativePath,
    await readFile(path.join(repoRoot, relativePath), 'utf8'),
  ])));
}

export async function loadAppVisualAllowlist(repoRoot) {
  return JSON.parse(await readFile(
    path.join(repoRoot, 'scripts', 'contracts', 'app-visual-allowlist.json'),
    'utf8',
  ));
}

export function findVisualOccurrences(relativePath, source) {
  const occurrences = [];
  const patterns = [
    ['raw-color', /(?<!&)#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\([^)]*\)/gi],
    ['raw-brand-path', /\/brand\/[a-z0-9_./-]+/gi],
    ['raw-ui-icon-path', /\/ui-icons\/[a-z0-9_./-]+/gi],
    ['local-theme-media', /@media\s*\([^)]*prefers-color-scheme\s*:\s*(?:dark|light)[^)]*\)/gi],
    ['local-theme-selector', /\[data-theme\s*=\s*['"]?(?:dark|light)['"]?\]/gi],
    ['local-token-definition', /--ds-[a-z0-9-]+\s*:/gi],
  ];
  for (const [kind, pattern] of patterns) {
    for (const match of source.matchAll(pattern)) {
      occurrences.push({
        kind,
        literal: normalizeLiteral(match[0]),
        path: normalizePath(relativePath),
      });
    }
  }
  return occurrences;
}

export function summarizeVisualOccurrences(sources) {
  const summary = {};
  for (const [relativePath, source] of Object.entries(sources)) {
    for (const occurrence of findVisualOccurrences(relativePath, source)) {
      summary[relativePath] ??= {};
      summary[relativePath][occurrence.kind] ??= {};
      summary[relativePath][occurrence.kind][occurrence.literal] =
        (summary[relativePath][occurrence.kind][occurrence.literal] ?? 0) + 1;
    }
  }
  return summary;
}

function validateAllowlist(allowlist) {
  const errors = [];
  if (allowlist?.version !== 1) errors.push('Den visuella allowlisten ska ha version 1.');
  const canonical = Array.isArray(allowlist?.canonical) ? allowlist.canonical : [];
  const exceptions = Array.isArray(allowlist?.exceptions) ? allowlist.exceptions : [];
  const keys = new Set();
  for (const [group, entries] of [['canonical', canonical], ['exceptions', exceptions]]) {
    for (const entry of entries) {
      const targetCount = Number(Boolean(entry.path)) + Number(Boolean(entry.pathPrefix));
      if (targetCount !== 1) errors.push(`${group}: varje post ska ha exakt path eller pathPrefix.`);
      const key = `${entry.path ?? `${entry.pathPrefix}*`}`;
      if (keys.has(key)) errors.push(`Duplicerad allowlist-post: ${key}.`);
      keys.add(key);
      if (typeof entry.reason !== 'string' || entry.reason.trim().length < 12) {
        errors.push(`${key}: allowlist-posten saknar en tydlig motivering.`);
      }
      if (group === 'canonical') {
        if (!Array.isArray(entry.kinds) || entry.kinds.length === 0) {
          errors.push(`${key}: canonical-posten saknar kinds.`);
        }
        for (const kind of entry.kinds ?? []) {
          if (!occurrenceKinds.has(kind)) errors.push(`${key}: okänd occurrence-typ ${kind}.`);
        }
      } else {
        if (entry.pathPrefix) errors.push(`${key}: baselinade undantag måste använda exakt path.`);
        const kinds = Object.keys(entry.allow ?? {});
        if (kinds.length === 0) errors.push(`${key}: undantaget saknar en exakt baseline.`);
        for (const kind of kinds) {
          if (!occurrenceKinds.has(kind)) errors.push(`${key}: okänd occurrence-typ ${kind}.`);
          const literals = entry.allow[kind];
          if (!literals || typeof literals !== 'object' || Array.isArray(literals)) {
            errors.push(`${key}: ${kind} ska vara ett literal-till-antal-objekt.`);
            continue;
          }
          for (const [literal, count] of Object.entries(literals)) {
            if (literal !== normalizeLiteral(literal) || !Number.isInteger(count) || count < 1) {
              errors.push(`${key}: ogiltig baseline för ${kind} (${literal}).`);
            }
          }
        }
      }
    }
  }
  return errors;
}

function canonicalEntryFor(allowlist, occurrence) {
  return allowlist.canonical.find((entry) => (
    (entry.path === occurrence.path || (entry.pathPrefix && occurrence.path.startsWith(entry.pathPrefix)))
    && entry.kinds.includes(occurrence.kind)
  ));
}

function countOccurrences(occurrences) {
  const counts = {};
  for (const occurrence of occurrences) {
    counts[occurrence.path] ??= {};
    counts[occurrence.path][occurrence.kind] ??= {};
    counts[occurrence.path][occurrence.kind][occurrence.literal] =
      (counts[occurrence.path][occurrence.kind][occurrence.literal] ?? 0) + 1;
  }
  return counts;
}

export function validateAppVisualGuardrails(sources, allowlist) {
  const errors = validateAllowlist(allowlist);
  if (errors.length > 0) return errors;
  const occurrences = Object.entries(sources).flatMap(([relativePath, source]) => (
    findVisualOccurrences(relativePath, source)
  ));
  const counts = countOccurrences(occurrences);
  const exceptionByPath = new Map(allowlist.exceptions.map((entry) => [entry.path, entry]));

  for (const occurrence of occurrences) {
    if (canonicalEntryFor(allowlist, occurrence)) continue;
    const expectedCount = exceptionByPath.get(occurrence.path)?.allow?.[occurrence.kind]?.[occurrence.literal];
    const actualCount = counts[occurrence.path]?.[occurrence.kind]?.[occurrence.literal] ?? 0;
    if (expectedCount !== actualCount) {
      errors.push(
        `${occurrence.path}: ${occurrence.kind} ${occurrence.literal} förekommer ${actualCount} gånger, `
        + `förväntat ${expectedCount ?? 0}.`,
      );
    }
  }

  for (const entry of allowlist.exceptions) {
    if (!(entry.path in sources)) {
      errors.push(`${entry.path}: allowlistad produktionsfil saknas i skanningen.`);
      continue;
    }
    for (const [kind, literals] of Object.entries(entry.allow)) {
      for (const [literal, expectedCount] of Object.entries(literals)) {
        const actualCount = counts[entry.path]?.[kind]?.[literal] ?? 0;
        if (actualCount !== expectedCount) {
          errors.push(
            `${entry.path}: baselinen för ${kind} ${literal} är ${expectedCount}, faktisk förekomst ${actualCount}.`,
          );
        }
      }
    }
  }

  return [...new Set(errors)];
}

function parseHexColor(value) {
  const hex = value.slice(1);
  const expanded = hex.length === 3 ? [...hex].map((character) => character.repeat(2)).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) throw new Error(`Kontrastkontrollen stöder inte färgen ${value}.`);
  return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16));
}

function relativeLuminance(value) {
  const channels = parseHexColor(value).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

export function contrastRatio(first, second) {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateThemeContrast(themeContract) {
  const errors = [];
  const pairs = [
    ['text', 'canvas', 4.5],
    ['text', 'surface', 4.5],
    ['text-secondary', 'canvas', 4.5],
    ['text-secondary', 'surface', 4.5],
    ['text-on-inverse', 'surface-inverse', 4.5],
    ['action-on-primary', 'action-primary', 4.5],
    ['highlight-text', 'highlight-surface', 4.5],
    ['status-success-fg', 'status-success-bg', 4.5],
    ['status-warning-fg', 'status-warning-bg', 4.5],
    ['status-danger-fg', 'status-danger-bg', 4.5],
    ['status-neutral-fg', 'status-neutral-bg', 4.5],
    ['focus', 'canvas', 3],
    ['focus', 'surface', 3],
    ['border-strong', 'canvas', 3],
    ['border-strong', 'surface', 3],
  ];
  for (const [themeName, theme] of Object.entries(themeContract.themes ?? {})) {
    for (const [foreground, background, minimum] of pairs) {
      try {
        const ratio = contrastRatio(theme.tokens[foreground], theme.tokens[background]);
        if (ratio < minimum) {
          errors.push(
            `${themeName}: ${foreground}/${background} har kontrast ${ratio.toFixed(2)}:1, kräver ${minimum}:1.`,
          );
        }
      } catch (error) {
        errors.push(`${themeName}: ${error.message}`);
      }
    }
  }
  return errors;
}

export function validateVisualAccessibilityContracts(sources) {
  const errors = [];
  const requirements = [
    ['apps/app/src/styles/global.css', /body\s*\{[^}]*min-width:\s*320px/s, 'Appen ska behålla 320 px-baslinjen.'],
    ['apps/app/src/styles/global.css', /:where\([^)]*\[role=['"]button['"]\][^)]*\):focus-visible/, 'Tabbara role=button-ytor ska ha globalt synligt fokus.'],
    ['packages/design-system/styles/base.css', /\.ds-button:focus-visible[\s\S]*\.ds-text-field:focus-visible/, 'Designsystemets knappar och fält ska ha focus-visible.'],
    ['packages/design-system/styles/base.css', /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.ds-button\s*\{\s*transition:\s*none;/, 'Designsystemets knappmotion ska kunna stängas av.'],
    ['apps/app/src/components/SavedControlView.css', /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none;/, 'Sparbekräftelsens animation ska kunna stängas av.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<LinkButton[^>]*variant="secondary"/, 'Showcase ska visa sekundär LinkButton.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<LinkButton[^>]*variant="ghost"/, 'Showcase ska visa ghost LinkButton.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<LinkButton[^>]*disabled/, 'Showcase ska visa disabled LinkButton.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<Alert[^>]*live="assertive"/, 'Showcase ska visa assertive Alert efter handling.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<TextField[^>]*invalid/, 'Showcase ska visa explicit invalid TextField.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<TextField[^>]*disabled/, 'Showcase ska visa disabled TextField.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<TextField[^>]*readOnly/, 'Showcase ska visa readonly TextField.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<AppStatusIndicator>Planerad<\/AppStatusIndicator>/, 'Showcase ska visa neutral AppStatusIndicator.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<AppIconButton[^>]*disabled/, 'Showcase ska visa disabled AppIconButton.'],
    ['apps/app/src/components/DesignSystemShowcase.tsx', /<AppNavButton[^>]*disabled/, 'Showcase ska visa disabled AppNavButton.'],
  ];
  for (const [relativePath, pattern, message] of requirements) {
    const source = sources[relativePath];
    if (typeof source !== 'string' || !pattern.test(source)) errors.push(message);
  }
  return errors;
}

export function validateRemovedLegacyCss(sources) {
  const errors = [];
  if ('apps/app/src/components/ReportTools.css' in sources) {
    errors.push('Den verifierat döda filen ReportTools.css får inte återinföras.');
  }
  const forbiddenSelectors = {
    'apps/app/src/styles/global.css': [/\.check-list\b/, /\.module-grid\b/, /\.module-card\b/],
    'apps/app/src/components/ControlRunForm.css': [/\.canvas-edit-toolbar\b/],
    'apps/app/src/components/SharingView.css': [/\.share-result\b/],
    'apps/app/src/components/OrganizationSetup.css': [/\.industry-panel\b/, /\.industry-icon\b/],
    'apps/app/src/components/ControlTypesView.css': [/\.control-type-edit-form\b/],
    'apps/app/src/components/InspectorView.css': [/\.inspector-list\b/, /\.inspector-row\b/],
    'apps/app/src/components/AdminControls.css': [
      /\.admin-row\.selected\b/,
      /\.admin-object-panel\b/,
      /\.admin-object-card\b/,
      /\.admin-object-icon\b/,
      /\.admin-section-heading\b/,
    ],
    'apps/app/src/components/PublicLandingPage.css': [
      /\.public-nav-primary\b/,
      /\.landing-phone(?:-frame)?\b/,
      /\.phone-[a-z0-9-]+\b/,
      /\.mark-[234]\b/,
      /\.(?:problem|solution|industry|knowledge-link|insight|price)-[a-z0-9-]+\b/,
      /\.insights-band\b/,
      /\.(?:how|feature)-grid\b/,
      /\.step-number\b/,
    ],
  };
  for (const [relativePath, patterns] of Object.entries(forbiddenSelectors)) {
    const source = sources[relativePath] ?? '';
    for (const pattern of patterns) {
      if (pattern.test(source)) errors.push(`${relativePath}: verifierat död legacy-CSS återinfördes (${pattern}).`);
    }
  }
  return errors;
}
