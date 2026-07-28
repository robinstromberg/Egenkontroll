import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { reportPalette } from '../reports/reportPalette.js';

const componentUrl = new URL('./', import.meta.url);
const rawColorPattern = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i;

async function readComponentFile(name: string) {
  return readFile(new URL(name, componentUrl), 'utf8');
}

async function readSourceFile(path: string) {
  return readFile(new URL(path, componentUrl), 'utf8');
}

function count(source: string, value: string) {
  return source.split(value).length - 1;
}

function assertOrdered(source: string, values: string[]) {
  let cursor = -1;
  for (const value of values) {
    const next = source.indexOf(value, cursor + 1);
    assert.notEqual(next, -1, `Saknar kontraktsdelen: ${value}`);
    assert.ok(next > cursor, `Fel ordning för kontraktsdelen: ${value}`);
    cursor = next;
  }
}

function stripHtmlEntities(source: string) {
  return source.replace(/&#\d+;/g, '');
}

test('review and sharing product CSS uses semantic tokens with narrow static exceptions', async () => {
  for (const cssFile of ['HistoryView.css', 'KpiView.css']) {
    const source = await readComponentFile(cssFile);
    assert.match(source, /var\(--ds-/);
    assert.doesNotMatch(source, rawColorPattern, `${cssFile} innehåller en rå färg`);
    assert.doesNotMatch(source, /@media\s*\(prefers-color-scheme:/, `${cssFile} innehåller en lokal temapalett`);
  }

  const sharingCss = await readComponentFile('SharingView.css');
  const qrBlock = sharingCss.match(/\.qr-image\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(qrBlock, /color:\s*#111827/);
  assert.match(qrBlock, /background:\s*#ffffff/);
  assert.doesNotMatch(sharingCss.replace(qrBlock, ''), rawColorPattern);
  assert.doesNotMatch(sharingCss, /@media\s*\(prefers-color-scheme:/);

  const historyCss = await readComponentFile('HistoryView.css');
  const inspectorCss = await readComponentFile('InspectorView.css');
  const modalBackdrops = [
    ['HistoryView.css', historyCss, /\.history-image-modal\s*\{[\s\S]*?\n\}/],
    ['SharingView.css', sharingCss, /\.share-modal-backdrop\s*\{[\s\S]*?\n\}/],
    ['InspectorView.css', inspectorCss, /\.inspector-image-modal\s*\{[\s\S]*?\n\}/],
  ] as const;
  for (const [fileName, source, blockPattern] of modalBackdrops) {
    const backdropBlock = source.match(blockPattern)?.[0] ?? '';
    assert.match(backdropBlock, /background:\s*var\(--ds-overlay-scrim\)/, `${fileName} saknar central scrim`);
    assert.doesNotMatch(backdropBlock, /--ds-canvas|color-mix\(/, `${fileName} får inte bygga scrim från canvas`);
  }

  const printIndex = inspectorCss.indexOf('@media print');
  assert.notEqual(printIndex, -1);
  assert.doesNotMatch(inspectorCss.slice(0, printIndex), rawColorPattern);
  assert.doesNotMatch(inspectorCss, /@media\s*\(prefers-color-scheme:/);

  const themeContract = JSON.parse(await readSourceFile('../../../../packages/design-system/theme-contract.json')) as {
    themes: {
      light: { tokens: Record<string, string> };
      dark: { tokens: Record<string, string> };
    };
  };
  const light = themeContract.themes.light.tokens;
  const dark = themeContract.themes.dark.tokens;
  assert.equal(light['overlay-scrim'], 'rgb(24 34 31 / 72%)');
  assert.equal(dark['overlay-scrim'], 'rgb(0 0 0 / 72%)');
  const printAssignments = Object.fromEntries(
    [...inspectorCss.slice(printIndex).matchAll(/(--ds-[\w-]+):\s*(#[0-9a-f]{6});/gi)]
      .map((match) => [match[1], match[2].toLowerCase()]),
  );
  assert.deepEqual(printAssignments, {
    '--ds-canvas': light.canvas,
    '--ds-surface': light.surface,
    '--ds-surface-subtle': light['surface-subtle'],
    '--ds-text': light.text,
    '--ds-text-secondary': light['text-secondary'],
    '--ds-border': light.border,
    '--ds-action-primary': light['action-primary'],
    '--ds-action-secondary': light['action-secondary'],
    '--ds-status-success-fg': light['status-success-fg'],
    '--ds-status-success-bg': light['status-success-bg'],
    '--ds-status-danger-fg': light['status-danger-fg'],
    '--ds-status-danger-bg': light['status-danger-bg'],
    '--ds-status-neutral-fg': light['status-neutral-fg'],
    '--ds-status-neutral-bg': light['status-neutral-bg'],
  });

  assert.match(inspectorCss, /@media \(max-width: 520px\)[\s\S]*\.inspector-table thead\s*\{\s*display:\s*none/);
  assert.match(inspectorCss, /grid-template-columns:\s*92px minmax\(0, 1fr\)/);
  assert.match(inspectorCss, /content:\s*attr\(data-label\)/);
  assert.match(await readComponentFile('HistoryView.css'), /@media \(max-width: 420px\)/);
  assert.match(await readComponentFile('KpiView.css'), /@media \(max-width: 370px\)/);
});

test('History and KPI keep filters, data boundaries, states and chart contracts', async () => {
  const [history, historyService, kpi, kpiService] = await Promise.all([
    readComponentFile('HistoryView.tsx'),
    readSourceFile('../services/historyService.ts'),
    readComponentFile('KpiView.tsx'),
    readSourceFile('../services/kpiService.ts'),
  ]);

  assertOrdered(history, [
    'value={filters.fromDate',
    'value={filters.toDate',
    'value={filters.status',
    'value={filters.query',
  ]);
  assert.match(history, /onChange=\{\(event\) => updateFilters/);
  assert.match(history, /run\.status === 'completed_with_deviation' \? 'status-pill warning' : 'status-pill done'/);
  assert.match(history, /attachment\.signed_url \? \(/);
  assert.match(history, /onClick=\{\(event\) => event\.stopPropagation\(\)\}/);
  const historyPrint = history.slice(history.indexOf('async function handlePrint'), history.indexOf('function closeDetail'));
  assertOrdered(historyPrint, [
    'createPrintReportWindow()',
    'collectReportRows(organizationId, filters)',
    'openPrintReport(rows, printWindow)',
    'printWindow.close()',
  ]);

  for (const contract of [
    ".eq('organization_id', organizationId)",
    ".order('performed_at', { ascending: false })",
    '.limit(50)',
    '`${filters.fromDate}T00:00:00`',
    '`${filters.toDate}T23:59:59`',
    ".eq('status', filters.status)",
    '.filter(isImageAttachment)',
    'createSignedAttachmentUrls(imageAttachments)',
  ]) {
    assert.match(historyService, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assertOrdered(kpi, [
    'summary.currentDocumentationStreak',
    'summary.compliancePercent',
    'summary.completedControls',
    'summary.openDeviations',
    'formatResolved(summary)',
    'summary.documentationDays',
  ]);
  assertOrdered(kpi, [
    "setActiveTab('temperature')",
    "setActiveTab('deliveries')",
    "setActiveTab('deviations')",
  ]);
  assert.match(kpi, /summary\.openDeviations > 0 \? 'kpi-card warning' : 'kpi-card'/);
  assert.match(kpi, /const width = 300/);
  assert.match(kpi, /const height = 96/);
  assert.equal(count(kpi, 'Math.max(8,'), 2);
  assertOrdered(kpi, ['await Promise.all([', 'getKpiSummary(organizationId)', 'getKpiAnalysis(organizationId)']);
  assert.match(await readComponentFile('KpiView.css'), /\.kpi-bars span \+ span\s*\{[\s\S]*repeating-linear-gradient/);

  for (const contract of [
    'const defaultPeriodDays = 30',
    'const streakLookbackDays = 120',
    'const analysisPeriodDays = 180',
    '.limit(600)',
    '.limit(1200)',
    "fieldKey === 'supplier' || fieldLabel === 'leverantör'",
    '.slice(-40)',
    '.slice(0, 8)',
    'Math.max(1, getDateKeys(countedPeriodStart, periodEnd).length)',
  ]) {
    assert.match(kpiService, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('sharing permissions, hashes, QR and token contracts stay intact', async () => {
  const [sharing, sharingContract, shareRecords, shareToken, qr, accessList, app] = await Promise.all([
    readComponentFile('SharingView.tsx'),
    readSourceFile('../sharing/inspectorSharing.ts'),
    readSourceFile('../services/shareRecords.ts'),
    readSourceFile('../services/shareToken.ts'),
    readComponentFile('LocalQrCode.tsx'),
    readComponentFile('AccessRunList.tsx'),
    readSourceFile('../App.tsx'),
  ]);

  assert.equal(accessList.trim(), "export { SharedRunList as AccessRunList } from './SharedRunList';");
  assert.match(app, /params\.get\('inspector'\)/);
  assertOrdered(app, ['if (inspectorKey) {', 'return <InspectorView shareKey={inspectorKey} />;']);
  assert.match(sharingContract, /canCreateTemporaryLink:\s*true/);
  assert.match(sharingContract, /canManageLinks:\s*canManageOrganization/);
  assert.equal(count(sharing, 'capabilities.canManageLinks ?'), 3);
  assertOrdered(sharing, ["value: '1'", "value: '7'", "value: '30'", "value: 'custom'"]);
  assert.match(sharing, /const marker = \['s', 'hare', ''\]\.join\('\/'\)/);
  assert.match(sharing, /String\.fromCharCode\(35\) \+ 'inspector='/);

  const customShare = sharing.slice(sharing.indexOf('async function handleSubmit'), sharing.indexOf('async function handleQuickShare'));
  assertOrdered(customShare, [
    'createAccessLink({',
    'setLatestUrl(formatAccessUrl(url))',
    'setLatestValidUntil(selectedValidUntil)',
    'setCopied(false)',
    'await refresh()',
    "eventName: 'share_link_created'",
    "share_mode: 'custom'",
  ]);
  const quickShare = sharing.slice(sharing.indexOf('async function handleQuickShare'), sharing.indexOf('async function handleCopy'));
  assertOrdered(quickShare, [
    'createTemporaryInspectorAccessLink(organizationId)',
    'setLatestUrl(formatAccessUrl(access.url))',
    'setLatestValidUntil(access.validUntil)',
    'setCopied(false)',
    'await refresh()',
    "eventName: 'share_link_created'",
    "share_mode: 'quick'",
  ]);
  assert.match(sharing, /navigator\.clipboard\.writeText\(latestUrl\)/);
  assert.match(sharing, /navigator\.share\(\{/);
  assert.match(sharing, /error\.name === 'AbortError'/);
  assert.match(sharing, /window\.open\(latestUrl, '_blank', 'noopener,noreferrer'\)/);
  assert.match(sharing, /<LocalQrCode className="qr-image large" value=\{latestUrl\}/);

  for (const value of [
    'bgColor="#ffffff"',
    'fgColor="#111827"',
    'level="M"',
    'marginSize={4}',
    'size={260}',
    'value={value}',
  ]) {
    assert.match(qr, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(shareToken, /new Uint8Array\(24\)/);
  assert.match(shareToken, /window\.crypto\.getRandomValues\(bytes\)/);
  assert.match(shareToken, /window\.crypto\.subtle\.digest\('SHA-256', encoded\)/);
  assertOrdered(shareRecords, ['const secret = createShareToken()', 'const secretHash = await hashShareToken(secret)', 'token_hash: secretHash']);
  assert.match(shareRecords, /valid_until: new Date\(`\$\{input\.validUntil\}T23:59:59`\)\.toISOString\(\)/);
  assert.match(shareRecords, /period_start: input\.periodStart \?\? '1900-01-01'/);
  assert.match(shareRecords, /period_end: input\.periodEnd \?\? '9999-12-31'/);
  assert.match(shareRecords, /included_control_type_ids: input\.includedControlTypeIds \?\? \[\]/);
});

test('inspector filters, attachments and mobile table columns stay intact', async () => {
  const shared = await readComponentFile('SharedRunList.tsx');

  for (const contract of [
    "if (filter === 'with-open') return openCount > 0",
    "if (filter === 'with-resolved') return resolvedCount > 0 && openCount === 0",
    "if (filter === 'without') return run.deviations.length === 0",
    "if (sortKey === 'performed-asc')",
    "if (sortKey === 'control-type')",
    "if (sortKey === 'deviation-status')",
    "return /\\.(avif|gif|jpe?g|png|webp)$/i.test(attachment.file_name ?? '')",
    'createSharedAttachmentSignedUrl(shareKey, attachment.id)',
    "status: 'omitted' as const",
    'disabled={loading || selectedControlTypeIds.length === 0}',
  ]) {
    assert.match(shared, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assertOrdered(shared, [
    'readSharedInspectorContext(shareKey)',
    'readSharedControlTypeOptions(shareKey)',
    'setSelectedControlTypeIds(nextControlTypes.map((option) => option.control_type_id))',
  ]);
  const loadRuns = shared.slice(shared.indexOf('async function loadRuns'), shared.indexOf('async function handleSubmit'));
  assert.match(loadRuns, /readSharedRuns\(shareKey, \{[\s\S]*periodStart,[\s\S]*periodEnd,[\s\S]*controlTypeIds: selectedControlTypeIds/);
  assert.match(shared, /sortRuns\(\s*runs\.filter\(\(run\) => matchesDeviationFilter\(run, deviationFilter\) && matchesSearch\(run, searchQuery\)\),\s*sortKey/);

  const tableSections = [...shared.matchAll(/<table className="inspector-table">([\s\S]*?)<\/table>/g)].map((match) => match[1]);
  assert.equal(tableSections.length, 2);
  const headers = tableSections.map((section) => [...section.matchAll(/<th>([^<]+)<\/th>/g)].map((match) => match[1]));
  const dataLabels = tableSections.map((section) => [...section.matchAll(/<td data-label="([^"]+)"/g)].map((match) => match[1]));
  assert.deepEqual(headers[0], ['Datum', 'Utförd av', 'Kontrolltyp', 'Kontrollpunkt', 'Värde/svar', 'Status', 'Avvikelse', 'Åtgärd']);
  assert.deepEqual(dataLabels[0], headers[0]);
  assert.deepEqual(headers[1], ['Datum', 'Utförd av', 'Kontroll', 'Status', 'Avvikelser', 'Innehåll']);
  assert.deepEqual(dataLabels[1], headers[1]);
});

test('static reports share the light design-system palette and keep document structure', async () => {
  const themeContract = JSON.parse(await readSourceFile('../../../../packages/design-system/theme-contract.json')) as {
    themes: { light: { tokens: Record<string, string> } };
  };
  const light = themeContract.themes.light.tokens;
  assert.deepEqual(reportPalette, {
    canvas: light.canvas,
    paper: light.surface,
    surfaceSubtle: light['surface-subtle'],
    text: light.text,
    muted: light['text-secondary'],
    border: light.border,
    borderStrong: light['border-strong'],
    brand: light['action-primary'],
    brandOn: light['action-on-primary'],
    brandPale: light['action-secondary'],
    highlight: light['highlight-surface'],
    warning: light['status-warning-bg'],
    warningText: light['status-warning-fg'],
    warningBorder: light['status-warning-border'],
    danger: light['status-danger-bg'],
    dangerText: light['status-danger-fg'],
    success: light['status-success-bg'],
    successText: light['status-success-fg'],
    neutral: light['status-neutral-bg'],
    neutralText: light['status-neutral-fg'],
    shadow: light['shadow-md'],
    category: {
      temperature: light['status-success-border'],
      checklist: light.focus,
      receiving: light['status-warning-border'],
      traceability: light['action-primary'],
      round: light['highlight-border'],
      custom: light['status-neutral-border'],
    },
  });

  const [historyReport, shared, pdf, documentModel] = await Promise.all([
    readSourceFile('../services/reportService.ts'),
    readComponentFile('SharedRunList.tsx'),
    readSourceFile('../reports/inspectorReportPdf.js'),
    readSourceFile('../reports/inspectorReportDocument.js'),
  ]);
  for (const source of [historyReport, shared, pdf]) {
    assert.match(source, /reportPalette/);
    assert.match(source, /brandAssets\.reportIcon/);
    assert.doesNotMatch(stripHtmlEntities(source), rawColorPattern);
  }

  const historyCsv = historyReport.slice(historyReport.indexOf('export function downloadCsvReport'), historyReport.indexOf('export function openPrintReport'));
  assertOrdered(historyCsv, ['Tidpunkt', 'Utförd av', 'Kontrolltyp', 'Rutin/instruktion', 'Status', 'Värden', 'Avvikelse', 'Åtgärd']);
  assert.match(historyCsv, /headers\.map\(escapeCsv\)\.join\(','\)/);
  assert.match(historyCsv, /egenkontroll-historik\.csv/);

  const sharedCsv = shared.slice(shared.indexOf('function buildCsv'), shared.indexOf('function escapeHtml'));
  assertOrdered(sharedCsv, ['Datum', 'Utförd av', 'Kontroll', 'Kategori', 'Rutin/instruktion', 'Status', 'Kontrollpunkt', 'Värde', 'Fältstatus', 'Avvikelse', 'Åtgärd', 'Anteckning']);
  assert.match(sharedCsv, /join\(';'\)/);
  assert.match(shared, /`egenkontroll-\$\{periodStart\}-\$\{periodEnd\}\.csv`/);

  for (const source of [historyReport, shared]) {
    assert.match(source, /break-before:\s*page; page-break-before:\s*always/);
    assert.match(source, /break-inside:\s*avoid; page-break-inside:\s*avoid/);
    assert.match(source, /max-height:\s*620px/);
    assert.match(source, /Promise\.all\(Array\.from\(document\.images\)/);
  }
  assert.match(documentModel, /const MAX_REPORT_VALUE_COLUMNS = 10/);
  assert.match(pdf, /const PAGE = \{ size: 'A4', layout: 'landscape', margin: 34 \}/);
  assert.match(pdf, /addReportPage\(doc, \{ size: 'A4', layout: 'portrait', margin: 36 \}\)/);
  assert.match(pdf, /autoFirstPage:\s*false/);
  assert.match(pdf, /bufferPages:\s*true/);
  assert.match(pdf, /compress:\s*true/);
  assert.match(pdf, /Sida \$\{index \+ 1\} av \$\{range\.count\}/);
});

test('export, attachment and email side effects retain their ordering and payloads', async () => {
  const [shared, emailApi] = await Promise.all([
    readComponentFile('SharedRunList.tsx'),
    readSourceFile('../../api/send-inspector-report.js'),
  ]);
  const csvExport = shared.slice(shared.indexOf('async function handleCsvExport'), shared.indexOf('async function handlePrintExport'));
  assertOrdered(csvExport, ["await recordExport('csv')", 'downloadTextFile(']);

  const printExport = shared.slice(shared.indexOf('async function handlePrintExport'), shared.indexOf('async function handleEmailReport'));
  assertOrdered(printExport, [
    "window.open('', '_blank')",
    'createPrintableAttachmentStates(visibleRuns)',
    'writePrintReport(printWindow, visibleRuns, reportSummary, attachmentStates)',
    "await recordExport('pdf')",
  ]);

  const emailExport = shared.slice(shared.indexOf('async function handleEmailReport'), shared.indexOf('if (optionsLoading)'));
  assertOrdered(emailExport, [
    'secret: shareKey',
    'email,',
    'companyName,',
    'periodStart,',
    'periodEnd,',
    'controlTypeIds: selectedControlTypeIds',
    'controlTypeNames: selectedControlTypeNames',
    'deviationFilter,',
    'searchQuery: searchQuery.trim()',
    'sort: sortKey',
    'visibleRunIds: visibleRuns.map((run) => run.run_id)',
    'summaryUrl: window.location.href',
  ]);

  assertOrdered(emailApi, [
    'selectInspectorReportRuns(runs, {',
    'visibleRunIds: input.visibleRunIds',
    'addSignedAttachmentLinks(visibleRuns)',
    'resolveEmailAttachmentStates(runsWithAttachmentLinks)',
    'buildInspectorReportDocument(runsWithAttachmentLinks',
    'buildInspectorReportPdf(report)',
    'sendWithResend({',
    "callSupabaseRpc('log_shared_export'",
  ]);
  for (const contract of [
    "p_export_type: 'pdf'",
    "delivery: 'email'",
    'recipient: email',
    'run_count: visibleRuns.length',
    'item_count: report.summary.metrics[2].value',
    'open_deviations: report.summary.metrics[3].value',
    'resolved_deviations: report.summary.metrics[4].value',
    'omitted_attachment_count: report.omittedAttachments.length',
  ]) {
    assert.match(emailApi, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
