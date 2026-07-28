import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const supportedExtensions = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.ts',
  '.tsx',
  '.webmanifest',
]);
const excludedDirectories = new Set(['.astro', '__fixtures__', '__tests__', 'dist', 'node_modules']);
const occurrenceKinds = new Set([
  'local-theme-media',
  'local-theme-selector',
  'local-token-definition',
  'raw-brand-path',
  'raw-color',
  'raw-radius',
  'raw-shadow',
  'raw-typography',
  'raw-ui-icon-path',
]);

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function normalizeLiteral(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function declarationValue(literal) {
  return literal.slice(literal.indexOf(':') + 1).trim();
}

function declarationProperty(literal) {
  return literal.slice(0, literal.indexOf(':')).trim();
}

function isExactSemanticToken(value, tokenPrefix, semanticTokens) {
  const match = value.match(new RegExp(`^var\\((--ds-${tokenPrefix}[a-z0-9-]*)\\)$`, 'i'));
  return Boolean(match && semanticTokens.has(match[1].toLowerCase()));
}

function isSemanticTypography(literal, semanticTokens) {
  const property = declarationProperty(literal);
  const value = declarationValue(literal);
  if (/^(?:inherit|initial|normal|unset)$/i.test(value)) return true;
  if (property === 'font-family') return isExactSemanticToken(value, 'font-', semanticTokens);
  if (property === 'font-size') return isExactSemanticToken(value, 'font-size-', semanticTokens);
  if (property === 'line-height') return isExactSemanticToken(value, 'line-height-', semanticTokens);
  return false;
}

export function isWebProductionSource(relativePath) {
  const normalized = normalizePath(relativePath);
  const segments = normalized.split('/');
  if (segments.some((segment) => excludedDirectories.has(segment))) return false;
  if (/\.(?:spec|test)\.[^.]+$/i.test(normalized)) return false;
  if (!normalized.startsWith('apps/web/public/') && !normalized.startsWith('apps/web/src/')) return false;
  return supportedExtensions.has(path.extname(normalized));
}

async function listFiles(directory, repoRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) continue;
      files.push(...await listFiles(absolutePath, repoRoot));
    } else {
      const relativePath = normalizePath(path.relative(repoRoot, absolutePath));
      if (isWebProductionSource(relativePath)) files.push(relativePath);
    }
  }
  return files;
}

export async function collectWebVisualSources(repoRoot) {
  const roots = [
    path.join(repoRoot, 'apps', 'web', 'public'),
    path.join(repoRoot, 'apps', 'web', 'src'),
  ];
  const files = [];
  for (const root of roots) files.push(...await listFiles(root, repoRoot));
  files.sort();
  return Object.fromEntries(await Promise.all(files.map(async (relativePath) => [
    relativePath,
    await readFile(path.join(repoRoot, relativePath), 'utf8'),
  ])));
}

export async function loadWebVisualAllowlist(repoRoot) {
  const [allowlistSource, themeContractSource] = await Promise.all([
    readFile(path.join(repoRoot, 'scripts', 'contracts', 'web-visual-allowlist.json'), 'utf8'),
    readFile(path.join(repoRoot, 'packages', 'design-system', 'theme-contract.json'), 'utf8'),
  ]);
  const allowlist = JSON.parse(allowlistSource);
  const themeContract = JSON.parse(themeContractSource);
  const tokenNames = new Set([
    ...Object.keys(themeContract.sharedTokens ?? {}),
    ...Object.keys(themeContract.themes?.light?.tokens ?? {}),
    ...Object.keys(themeContract.themes?.dark?.tokens ?? {}),
  ]);
  return {
    ...allowlist,
    semanticTokens: [...tokenNames].sort().map((tokenName) => `--ds-${tokenName}`),
  };
}

function addMatches(occurrences, relativePath, source, kind, pattern, include = () => true) {
  for (const match of source.matchAll(pattern)) {
    const literal = normalizeLiteral(match[0]);
    if (include(literal)) occurrences.push({ kind, literal, path: normalizePath(relativePath) });
  }
}

