import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { AssetIcon } from './ui/AssetIcon';
import { readControlTypeIcon } from '../config/assets';
import { listOpenDeviations, listTodayControls } from '../services/dashboardService';
import { resolveDeviation } from '../services/deviationService';
import { runPwaInstallPrompt, subscribePwaInstallPrompt } from '../services/pwaInstallPrompt';
import type { FirstRunMode } from './AppDashboard';
import type { OpenDeviationSummary, TodayControl } from '../services/dashboardService';
import './TodayDashboard.css';

const HOME_SCREEN_SNOOZE_KEY = 'min-egenkontroll-home-screen-snoozed-until';
const HOME_SCREEN_SNOOZE_MS = 24 * 60 * 60 * 1000;

export type TodayDashboardProps = {
  organizationId: string;
  userId: string;
  displayName?: string;
  onStartControl: (controlTypeId: string) => void;
  canManage: boolean;
  firstRunMode: FirstRunMode | null;
  onOpenControlTypes: () => void;
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

function getFirstName(displayName?: string): string {
  return displayName?.trim().split(/\s+/)[0] ?? '';
}

function getFirstRunCopy(firstRunMode: FirstRunMode) {
  if (firstRunMode === 'staff') {
    return {
      eyebrow: 'Välkommen',
      title: 'Du är inne i verksamheten',
      copy: 'Här ser du dagens kontroller. Spara din första kontroll här, så hamnar dokumentationen i Historik.',
      action: 'Utför första kontrollen',
    };
  }

  return {
    eyebrow: 'Kom igång',
    title: 'Verksamheten är skapad',
    copy: 'Startkontrollerna är redo. Spara din första kontroll här, så hamnar dokumentationen i Historik.',
    action: 'Utför första kontrollen',
  };
}

function getStatusText(control: TodayControl): string {
  if (control.status === 'done') return 'Klar';
  if (control.status === 'done_with_deviation') return 'Avvikelse';
  if (control.controlType.frequency === 'per_delivery') return 'Vid behov';
  if (control.controlType.frequency === 'weekly' || control.controlType.frequency === 'custom') return 'Återkommande';
  return 'Ej utförd';
}

function getStatusClass(status: TodayControl['status']): string {
  if (status === 'done') return 'status-pill done';
  if (status === 'done_with_deviation') return 'status-pill warning';
  return 'status-pill pending';
}

function getCategoryMeta(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('temperatur') || normalized.includes('temperature')) {
    return { className: 'temperature', label: '°C', name: 'Temperatur' };
  }
  if (normalized.includes('städ') || normalized.includes('stad') || normalized.includes('checklist')) {
    return { className: 'checklist', label: '✓', name: 'Checklista' };
  }
  if (normalized.includes('mottag') || normalized.includes('receiving')) {
    return { className: 'receiving', label: 'IN', name: 'Mottagning' };
  }
  if (normalized.includes('spår') || normalized.includes('spar') || normalized.includes('traceability')) {
    return { className: 'traceability', label: 'SP', name: 'Spårbarhet' };
  }
  if (normalized.includes('runda') || normalized.includes('round')) {
    return { className: 'round', label: 'R', name: 'Rond' };
  }
  return { className: 'custom', label: 'C', name: category };
}

function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIosDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const touchMac = userAgent.includes('macintosh') && window.navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/.test(userAgent) || touchMac;
}

function isAndroidDevice() {
  return window.navigator.userAgent.toLowerCase().includes('android');
}

function readHomeScreenSnoozed() {
  try {
    const value = window.localStorage.getItem(HOME_SCREEN_SNOOZE_KEY);
    if (!value) return false;
    const snoozedUntil = Number(value);
    return Number.isFinite(snoozedUntil) && snoozedUntil > Date.now();
  } catch {
    return false;
  }
}

function snoozeHomeScreenGuide() {
  try {
    window.localStorage.setItem(HOME_SCREEN_SNOOZE_KEY, String(Date.now() + HOME_SCREEN_SNOOZE_MS));
  } catch {
    // localStorage can be unavailable in private browsing; component state still hides the card.
  }
}

