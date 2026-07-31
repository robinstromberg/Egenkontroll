import { brandAssets } from '@min-egenkontroll/brand';
import { reportPalette } from '../reports/reportPalette.js';
import { getControlRunDetail, listHistoryRunsPage } from './historyService';
import type { HistoryFilters } from './historyService';
import {
  collectHistoryPagesSequentially,
  HISTORY_PAGE_SIZE,
} from './historyPagination';
import {
  buildCsvReportContent,
  buildPrintReportHtml,
} from './historyReportContent';
import type { ReportRow } from './historyReportContent';

export type { ReportRow } from './historyReportContent';

type ReportFilters = HistoryFilters;

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

export function createPrintReportWindow(): Window | null {
  const printWindow = window.open('', '_blank');

  if (!printWindow) return null;

  printWindow.document.write(`
    <!doctype html>
    <html lang="sv">
      <head>
        <title>Förbereder utskriftsvy</title>
        <style>
          body {
            display: grid;
            min-height: 100vh;
            place-items: center;
            margin: 0;
            color: ${reportPalette.text};
            font-family: Arial, sans-serif;
            background: ${reportPalette.canvas};
          }
          p {
            border: 1px solid ${reportPalette.border};
            border-radius: 16px;
            padding: 18px 20px;
            background: ${reportPalette.paper};
            box-shadow: ${reportPalette.shadow};
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <p>Förbereder utskriftsvy...</p>
      </body>
    </html>
  `);
  printWindow.document.close();

  return printWindow;
}

export async function collectReportRows(
  organizationId: string,
  filters: ReportFilters,
): Promise<ReportRow[]> {
  return collectHistoryPagesSequentially({
    fetchPage: (cursor) => listHistoryRunsPage(organizationId, filters, {
      cursor,
      pageSize: HISTORY_PAGE_SIZE,
    }),
    transformRow: async (run, resultIndex) => {
      const detail = await getControlRunDetail(organizationId, run.id);
      const controlType = run.control_type_name ?? 'Kontroll';
      const routine = uniqueNonEmpty([
        detail.run.control_type_instructions ?? '',
        readObjectInstructionSummary(detail.items),
      ]).join(' | ');

      return {
        id: run.id,
        performedAt: run.performed_at,
        performedBy: detail.run.performed_by_name,
        controlType,
        routine,
        status: run.status,
        values: readRunValueSummary(detail.items) || 'Inga fält registrerade',
        deviation: readRunDeviationSummary(detail),
        action: readRunActionSummary(detail),
        attachments: detail.attachments.map((attachment, index) => ({
          id: attachment.id,
          reference: `Bilaga ${resultIndex + 1}.${index + 1}`,
          performedAt: run.performed_at,
          controlType,
          fileName: attachment.file_name ?? 'Bilaga',
          createdAt: attachment.created_at,
          signedUrl: attachment.signed_url ?? null,
        })),
      };
    },
  });
}

export function downloadCsvReport(rows: ReportRow[]) {
  downloadTextFile(
    'egenkontroll-historik.csv',
    buildCsvReportContent(rows),
    'text/csv;charset=utf-8',
  );
}

export function openPrintReport(rows: ReportRow[], printWindow = createPrintReportWindow()) {
  if (!printWindow) return false;

  const brandMarkUrl = absoluteAssetUrl(brandAssets.reportIcon);
  printWindow.document.open();
  printWindow.document.write(buildPrintReportHtml(rows, brandMarkUrl));
  printWindow.document.close();

  return true;
}