function addColorMatches(occurrences, relativePath, source) {
  addMatches(occurrences, relativePath, source, 'raw-color', /(?<!&)#[0-9a-f]{3,8}\b/gi);
  const colorFunction = /\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color-mix|color)\(/gi;
  for (const match of source.matchAll(colorFunction)) {
    let depth = 1;
    let index = match.index + match[0].length;
    while (index < source.length && depth > 0) {
      if (source[index] === '(') depth += 1;
      if (source[index] === ')') depth -= 1;
      index += 1;
    }
    const literal = normalizeLiteral(source.slice(match.index, index));
    occurrences.push({ kind: 'raw-color', literal, path: normalizePath(relativePath) });
  }
}

export function findWebVisualOccurrences(relativePath, source, semanticTokenNames = []) {
  const occurrences = [];
  const semanticTokens = new Set(semanticTokenNames.map((tokenName) => tokenName.toLowerCase()));
  addColorMatches(occurrences, relativePath, source);
  addMatches(occurrences, relativePath, source, 'raw-brand-path', /\/brand\/[a-z0-9_./-]+/gi);
  addMatches(occurrences, relativePath, source, 'raw-ui-icon-path', /\/ui-icons\/[a-z0-9_./-]+/gi);
  addMatches(occurrences, relativePath, source, 'local-theme-media', /@media\s*\([^)]*prefers-color-scheme\s*:\s*(?:dark|light)[^)]*\)/gi);
  addMatches(occurrences, relativePath, source, 'local-theme-selector', /\[data-theme\s*=\s*['"]?(?:dark|light)['"]?\]/gi);
  addMatches(occurrences, relativePath, source, 'local-token-definition', /--ds-[a-z0-9-]+\s*:/gi);
  addMatches(
    occurrences,
    relativePath,
    source,
    'raw-typography',
    /(?:font(?:-family|-size)?|line-height)\s*:\s*[^;{}]+/gi,
    (literal) => !isSemanticTypography(literal, semanticTokens),
  );
  addMatches(
    occurrences,
    relativePath,
    source,
    'raw-radius',
    /border-radius\s*:\s*[^;{}]+/gi,
    (literal) => !isExactSemanticToken(declarationValue(literal), 'radius-', semanticTokens),
  );
  addMatches(
    occurrences,
    relativePath,
    source,
    'raw-shadow',
    /(?:box-shadow|text-shadow)\s*:\s*[^;{}]+|filter\s*:\s*drop-shadow\([^;{}]+\)/gi,
    (literal) => {
      const value = declarationValue(literal);
      return !isExactSemanticToken(value, 'shadow-', semanticTokens) && !/^(?:inherit|initial|none|unset)$/i.test(value);
    },
  );
  return occurrences;
}

export function summarizeWebVisualOccurrences(sources, semanticTokenNames = []) {
  const summary = {};
  for (const [relativePath, source] of Object.entries(sources)) {
    for (const occurrence of findWebVisualOccurrences(relativePath, source, semanticTokenNames)) {
      summary[relativePath] ??= {};
      summary[relativePath][occurrence.kind] ??= {};
      summary[relativePath][occurrence.kind][occurrence.literal] =
        (summary[relativePath][occurrence.kind][occurrence.literal] ?? 0) + 1;
    }
  }
  return summary;
}

function validateCanonicalBaseline(entry, key, errors) {
  if (entry.pathPrefix && !entry.baseline) {
    errors.push(`${key}: canonical pathPrefix kräver en exakt baseline.`);
    return;
  }
  if (!entry.baseline) return;
  if (!entry.pathPrefix) errors.push(`${key}: canonical baseline kräver pathPrefix.`);
  const { countPerFile, fileCount, literal } = entry.baseline;
  if (!Number.isInteger(fileCount) || fileCount < 1) errors.push(`${key}: baseline.fileCount ska vara ett positivt heltal.`);
  if (!Number.isInteger(countPerFile) || countPerFile < 1) errors.push(`${key}: baseline.countPerFile ska vara ett positivt heltal.`);
  if (typeof literal !== 'string' || literal !== normalizeLiteral(literal)) {
    errors.push(`${key}: baseline.literal ska vara en normaliserad sträng.`);
  }
  if (entry.kinds?.length !== 1) errors.push(`${key}: canonical baseline ska skydda exakt en occurrence-typ.`);
}

function validateAllowlist(allowlist) {
  const errors = [];
  if (allowlist?.version !== 1) errors.push('Webbens visuella allowlist ska ha version 1.');
  if (!Array.isArray(allowlist?.semanticTokens) || allowlist.semanticTokens.length === 0) {
    errors.push('Webbguardrailen ska läsa semantiska tokennamn från theme-contract.json.');
  }
  const canonical = Array.isArray(allowlist?.canonical) ? allowlist.canonical : [];
  const exceptions = Array.isArray(allowlist?.exceptions) ? allowlist.exceptions : [];
  const keys = new Set();
  for (const [group, entries] of [['canonical', canonical], ['exceptions', exceptions]]) {
    for (const entry of entries) {
      const targetCount = Number(Boolean(entry.path)) + Number(Boolean(entry.pathPrefix));
      if (targetCount !== 1) errors.push(`${group}: varje post ska ha exakt path eller pathPrefix.`);
      const key = entry.path ?? `${entry.pathPrefix}*`;
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
        validateCanonicalBaseline(entry, key, errors);
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

function validateCanonicalBaselines(sources, allowlist, counts) {
  const errors = [];
  for (const entry of allowlist.canonical.filter((candidate) => candidate.baseline)) {
    const matchingFiles = Object.keys(sources).filter((relativePath) => relativePath.startsWith(entry.pathPrefix));
    if (matchingFiles.length !== entry.baseline.fileCount) {
      errors.push(
        `${entry.pathPrefix}*: canonical baseline innehåller ${matchingFiles.length} filer, `
        + `förväntat ${entry.baseline.fileCount}.`,
      );
    }
    const kind = entry.kinds[0];
    for (const relativePath of matchingFiles) {
      const kindCounts = counts[relativePath]?.[kind] ?? {};
      const actualCount = kindCounts[entry.baseline.literal] ?? 0;
      const totalCount = Object.values(kindCounts).reduce((sum, count) => sum + count, 0);
      if (actualCount !== entry.baseline.countPerFile || totalCount !== entry.baseline.countPerFile) {
        errors.push(
          `${relativePath}: canonical ${kind}-baseline kräver exakt `
          + `${entry.baseline.countPerFile} × ${entry.baseline.literal}.`,
        );
      }
    }
  }
  return errors;
}

export function validateWebVisualGuardrails(sources, allowlist) {
  const errors = validateAllowlist(allowlist);
  if (errors.length > 0) return errors;
  const occurrences = Object.entries(sources).flatMap(([relativePath, source]) => (
    findWebVisualOccurrences(relativePath, source, allowlist.semanticTokens)
  ));
  const counts = countOccurrences(occurrences);
  const exceptionByPath = new Map(allowlist.exceptions.map((entry) => [entry.path, entry]));

  errors.push(...validateCanonicalBaselines(sources, allowlist, counts));

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

export function validateWebVisualAccessibilityContracts(sources) {
  const errors = [];
  const requirements = [
    ['apps/web/src/styles/global.css', /body\s*\{[^}]*min-width:\s*320px/s, 'Webben ska behålla 320 px-baslinjen.'],
    ['apps/web/src/layouts/PublicLayout.astro', /@min-egenkontroll\/design-system\/tokens\.css/, 'Webbens layout ska importera centrala designtokens.'],
    ['apps/web/src/layouts/PublicLayout.astro', /@min-egenkontroll\/brand/, 'Webbens layout ska använda det centrala brandpaketet.'],
    ['apps/web/src/layouts/PublicLayout.astro', /matchMedia\(['"]\(prefers-color-scheme: dark\)['"]\)/, 'Webbens systemtema ska tillämpas före sidans interaktion.'],
    ['apps/web/src/layouts/PublicLayout.astro', /document\.documentElement\.setAttribute\(['"]data-theme['"], theme\)/, 'Webbens bootstrap ska tillämpa explicit tema på dokumentroten.'],
    ['apps/web/src/components/PublicHeader.tsx', /document\.documentElement\.setAttribute\(['"]data-theme['"], theme\)/, 'Webbens temaväxlare ska tillämpa explicit tema på dokumentroten.'],
    ['apps/web/src/components/PublicSiteShell.css', /\.home-page a:focus-visible[^{]*\{[^}]*var\(--ds-focus\)/s, 'Webbskalet ska behålla synligt tokenbaserat fokus.'],
    ['apps/web/src/components/PublicSiteShell.css', /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*transition:\s*none/, 'Webbskalet ska respektera reduced motion.'],
    ['apps/web/src/components/FactPage.css', /\.fact-page a:focus-visible[^}]*var\(--ds-focus\)/s, 'Den migrerade faktasidan ska behålla synligt fokus.'],
    ['apps/web/src/components/HazardAnalysisToolPage.css', /\.hazard-tool[^{}]*:focus-visible[^{]*\{[^}]*var\(--ds-focus\)/s, 'Det interaktiva verktyget ska behålla synligt fokus.'],
  ];
  for (const [relativePath, pattern, message] of requirements) {
    const source = sources[relativePath];
    if (typeof source !== 'string' || !pattern.test(source)) errors.push(message);
  }
  return errors;
}
