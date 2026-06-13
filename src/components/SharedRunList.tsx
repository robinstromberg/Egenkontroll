import { useEffect, useState } from 'react';
import { readSharedRuns } from '../services/shareRecords';
import type { SharedRun, SharedRunItem } from '../services/shareRecords';

export type SharedRunListProps = {
  shareKey: string;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function readSnapshotLabel(snapshot: Record<string, unknown>, fallback: string): string {
  return typeof snapshot.name === 'string' ? snapshot.name : fallback;
}

function readFieldLabel(snapshot: Record<string, unknown>): string {
  return typeof snapshot.label === 'string' ? snapshot.label : 'Fält';
}

function readItemValue(item: SharedRunItem): string {
  if (item.value_text) return item.value_text;
  if (item.value_number !== null) return String(item.value_number);
  if (item.value_boolean !== null) return item.value_boolean ? 'Ja' : 'Nej';
  if (item.value_date) return item.value_date;
  if (item.value_json && Object.keys(item.value_json).length > 0) return JSON.stringify(item.value_json);
  return 'Ej angivet';
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
          <div>
            <strong>{run.control_type_name}</strong>
            <p className="muted-copy">{formatDateTime(run.performed_at)} · {run.status}</p>
            {run.notes ? <p>{run.notes}</p> : null}
          </div>

          <div className="inspector-detail-list">
            {run.items.map((item) => (
              <section className="inspector-detail-card" key={item.id}>
                <strong>
                  {readSnapshotLabel(item.object_snapshot, 'Kontrollpunkt')} · {readFieldLabel(item.field_snapshot)}
                </strong>
                <p>{readItemValue(item)}</p>
                <p className="muted-copy">Status: {item.status}</p>
                {item.deviation_detected ? (
                  <p className="form-message error-message">Avvikelse: {item.deviation_reason ?? 'Åtgärd krävs'}</p>
                ) : null}
                {item.action_text ? <p className="muted-copy">Åtgärd: {item.action_text}</p> : null}
              </section>
            ))}
          </div>

          {run.deviations.length ? (
            <div className="inspector-detail-list">
              <h4>Avvikelser</h4>
              {run.deviations.map((deviation) => (
                <section className="inspector-detail-card" key={deviation.id}>
                  <strong>{deviation.status} · {deviation.severity}</strong>
                  <p>{deviation.description}</p>
                  <p className="muted-copy">Åtgärd: {deviation.action_text}</p>
                  {deviation.follow_up_comment ? <p className="muted-copy">Uppföljning: {deviation.follow_up_comment}</p> : null}
                  {deviation.resolved_at ? <p className="muted-copy">Löst: {formatDateTime(deviation.resolved_at)}</p> : null}
                </section>
              ))}
            </div>
          ) : null}

          {run.attachments.length ? (
            <div className="inspector-detail-list">
              <h4>Bilagor</h4>
              {run.attachments.map((attachment) => (
                <section className="inspector-detail-card" key={attachment.id}>
                  <strong>{attachment.file_name ?? 'Bilaga'}</strong>
                  <p className="muted-copy">{attachment.storage_path}</p>
                </section>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