function ControlSection({
  title,
  summary,
  emptyText,
  controls,
  onStartControl,
}: {
  title: string;
  summary: string;
  emptyText: string;
  controls: TodayControl[];
  onStartControl: (controlTypeId: string) => void;
}) {
  return (
    <section className="today-control-section" aria-label={title}>
      <div className="today-list-heading">
        <h4>{title}</h4>
        <span>{summary}</span>
      </div>

      {controls.length === 0 ? (
        <p className="muted-copy">{emptyText}</p>
      ) : null}

      {controls.map((control) => {
        const categoryMeta = getCategoryMeta(control.controlType.category);
        const iconSrc = readControlTypeIcon({
          category: control.controlType.category,
          name: control.controlType.name,
        });
        return (
          <button
            className={`today-control-row ${control.status}`}
            key={control.controlType.id}
            onClick={() => onStartControl(control.controlType.id)}
            type="button"
          >
            <span className={`control-type-icon ${categoryMeta.className}`} aria-hidden="true">
              <AssetIcon src={iconSrc} fallback={categoryMeta.label} />
            </span>
            <span className="today-control-copy">
              <strong>{control.controlType.name}</strong>
              <span>{categoryMeta.name}</span>
            </span>
            <span className={getStatusClass(control.status)}>{getStatusText(control)}</span>
            <span className="row-chevron" aria-hidden="true">›</span>
          </button>
        );
      })}
    </section>
  );
}

