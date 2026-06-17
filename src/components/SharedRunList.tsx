import { FormEvent, useEffect, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  readSharedControlTypeOptions,
  readSharedRuns,
} from '../services/shareRecords';
import type { SharedControlTypeOption, SharedRun, SharedRunItem } from '../services/shareRecords';

type DeviationFilter = 'all' | 'with-open' | 'with-resolved' | 'without';
type SortKey = 'performed-desc' | 'performed-asc' | 'control-type' | 'deviation-status';

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

function countOpenDeviations(run: SharedRun): number {
  return run.deviations.filter((deviation) => deviation.status !== 'resolved').length;
}

function countResolvedDeviations(run: SharedRun): number {
  return run.deviations.filter((deviation) => deviation.status === 'resolved').length;
}

function readDeviationLabel(run: SharedRun): string {
  const openCount = countOpenDeviations(run);
  const resolvedCount = countResolvedDeviations(run);

  if (openCount > 0) return `${openCount} öppna`;
  if (resolvedCount > 0) return `${resolvedCount} lösta`;
  return 'Inga';
}

function readDeviationTone(run: SharedRun): string {
  if (countOpenDeviations(run) > 0) return 'danger';
  if (countResolvedDeviations(run) > 0) return 'success';
  return 'neutral';
}

function matchesDeviationFilter(run: SharedRun, filter: DeviationFilter): boolean {
  const openCount = countOpenDeviations(run);
  const resolvedCount = countResolvedDeviations(run);

  if (filter === 'with-open') return openCount > 0;
  if (filter === 'with-resolved') return resolvedCount > 0 && openCount === 0;
  if (filter === 'without') return run.deviations.length === 0;
  return true;
}

function sortRuns(runs: SharedRun[], sortKey: SortKey): SharedRun[] {
  return [...runs].sort((first, second) => {
    if (sortKey === 'performed-asc') {
      return new Date(first.performed_at).getTime() - new Date(second.performed_at).getTime();
    }

    if (sortKey === 'control-type') {
      return first.control_type_name.localeCompare(second.control_type_name, 'sv-SE');
    }

    if (sortKey === 'deviation-status') {
      return countOpenDeviations(second) - countOpenDeviations(first)
        || countResolvedDeviations(second) - countResolvedDeviations(first)
        || new Date(second.performed_at).getTime() - new Date(first.performed_at).getTime();
    }

    return new Date(second.performed_at).getTime() - new Date(first.performed_at).getTime();
  });
}

export function SharedRunList({ shareKey }: SharedRunListProps) {
  const [controlTypes, setControlTypes] = useState<SharedControlTypeOption[]>([]);
  const [selectedControlTypeIds, setSelectedControlTypeIds] = useState<string[]>([]);
  const [periodStart, setPeriodStart] = useState(dateDaysAgo(30));
  const [periodEnd, setPeriodEnd] = useState(today());
  const [deviationFilter, setDeviationFilter] = useState<DeviationFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('performed-desc');
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

  const visibleRuns = sortRuns(
    runs.filter((run) => matchesDeviationFilter(run, deviationFilter)),
    sortKey,
  );

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

        <div className="inspector-secondary-filters">
          <label>
            Avvikelser
            <select
              className="text-input"
              value={deviationFilter}
              onChange={(event) => setDeviationFilter(event.target.value as DeviationFilter)}
            >
              <option value="all">Alla kontroller</option>
              <option value="with-open">Med öppna avvikelser</option>
              <option value="with-resolved">Med lösta avvikelser</option>
              <option value="without">Utan avvikelser</option>
            </select>
          </label>

          <label>
            Sortering
            <select
              className="text-input"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              <option value="performed-desc">Senaste först</option>
              <option value="performed-asc">Äldsta först</option>
              <option value="control-type">Kontrolltyp A-Ö</option>
              <option value="deviation-status">Avvikelser först</option>
            </select>
          </label>
        </div>

        <ActionButton type="submit" disabled={loading || selectedControlTypeIds.length === 0}>
          {loading ? 'Hämtar...' : 'Visa dokumentation'}
        </ActionButton>
      </form>

      {message && hasSearched ? <p className="form-message error-message">{message}</p> : null}
      {!hasSearched ? <p className="muted-copy">Välj period och kontrolltyper för att visa dokumentationen.</p> : null}
      {hasSearched && !loading && runs.length === 0 ? <p className="muted-copy">Inga kontroller hittades för urvalet.</p> : null}
      {hasSearched && !loading && runs.length > 0 && visibleRuns.length === 0 ? (
        <p className="muted-copy">Inga kontroller matchar avvikelsefiltret.</p>
      ) : null}

      {visibleRuns.length ? (
        <div className="inspector-table-wrap">
          <table className="inspector-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Kontroll</th>
                <th>Status</th>
                <th>Avvikelser</th>
                <th>Innehåll</th>
              </tr>
            </thead>
            <tbody>
              {visibleRuns.map((run) => (
                <tr key={run.run_id}>
                  <td data-label="Datum">{formatDateTime(run.performed_at)}</td>
                  <td data-label="Kontroll">
                    <strong>{run.control_type_name}</strong>
                    {run.notes ? <span className="inspector-table-note">{run.notes}</span> : null}
                  </td>
                  <td data-label="Status">
                    <span className="inspector-status-pill">{run.status}</span>
                  </td>
                  <td data-label="Avvikelser">
                    <span className={`inspector-deviation-pill ${readDeviationTone(run)}`}>
                      {readDeviationLabel(run)}
                    </span>
                  </td>
                  <td data-label="Innehåll">
                    <details className="inspector-details">
                      <summary>
                        {run.items.length} fält
                        {run.attachments.length ? ` · ${run.attachments.length} bilagor` : ''}
                      </summary>

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
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
