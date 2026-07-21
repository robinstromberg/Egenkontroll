/* global console */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import { buildInspectorReportPdf } from '../src/reports/inspectorReportPdf.js';
import { buildInspectorReportDocument } from '../src/reports/inspectorReportDocument.js';
import {
  createInspectorReportFixtureInput,
  createInspectorReportFixtureRuns,
  fixturePng,
} from '../src/reports/inspectorReportFixtures.js';

const outputDirectory = fileURLToPath(new URL('../../../tmp/pdfs/issue-330', import.meta.url));
await mkdir(outputDirectory, { recursive: true });

const cases = [
  {
    name: 'normal-deviation-attachment',
    runs: createInspectorReportFixtureRuns(),
    states: [{ attachmentId: 'attachment-1', status: 'included', source: fixturePng }],
  },
  {
    name: 'without-attachment',
    runs: createInspectorReportFixtureRuns({ attachments: false }),
    states: [],
  },
  {
    name: 'omitted-attachment',
    runs: createInspectorReportFixtureRuns(),
    states: [{ attachmentId: 'attachment-1', status: 'omitted', reason: 'Bilden kunde inte hämtas.' }],
  },
  {
    name: 'multipage',
    runs: createInspectorReportFixtureRuns({ repeat: 32 }),
    states: [{ attachmentId: 'attachment-1', status: 'included', source: fixturePng }],
  },
];

for (const fixture of cases) {
  const report = buildInspectorReportDocument(fixture.runs, createInspectorReportFixtureInput(), fixture.states);
  const pdf = await buildInspectorReportPdf(report);
  await writeFile(`${outputDirectory}/${fixture.name}.pdf`, pdf);
}

console.log(outputDirectory);
