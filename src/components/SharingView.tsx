import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { createAccessLink, listAccessLinks } from '../services/shareRecords';
import type { AccessRecord } from '../services/shareRecords';
import './SharingView.css';

export type SharingViewProps = {
  organizationId: string;
  userId: string;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextWeek(): string {
  const value = new Date();
  value.setDate(value.getDate() + 7);
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

export function SharingView({ organizationId, userId }: SharingViewProps) {
  const [periodStart, setPeriodStart] = useState(today());
  const [periodEnd, setPeriodEnd] = useState(today());
  const [validUntil, setValidUntil] = useState(nextWeek());
  const [links, setLinks] = useState<AccessRecord[]>([]);
  const [latestUrl, setLatestUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  const qrUrl = useMemo(() => {
    if (!latestUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(latestUrl)}`;
  }, [latestUrl]);

  async function refresh() {
    setLinks(await listAccessLinks(organizationId));
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
        periodStart,
        periodEnd,
        validUntil,
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
        <p className="muted-copy">Skapa en tidsbegränsad läslänk för kontrollhistorik.</p>
      </div>

      <form className="sharing-form" onSubmit={handleSubmit}>
        <label>
          Från
          <input className="text-input" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} required />
        </label>
        <label>
          Till
          <input className="text-input" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} required />
        </label>
        <label>
          Giltig till
          <input className="text-input" type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} required />
        </label>
        <ActionButton type="submit">Skapa läslänk</ActionButton>
      </form>

      {message ? <p className="form-message error-message">{message}</p> : null}

      {latestUrl ? (
        <div className="share-modal-backdrop" role="presentation">
          <section className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
            <div>
              <p className="eyebrow">Delning skapad</p>
              <h3 id="share-modal-title">Inspektörslänk</h3>
              <p className="muted-copy">Period: {periodStart} – {periodEnd}. Giltig till {validUntil}.</p>
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
            <p>Period: {link.period_start} – {link.period_end}</p>
            <p>Giltig till: {new Date(link.valid_until).toLocaleDateString('sv-SE')}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
