export const HISTORY_PAGE_SIZE = 50;

export type HistoryCursor = {
  performedAt: string;
  id: string;
};

export type OrderedHistoryRow = {
  id: string;
  performed_at: string;
};

export type HistoryPage<T> = {
  rows: T[];
  nextCursor: HistoryCursor | null;
  hasMore: boolean;
};

type LoadFilteredHistoryPageOptions<TRaw extends OrderedHistoryRow, TResult extends OrderedHistoryRow> = {
  cursor?: HistoryCursor | null;
  pageSize?: number;
  fetchSourceBatch: (cursor: HistoryCursor | null, limit: number) => Promise<TRaw[]>;
  selectMatches: (rows: TRaw[]) => Promise<TResult[]>;
};

type CollectHistoryPagesOptions<T extends { id: string }, TResult> = {
  fetchPage: (cursor: HistoryCursor | null) => Promise<HistoryPage<T>>;
  transformRow: (row: T, resultIndex: number) => Promise<TResult>;
};

export function createHistoryCursor(row: OrderedHistoryRow): HistoryCursor {
  return {
    performedAt: row.performed_at,
    id: row.id,
  };
}

function isStrictlyBeforeInHistoryOrder(
  current: OrderedHistoryRow,
  previous: OrderedHistoryRow,
): boolean {
  if (current.performed_at !== previous.performed_at) {
    return current.performed_at < previous.performed_at;
  }

  return current.id < previous.id;
}

function assertStableSourceOrder(rows: OrderedHistoryRow[]) {
  for (let index = 1; index < rows.length; index += 1) {
    if (!isStrictlyBeforeInHistoryOrder(rows[index], rows[index - 1])) {
      throw new Error('Historikens datakälla returnerade en instabil eller duplicerad sorteringsordning.');
    }
  }
}

function assertMatchesKeepSourceOrder<TRaw extends OrderedHistoryRow, TResult extends OrderedHistoryRow>(
  sourceRows: TRaw[],
  matchingRows: TResult[],
) {
  const sourceIndexById = new Map(sourceRows.map((row, index) => [row.id, index]));
  let previousIndex = -1;

  for (const row of matchingRows) {
    const sourceIndex = sourceIndexById.get(row.id);
    if (sourceIndex === undefined || sourceIndex <= previousIndex) {
      throw new Error('Historikens filtrering ändrade den stabila sorteringsordningen.');
    }
    previousIndex = sourceIndex;
  }
}

export async function loadFilteredHistoryPage<
  TRaw extends OrderedHistoryRow,
  TResult extends OrderedHistoryRow,
>({
  cursor = null,
  pageSize = HISTORY_PAGE_SIZE,
  fetchSourceBatch,
  selectMatches,
}: LoadFilteredHistoryPageOptions<TRaw, TResult>): Promise<HistoryPage<TResult>> {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error('Historikens sidstorlek måste vara ett positivt heltal.');
  }

  const scanBatchSize = pageSize + 1;
  const matchingRows: TResult[] = [];
  let scanCursor = cursor;

  while (matchingRows.length <= pageSize) {
    const sourceRows = await fetchSourceBatch(scanCursor, scanBatchSize);

    if (sourceRows.length > scanBatchSize) {
      throw new Error('Historikens datakälla returnerade fler rader än den begärda batchstorleken.');
    }
    if (sourceRows.length === 0) {
      break;
    }

    assertStableSourceOrder(sourceRows);
    const cursorAtBatchStart = scanCursor;
    if (
      cursorAtBatchStart
      && sourceRows.some((row) => !isStrictlyBeforeInHistoryOrder(row, {
        id: cursorAtBatchStart.id,
        performed_at: cursorAtBatchStart.performedAt,
      }))
    ) {
      throw new Error('Historikens datakälla returnerade en rad före eller på den aktuella markören.');
    }

    const selectedRows = await selectMatches(sourceRows);
    assertMatchesKeepSourceOrder(sourceRows, selectedRows);

    for (const row of selectedRows) {
      matchingRows.push(row);
      if (matchingRows.length > pageSize) break;
    }

    if (matchingRows.length > pageSize || sourceRows.length < scanBatchSize) {
      break;
    }

    const nextScanCursor = createHistoryCursor(sourceRows[sourceRows.length - 1]);
    if (
      scanCursor
      && nextScanCursor.performedAt === scanCursor.performedAt
      && nextScanCursor.id === scanCursor.id
    ) {
      throw new Error('Historikens paginering kunde inte flytta markören framåt.');
    }
    scanCursor = nextScanCursor;
  }

  const rows = matchingRows.slice(0, pageSize);
  const hasMore = matchingRows.length > pageSize;

  return {
    rows,
    nextCursor: hasMore && rows.length > 0
      ? createHistoryCursor(rows[rows.length - 1])
      : null,
    hasMore,
  };
}

function incompleteReportError(batchNumber: number, cause?: unknown): Error {
  const error = new Error(
    `Kunde inte hämta ett fullständigt rapportunderlag. Hämtningen avbröts i batch ${batchNumber}; ingen delrapport skapades.`,
  ) as Error & { cause?: unknown };
  error.cause = cause;
  return error;
}

export async function collectHistoryPagesSequentially<T extends { id: string }, TResult>({
  fetchPage,
  transformRow,
}: CollectHistoryPagesOptions<T, TResult>): Promise<TResult[]> {
  const results: TResult[] = [];
  const seenIds = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor: HistoryCursor | null = null;
  let batchNumber = 1;

  while (true) {
    let page: HistoryPage<T>;

    try {
      page = await fetchPage(cursor);

      for (const row of page.rows) {
        if (seenIds.has(row.id)) {
          throw new Error(`Historikraden ${row.id} förekommer i flera rapportbatcher.`);
        }
        seenIds.add(row.id);
        results.push(await transformRow(row, results.length));
      }
    } catch (error) {
      throw incompleteReportError(batchNumber, error);
    }

    if (!page.hasMore) {
      return results;
    }
    if (!page.nextCursor || page.rows.length === 0) {
      throw incompleteReportError(batchNumber);
    }

    const cursorKey = `${page.nextCursor.performedAt}\u0000${page.nextCursor.id}`;
    if (seenCursors.has(cursorKey)) {
      throw incompleteReportError(batchNumber);
    }
    seenCursors.add(cursorKey);
    cursor = page.nextCursor;
    batchNumber += 1;
  }
}
