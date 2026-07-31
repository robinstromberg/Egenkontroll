import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCsvReportContent,
  buildPrintReportHtml,
} from './historyReportContent';
import type { ReportRow } from './historyReportContent';

function createReportRows(count: number): ReportRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `run-${index + 1}`,
    performedAt: `2026-07-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`,
    performedBy: 'Testanvändare',
    controlType: `Kontroll ${index + 1}`,
    routine: `Rutin ${index + 1}`,
    status: 'completed',
    values: `Värde ${index + 1}`,
    deviation: '',
    action: '',
    attachments: [],
  }));
}

test('CSV-innehållet omfattar samtliga 51 rapportposter', () => {
  const rows = createReportRows(51);
  const csv = buildCsvReportContent(rows);
  const lines = csv.split('\n');

  assert.equal(lines.length, 52);
  for (const row of rows) {
    assert.match(csv, new RegExp(`"${row.controlType}"`));
  }
  assert.match(csv, /"Kontroll 51"/);
});

test('utskriftsinnehållet omfattar samtliga 51 rapportposter', () => {
  const rows = createReportRows(51);
  const html = buildPrintReportHtml(rows, 'https://example.test/report-icon.png');

  for (const row of rows) {
    assert.match(html, new RegExp(`<td>${row.controlType}</td>`));
  }
  assert.match(html, /<td>Kontroll 51<\/td>/);
  assert.match(html, /Promise\.all\(Array\.from\(document\.images\)/);
});
