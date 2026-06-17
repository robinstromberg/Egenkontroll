import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { createAccessLink, listAccessLinks, listExportLogs } from '../services/shareRecords';
import type { AccessRecord, ExportLogRecord } from '../services/shareRecords';
import './SharingView.css';

export type SharingViewProps = {
  organizationId: string;
  userId: string;
};

const validityOptions = [
  { label: '24 timmar', value: '1' },
  { label: '7 dagar', value: '7' },
  { label: '30 dagar', value: '30' },
  { label: 'Eget datum', value: 'custom' },
];

function dateAfter(days: number): string {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatAccessUrl(value: string): string {
  const marker = ['s', 'hare', ''].join('/');
  const key = value.split(marker)[1];
  if (!key) return value;
  return window.location.origin + '/' + String.fromCharCode(35) + 'inspector=' + key;
}

function getShareStatusText(status: string): string {
  if (status === 'active') return 'Aktiv';
  if (status === 'expired') return 'Utgången';
  if (status === 'revoked') return 'Stoppad';
  return status;
}

function getExportTypeText(exportType: string): string {
  if (exportType === 'pdf') return 'PDF';
  if (exportType === 'csv') return 'CSV';
  return exportType.toUpperCase();
}

function readFilterText(filters: Record<string, unknown>): string {
  const periodStart = typeof filters.period_start === 'string' ? filters.period_start : '';
  const periodEnd = typeof filters.period_end === 'string' ? filters.period_end : '';
  const runCount = typeof filters.run_count === 'number' ? filters.run_count : null;
  const openDeviations = typeof filters.open_deviations === 'number' ? filters.open_deviations : null;
  const period = periodStart && periodEnd ? `${periodStart} - ${periodEnd}` : 'Okänd period';
  const counts = [
    runCount !== null ? `${runCount} kontroller` : '',
    openDeviations !== null ? `${openDeviations} öppna avvikelser` : '',
  ].filter(Boolean).join(' · ');

  return counts ? `${period} · ${counts}` : period;
}

export function SharingView({ organizationId, userId }: SharingViewProps) {
  const [validityPreset, setValidityPreset] = useState('7');
  const [customValidUntil, setCustomValidUntil] = useState(dateAfter(7));
  const [links, setLinks] = useState<AccessRecord[]>([]);
  const [exportLogs, setExportLogs] = useState<ExportLogRecord[]>([]);
  const [latestUrl, setLatestUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  const selectedValidUntil = validityPreset === 'custom'
    ? customValidUntil
    : dateAfter(Number(validityPreset));

  const qrUrl = useMemo(() => {
    if (!latestUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(latestUrl)}`;
  }, [latestUrl]);

  async function refresh() {
    const [nextLinks, nextExportLogs] = await Promise.all([
      listAccessLinks(organizationId),
      listExportLogs(organizationId),
    ]);
    setLinks(nextLinks);
    setExportLogs(nextExportLogs);
  }

  useEffect(() => {
    void refresh();
  }, [organizationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      const url = await createAccessLink({
        organizationId,
        createdBy: userId,
        validUntil: selectedValidUntil,
      });
      setLatestUrl(formatAccessUrl(url));
      setCopied(false);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa delning.');
    }
  }

  async function handleCopy() {
    if (!latestUrl) return;

    try {
      await navigator.clipboard.writeText(latestUrl);
      setCopied(true);
    } catch {
      setMessage('Kunde inte kopiera länken automatiskt.');
    }
  }

  return (
    <section className="sharing-view" aria-labelledby="sharing-title">
      <div>
        <p className="eyebrow">Delning</p>
        <h3 id="sharing-title">Inspektörslänk</h3>
        <p className="muted-copy">Skapa en tidsbegränsad läslänk. Inspektören väljer period i läsvyn.</p>
      </div>

      <form className="sharing-form" onSubmit={handleSubmit}>
        <fieldset className="validity-options">
          <legend>Giltighet</legend>
          {validityOptions.map((option) => (
            <label
              className={validityPreset === option.value ? 'validity-option selected' : 'validity-option'}
              key={option.value}
            >
              <input
                checked={validityPreset === option.value}
                name="validity"
                onChange={() => setValidityPreset(option.value)}
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        {validityPreset === 'custom' ? (
          <label>
            Giltig till
            <input
              className="text-input"
              type="date"
              value={customValidUntil}
              onChange={(event) => setCustomValidUntil(event.target.value)}
              required
            />
          </label>
        ) : null}

        <ActionButton type="submit">Skapa läslänk</ActionButton>
      </form>

      {message ? <p className="form-message error-message">{message}</p> : null}

      {latestUrl ? (
        <div className="share-modal-backdrop" role="presentation">
          <section className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
            <div>
              <p className="eyebrow">Delning skapad</p>
              <h3 id="share-modal-title">Inspektörslänk</h3>
              <p className="muted-copy">Giltig till {selectedValidUntil}.</p>
            </div>
            {qrUrl ? <img className="qr-image large" src={qrUrl} alt="QR-kod för inspektörslänk" /> : null}
            <p className="share-link-box">{latestUrl}</p>
            <div className="form-actions">
              <ActionButton type="button" onClick={handleCopy}>
                {copied ? 'Kopierad' : 'Kopiera länk'}
              </ActionButton>
              <ActionButton type="button" variant="secondary" onClick={() => window.open(latestUrl, '_blank', 'noopener,noreferrer')}>
                Öppna läsvy
              </ActionButton>
              <ActionButton type="button" variant="secondary" onClick={() => setLatestUrl('')}>
                Stäng
              </ActionButton>
            </div>
          </section>
        </div>
      ) : null}

      <div className="share-list">
        <h4>Senaste delningar</h4>
        {links.map((link) => (
          <article className="share-row" key={link.id}>
            <strong className={link.status === 'active' ? 'share-status active' : 'share-status inactive'}>
              {getShareStatusText(link.status)}
            </strong>
            <p>Giltig till: {new Date(link.valid_until).toLocaleDateString('sv-SE')}</p>
            {exportLogs.some((log) => log.share_link_id === link.id) ? (
              <div className="share-export-list">
                {exportLogs.filter((log) => log.share_link_id === link.id).slice(0, 3).map((log) => (
                  <p className="share-export-row" key={log.id}>
                    <span>{getExportTypeText(log.export_type)}</span>
                    {new Date(log.created_at).toLocaleString('sv-SE')} · {readFilterText(log.filters)}
                  </p>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="share-list">
        <h4>Senaste exporter</h4>
        {exportLogs.length === 0 ? <p className="muted-copy">Inga exporter har loggats ännu.</p> : null}
        {exportLogs.slice(0, 8).map((log) => (
          <article className="share-row compact" key={log.id}>
            <strong className="share-status active">{getExportTypeText(log.export_type)}</strong>
            <p>{new Date(log.created_at).toLocaleString('sv-SE')}</p>
            <p>{readFilterText(log.filters)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
