import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveEmailAttachmentStates } from '../../api/send-inspector-report.js';
import { buildInspectorReportDocument } from './inspectorReportDocument.js';
import {
  createInspectorReportFixtureInput,
  createInspectorReportFixtureRuns,
  fixturePng,
} from './inspectorReportFixtures.js';
import { buildInspectorReportPdf } from './inspectorReportPdf.js';

test('resolves every image independently and preserves failures as omissions', async () => {
  const runs = createInspectorReportFixtureRuns();
  runs[0].attachments = [{
    ...runs[1].attachments[0],
    id: 'attachment-failed',
    signed_url: 'https://example.invalid/failed',
  }];
  const states = await resolveEmailAttachmentStates(runs, async (url) => {
    if (url.endsWith('/failed')) return { ok: false };
    return { ok: true, arrayBuffer: async () => fixturePng };
  });

  assert.deepEqual(states.map((state) => [state.attachmentId, state.status]), [
    ['attachment-failed', 'omitted'],
    ['attachment-1', 'included'],
  ]);
});

test('renders Unicode, tables, warnings, images and a multipage PDF', async () => {
  const runs = createInspectorReportFixtureRuns({ repeat: 32 });
  const report = buildInspectorReportDocument(runs, createInspectorReportFixtureInput(), [
    { attachmentId: 'attachment-1', status: 'included', source: fixturePng },
  ]);
  const pdf = await buildInspectorReportPdf(report);

  assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.ok(pdf.length > 10_000);
  assert.ok((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length >= 3);
});

test('renders a report without attachments and a report with omitted images', async () => {
  const withoutAttachments = buildInspectorReportDocument(
    createInspectorReportFixtureRuns({ attachments: false }),
    createInspectorReportFixtureInput(),
  );
  const omitted = buildInspectorReportDocument(
    createInspectorReportFixtureRuns(),
    createInspectorReportFixtureInput(),
    [{ attachmentId: 'attachment-1', status: 'omitted', reason: 'Bilden kunde inte hämtas.' }],
  );

  const [plainPdf, warningPdf] = await Promise.all([
    buildInspectorReportPdf(withoutAttachments),
    buildInspectorReportPdf(omitted),
  ]);
  assert.equal(plainPdf.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.equal(warningPdf.subarray(0, 5).toString('ascii'), '%PDF-');
});
