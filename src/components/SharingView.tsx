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

export function SharingView({ organizationId, userId }: SharingViewProps) {
  const [periodStart, setPeriodStart] = useState(today());
  const [periodEnd, setPeriodEnd] = useState(today());
  const [validUntil, setValidUntil] = useState(nextWeek());
  const [links, setLinks] = useState<AccessRecord[]>([]);
  const [latestUrl, setLatestUrl] = useState('');
  const [message, setMessage] = useState('');

  const qrUrl = useMemo(() => {
    if (!latestUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(latestUrl)}`;
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
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa delning.');
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
        <div className="share-result">
          <strong>Ny delningslänk</strong>
          <p className="share-link-box">{latestUrl}</p>
          {qrUrl ? <img className="qr-image" src={qrUrl} alt="QR-kod för inspektörslänk" /> : null}
        </div>
      ) : null}

      <div className="share-list">
        <h4>Senaste delningar</h4>
        {links.map((link) => (
          <article className="share-row" key={link.id}>
            <strong>{link.status}</strong>
            <p className="muted-copy">Period: {link.period_start} – {link.period_end}</p>
            <p className="muted-copy">Giltig till: {new Date(link.valid_until).toLocaleDateString('sv-SE')}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
