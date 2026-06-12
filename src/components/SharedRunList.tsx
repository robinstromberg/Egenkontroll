import { useEffect, useState } from 'react';
import { readSharedRuns } from '../services/shareRecords';
import type { SharedRun } from '../services/shareRecords';

export type SharedRunListProps = {
  shareKey: string;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function SharedRunList({ shareKey }: SharedRunListProps) {
  const [runs, setRuns] = useState<SharedRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const nextRuns = await readSharedRuns(shareKey);
        if (active) setRuns(nextRuns);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa delade kontroller.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [shareKey]);

  if (loading) return <p className="muted-copy">Laddar delning...</p>;
  if (message) return <p className="form-message error-message">{message}</p>;
  if (runs.length === 0) return <p className="muted-copy">Inga kontroller hittades för perioden.</p>;

  return (
    <div className="inspector-list">
      {runs.map((run) => (
        <article className="inspector-row" key={run.run_id}>
          <strong>{run.control_type_name}</strong>
          <p className="muted-copy">{formatDateTime(run.performed_at)} · {run.status}</p>
        </article>
      ))}
    </div>
  );
}
