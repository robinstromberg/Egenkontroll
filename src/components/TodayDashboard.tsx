import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { listOpenDeviations, listTodayControls } from '../services/dashboardService';
import { resolveDeviation } from '../services/deviationService';
import { getControlTypeVisual } from '../utils/controlTypeVisuals';
import type { OpenDeviationSummary, TodayControl } from '../services/dashboardService';
import './TodayDashboard.css';

export type TodayDashboardProps = {
  organizationId: string;
  userId: string;
  onStartControl: (controlTypeId: string) => void;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(value);
}

function getGreeting(value: Date): string {
  const hour = value.getHours();
  if (hour < 10) return 'God morgon';
  if (hour < 17) return 'Hej';
  return 'God kväll';
}

function getStatusText(status: TodayControl['status']): string {
  if (status === 'done') return 'Klar';
  if (status === 'done_with_deviation') return 'Avvikelse';
  return 'Ej utförd';
}

function getStatusClass(status: TodayControl['status']): string {
  if (status === 'done') return 'status-pill done';
  if (status === 'done_with_deviation') return 'status-pill warning';
  return 'status-pill pending';
}

export function TodayDashboard({ organizationId, userId, onStartControl }: TodayDashboardProps) {
  const [controls, setControls] = useState<TodayControl[]>([]);
  const [deviations, setDeviations] = useState<OpenDeviationSummary[]>([]);
  const [followUps, setFollowUps] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const today = new Date();

  async function loadDashboard(active = true) {
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

  useEffect(() => {
    let active = true;
    void loadDashboard(active);
    return () => {
      active = false;
    };
  }, [organizationId]);

  const completedCount = useMemo(
    () => controls.filter((control) => control.status !== 'not_done').length,
    [controls],
  );

  const nextControl = useMemo(
    () => controls.find((control) => control.status === 'not_done') ?? controls[0],
    [controls],
  );

  async function handleResolve(deviationId: string) {
    setMessage('');
    try {
      await resolveDeviation(organizationId, deviationId, userId, followUps[deviationId] ?? '');
      setFollowUps((current) => ({ ...current, [deviationId]: '' }));
      await loadDashboard(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte stänga avvikelsen.');
    }
  }

  return (
    <section className="today-dashboard" aria-labelledby="today-title">
      <div className="today-hero">
        <div>
          <p className="eyebrow">Idag</p>
          <h3 id="today-title">{getGreeting(today)}</h3>
          <p className="today-date">{formatDate(today)}</p>
        </div>
        <span className="today-weather" aria-hidden="true">☀</span>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}
      {loading ? <p className="muted-copy">Laddar dagens arbete...</p> : null}

      <div className="today-summary">
        <div>
          <span>Dagens kontroller</span>
          <strong>{completedCount} av {controls.length} klara</strong>
        </div>
        <div>
          <span>Öppna avvikelser</span>
          <strong>{deviations.length}</strong>
        </div>
      </div>

      <div className="today-list" aria-label="Dagens kontroller">
        <div className="today-list-heading">
          <h4>Dagens kontroller</h4>
          <span>{completedCount} av {controls.length} klara</span>
        </div>

        {controls.length === 0 && !loading ? (
          <p className="muted-copy">Inga dagliga eller veckovisa kontroller är aktiva ännu.</p>
        ) : null}

        {controls.map((control) => {
          const visual = getControlTypeVisual(control.controlType);
          return (
            <button
              className={`today-control-row ${control.status}`}
              key={control.controlType.id}
              onClick={() => onStartControl(control.controlType.id)}
              type="button"
            >
              <span className={`control-type-icon ${visual.className}${visual.imageSrc ? ' has-image' : ''}`} aria-hidden="true">
                {visual.imageSrc ? <img src={visual.imageSrc} alt="" /> : visual.icon}
              </span>
              <span className="today-control-copy">
                <strong>{control.controlType.name}</strong>
                <span>{visual.label}</span>
              </span>
              <span className={getStatusClass(control.status)}>{getStatusText(control.status)}</span>
              <span className="row-chevron" aria-hidden="true">›</span>
            </button>
          );
        })}
      </div>

      {nextControl ? (
        <ActionButton
          className="today-primary-action"
          type="button"
          onClick={() => onStartControl(nextControl.controlType.id)}
        >
          Utför kontroll
        </ActionButton>
      ) : null}

      <div className="deviation-list">
        <div className="today-list-heading deviation-heading">
          <h4>Öppna avvikelser</h4>
          <span>{deviations.length}</span>
        </div>
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
            <label className="action-label" htmlFor={`follow-up-${deviation.id}`}>Uppföljningskommentar</label>
            <textarea
              className="text-input"
              id={`follow-up-${deviation.id}`}
              value={followUps[deviation.id] ?? ''}
              onChange={(event) => setFollowUps((current) => ({ ...current, [deviation.id]: event.target.value }))}
              placeholder="Exempel: Temperaturen kontrollerad igen och är nu inom gränsvärde."
            />
            <ActionButton type="button" variant="secondary" onClick={() => handleResolve(deviation.id)}>
              Markera som löst
            </ActionButton>
          </article>
        ))}
      </div>
    </section>
  );
}
