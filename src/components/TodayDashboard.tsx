import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { listOpenDeviations, listTodayControls } from '../services/dashboardService';
import type { OpenDeviationSummary, TodayControl } from '../services/dashboardService';
import './TodayDashboard.css';

export type TodayDashboardProps = {
  organizationId: string;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(value);
}

function getStatusText(status: TodayControl['status']): string {
  if (status === 'done') return 'Klar';
  if (status === 'done_with_deviation') return 'Klar med avvikelse';
  return 'Ej utförd';
}

function getStatusClass(status: TodayControl['status']): string {
  if (status === 'done') return 'status-pill done';
  if (status === 'done_with_deviation') return 'status-pill warning';
  return 'status-pill pending';
}

export function TodayDashboard({ organizationId }: TodayDashboardProps) {
  const [controls, setControls] = useState<TodayControl[]>([]);
  const [deviations, setDeviations] = useState<OpenDeviationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [todayControls, openDeviations] = await Promise.all([
          listTodayControls(organizationId),
          listOpenDeviations(organizationId),
        ]);
        if (!active) return;
        setControls(todayControls);
        setDeviations(openDeviations);
      } catch (error) {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : 'Kunde inte läsa dagens kontroller.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [organizationId]);

  const completedCount = useMemo(
    () => controls.filter((control) => control.status !== 'not_done').length,
    [controls],
  );

  return (
    <section className="today-dashboard" aria-labelledby="today-title">
      <div>
        <p className="eyebrow">Idag</p>
        <h3 id="today-title">{formatDate(new Date())}</h3>
        <p className="muted-copy">
          Här ser personalen vad som ska göras, vad som är klart och vad som kräver åtgärd.
        </p>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}
      {loading ? <p className="muted-copy">Laddar dagens arbete...</p> : null}

      <div className="today-summary">
        <strong>{completedCount} av {controls.length} kontroller klara</strong>
        <span>{deviations.length} öppna avvikelser</span>
      </div>

      <div className="today-list">
        {controls.length === 0 && !loading ? (
          <p className="muted-copy">Inga dagliga eller veckovisa kontroller är aktiva ännu.</p>
        ) : null}

        {controls.map((control) => (
          <article className="today-item" key={control.controlType.id}>
            <div className="today-item-header">
              <div>
                <h4>{control.controlType.name}</h4>
                <p className="muted-copy">{control.controlType.frequency} · {control.controlType.category}</p>
              </div>
              <span className={getStatusClass(control.status)}>{getStatusText(control.status)}</span>
            </div>
            <ActionButton type="button" variant="secondary">
              Utför kontroll
            </ActionButton>
          </article>
        ))}
      </div>

      <div className="deviation-list">
        <h4>Öppna avvikelser</h4>
        {deviations.length === 0 && !loading ? (
          <p className="muted-copy">Inga öppna avvikelser just nu.</p>
        ) : null}

        {deviations.map((deviation) => (
          <article className="deviation-item" key={deviation.id}>
            <div className="deviation-item-header">
              <div>
                <strong>{deviation.control_type_name ?? 'Kontroll'}</strong>
                <p className="muted-copy">{deviation.control_object_name ?? 'Ingen kontrollpunkt'}</p>
              </div>
              <span className="status-pill warning">Åtgärd krävs</span>
            </div>
            <p>{deviation.description}</p>
            <p className="muted-copy">Åtgärd: {deviation.action_text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