export function TodayDashboard({
  organizationId,
  userId,
  displayName,
  onStartControl,
  canManage,
  firstRunMode,
  onOpenControlTypes,
}: TodayDashboardProps) {
  const [controls, setControls] = useState<TodayControl[]>([]);
  const [deviations, setDeviations] = useState<OpenDeviationSummary[]>([]);
  const [followUps, setFollowUps] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuideSnoozed, setInstallGuideSnoozed] = useState(() => readHomeScreenSnoozed());
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [installGuideStep, setInstallGuideStep] = useState(0);
  const [isStandalone] = useState(() => isRunningStandalone());
  const [isIos] = useState(() => isIosDevice());
  const [isAndroid] = useState(() => isAndroidDevice());
  const today = new Date();
  const firstName = getFirstName(displayName);

  const loadDashboard = useCallback(async (active = true) => {
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
  }, [organizationId]);

  useEffect(() => {
    let active = true;
    void loadDashboard(active);
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  useEffect(() => {
    return subscribePwaInstallPrompt(setInstallPrompt);
  }, []);

  const dailyControls = useMemo(
    () => controls.filter((control) => control.controlType.frequency === 'daily'),
    [controls],
  );

  const onDemandControls = useMemo(
    () => controls.filter((control) => control.controlType.frequency === 'per_delivery'),
    [controls],
  );

  const recurringControls = useMemo(
    () =>
      controls.filter(
        (control) => control.controlType.frequency === 'weekly' || control.controlType.frequency === 'custom',
      ),
    [controls],
  );

  const completedCount = useMemo(
    () => dailyControls.filter((control) => control.status !== 'not_done').length,
    [dailyControls],
  );

  const nextControl = useMemo(
    () =>
      dailyControls.find((control) => control.status === 'not_done') ??
      dailyControls[0] ??
      onDemandControls[0] ??
      recurringControls[0],
    [dailyControls, onDemandControls, recurringControls],
  );

  const hasAnyControls = controls.length > 0;

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

  async function handleInstallApp() {
    if (installPrompt) {
      await runPwaInstallPrompt();
      setInstallGuideSnoozed(true);
      return;
    }

    setInstallGuideOpen(true);
    setInstallGuideStep(0);
  }

  function handleSnoozeInstallGuide() {
    snoozeHomeScreenGuide();
    setInstallGuideSnoozed(true);
  }

  const homeScreenGuideSteps = useMemo(() => {
    if (isIos) {
      return [
        'Öppna Min Egenkontroll i Safari.',
        'Tryck på dela-ikonen längst ned i Safari.',
        'Välj Lägg till på hemskärmen.',
        'Bekräfta med Lägg till.',
      ];
    }

    if (isAndroid) {
      return [
        'Öppna Min Egenkontroll i Chrome.',
        'Tryck på webbläsarens meny med tre punkter.',
        'Välj Lägg till på hemskärmen.',
        'Bekräfta när Chrome frågar.',
      ];
    }

    return [
      'Öppna Min Egenkontroll i mobilens webbläsare.',
      'Öppna webbläsarens delnings- eller menyknapp.',
      'Välj Lägg till på hemskärmen om alternativet finns.',
      'Bekräfta och öppna appen från hemskärmen nästa gång.',
    ];
  }, [isAndroid, isIos]);

  const showHomeScreenGuide = firstRunMode && !loading && !isStandalone && !installGuideSnoozed;

  return (
    <section className="today-dashboard" aria-labelledby="today-title">
      <div className="today-hero">
        <div>
          <p className="eyebrow">Idag</p>
          <h3 id="today-title">{firstName ? `${getGreeting(today)}, ${firstName}` : getGreeting(today)}</h3>
          <p className="today-date">{formatDate(today)}</p>
        </div>
        <span className="today-weather" aria-hidden="true">☀</span>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}
      {loading ? <p className="muted-copy">Laddar dagens arbete...</p> : null}

      {firstRunMode && !loading ? (
        <section className="first-run-panel" aria-labelledby="first-run-title">
          <div>
            <p className="eyebrow">{getFirstRunCopy(firstRunMode).eyebrow}</p>
            <h4 id="first-run-title">{getFirstRunCopy(firstRunMode).title}</h4>
            <p className="muted-copy">{getFirstRunCopy(firstRunMode).copy}</p>
          </div>
          {showHomeScreenGuide ? (
            <div className="home-screen-guide" aria-labelledby="home-screen-guide-title">
              <div className="home-screen-guide-icon" aria-hidden="true">ME</div>
              <div className="home-screen-guide-copy">
                <p className="eyebrow">Snabbare nästa gång</p>
                <h4 id="home-screen-guide-title">Lägg till Min Egenkontroll på hemskärmen</h4>
                <p>
                  Öppna Min Egenkontroll direkt från hemskärmen. Det tar bara några sekunder och gör appen snabbare att använda varje dag.
                </p>

                <div className="home-screen-actions">
                  <button className="home-screen-primary" type="button" onClick={handleInstallApp}>
                    Lägg till på hemskärmen
                  </button>
                  <button className="home-screen-skip" type="button" onClick={handleSnoozeInstallGuide}>
                    Påminn mig senare
                  </button>
                </div>

                {installGuideOpen ? (
                  <div className="home-screen-step-card" aria-live="polite">
                    <span>Steg {installGuideStep + 1} av {homeScreenGuideSteps.length}</span>
                    <p>{homeScreenGuideSteps[installGuideStep]}</p>
                    <div className="home-screen-step-actions">
                      <button
                        className="home-screen-skip"
                        disabled={installGuideStep === 0}
                        type="button"
                        onClick={() => setInstallGuideStep((current) => Math.max(0, current - 1))}
                      >
                        Tillbaka
                      </button>
                      <button
                        className="home-screen-primary"
                        type="button"
                        onClick={() => {
                          if (installGuideStep === homeScreenGuideSteps.length - 1) {
                            handleSnoozeInstallGuide();
                            return;
                          }
                          setInstallGuideStep((current) => Math.min(homeScreenGuideSteps.length - 1, current + 1));
                        }}
                      >
                        {installGuideStep === homeScreenGuideSteps.length - 1 ? 'Klart' : 'Nästa'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          {nextControl ? (
            <ActionButton type="button" onClick={() => onStartControl(nextControl.controlType.id)}>
              {getFirstRunCopy(firstRunMode).action}
            </ActionButton>
          ) : null}
        </section>
      ) : null}

      <div className="today-summary">
        <div>
          <span>Dagens kontroller</span>
          <strong>{completedCount} av {dailyControls.length} klara</strong>
        </div>
        <div>
          <span>Öppna avvikelser</span>
          <strong>{deviations.length}</strong>
        </div>
      </div>

      <div className="today-list" aria-label="Dagens kontroller">
        {!loading ? (
          <>
            {!hasAnyControls ? (
              <section className="empty-view-card today-empty-state" aria-labelledby="today-empty-title">
                <p className="eyebrow">Inga aktiva kontroller</p>
                <h4 id="today-empty-title">Det finns inget att utföra ännu</h4>
                <p className="muted-copy">
                  {canManage
                    ? 'Aktivera eller skapa kontrolltyper under Meny -> Kontrolltyper. När minst en kontroll är aktiv visas den här.'
                    : 'En administratör behöver aktivera eller skapa kontroller innan du kan utföra dagens arbete.'}
                </p>
                {canManage ? (
                  <ActionButton type="button" variant="secondary" onClick={onOpenControlTypes}>
                    Öppna kontrolltyper
                  </ActionButton>
                ) : null}
              </section>
            ) : null}
            <ControlSection
              title="Ska göras idag"
              summary={`${completedCount} av ${dailyControls.length} klara`}
              emptyText="Inga dagliga kontroller är aktiva ännu."
              controls={dailyControls}
              onStartControl={onStartControl}
            />
            <ControlSection
              title="Vid behov"
              summary={`${onDemandControls.length} startbara`}
              emptyText="Inga kontroller vid behov är aktiva ännu."
              controls={onDemandControls}
              onStartControl={onStartControl}
            />
            <ControlSection
              title="Återkommande"
              summary={`${recurringControls.length} aktiva`}
              emptyText="Inga återkommande kontroller är aktiva ännu."
              controls={recurringControls}
              onStartControl={onStartControl}
            />
          </>
        ) : null}
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
