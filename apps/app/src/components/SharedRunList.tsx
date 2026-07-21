import { FormEvent, useEffect, useState } from 'react';
import { brandAssets } from '@min-egenkontroll/brand';
import { ActionButton } from './ui/ActionButton';
import { AssetIcon } from './ui/AssetIcon';
import { readControlTypeIcon } from '../config/assets';
import {
  createSharedAttachmentSignedUrl,
  logSharedExport,
  readSharedControlTypeOptions,
  readSharedRuns,
  sendSharedReportEmail,
} from '../services/shareRecords';
import type { SharedAttachment, SharedControlTypeOption, SharedExportType, SharedRun, SharedRunItem } from '../services/shareRecords';
import { buildInspectorReportDocument } from '../reports/inspectorReportDocument.js';
import type { AttachmentState } from '../reports/inspectorReportDocument.js';

type DeviationFilter = 'all' | 'with-open' | 'with-resolved' | 'without';
type SortKey = 'performed-desc' | 'performed-asc' | 'control-type' | 'deviation-status';
type SharedReportSummary = {
  companyName: string;
  periodStart: string;
  periodEnd: string;
  controlTypes: string;
  deviationFilter: string;
  search: string;
  sort: string;
  generatedAt: string;
  runCount: number;
  documentedDays: number;
  itemCount: number;
  openDeviations: number;
  resolvedDeviations: number;
};
type DocumentationRow = {
  id: string;
  run: SharedRun;
  item: SharedRunItem | null;
};
type SharedAttachmentPreview = {
  attachment: SharedAttachment;
  run: SharedRun;
  signedUrl: string;
};

const categoryMeta: Record<string, { icon: string; className: string; fallback: string }> = {
  temperature: { icon: readControlTypeIcon({ category: 'temperature' }), className: 'temperature', fallback: '°C' },
  checklist: { icon: readControlTypeIcon({ category: 'checklist' }), className: 'checklist', fallback: 'OK' },
  receiving: { icon: readControlTypeIcon({ category: 'receiving' }), className: 'receiving', fallback: 'IN' },
  traceability: { icon: readControlTypeIcon({ category: 'traceability' }), className: 'traceability', fallback: 'SP' },
  round: { icon: readControlTypeIcon({ category: 'round' }), className: 'round', fallback: 'R' },
  custom: { icon: readControlTypeIcon({ category: 'custom' }), className: 'custom', fallback: '+' },
};

const deviationFilterLabels: Record<DeviationFilter, string> = {
  all: 'Alla kontroller',
  'with-open': 'Med öppna avvikelser',
  'with-resolved': 'Med lösta avvikelser',
  without: 'Utan avvikelser',
};

const sortLabels: Record<SortKey, string> = {
  'performed-desc': 'Senaste först',
  'performed-asc': 'Äldsta först',
  'control-type': 'Kontrolltyp A-Ö',
  'deviation-status': 'Avvikelser först',
};

export type SharedRunListProps = {
  shareKey: string;
};

