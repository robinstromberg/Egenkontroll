import { FormEvent, useEffect, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  readSharedControlTypeOptions,
  readSharedRuns,
} from '../services/shareRecords';
import type { SharedControlTypeOption, SharedRun, SharedRunItem } from '../services/shareRecords';

export type SharedRunListProps = {
  shareKey: string;
};

function dateDaysAgo(days: number): string {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

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
  const [controlTypes, setControlTypes] = useState<SharedControlTypeOption[]>([]);
  const [selectedControlTypeIds, setSelectedControlTypeIds] = useState<string[]>([]);
  const [periodStart, setPeriodStart] = useState(dateDaysAgo(30));
  const [periodEnd, setPeriodEnd] = useState(today());
  const [runs, setRuns] = useState<SharedRun[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        setOptionsLoading(true);
        setMessage('');
        const nextControlTypes = await readSharedControlTypeOptions(shareKey);
        if (!active) return;
        setControlTypes(nextControlTypes);
        setSelectedControlTypeIds(nextControlTypes.map((option) => option.control_type_id));
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa delningslänken.');
      } finally {
        if (active) setOptionsLoading(false);
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, [shareKey]);

  async function loadRuns() {
    try {
      setLoading(true);
      setMessage('');
      const nextRuns = await readSharedRuns(shareKey, {
        periodStart,
        periodEnd,
        controlTypeIds: selectedControlTypeIds,
      });
      setRuns(nextRuns);
      setHasSearched(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte läsa delade kontroller.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadRuns();
  }

  function toggleControlType(controlTypeId: string) {
    setSelectedControlTypeIds((current) => (
      current.includes(controlTypeId)
        ? current.filter((item) => item !== controlTypeId)
        : [...current, controlTypeId]
    ));
  }

  if (optionsLoading) return <p className="muted-copy">Laddar delning...</p>;
  if (message && !hasSearched) return <p className="form-message error-message">{message}</p>;

  return (
    <div className="inspector-content">
      <form className="inspector-filter-panel" onSubmit={handleSubmit}>
        <div className="inspector-filter-grid">
          <label>
            Från
            <input
              className="text-input"
              type="date"
              value={periodStart}
              onChange={(event) => setPeriodStart(event.target.value)}
              required
            />
          </label>
          <label>
            Till
            <input
              className="text-input"
              type="date"
              value={periodEnd}
              onChange={(event) => setPeriodEnd(event.target.value)}
              required
            />
          </label>
        </div>

        <fieldset className="inspector-control-type-filter">
          <legend>Kontrolltyper</legend>
          {controlTypes.length ? (
            controlTypes.map((controlType) => (
              <label className="inspector-check-option" key={controlType.control_type_id}>
                <input
                  checked={selectedControlTypeIds.includes(controlType.control_type_id)}
                  onChange={() => toggleControlType(controlType.control_type_id)}
                  type="checkbox"
                />
                {controlType.control_type_name}
              </label>
            ))
          ) : (
            <p className="muted-copy">Inga kontrolltyper finns i delningen.</p>
          )}
        </fieldset>

        <ActionButton type="submit" disabled={loading || selectedControlTypeIds.length === 0}>
          {loading ? 'Hämtar...' : 'Visa dokumentation'}
        </ActionButton>
      </form>

      {message && hasSearched ? <p className="form-message error-message">{message}</p> : null}
      {!hasSearched ? <p className="muted-copy">Välj period och kontrolltyper för att visa dokumentationen.</p> : null}
      {hasSearched && !loading && runs.length === 0 ? <p className="muted-copy">Inga kontroller hittades för urvalet.</p> : null}

      {runs.length ? (
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
      ) : null}
    </div>
  );
}
