import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildInspectorReportDocument,
  readAttachmentReference,
  selectInspectorReportRuns,
} from './inspectorReportDocument.js';
import {
  createInspectorReportFixtureInput,
  createInspectorReportFixtureRuns,
  fixturePng,
} from './inspectorReportFixtures.js';

test('uses the exact authorized run IDs and order from the printed selection', () => {
  const runs = createInspectorReportFixtureRuns();
  const selection = selectInspectorReportRuns(runs, {
    visibleRunIds: ['run-normal', 'missing', 'run-deviation', 'run-normal'],
  });

  assert.deepEqual(selection.runs.map((run) => run.run_id), ['run-normal', 'run-deviation']);
  assert.deepEqual(selection.missingRunIds, ['missing']);
});

test('falls back to the same search, deviation and sort semantics', () => {
  const runs = createInspectorReportFixtureRuns();
  const selection = selectInspectorReportRuns(runs, {
    deviationFilter: 'with-open',
    searchQuery: 'Björn',
    sort: 'performed-desc',
  });

  assert.deepEqual(selection.runs.map((run) => run.run_id), ['run-deviation']);
});

test('builds canonical groups, metrics, deviations and attachment references', () => {
  const report = buildInspectorReportDocument(
    createInspectorReportFixtureRuns(),
    createInspectorReportFixtureInput(),
    [{ attachmentId: 'attachment-1', status: 'included', source: fixturePng }],
  );

  assert.equal(report.title, 'Egenkontroll - rapport');
  assert.deepEqual(report.summary.metrics.map((metric) => metric.value), [2, 1, 2, 1, 0]);
  assert.deepEqual(report.controlGroups.map((group) => group.name), ['Temperaturkontroll', 'Varumottagning']);
  assert.equal(report.controlGroups[1].rows[0].performer, 'Björn Ärlig');
  assert.match(report.controlGroups[1].rows[0].deviation, /För hög temperatur/);
  assert.equal(report.deviations.length, 1);
  assert.equal(report.attachments.length, 2);
  assert.equal(report.attachments[0].reference, 'Bilaga A');
  assert.equal(report.attachments[1].reference, '');
  assert.equal(report.attachmentImages.length, 1);
  assert.equal(report.omittedAttachments.length, 0);
});

test('keeps every attachment row and records partial or complete image omission', () => {
  const runs = createInspectorReportFixtureRuns();
  const partial = buildInspectorReportDocument(runs, createInspectorReportFixtureInput(), [
    { attachmentId: 'attachment-1', status: 'omitted', reason: 'Bilden kunde inte hämtas.' },
  ]);
  const withoutAttachments = buildInspectorReportDocument(
    createInspectorReportFixtureRuns({ attachments: false }),
    createInspectorReportFixtureInput(),
  );

  assert.equal(partial.attachments.length, 2);
  assert.equal(partial.attachmentImages.length, 0);
  assert.deepEqual(partial.omittedAttachments.map((attachment) => attachment.reference), ['Bilaga A']);
  assert.equal(withoutAttachments.attachments.length, 0);
  assert.equal(withoutAttachments.omittedAttachments.length, 0);
});

test('creates stable attachment references beyond Z', () => {
  assert.equal(readAttachmentReference(0), 'Bilaga A');
  assert.equal(readAttachmentReference(25), 'Bilaga Z');
  assert.equal(readAttachmentReference(26), 'Bilaga AA');
});