function dateDaysAgo(days: number): string {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function readSnapshotLabel(snapshot: Record<string, unknown>, fallback: string): string {
  return typeof snapshot.name === 'string' ? snapshot.name : fallback;
}

function readFieldLabel(snapshot: Record<string, unknown>): string {
  return typeof snapshot.label === 'string' ? snapshot.label : 'Fält';
}

function readItemValue(item: SharedRunItem): string {
  if (item.value_text) return item.value_text;
  if (item.value_number !== null) return String(item.value_number);
  if (item.value_boolean !== null) return item.value_boolean ? 'Ja' : 'Nej';
  if (item.value_date) return item.value_date;
  if (item.value_json && Object.keys(item.value_json).length > 0) return JSON.stringify(item.value_json);
  return 'Ej angivet';
}

function readObjectInstructions(item: SharedRunItem): string | null {
  return typeof item.object_snapshot.instructions === 'string' && item.object_snapshot.instructions.trim()
    ? item.object_snapshot.instructions
    : null;
}

function readRunRoutineSummary(run: SharedRun): string {
  return uniqueNonEmpty([
    run.control_type_instructions ?? '',
    ...run.items.map((item) => {
      const instructions = readObjectInstructions(item);
      if (!instructions) return '';
      return `${readSnapshotLabel(item.object_snapshot, 'Kontrollpunkt')}: ${instructions}`;
    }),
  ]).join('; ');
}

function isImageAttachment(attachment: SharedAttachment): boolean {
  if (attachment.content_type?.startsWith('image/')) return true;

  return /\.(avif|gif|jpe?g|png|webp)$/i.test(attachment.file_name ?? '');
}

function readCategoryMeta(category: string | null | undefined) {
  return categoryMeta[category ?? ''] ?? categoryMeta.custom;
}

function readControlTypeMeta(category: string | null | undefined, name: string | null | undefined) {
  const meta = readCategoryMeta(category);
  return {
    ...meta,
    icon: readControlTypeIcon({ category, name }),
  };
}

function countOpenDeviations(run: SharedRun): number {
  return run.deviations.filter((deviation) => deviation.status !== 'resolved').length;
}

function countResolvedDeviations(run: SharedRun): number {
  return run.deviations.filter((deviation) => deviation.status === 'resolved').length;
}

function readDeviationLabel(run: SharedRun): string {
  const openCount = countOpenDeviations(run);
  const resolvedCount = countResolvedDeviations(run);

  if (openCount > 0) return `${openCount} öppna`;
  if (resolvedCount > 0) return `${resolvedCount} lösta`;
  return 'Inga';
}

function readDeviationTone(run: SharedRun): string {
  if (countOpenDeviations(run) > 0) return 'danger';
  if (countResolvedDeviations(run) > 0) return 'success';
  return 'neutral';
}

function readItemDeviationTone(run: SharedRun, item: SharedRunItem | null): 'danger' | 'success' | 'neutral' {
  if (!item) return readDeviationTone(run) as 'danger' | 'success' | 'neutral';

  const relatedDeviations = run.deviations.filter((deviation) => deviation.control_run_item_id === item.id);
  if (relatedDeviations.some((deviation) => deviation.status !== 'resolved')) return 'danger';
  if (relatedDeviations.some((deviation) => deviation.status === 'resolved')) return 'success';
  if (item.deviation_detected) return 'danger';
  return 'neutral';
}

function readItemDeviationLabel(run: SharedRun, item: SharedRunItem | null): string {
  const tone = readItemDeviationTone(run, item);
  if (tone === 'danger') return item?.deviation_reason ?? 'Öppen avvikelse';
  if (tone === 'success') return 'Åtgärdad avvikelse';
  return 'Ingen';
}

function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function readRunPerformerName(run: SharedRun): string {
  return run.performer_name?.trim() || 'Okänd användare';
}

function matchesDeviationFilter(run: SharedRun, filter: DeviationFilter): boolean {
  const openCount = countOpenDeviations(run);
  const resolvedCount = countResolvedDeviations(run);

  if (filter === 'with-open') return openCount > 0;
  if (filter === 'with-resolved') return resolvedCount > 0 && openCount === 0;
  if (filter === 'without') return run.deviations.length === 0;
  return true;
}

function sortRuns(runs: SharedRun[], sortKey: SortKey): SharedRun[] {
  return [...runs].sort((first, second) => {
    if (sortKey === 'performed-asc') {
      return new Date(first.performed_at).getTime() - new Date(second.performed_at).getTime();
    }

    if (sortKey === 'control-type') {
      return first.control_type_name.localeCompare(second.control_type_name, 'sv-SE');
    }

    if (sortKey === 'deviation-status') {
      return countOpenDeviations(second) - countOpenDeviations(first)
        || countResolvedDeviations(second) - countResolvedDeviations(first)
        || new Date(second.performed_at).getTime() - new Date(first.performed_at).getTime();
    }

    return new Date(second.performed_at).getTime() - new Date(first.performed_at).getTime();
  });
}

function matchesSearch(run: SharedRun, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const text = [
    run.control_type_name,
    run.control_type_category,
    run.control_type_instructions,
    run.status,
    run.notes,
    readRunPerformerName(run),
    readRunRoutineSummary(run),
    ...run.items.map((item) => JSON.stringify([
      item.object_snapshot,
      item.field_snapshot,
      readItemValue(item),
      item.deviation_reason,
      item.action_text,
    ])),
    ...run.deviations.map((deviation) => JSON.stringify(deviation)),
    ...run.attachments.map((attachment) => attachment.file_name ?? ''),
  ].join(' ').toLowerCase();

  return text.includes(normalizedQuery);
}

function formatCsvCell(value: string | number): string {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function buildCsv(runs: SharedRun[]): string {
  const headers = [
    'Datum',
    'Utförd av',
    'Kontroll',
    'Kategori',
    'Rutin/instruktion',
    'Status',
    'Kontrollpunkt',
    'Värde',
    'Fältstatus',
    'Avvikelse',
    'Åtgärd',
    'Anteckning',
  ];
  const rows = runs.flatMap((run) => {
    if (run.items.length === 0) {
      return [[
        formatDateTime(run.performed_at),
        readRunPerformerName(run),
        run.control_type_name,
        run.control_type_category,
        readRunRoutineSummary(run),
        run.status,
        '',
        '',
        '',
        readDeviationLabel(run),
        '',
        run.notes ?? '',
      ]];
    }

    return run.items.map((item) => [
      formatDateTime(run.performed_at),
      readRunPerformerName(run),
      run.control_type_name,
      run.control_type_category,
      readRunRoutineSummary(run),
      run.status,
      `${readSnapshotLabel(item.object_snapshot, 'Kontrollpunkt')} · ${readFieldLabel(item.field_snapshot)}`,
      readItemValue(item),
      item.status,
      item.deviation_detected ? item.deviation_reason ?? 'Avvikelse' : '',
      item.action_text ?? '',
      run.notes ?? '',
    ]);
  });

  return [headers, ...rows]
    .map((row) => row.map(formatCsvCell).join(';'))
    .join('\n');
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function absoluteAssetUrl(path: string): string {
  return new URL(path, window.location.origin).href;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildPrintReportHtml(
  runs: SharedRun[],
  summary: SharedReportSummary,
  attachmentStates: AttachmentState[] = [],
): string {
  const brandColor = '#5b46e1';
  const brandMark = `<img class="brand-mark" src="${escapeHtml(absoluteAssetUrl(brandAssets.icon))}" alt="" />`;
  const report = buildInspectorReportDocument(runs, {
    companyName: summary.companyName,
    periodStart: summary.periodStart,
    periodEnd: summary.periodEnd,
    controlTypes: summary.controlTypes,
    deviationFilterLabel: summary.deviationFilter,
    search: summary.search,
    sortLabel: summary.sort,
    generatedAt: summary.generatedAt,
  }, attachmentStates);
  const performedControlTables = report.controlGroups.map((group) => {
    const headers = group.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
    const rows = group.rows.map((row) => `
      <tr class="report-row report-row-${escapeHtml(group.category)} report-row-${escapeHtml(row.tone)}">
        <td>${escapeHtml(row.performedAt)}</td>
        <td>${escapeHtml(row.performer)}</td>
        ${row.values.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}
        ${group.hasOverflow ? `<td>${escapeHtml(row.overflow)}</td>` : ''}
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.deviation)}</td>
        <td>${escapeHtml(row.action)}</td>
      </tr>
    `).join('');

    return `
      <h3>${escapeHtml(group.name)}</h3>
      ${group.routine ? `<p class="routine"><strong>Rutin/instruktion:</strong> ${escapeHtml(group.routine)}</p>` : ''}
      <div class="report-table-wrap">
        <table>
          <thead><tr><th>Datum</th><th>Utförd av</th>${headers}${group.hasOverflow ? '<th>Övrigt</th>' : ''}<th>Status</th><th>Avvikelse</th><th>Åtgärd</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }).join('');
  const deviationRows = report.deviations.map((deviation) => `
    <tr>
      <td>${escapeHtml(deviation.performedAt)}</td>
      <td>${escapeHtml(deviation.performer)}</td>
      <td>${escapeHtml(deviation.controlType)}</td>
      <td>${escapeHtml(deviation.status)}</td>
      <td>${escapeHtml(deviation.severity)}</td>
      <td>${escapeHtml(deviation.description)}</td>
      <td>${escapeHtml(deviation.action)}</td>
      <td>${escapeHtml(deviation.resolvedAt)}</td>
    </tr>
  `).join('');

  const attachmentRows = report.attachments.map((attachment) => `
    <tr>
      <td>${escapeHtml(attachment.performedAt)}</td>
      <td>${escapeHtml(attachment.performer)}</td>
      <td>${escapeHtml(attachment.controlType)}</td>
      <td>${escapeHtml(attachment.fileName)}</td>
      <td>${escapeHtml(attachment.reference)}</td>
      <td>${escapeHtml(attachment.createdAt)}</td>
    </tr>
  `).join('');
  const attachmentImageSections = report.attachmentImages.map((image) => `
    <section class="attachment-appendix-card">
      <h3>${escapeHtml(image.reference)}</h3>
      <p>${escapeHtml(image.controlType)} - ${escapeHtml(image.performedAt)}</p>
      <p>${escapeHtml(image.fileName)}</p>
      <img src="${escapeHtml(String(image.source))}" alt="${escapeHtml(image.fileName || image.reference)}" />
    </section>
  `).join('');
  const omittedAttachmentWarning = report.omittedAttachments.length ? `
    <section class="attachment-warning">
      <h3>Några bildbilagor kunde inte tas med</h3>
      <ul>${report.omittedAttachments.map((attachment) => `<li>${escapeHtml(attachment.reference)}: ${escapeHtml(attachment.fileName)} – ${escapeHtml(attachment.reason)}</li>`).join('')}</ul>
    </section>
  ` : '';

  return `
    <!doctype html>
    <html lang="sv">
      <head>
        <title>Egenkontroll - rapport</title>
        <style>
          body { color: #172033; font-family: Arial, sans-serif; margin: 0; padding: 28px; }
          h1, h2, p { margin-top: 0; }
          .brand { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }
          .brand-mark { display: inline-flex; width: 42px; height: 42px; border-radius: 12px; object-fit: contain; }
          .brand h1 { margin: 0; }
          .muted { color: #5f6b85; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin: 18px 0 24px; }
          .metric { border: 1px solid #ddd8ff; border-radius: 12px; padding: 12px; background: #f7f5ff; }
          .metric strong { display: block; font-size: 22px; }
          .filters { border: 1px solid #d9deea; border-radius: 12px; margin: 18px 0 24px; padding: 12px; }
          .filters p { margin: 4px 0; }
          .routine { color: #4f5b73; margin: -4px 0 10px; }
          h3 { margin: 22px 0 10px; }
          .report-table-wrap { overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
          th, td { border: 1px solid #d9deea; padding: 8px; text-align: left; vertical-align: top; word-break: break-word; }
          th { background: #f0edff; }
          .attachment-appendix { break-before: page; page-break-before: always; }
          .attachment-appendix-card { break-inside: avoid; page-break-inside: avoid; margin: 0 0 24px; border: 1px solid #e5e1ff; border-radius: 14px; padding: 14px; }
          .attachment-appendix-card h3 { margin: 0 0 8px; color: ${escapeHtml(brandColor)}; }
          .attachment-appendix-card p { margin: 0 0 6px; color: #4f5b73; }
          .attachment-appendix-card img { display: block; width: 100%; max-height: 620px; margin-top: 12px; border-radius: 10px; object-fit: contain; background: #f6f7fb; }
          .attachment-warning { border: 1px solid #d97706; border-radius: 12px; background: #fff8e8; margin: 0 0 24px; padding: 12px; }
          .attachment-warning h3 { margin: 0 0 8px; }
          .attachment-warning ul { margin: 0; padding-left: 20px; }
          .report-row-temperature td:first-child { border-left: 5px solid #059669; }
          .report-row-checklist td:first-child { border-left: 5px solid #2563eb; }
          .report-row-receiving td:first-child { border-left: 5px solid #d97706; }
          .report-row-traceability td:first-child { border-left: 5px solid #5b46e1; }
          .report-row-round td:first-child { border-left: 5px solid #0891b2; }
          .report-row-danger td { background: #fff5f6; }
          .report-row-success td { background: #f1fbf5; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="brand">
          ${brandMark}
          <div>
            <h1>Egenkontroll - rapport</h1>
            <p class="muted">${escapeHtml(summary.companyName)}</p>
          </div>
        </div>
        <p class="muted">Skapad: ${escapeHtml(summary.generatedAt)}</p>
        <section class="filters">
          <h2>Urval</h2>
          <p><strong>Period:</strong> ${escapeHtml(summary.periodStart)} - ${escapeHtml(summary.periodEnd)}</p>
          <p><strong>Kontrolltyper:</strong> ${escapeHtml(summary.controlTypes)}</p>
          <p><strong>Avvikelsefilter:</strong> ${escapeHtml(summary.deviationFilter)}</p>
          <p><strong>Sökning:</strong> ${escapeHtml(summary.search || 'Ingen')}</p>
          <p><strong>Sortering:</strong> ${escapeHtml(summary.sort)}</p>
        </section>
        <div class="summary">
          ${report.summary.metrics.map((metric) => `<div class="metric"><strong>${escapeHtml(metric.value)}</strong> ${escapeHtml(metric.label)}</div>`).join('')}
        </div>

        <h2>Utförda kontroller</h2>
        ${performedControlTables || '<p>Inga kontroller i urvalet.</p>'}

        <h2>Avvikelser</h2>
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Utförd av</th>
              <th>Kontroll</th>
              <th>Status</th>
              <th>Allvar</th>
              <th>Beskrivning</th>
              <th>Åtgärd</th>
              <th>Löst</th>
            </tr>
          </thead>
          <tbody>${deviationRows || '<tr><td colspan="8">Inga avvikelser i urvalet.</td></tr>'}</tbody>
        </table>
        <h2>Bilagor</h2>
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Utförd av</th>
              <th>Kontroll</th>
              <th>Fil</th>
              <th>Referens</th>
              <th>Registrerad</th>
            </tr>
          </thead>
          <tbody>${attachmentRows || '<tr><td colspan="6">Inga bilagor i urvalet.</td></tr>'}</tbody>
        </table>
        ${omittedAttachmentWarning}
        ${report.attachmentImages.length ? `
          <section class="attachment-appendix">
            <h2>Bildbilagor</h2>
            ${attachmentImageSections}
          </section>
        ` : ''}
        <p class="no-print muted">Välj "Spara som PDF" i utskriftsdialogen för PDF.</p>
        <script>
          Promise.all(Array.from(document.images).map((image) => {
            if (image.complete) return Promise.resolve();
            return new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
            });
          })).finally(() => {
            window.focus();
            window.print();
          });
        </script>
      </body>
    </html>
  `;
}

function writePrintReport(
  printWindow: Window,
  runs: SharedRun[],
  summary: SharedReportSummary,
  attachmentStates: AttachmentState[] = [],
): void {
  printWindow.document.open();
  printWindow.document.write(buildPrintReportHtml(runs, summary, attachmentStates));
  printWindow.document.close();
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function SharedRunList({ shareKey }: SharedRunListProps) {
  const [controlTypes, setControlTypes] = useState<SharedControlTypeOption[]>([]);
  const [selectedControlTypeIds, setSelectedControlTypeIds] = useState<string[]>([]);
  const [periodStart, setPeriodStart] = useState(dateDaysAgo(30));
  const [periodEnd, setPeriodEnd] = useState(today());
  const [deviationFilter, setDeviationFilter] = useState<DeviationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('performed-desc');
  const [runs, setRuns] = useState<SharedRun[]>([]);
  const [reportEmail, setReportEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<SharedAttachmentPreview | null>(null);
  const [loadingAttachmentId, setLoadingAttachmentId] = useState<string | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        setOptionsLoading(true);
        setMessage('');
        const nextControlTypes = await readSharedControlTypeOptions(shareKey);
        if (!active) return;
        setControlTypes(nextControlTypes);
        setSelectedControlTypeIds(nextControlTypes.map((option) => option.control_type_id));
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa delningslänken.');
      } finally {
        if (active) setOptionsLoading(false);
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, [shareKey]);

  async function loadRuns() {
    try {
      setLoading(true);
      setMessage('');
      const nextRuns = await readSharedRuns(shareKey, {
        periodStart,
        periodEnd,
        controlTypeIds: selectedControlTypeIds,
      });
      setRuns(nextRuns);
      setHasSearched(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte läsa delade kontroller.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadRuns();
  }

  function toggleControlType(controlTypeId: string) {
    setSelectedControlTypeIds((current) => (
      current.includes(controlTypeId)
        ? current.filter((item) => item !== controlTypeId)
        : [...current, controlTypeId]
    ));
  }

  async function openAttachmentPreview(run: SharedRun, attachment: SharedAttachment) {
    try {
      setMessage('');
      setLoadingAttachmentId(attachment.id);
      const signed = await createSharedAttachmentSignedUrl(shareKey, attachment.id);
      setAttachmentPreview({
        attachment,
        run,
        signedUrl: signed.signedUrl,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte öppna bilden.');
    } finally {
      setLoadingAttachmentId(null);
    }
  }

  async function createPrintableAttachmentStates(sourceRuns: SharedRun[]): Promise<AttachmentState[]> {
    const imagePairs = sourceRuns.flatMap((run) => (
      run.attachments
        .filter(isImageAttachment)
        .map((attachment) => ({ run, attachment }))
    ));

    return Promise.all(imagePairs.map(async ({ attachment }) => {
      try {
        const signed = await createSharedAttachmentSignedUrl(shareKey, attachment.id);
        return { attachmentId: attachment.id, status: 'included' as const, source: signed.signedUrl };
      } catch {
        return { attachmentId: attachment.id, status: 'omitted' as const, reason: 'Bilden kunde inte hämtas.' };
      }
    }));
  }

  const visibleRuns = sortRuns(
    runs.filter((run) => matchesDeviationFilter(run, deviationFilter) && matchesSearch(run, searchQuery)),
    sortKey,
  );
  const selectedControlTypeNames = controlTypes
    .filter((controlType) => selectedControlTypeIds.includes(controlType.control_type_id))
    .map((controlType) => controlType.control_type_name);
  const documentedDays = new Set(visibleRuns.map((run) => run.performed_at.slice(0, 10))).size;
  const totalItems = visibleRuns.reduce((sum, run) => sum + run.items.length, 0);
  const openDeviations = visibleRuns.reduce((sum, run) => sum + countOpenDeviations(run), 0);
  const resolvedDeviations = visibleRuns.reduce((sum, run) => sum + countResolvedDeviations(run), 0);
  const documentationRows = visibleRuns.flatMap<DocumentationRow>((run) => (
    run.items.length
      ? run.items.map((item) => ({ id: item.id, run, item }))
      : [{ id: run.run_id, run, item: null }]
  ));
  const companyName = visibleRuns[0]?.organization_name ?? 'Verksamhet';
  const reportSummary: SharedReportSummary = {
    companyName,
    periodStart,
    periodEnd,
    controlTypes: selectedControlTypeNames.join(', ') || 'Valda kontrolltyper',
    deviationFilter: deviationFilterLabels[deviationFilter],
    search: searchQuery.trim(),
    sort: sortLabels[sortKey],
    generatedAt: new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    runCount: visibleRuns.length,
    documentedDays,
    itemCount: totalItems,
    openDeviations,
    resolvedDeviations,
  };

  async function recordExport(exportType: SharedExportType) {
    try {
      await logSharedExport(shareKey, exportType, {
        period_start: periodStart,
        period_end: periodEnd,
        control_type_ids: selectedControlTypeIds,
        control_type_names: selectedControlTypeNames,
        deviation_filter: deviationFilter,
        search_query: searchQuery.trim(),
        sort: sortKey,
        run_count: visibleRuns.length,
        item_count: totalItems,
        open_deviations: openDeviations,
        resolved_deviations: resolvedDeviations,
      });
    } catch (error) {
      setMessage(error instanceof Error ? `Exporten skapades, men kunde inte loggas: ${error.message}` : 'Exporten skapades, men kunde inte loggas.');
    }
  }

  async function handleCsvExport() {
    await recordExport('csv');
    downloadTextFile(`egenkontroll-${periodStart}-${periodEnd}.csv`, buildCsv(visibleRuns), 'text/csv;charset=utf-8');
  }

  async function handlePrintExport() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setMessage('Kunde inte öppna PDF-vyn. Tillåt popup-fönster och försök igen.');
      return;
    }

    printWindow.document.write('<!doctype html><html lang="sv"><body><p>Förbereder bildbilagor...</p></body></html>');
    printWindow.document.close();

    try {
      setMessage('');
      const attachmentStates = await createPrintableAttachmentStates(visibleRuns);
      writePrintReport(printWindow, visibleRuns, reportSummary, attachmentStates);

      await recordExport('pdf');
      const omittedCount = attachmentStates.filter((state) => state.status === 'omitted').length;
      if (omittedCount > 0) {
        setMessage(`Rapporten skapades, men ${omittedCount} ${omittedCount === 1 ? 'bildbilaga' : 'bildbilagor'} kunde inte tas med.`);
      }
    } catch (error) {
      printWindow.close();
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa PDF-vyn.');
    }
  }

  async function handleEmailReport() {
    const email = reportEmail.trim();
    if (!isValidEmail(email)) {
      setMessage('Ange en giltig e-postadress.');
      return;
    }

    try {
      setEmailSending(true);
      setMessage('');
      await sendSharedReportEmail({
        secret: shareKey,
        email,
        companyName,
        periodStart,
        periodEnd,
        controlTypeIds: selectedControlTypeIds,
        controlTypeNames: selectedControlTypeNames,
        deviationFilter,
        deviationFilterLabel: deviationFilterLabels[deviationFilter],
        searchQuery: searchQuery.trim(),
        sort: sortKey,
        sortLabel: sortLabels[sortKey],
        visibleRunIds: visibleRuns.map((run) => run.run_id),
        summaryUrl: window.location.href,
      });
      setMessage('Rapporten skickades.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skicka rapporten.');
    } finally {
      setEmailSending(false);
    }
  }

  if (optionsLoading) return <p className="muted-copy">Laddar delning...</p>;
  if (message && !hasSearched) return <p className="form-message error-message">{message}</p>;

  return (
    <div className="inspector-content">
      <form className="inspector-filter-panel" onSubmit={handleSubmit}>
        <div className="inspector-filter-grid">
          <label>
            Från
            <input
              className="text-input"
              type="date"
              value={periodStart}
              onChange={(event) => setPeriodStart(event.target.value)}
              required
            />
          </label>
          <label>
            Till
            <input
              className="text-input"
              type="date"
              value={periodEnd}
              onChange={(event) => setPeriodEnd(event.target.value)}
              required
            />
          </label>
        </div>

        <fieldset className="inspector-control-type-filter">
          <legend>Kontrolltyper</legend>
          {controlTypes.length ? (
            controlTypes.map((controlType) => (
              <label className="inspector-check-option" key={controlType.control_type_id}>
                <input
                  checked={selectedControlTypeIds.includes(controlType.control_type_id)}
                  onChange={() => toggleControlType(controlType.control_type_id)}
                  type="checkbox"
                />
                <span
                  className={`inspector-type-mark ${readControlTypeMeta(controlType.control_type_category, controlType.control_type_name).className}`}
                  aria-hidden="true"
                >
                  <AssetIcon
                    src={readControlTypeMeta(controlType.control_type_category, controlType.control_type_name).icon}
                    fallback={readControlTypeMeta(controlType.control_type_category, controlType.control_type_name).fallback}
                  />
                </span>
                {controlType.control_type_name}
              </label>
            ))
          ) : (
            <p className="muted-copy">Inga kontrolltyper finns i delningen.</p>
          )}
        </fieldset>

        <div className="inspector-secondary-filters">
          <label>
            Sök
            <input
              className="text-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Produkt, leverantör, batch eller dokument"
            />
          </label>

          <label>
            Avvikelser
            <select
              className="text-input"
              value={deviationFilter}
              onChange={(event) => setDeviationFilter(event.target.value as DeviationFilter)}
            >
              <option value="all">Alla kontroller</option>
              <option value="with-open">Med öppna avvikelser</option>
              <option value="with-resolved">Med lösta avvikelser</option>
              <option value="without">Utan avvikelser</option>
            </select>
          </label>

          <label>
            Sortering
            <select
              className="text-input"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              <option value="performed-desc">Senaste först</option>
              <option value="performed-asc">Äldsta först</option>
              <option value="control-type">Kontrolltyp A-Ö</option>
              <option value="deviation-status">Avvikelser först</option>
            </select>
          </label>
        </div>

        <ActionButton type="submit" disabled={loading || selectedControlTypeIds.length === 0}>
          {loading ? 'Hämtar...' : 'Visa dokumentation'}
        </ActionButton>
      </form>

      {message && hasSearched ? <p className="form-message error-message">{message}</p> : null}
      {!hasSearched ? <p className="muted-copy">Välj period och kontrolltyper för att visa dokumentationen.</p> : null}
      {hasSearched && !loading && runs.length === 0 ? <p className="muted-copy">Inga kontroller hittades för urvalet.</p> : null}
      {hasSearched && !loading && runs.length > 0 && visibleRuns.length === 0 ? (
        <p className="muted-copy">Inga kontroller matchar sökningen eller avvikelsefiltret.</p>
      ) : null}

      {visibleRuns.length ? (
        <>
          <section className="inspector-report-panel">
            <div>
              <p className="inspector-report-eyebrow">Rapport</p>
              <h3>Sammanfattning för valt urval</h3>
              <p className="muted-copy">
                {periodStart} - {periodEnd} · {selectedControlTypeNames.join(', ') || 'Valda kontrolltyper'}
              </p>
            </div>

            <div className="inspector-report-metrics">
              <div>
                <strong>{visibleRuns.length}</strong>
                <span>kontroller</span>
              </div>
              <div>
                <strong>{documentedDays}</strong>
                <span>dagar</span>
              </div>
              <div>
                <strong>{openDeviations}</strong>
                <span>öppna avvikelser</span>
              </div>
              <div>
                <strong>{resolvedDeviations}</strong>
                <span>åtgärdade</span>
              </div>
            </div>

            <div className="inspector-export-actions">
              <ActionButton type="button" onClick={handlePrintExport}>Skriv ut / spara PDF</ActionButton>
              <ActionButton type="button" variant="secondary" onClick={handleCsvExport}>Exportera CSV</ActionButton>
            </div>

            <div className="inspector-email-export">
              <label>
                E-postadress
                <input
                  className="text-input"
                  type="email"
                  value={reportEmail}
                  onChange={(event) => setReportEmail(event.target.value)}
                  placeholder="namn@example.com"
                />
              </label>
              <ActionButton
                type="button"
                variant="secondary"
                onClick={handleEmailReport}
                disabled={!isValidEmail(reportEmail) || emailSending}
              >
                {emailSending ? 'Skickar...' : 'Skicka PDF'}
              </ActionButton>
            </div>
          </section>

          <div className="inspector-table-wrap">
            <table className="inspector-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Utförd av</th>
                  <th>Kontrolltyp</th>
                  <th>Kontrollpunkt</th>
                  <th>Värde/svar</th>
                  <th>Status</th>
                  <th>Avvikelse</th>
                  <th>Åtgärd</th>
                </tr>
              </thead>
              <tbody>
                {documentationRows.map(({ id, run, item }) => {
                  const categoryClass = readCategoryMeta(run.control_type_category).className;
                  const deviationTone = readItemDeviationTone(run, item);

                  return (
                  <tr className={`inspector-data-row inspector-data-row-${categoryClass} inspector-data-row-${deviationTone}`} key={id}>
                    <td data-label="Datum">{formatDateTime(run.performed_at)}</td>
                    <td data-label="Utförd av">{readRunPerformerName(run)}</td>
                    <td data-label="Kontrolltyp">
                      <span className="inspector-type-cell">
                        <span
                          className={`inspector-type-mark ${readControlTypeMeta(run.control_type_category, run.control_type_name).className}`}
                          aria-hidden="true"
                        >
                          <AssetIcon
                            src={readControlTypeMeta(run.control_type_category, run.control_type_name).icon}
                            fallback={readControlTypeMeta(run.control_type_category, run.control_type_name).fallback}
                          />
                        </span>
                        <strong>{run.control_type_name}</strong>
                      </span>
                    </td>
                    <td data-label="Kontrollpunkt">
                      {item
                        ? `${readSnapshotLabel(item.object_snapshot, 'Kontrollpunkt')} · ${readFieldLabel(item.field_snapshot)}`
                        : 'Inga fält registrerade'}
                    </td>
                    <td data-label="Värde/svar">{item ? readItemValue(item) : '-'}</td>
                    <td data-label="Status">
                      <span className="inspector-status-pill">{item?.status ?? run.status}</span>
                    </td>
                    <td data-label="Avvikelse">
                      <span className={`inspector-deviation-pill ${deviationTone}`}>
                        {readItemDeviationLabel(run, item)}
                      </span>
                    </td>
                    <td data-label="Åtgärd">{item?.action_text || '-'}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="inspector-table-wrap">
            <table className="inspector-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Utförd av</th>
                  <th>Kontroll</th>
                  <th>Status</th>
                  <th>Avvikelser</th>
                  <th>Innehåll</th>
                </tr>
              </thead>
              <tbody>
                {visibleRuns.map((run) => (
                  <tr className={`inspector-data-row inspector-data-row-${readCategoryMeta(run.control_type_category).className} inspector-data-row-${readDeviationTone(run)}`} key={run.run_id}>
                    <td data-label="Datum">{formatDateTime(run.performed_at)}</td>
                    <td data-label="Utförd av">{readRunPerformerName(run)}</td>
                  <td data-label="Kontroll">
                    <span className="inspector-type-cell">
                      <span
                        className={`inspector-type-mark ${readControlTypeMeta(run.control_type_category, run.control_type_name).className}`}
                        aria-hidden="true"
                      >
                        <AssetIcon
                          src={readControlTypeMeta(run.control_type_category, run.control_type_name).icon}
                          fallback={readControlTypeMeta(run.control_type_category, run.control_type_name).fallback}
                        />
                      </span>
                      <strong>{run.control_type_name}</strong>
                    </span>
                    {run.notes ? <span className="inspector-table-note">{run.notes}</span> : null}
                    {run.control_type_instructions ? (
                      <span className="inspector-table-note">Rutin: {run.control_type_instructions}</span>
                    ) : null}
                  </td>
                    <td data-label="Status">
                      <span className="inspector-status-pill">{run.status}</span>
                    </td>
                    <td data-label="Avvikelser">
                      <span className={`inspector-deviation-pill ${readDeviationTone(run)}`}>
                        {readDeviationLabel(run)}
                      </span>
                    </td>
                    <td data-label="Innehåll">
                      <details className="inspector-details">
                        <summary>
                          {run.items.length} fält
                          {run.attachments.length ? ` · ${run.attachments.length} bilagor` : ''}
                        </summary>

                        <div className="inspector-detail-list">
                          {run.items.map((item) => (
                            <section className="inspector-detail-card" key={item.id}>
                              <strong>
                                {readSnapshotLabel(item.object_snapshot, 'Kontrollpunkt')} · {readFieldLabel(item.field_snapshot)}
                              </strong>
                              {readObjectInstructions(item) ? (
                                <p className="muted-copy">Instruktion: {readObjectInstructions(item)}</p>
                              ) : null}
                              <p>{readItemValue(item)}</p>
                              <p className="muted-copy">Status: {item.status}</p>
                              {item.deviation_detected ? (
                                <p className="form-message error-message">Avvikelse: {item.deviation_reason ?? 'Åtgärd krävs'}</p>
                              ) : null}
                              {item.action_text ? <p className="muted-copy">Åtgärd: {item.action_text}</p> : null}
                            </section>
                          ))}
                        </div>

                        {run.deviations.length ? (
                          <div className="inspector-detail-list">
                            <h4>Avvikelser</h4>
                            {run.deviations.map((deviation) => (
                              <section className="inspector-detail-card" key={deviation.id}>
                                <strong>{deviation.status} · {deviation.severity}</strong>
                                <p>{deviation.description}</p>
                                <p className="muted-copy">Åtgärd: {deviation.action_text}</p>
                                {deviation.follow_up_comment ? <p className="muted-copy">Uppföljning: {deviation.follow_up_comment}</p> : null}
                                {deviation.resolved_at ? <p className="muted-copy">Löst: {formatDateTime(deviation.resolved_at)}</p> : null}
                              </section>
                            ))}
                          </div>
                        ) : null}

                        {run.attachments.length ? (
                          <div className="inspector-detail-list">
                            <h4>Bilagor</h4>
                            {run.attachments.map((attachment) => (
                              <section className="inspector-detail-card inspector-attachment-card" key={attachment.id}>
                                <div>
                                  <strong>{attachment.file_name ?? 'Bilaga'}</strong>
                                  <p className="muted-copy">Registrerad {formatDateTime(attachment.created_at)}</p>
                                </div>
                                {isImageAttachment(attachment) ? (
                                  <ActionButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => openAttachmentPreview(run, attachment)}
                                    disabled={loadingAttachmentId === attachment.id}
                                  >
                                    {loadingAttachmentId === attachment.id ? 'Öppnar...' : 'Visa bild'}
                                  </ActionButton>
                                ) : null}
                              </section>
                            ))}
                          </div>
                        ) : null}
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {attachmentPreview ? (
        <div
          className="inspector-image-modal"
          role="dialog"
          aria-modal="true"
          aria-label={attachmentPreview.attachment.file_name ?? 'Bilaga'}
          onClick={() => setAttachmentPreview(null)}
        >
          <div className="inspector-image-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="inspector-image-modal-header">
              <div>
                <h4>{attachmentPreview.attachment.file_name ?? 'Bilaga'}</h4>
                <p className="muted-copy">
                  {attachmentPreview.run.control_type_name} · {formatDateTime(attachmentPreview.run.performed_at)}
                </p>
              </div>
              <ActionButton type="button" variant="secondary" onClick={() => setAttachmentPreview(null)}>
                Stäng
              </ActionButton>
            </div>
            <img src={attachmentPreview.signedUrl} alt={attachmentPreview.attachment.file_name ?? 'Bilaga'} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
