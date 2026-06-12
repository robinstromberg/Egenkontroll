import { getControlRunDetail, listHistoryRuns } from './historyService';

type ReportFilters = {
  fromDate?: string;
  toDate?: string;
};

type ReportRow = {
  performedAt: string;
  controlType: string;
  status: string;
  item: string;
  value: string;
  deviation: string;
  action: string;
};

function readItemLabel(item: Awaited<ReturnType<typeof getControlRunDetail>>['items'][number]): string {
  const fieldLabel = typeof item.field_snapshot.label === 'string' ? item.field_snapshot.label : 'Fält';
  const objectName = typeof item.object_snapshot.name === 'string' ? item.object_snapshot.name : 'Kontroll';
  return `${objectName} · ${fieldLabel}`;
}

function readItemValue(item: Awaited<ReturnType<typeof getControlRunDetail>>['items'][number]): string {
  if (item.value_text) return item.value_text;
  if (item.value_number !== null) return String(item.value_number);
  if (item.value_boolean !== null) return item.value_boolean ? 'Ja' : 'Nej';
  if (item.value_date) return item.value_date;
  return '';
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
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
    for (const item of detail.items) {
      rows.push({
        performedAt: run.performed_at,
        controlType: run.control_type_name ?? 'Kontroll',
        status: run.status,
        item: readItemLabel(item),
        value: readItemValue(item),
        deviation: item.deviation_detected ? item.deviation_reason ?? 'Avvikelse' : '',
        action: item.action_text ?? '',
      });
    }
  }

  return rows;
}

export function downloadCsvReport(rows: ReportRow[]) {
  const headers = ['Tidpunkt', 'Kontrolltyp', 'Status', 'Kontrollpunkt', 'Värde', 'Avvikelse', 'Åtgärd'];
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) =>
      [
        row.performedAt,
        row.controlType,
        row.status,
        row.item,
        row.value,
        row.deviation,
        row.action,
      ].map(escapeCsv).join(','),
    ),
  ];

  downloadTextFile('egenkontroll-historik.csv', lines.join('\n'), 'text/csv;charset=utf-8');
}

export function openPrintReport(rows: ReportRow[]) {
  const htmlRows = rows
    .map((row) => `
      <tr>
        <td>${row.performedAt}</td>
        <td>${row.controlType}</td>
        <td>${row.status}</td>
        <td>${row.item}</td>
        <td>${row.value}</td>
        <td>${row.deviation}</td>
        <td>${row.action}</td>
      </tr>
    `)
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html lang="sv">
      <head>
        <title>Egenkontroll – rapport</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f3f0ff; }
        </style>
      </head>
      <body>
        <h1>Egenkontroll – rapport</h1>
        <p>Skapa PDF genom att välja “Spara som PDF” i utskriftsdialogen.</p>
        <table>
          <thead>
            <tr>
              <th>Tidpunkt</th>
              <th>Kontrolltyp</th>
              <th>Status</th>
              <th>Kontrollpunkt</th>
              <th>Värde</th>
              <th>Avvikelse</th>
              <th>Åtgärd</th>
            </tr>
          </thead>
          <tbody>${htmlRows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
