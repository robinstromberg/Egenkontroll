import { brandAssets } from '../config/assets';
import { getControlRunDetail, listHistoryRuns } from './historyService';

type ReportFilters = {
  fromDate?: string;
  toDate?: string;
};

type ReportAttachment = {
  id: string;
  reference: string;
  performedAt: string;
  controlType: string;
  fileName: string;
  createdAt: string;
  signedUrl: string | null;
};

type ReportRow = {
  id: string;
  performedAt: string;
  controlType: string;
  routine: string;
  status: string;
  values: string;
  deviation: string;
  action: string;
  attachments: ReportAttachment[];
};

function readItemLabel(item: Awaited<ReturnType<typeof getControlRunDetail>>['items'][number]): string {
  const fieldLabel = typeof item.field_snapshot.label === 'string' ? item.field_snapshot.label : 'Fält';
  const objectName = typeof item.object_snapshot.name === 'string' ? item.object_snapshot.name : 'Kontroll';
  return fieldLabel === 'Status' ? objectName : `${objectName} · ${fieldLabel}`;
}

function readItemValue(item: Awaited<ReturnType<typeof getControlRunDetail>>['items'][number]): string {
  if (item.value_text) return item.value_text;
  if (item.value_number !== null) return String(item.value_number);
  if (item.value_boolean !== null) return item.value_boolean ? 'Ja' : 'Nej';
  if (item.value_date) return item.value_date;
  return '';
}

function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function readRunValueSummary(items: Awaited<ReturnType<typeof getControlRunDetail>>['items']): string {
  const valuesByLabel = new Map<string, string[]>();

  for (const item of items) {
    const label = readItemLabel(item);
    valuesByLabel.set(label, [...(valuesByLabel.get(label) ?? []), readItemValue(item) || 'Ej angivet']);
  }

  return [...valuesByLabel.entries()]
    .map(([label, values]) => `${label}: ${uniqueNonEmpty(values).join(', ')}`)
    .join(' | ');
}

function readObjectInstructionSummary(items: Awaited<ReturnType<typeof getControlRunDetail>>['items']): string {
  return uniqueNonEmpty(items.map((item) => {
    const objectName = typeof item.object_snapshot.name === 'string' ? item.object_snapshot.name : 'Kontrollpunkt';
    const instructions = typeof item.object_snapshot.instructions === 'string' ? item.object_snapshot.instructions : '';
    return instructions ? `${objectName}: ${instructions}` : '';
  })).join(' | ');
}

function readRunDeviationSummary(
  detail: Awaited<ReturnType<typeof getControlRunDetail>>,
): string {
  return uniqueNonEmpty([
    ...detail.items.filter((item) => item.deviation_detected).map((item) => item.deviation_reason ?? 'Avvikelse'),
    ...detail.deviations.map((deviation) => deviation.description),
  ]).join('; ');
}

function readRunActionSummary(
  detail: Awaited<ReturnType<typeof getControlRunDetail>>,
): string {
  return uniqueNonEmpty([
    ...detail.items.map((item) => item.action_text),
    ...detail.deviations.map((deviation) => deviation.action_text),
  ]).join('; ');
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
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

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function collectReportRows(
  organizationId: string,
  filters: ReportFilters,
): Promise<ReportRow[]> {
  const runs = await listHistoryRuns(organizationId, filters);
  const rows: ReportRow[] = [];

  for (const run of runs) {
    const detail = await getControlRunDetail(organizationId, run.id);
    const controlType = run.control_type_name ?? 'Kontroll';
    const routine = uniqueNonEmpty([
      detail.run.control_type_instructions ?? '',
      readObjectInstructionSummary(detail.items),
    ]).join(' | ');
    rows.push({
      id: run.id,
      performedAt: run.performed_at,
      controlType,
      routine,
      status: run.status,
      values: readRunValueSummary(detail.items) || 'Inga fält registrerade',
      deviation: readRunDeviationSummary(detail),
      action: readRunActionSummary(detail),
      attachments: detail.attachments.map((attachment, index) => ({
        id: attachment.id,
        reference: `Bilaga ${rows.length + 1}.${index + 1}`,
        performedAt: run.performed_at,
        controlType,
        fileName: attachment.file_name ?? 'Bilaga',
        createdAt: attachment.created_at,
        signedUrl: attachment.signed_url ?? null,
      })),
    });
  }

  return rows;
}

export function downloadCsvReport(rows: ReportRow[]) {
  const headers = ['Tidpunkt', 'Kontrolltyp', 'Rutin/instruktion', 'Status', 'Värden', 'Avvikelse', 'Åtgärd'];
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) =>
      [
        row.performedAt,
        row.controlType,
        row.routine,
        row.status,
        row.values,
        row.deviation,
        row.action,
      ].map(escapeCsv).join(','),
    ),
  ];

  downloadTextFile('egenkontroll-historik.csv', lines.join('\n'), 'text/csv;charset=utf-8');
}

