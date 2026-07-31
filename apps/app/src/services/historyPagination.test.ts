import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectHistoryPagesSequentially,
  HISTORY_PAGE_SIZE,
  loadFilteredHistoryPage,
} from './historyPagination';
import type { HistoryCursor, OrderedHistoryRow } from './historyPagination';

type FixtureRow = OrderedHistoryRow & {
  organization_id: string;
  status: 'completed' | 'completed_with_deviation';
  searchableText: string;
};

function fixtureId(index: number): string {
  return index.toString().padStart(4, '0');
}

function createRows(count: number): FixtureRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: fixtureId(count - index),
    organization_id: 'organization-a',
    performed_at: '2026-07-30T12:00:00.000Z',
    status: index % 2 === 0 ? 'completed' : 'completed_with_deviation',
    searchableText: `kontroll ${index + 1}`,
  }));
}

function isAfterCursor(row: FixtureRow, cursor: HistoryCursor | null): boolean {
  if (!cursor) return true;
  if (row.performed_at !== cursor.performedAt) {
    return row.performed_at < cursor.performedAt;
  }
  return row.id < cursor.id;
}

function createPageLoader(
  sourceRows: FixtureRow[],
  options: {
    organizationId?: string;
    status?: FixtureRow['status'];
    query?: string;
    fromDate?: string;
    toDate?: string;
  } = {},
) {
  const filteredSource = sourceRows.filter((row) => (
    row.organization_id === (options.organizationId ?? 'organization-a')
    && (!options.status || row.status === options.status)
    && (!options.fromDate || row.performed_at >= options.fromDate)
    && (!options.toDate || row.performed_at < options.toDate)
  ));
  const normalizedQuery = options.query?.trim().toLowerCase() ?? '';

  return (cursor: HistoryCursor | null) => loadFilteredHistoryPage({
    cursor,
    fetchSourceBatch: async (batchCursor, limit) => filteredSource
      .filter((row) => isAfterCursor(row, batchCursor))
      .slice(0, limit),
    selectMatches: async (rows) => normalizedQuery
      ? rows.filter((row) => row.searchableText.includes(normalizedQuery))
      : rows,
  });
}

test('51 historikrader pagineras stabilt utan dubbletter eller tappade rader', async () => {
  const sourceRows = createRows(51);
  const fetchPage = createPageLoader(sourceRows);
  const firstPage = await fetchPage(null);
  const secondPage = await fetchPage(firstPage.nextCursor);
  const allRows = [...firstPage.rows, ...secondPage.rows];

  assert.equal(firstPage.rows.length, HISTORY_PAGE_SIZE);
  assert.equal(firstPage.hasMore, true);
  assert.ok(firstPage.nextCursor);
  assert.equal(secondPage.rows.length, 1);
  assert.equal(secondPage.hasMore, false);
  assert.equal(secondPage.nextCursor, null);
  assert.deepEqual(allRows.map((row) => row.id), sourceRows.map((row) => row.id));
  assert.equal(new Set(allRows.map((row) => row.id)).size, 51);
});

test('sökning hittar en träff efter den första 50-radersgränsen', async () => {
  const sourceRows = createRows(75);
  sourceRows[50] = {
    ...sourceRows[50],
    searchableText: 'unik leverantör batch-51',
  };

  const page = await createPageLoader(sourceRows, { query: 'batch-51' })(null);

  assert.deepEqual(page.rows.map((row) => row.id), [sourceRows[50].id]);
  assert.equal(page.hasMore, false);
});

test('organisation, datum och status filtreras före sidbegränsningen', async () => {
  const organizationARows = createRows(60);
  const organizationBRows = createRows(60).map((row, index) => ({
    ...row,
    id: `b-${fixtureId(60 - index)}`,
    organization_id: 'organization-b',
    performed_at: index < 30
      ? '2026-07-30T12:00:00.000Z'
      : '2026-06-30T12:00:00.000Z',
  }));
  const sourceRows = [...organizationARows, ...organizationBRows]
    .sort((left, right) => (
      right.performed_at.localeCompare(left.performed_at)
      || right.id.localeCompare(left.id)
    ));
  const fetchPage = createPageLoader(sourceRows, {
    organizationId: 'organization-b',
    status: 'completed_with_deviation',
    fromDate: '2026-07-01T00:00:00.000Z',
    toDate: '2026-08-01T00:00:00.000Z',
  });

  const rows = await collectHistoryPagesSequentially({
    fetchPage,
    transformRow: async (row) => row,
  });

  assert.equal(rows.length, 15);
  assert.ok(rows.every((row) => row.organization_id === 'organization-b'));
  assert.ok(rows.every((row) => row.status === 'completed_with_deviation'));
  assert.ok(rows.every((row) => row.performed_at.startsWith('2026-07-30')));
});

test('fullständigt rapportunderlag hämtar alla 51 rader i sekventiella batcher', async () => {
  const sourceRows = createRows(51);
  const pageLoader = createPageLoader(sourceRows);
  let activeFetches = 0;
  let maxActiveFetches = 0;

  const rows = await collectHistoryPagesSequentially({
    fetchPage: async (cursor) => {
      activeFetches += 1;
      maxActiveFetches = Math.max(maxActiveFetches, activeFetches);
      try {
        return await pageLoader(cursor);
      } finally {
        activeFetches -= 1;
      }
    },
    transformRow: async (row) => row,
  });

  assert.equal(rows.length, 51);
  assert.deepEqual(rows.map((row) => row.id), sourceRows.map((row) => row.id));
  assert.equal(maxActiveFetches, 1);
});

test('fel i en senare batch avbryter rapporten med ett tydligt fel', async () => {
  const sourceRows = createRows(51);
  const pageLoader = createPageLoader(sourceRows);
  let batchNumber = 0;
  let completedResult = false;

  await assert.rejects(
    async () => {
      await collectHistoryPagesSequentially({
        fetchPage: async (cursor) => {
          batchNumber += 1;
          if (batchNumber === 2) throw new Error('simulerat nätverksfel');
          return pageLoader(cursor);
        },
        transformRow: async (row) => row,
      });
      completedResult = true;
    },
    (error: Error) => {
      assert.match(error.message, /batch 2/);
      assert.match(error.message, /ingen delrapport skapades/);
      return true;
    },
  );

  assert.equal(completedResult, false);
});

test('duplicerade rader mellan rapportbatcher avvisas i stället för att döljas', async () => {
  const rows = createRows(51);
  let batchNumber = 0;

  await assert.rejects(
    collectHistoryPagesSequentially({
      fetchPage: async () => {
        batchNumber += 1;
        if (batchNumber === 1) {
          return {
            rows: rows.slice(0, HISTORY_PAGE_SIZE),
            hasMore: true,
            nextCursor: {
              performedAt: rows[HISTORY_PAGE_SIZE - 1].performed_at,
              id: rows[HISTORY_PAGE_SIZE - 1].id,
            },
          };
        }
        return {
          rows: [rows[HISTORY_PAGE_SIZE - 1]],
          hasMore: false,
          nextCursor: null,
        };
      },
      transformRow: async (row) => row,
    }),
    /batch 2; ingen delrapport skapades/,
  );
});
