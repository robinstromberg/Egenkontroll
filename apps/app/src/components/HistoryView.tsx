import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { AssetIcon } from './ui/AssetIcon';
import { appUiIcons } from '../config/assets';
import { collectReportRows, createPrintReportWindow, downloadCsvReport, openPrintReport } from '../services/reportService';
import {
  getControlRunDetail,
  listHistoryRunsPage,
} from '../services/historyService';
import type { ControlRunDetail, ControlRunSummary, HistoryFilters } from '../services/historyService';
import { HISTORY_PAGE_SIZE } from '../services/historyPagination';
import type { HistoryCursor } from '../services/historyPagination';
import {
  readControlRunItemValue,
  readStoredTemperatureLimitText,
} from '../services/controlRunItemPresentation';
import './HistoryView.css';

export type HistoryViewProps = {
  organizationId: string;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function readItemLabel(item: ControlRunDetail['items'][number]): string {
  const fieldLabel = typeof item.field_snapshot.label === 'string' ? item.field_snapshot.label : 'Fält';
  const objectName = typeof item.object_snapshot.name === 'string' ? item.object_snapshot.name : 'Kontroll';
  return `${objectName} · ${fieldLabel}`;
}

function readItemValue(item: ControlRunDetail['items'][number]): string {
  return readControlRunItemValue(item);
}

function readObjectInstructions(item: ControlRunDetail['items'][number]): string | null {
  return typeof item.object_snapshot.instructions === 'string' && item.object_snapshot.instructions.trim()
    ? item.object_snapshot.instructions
    : null;
}

function getRunStatusText(status: string): string {
  if (status === 'completed_with_deviation') return 'Avvikelse';
  if (status === 'completed') return 'Klar';
  return status;
}

function getDeviationStatusText(status: string): string {
  if (status === 'open') return 'Behöver följas upp';
  if (status === 'resolved') return 'Löst';
  return status;
}

function formatFileSize(value: number | null): string {
  if (!value) return '';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} kB`;
  return `${(value / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function readAttachmentMeta(attachment: ControlRunDetail['attachments'][number]): string {
  return [
    attachment.content_type,
    formatFileSize(attachment.size_bytes),
    `Registrerad ${formatDateTime(attachment.created_at)}`,
  ].filter(Boolean).join(' · ');
}

function formatAttachmentCount(count: number): string {
  return count === 1 ? '1 bild' : `${count} bilder`;
}

export function HistoryView({ organizationId }: HistoryViewProps) {
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [runs, setRuns] = useState<ControlRunSummary[]>([]);
  const [detail, setDetail] = useState<ControlRunDetail | null>(null);
  const [previewImage, setPreviewImage] = useState<ControlRunDetail['attachments'][number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<HistoryCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [message, setMessage] = useState('');
  const requestSequence = useRef(0);
  const loadedRunIds = useRef(new Set<string>());
  const reportRequestActive = useRef(false);

  const loadRuns = useCallback(async (
    nextFilters: HistoryFilters,
    cursor: HistoryCursor | null = null,
    append = false,
  ) => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;

    try {
      setMessage('');
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setLoadingMore(false);
        setRuns([]);
        setNextCursor(null);
        setHasMore(false);
        loadedRunIds.current = new Set();
      }

      const page = await listHistoryRunsPage(organizationId, nextFilters, {
        cursor,
        pageSize: HISTORY_PAGE_SIZE,
      });

      if (requestId !== requestSequence.current) return;

      const nextLoadedIds = append
        ? new Set(loadedRunIds.current)
        : new Set<string>();
      for (const run of page.rows) {
        if (nextLoadedIds.has(run.id)) {
          throw new Error('Historiken innehöll en duplicerad rad mellan två sidor.');
        }
        nextLoadedIds.add(run.id);
      }

      loadedRunIds.current = nextLoadedIds;
      setRuns((currentRuns) => append ? [...currentRuns, ...page.rows] : page.rows);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      setMessage(error instanceof Error ? error.message : 'Kunde inte läsa historiken.');
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [organizationId]);

  useEffect(() => {
    requestSequence.current += 1;
    const delay = filters.query ? 250 : 0;
    const timeoutId = window.setTimeout(() => {
      void loadRuns(filters);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      requestSequence.current += 1;
    };
  }, [filters, loadRuns]);

  async function openDetail(runId: string) {
    try {
      setMessage('');
      setPreviewImage(null);
      setDetail(await getControlRunDetail(organizationId, runId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte läsa detaljvyn.');
    }
  }

  function updateFilters(nextFilters: HistoryFilters) {
    setFilters(nextFilters);
    setLoading(true);
    setRuns([]);
    setNextCursor(null);
    setHasMore(false);
    loadedRunIds.current = new Set();
    setDetail(null);
    setPreviewImage(null);
  }

  function loadMoreRuns() {
    if (!nextCursor || loadingMore) return;
    void loadRuns(filters, nextCursor, true);
  }

  async function handleCsv() {
    if (reportRequestActive.current) return;
    reportRequestActive.current = true;

    try {
      setReportLoading(true);
      setMessage('');
      const rows = await collectReportRows(organizationId, filters);
      downloadCsvReport(rows);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa CSV.');
    } finally {
      reportRequestActive.current = false;
      setReportLoading(false);
    }
  }

  async function handlePrint() {
    if (reportRequestActive.current) return;

    const printWindow = createPrintReportWindow();
    if (!printWindow) {
      setMessage('Kunde inte öppna utskriftsvyn. Tillåt popup-fönster och försök igen.');
      return;
    }

    reportRequestActive.current = true;
    try {
      setReportLoading(true);
      setMessage('');
      const rows = await collectReportRows(organizationId, filters);
      openPrintReport(rows, printWindow);
    } catch (error) {
      printWindow.close();
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa utskriftsvy.');
    } finally {
      reportRequestActive.current = false;
      setReportLoading(false);
    }
  }

  function closeDetail() {
    setDetail(null);
    setPreviewImage(null);
  }

  return (
    <section className="history-view" aria-labelledby="history-title">
      <div>
        <p className="eyebrow">Historik</p>
        <h3 id="history-title">Utförda kontroller</h3>
        <p className="muted-copy">Filtrera och öppna sparade kontroller med avvikelser och bilagor.</p>
      </div>

      <div className="history-filters">
        <label className="history-filter-field">
          <span>Från datum</span>
          <input
            className="text-input"
            type="date"
            value={filters.fromDate ?? ''}
            onChange={(event) => updateFilters({ ...filters, fromDate: event.target.value || undefined })}
          />
        </label>
        <label className="history-filter-field">
          <span>Till datum</span>
          <input
            className="text-input"
            type="date"
            value={filters.toDate ?? ''}
            onChange={(event) => updateFilters({ ...filters, toDate: event.target.value || undefined })}
          />
        </label>
        <label className="history-filter-field">
          <span>Status</span>
          <select
            className="text-input"
            value={filters.status ?? ''}
            onChange={(event) => updateFilters({ ...filters, status: event.target.value || undefined })}
          >
            <option value="">Alla statusar</option>
            <option value="completed">Klar</option>
            <option value="completed_with_deviation">Klar med avvikelse</option>
          </select>
        </label>
        <label className="history-filter-field">
          <span>Sök</span>
          <input
            className="text-input"
            type="search"
            value={filters.query ?? ''}
            onChange={(event) => updateFilters({ ...filters, query: event.target.value || undefined })}
            placeholder="Produkt, leverantör, batch eller dokument"
          />
        </label>
      </div>

      <div className="report-actions">
        <ActionButton type="button" variant="secondary" onClick={handleCsv} disabled={reportLoading}>CSV</ActionButton>
        <ActionButton type="button" variant="secondary" onClick={handlePrint} disabled={reportLoading}>Utskriftsvy</ActionButton>
      </div>

      {message ? <p className="form-message error-message" role="alert">{message}</p> : null}
      {reportLoading ? <p className="muted-copy" role="status">Hämtar hela rapportunderlaget...</p> : null}
      {loading ? <p className="muted-copy" role="status">Laddar historik...</p> : null}

      <div className="history-list">
        {runs.length === 0 && !loading ? <p className="muted-copy">Ingen historik hittades.</p> : null}
        {runs.map((run) => (
          <button className="history-row" key={run.id} onClick={() => openDetail(run.id)} type="button">
            <span className="history-icon" aria-hidden="true">
              <AssetIcon icon={appUiIcons.history} fallback="H" />
            </span>
            <span className="history-copy">
              <strong>{run.control_type_name ?? 'Kontroll'}</strong>
              <span>
                {formatDateTime(run.performed_at)} · {run.performed_by_name} · {getRunStatusText(run.status)}
                {run.attachment_count ? ` · ${formatAttachmentCount(run.attachment_count)}` : ''}
              </span>
            </span>
            {run.attachment_count ? (
              <span className="attachment-count-pill">{formatAttachmentCount(run.attachment_count)}</span>
            ) : null}
            <span className={run.status === 'completed_with_deviation' ? 'status-pill warning' : 'status-pill done'}>
              {getRunStatusText(run.status)}
            </span>
            <span className="row-chevron" aria-hidden="true">›</span>
          </button>
        ))}
      </div>

      {hasMore && !loading ? (
        <div className="history-pagination">
          <ActionButton
            type="button"
            variant="secondary"
            onClick={loadMoreRuns}
            disabled={loadingMore}
          >
            {loadingMore ? 'Laddar fler...' : 'Ladda fler'}
          </ActionButton>
        </div>
      ) : null}
      {!loading && runs.length > 0 && !hasMore ? (
        <p className="muted-copy history-list-end" role="status">
          Alla matchande kontroller är visade.
        </p>
      ) : null}

      {detail ? (
        <div className="history-detail">
          <div className="history-row-header">
            <div>
              <h4>{detail.run.control_type_name ?? 'Kontroll'}</h4>
              <p className="muted-copy">
                {formatDateTime(detail.run.performed_at)} · Utförd av {detail.run.performed_by_name} · {getRunStatusText(detail.run.status)}
              </p>
            </div>
            <ActionButton type="button" variant="secondary" onClick={closeDetail}>
              Stäng
            </ActionButton>
          </div>

          {detail.run.control_type_instructions ? (
            <article className="history-detail-card">
              <strong>Rutin eller instruktion</strong>
              <p>{detail.run.control_type_instructions}</p>
            </article>
          ) : null}

          <div className="history-detail-list">
            {detail.items.map((item) => (
              <article className="history-detail-card" key={item.id}>
                <strong>{readItemLabel(item)}</strong>
                {readObjectInstructions(item) ? <p className="muted-copy">Instruktion: {readObjectInstructions(item)}</p> : null}
                {readStoredTemperatureLimitText(item) ? (
                  <p className="muted-copy">Åtgärdsgräns: {readStoredTemperatureLimitText(item)}</p>
                ) : null}
                <p>{readItemValue(item)}</p>
                {item.deviation_detected ? <p className="form-message error-message">Avvikelse: {item.deviation_reason}</p> : null}
                {item.action_text ? <p className="muted-copy">Åtgärd: {item.action_text}</p> : null}
              </article>
            ))}
          </div>

          {detail.deviations.length ? (
            <div className="history-detail-list">
              <h4>Avvikelser</h4>
              {detail.deviations.map((deviation) => (
                <article className="history-detail-card" key={deviation.id}>
                  <strong>{getDeviationStatusText(deviation.status)}</strong>
                  <p>{deviation.description}</p>
                  <p className="muted-copy">Åtgärd: {deviation.action_text}</p>
                  {deviation.follow_up_comment ? <p className="muted-copy">Uppföljning: {deviation.follow_up_comment}</p> : null}
                </article>
              ))}
            </div>
          ) : null}

          {detail.attachments.length ? (
            <div className="history-detail-list">
              <h4>Bilagor</h4>
              {detail.attachments.map((attachment) => (
                <article className="history-detail-card history-attachment-card" key={attachment.id}>
                  {attachment.signed_url ? (
                    <button
                      className="history-attachment-thumb"
                      type="button"
                      onClick={() => setPreviewImage(attachment)}
                      aria-label={`Visa ${attachment.file_name ?? 'bilaga'} större`}
                    >
                      <img src={attachment.signed_url} alt={attachment.file_name ?? 'Bilaga'} loading="lazy" />
                    </button>
                  ) : null}
                  <div>
                    <strong>{attachment.file_name ?? 'Bilaga'}</strong>
                    <p className="muted-copy">{readAttachmentMeta(attachment)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {previewImage?.signed_url ? (
        <div
          className="history-image-modal"
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.file_name ?? 'Bilaga'}
          onClick={() => setPreviewImage(null)}
        >
          <div className="history-image-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="history-row-header">
              <div>
                <h4>{previewImage.file_name ?? 'Bilaga'}</h4>
                <p className="muted-copy">{readAttachmentMeta(previewImage)}</p>
              </div>
              <ActionButton type="button" variant="secondary" onClick={() => setPreviewImage(null)}>
                Stäng
              </ActionButton>
            </div>
            <img src={previewImage.signed_url} alt={previewImage.file_name ?? 'Bilaga'} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