export function openPrintReport(rows: ReportRow[]) {
  const brandMarkUrl = absoluteAssetUrl(brandAssets.icon);
  const htmlRows = rows
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.performedAt)}</td>
        <td>${escapeHtml(row.controlType)}</td>
        <td>${escapeHtml(row.routine)}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.values)}</td>
        <td>${escapeHtml(row.deviation)}</td>
        <td>${escapeHtml(row.action)}</td>
      </tr>
    `)
    .join('');
  const attachments = rows.flatMap((row) => row.attachments);
  const attachmentRows = attachments.map((attachment) => `
    <tr>
      <td>${escapeHtml(attachment.reference)}</td>
      <td>${escapeHtml(attachment.controlType)}</td>
      <td>${escapeHtml(attachment.fileName)}</td>
      <td>${escapeHtml(attachment.createdAt)}</td>
    </tr>
  `).join('');
  const attachmentImageSections = attachments
    .filter((attachment) => attachment.signedUrl)
    .map((attachment) => `
      <article class="attachment-card">
        <h3>${escapeHtml(attachment.reference)}</h3>
        <p>${escapeHtml(attachment.controlType)} - ${escapeHtml(attachment.performedAt)}</p>
        <p>${escapeHtml(attachment.fileName)}</p>
        <img src="${escapeHtml(attachment.signedUrl ?? '')}" alt="${escapeHtml(attachment.fileName)}" />
      </article>
    `)
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html lang="sv">
      <head>
        <title>Egenkontroll - rapport</title>
        <style>
          body { color: #172033; font-family: Arial, sans-serif; padding: 24px; }
          h1, h2, h3, p { margin-top: 0; }
          .brand { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }
          .brand img { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; }
          .brand h1 { margin: 0; }
          .muted { color: #5f6b85; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f3f0ff; }
          .attachment-appendix { break-before: page; page-break-before: always; }
          .attachment-card { break-inside: avoid; page-break-inside: avoid; margin: 0 0 24px; border: 1px solid #e5e1ff; border-radius: 14px; padding: 14px; }
          .attachment-card h3 { margin-bottom: 8px; color: #5b46e1; }
          .attachment-card p { margin-bottom: 6px; color: #4f5b73; }
          .attachment-card img { display: block; width: 100%; max-height: 620px; margin-top: 12px; border-radius: 10px; object-fit: contain; background: #f6f7fb; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="brand">
          <img src="${escapeHtml(brandMarkUrl)}" alt="" />
          <div>
            <h1>Egenkontroll - rapport</h1>
            <p class="muted">Min Egenkontroll</p>
          </div>
        </div>
        <p class="no-print muted">Skapa PDF genom att välja "Spara som PDF" i utskriftsdialogen.</p>
        <table>
          <thead>
            <tr>
              <th>Tidpunkt</th>
              <th>Kontrolltyp</th>
              <th>Rutin/instruktion</th>
              <th>Status</th>
              <th>Värden</th>
              <th>Avvikelse</th>
              <th>Åtgärd</th>
            </tr>
          </thead>
          <tbody>${htmlRows || '<tr><td colspan="7">Inga kontroller i urvalet.</td></tr>'}</tbody>
        </table>
        <h2>Bilagor</h2>
        <table>
          <thead>
            <tr>
              <th>Referens</th>
              <th>Kontroll</th>
              <th>Filnamn</th>
              <th>Registrerad</th>
            </tr>
          </thead>
          <tbody>${attachmentRows || '<tr><td colspan="4">Inga bilagor i urvalet.</td></tr>'}</tbody>
        </table>
        ${attachmentImageSections ? `
          <section class="attachment-appendix">
            <h2>Bildbilagor</h2>
            ${attachmentImageSections}
          </section>
        ` : ''}
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
  `);
  printWindow.document.close();
}
