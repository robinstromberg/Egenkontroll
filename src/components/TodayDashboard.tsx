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

function getHomeScreenSnoozeKey(organizationId: string, userId: string) {
  return `${HOME_SCREEN_SNOOZE_KEY}:${organizationId}:${userId}`;
}

function readHomeScreenSnoozed(storageKey: string) {
  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return false;
    const snoozedUntil = Number(value);
    return Number.isFinite(snoozedUntil) && snoozedUntil > Date.now();
  } catch {
    return false;
  }
}

function snoozeHomeScreenGuide(storageKey: string) {
  try {
    window.localStorage.setItem(storageKey, String(Date.now() + HOME_SCREEN_SNOOZE_MS));
  } catch {
    // localStorage can be unavailable in private browsing; component state still hides the card.
  }
}

type HomeScreenGuideStep = {
  title: string;
  body: string;
  hint: string;
  visual: 'safari' | 'share-sheet' | 'add-dialog' | 'home-screen';
};

const homeScreenGuideVisuals: Record<HomeScreenGuideStep['visual'], string> = {
  safari: '/pwa-onboarding/step-1.png',
  'share-sheet': '/pwa-onboarding/step-2.png',
  'add-dialog': '/pwa-onboarding/step-3.png',
  'home-screen': '/pwa-onboarding/step-4.png',
};

const iosHomeScreenGuideSteps: HomeScreenGuideStep[] = [
  {
    title: 'Tryck på dela-ikonen',
    body: 'Tryck på dela-ikonen längst ned i Safari.',
    hint: 'Om du inte ser knapparna längst ned, tryck på sidan eller scrolla lite så visas de igen.',
    visual: 'safari',
  },
  {
    title: 'Välj Lägg till på hemskärmen',
    body: 'Bläddra ned i delningsmenyn och välj Lägg till på hemskärmen.',
    hint: 'Raden ligger ofta längre ned bland alternativen.',
    visual: 'share-sheet',
  },
  {
    title: 'Bekräfta med Lägg till',
    body: 'Kontrollera att namnet är Min Egenkontroll och tryck på Lägg till uppe till höger.',
    hint: 'Namnet ska vara Min Egenkontroll.',
    visual: 'add-dialog',
  },
  {
    title: 'Klart',
    body: 'Nästa gång öppnar du Min Egenkontroll direkt från hemskärmen.',
    hint: 'Appen öppnas som en vanlig app, men internet krävs för att spara kontroller.',
    visual: 'home-screen',
  },
];

const fallbackHomeScreenGuideSteps: HomeScreenGuideStep[] = [
  {
    title: 'Öppna webbläsarens meny',
    body: 'Öppna webbläsarens delnings- eller menyknapp.',
    hint: 'Knappen kan se olika ut beroende på webbläsare.',
    visual: 'safari',
  },
  {
    title: 'Välj Lägg till på hemskärmen',
    body: 'Välj Lägg till på hemskärmen om alternativet finns.',
    hint: 'I Chrome kan det även stå Installera app.',
    visual: 'share-sheet',
  },
  {
    title: 'Bekräfta',
    body: 'Bekräfta när webbläsaren frågar.',
    hint: 'Behåll namnet Min Egenkontroll om du får välja.',
    visual: 'add-dialog',
  },
  {
    title: 'Klart',
    body: 'Öppna Min Egenkontroll från hemskärmen nästa gång.',
    hint: 'Du slipper leta upp webbadressen igen, men internet krävs för att spara kontroller.',
    visual: 'home-screen',
  },
];

function HomeScreenGuideVisual({ step }: { step: HomeScreenGuideStep }) {
  return (
    <figure className={`home-screen-visual ${step.visual}`} aria-hidden="true">
      <img src={homeScreenGuideVisuals[step.visual]} alt="" />
    </figure>
  );
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
  const homeScreenSnoozeKey = getHomeScreenSnoozeKey(organizationId, userId);
  const [installGuideSnoozed, setInstallGuideSnoozed] = useState(() => readHomeScreenSnoozed(homeScreenSnoozeKey));
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [installGuideStep, setInstallGuideStep] = useState(0);
  const [isStandalone] = useState(() => isRunningStandalone());
  const [isIos] = useState(() => isIosDevice());
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

  useEffect(() => {
    setInstallGuideSnoozed(readHomeScreenSnoozed(homeScreenSnoozeKey));
    setInstallGuideOpen(false);
    setInstallGuideStep(0);
  }, [homeScreenSnoozeKey]);

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
      const outcome = await runPwaInstallPrompt();
      if (outcome === 'accepted') {
        snoozeHomeScreenGuide(homeScreenSnoozeKey);
        setInstallGuideSnoozed(true);
      }
      return;
    }

    setInstallGuideOpen(true);
    setInstallGuideStep(0);
  }

  function handleSnoozeInstallGuide() {
    snoozeHomeScreenGuide(homeScreenSnoozeKey);
    setInstallGuideSnoozed(true);
  }

  const homeScreenGuideSteps = useMemo(() => {
    return isIos ? iosHomeScreenGuideSteps : fallbackHomeScreenGuideSteps;
  }, [isIos]);

  const currentInstallGuideStep = homeScreenGuideSteps[installGuideStep] ?? homeScreenGuideSteps[0];

  const showHomeScreenGuide = !loading && !isStandalone && !installGuideSnoozed;

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
          {nextControl ? (
            <ActionButton type="button" onClick={() => onStartControl(nextControl.controlType.id)}>
              {getFirstRunCopy(firstRunMode).action}
            </ActionButton>
          ) : null}
        </section>
      ) : null}

      {showHomeScreenGuide ? (
        <section className="home-screen-guide persistent-home-screen-guide" aria-labelledby="home-screen-guide-title">
          <div className="home-screen-guide-icon" aria-hidden="true">ME</div>
          <div className="home-screen-guide-copy">
            <p className="eyebrow">Snabbare varje dag</p>
            <h4 id="home-screen-guide-title">Lägg till Min Egenkontroll på hemskärmen</h4>
            <p>
              Öppna appen direkt från hemskärmen. Internet krävs fortfarande för att spara kontroller.
              Vi fortsätter påminna tills du öppnar den som hemskärmsapp.
            </p>

            <div className="home-screen-actions">
              <button className="home-screen-primary" type="button" onClick={handleInstallApp}>
                {installPrompt ? 'Installera appen' : 'Visa guide'}
              </button>
              <button className="home-screen-skip" type="button" onClick={handleSnoozeInstallGuide}>
                Påminn mig senare
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {showHomeScreenGuide && installGuideOpen ? (
        <div className="home-screen-guide-overlay" role="presentation">
          <section
            aria-labelledby="home-screen-dialog-title"
            aria-modal="true"
            className="home-screen-guide-dialog"
            role="dialog"
          >
            <div className="home-screen-dialog-heading">
              <div>
                <p className="eyebrow">Lägg till på hemskärmen</p>
                <h3 id="home-screen-dialog-title">
                  Lägg till <span>Min Egenkontroll</span> på hemskärmen
                </h3>
                <p>Öppna appen direkt från hemskärmen. Det tar bara några sekunder. Internet krävs för att spara kontroller.</p>
              </div>
              <button
                aria-label="Stäng guiden"
                className="home-screen-dialog-close"
                type="button"
                onClick={() => setInstallGuideOpen(false)}
              >
                Stäng
              </button>
            </div>

            <div className="home-screen-progress" aria-label={`Steg ${installGuideStep + 1} av ${homeScreenGuideSteps.length}`}>
              {homeScreenGuideSteps.map((step, index) => (
                <button
                  aria-current={index === installGuideStep ? 'step' : undefined}
                  aria-label={`Gå till steg ${index + 1}: ${step.title}`}
                  className={index === installGuideStep ? 'active' : ''}
                  key={step.title}
                  type="button"
                  onClick={() => setInstallGuideStep(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="home-screen-dialog-body">
              <HomeScreenGuideVisual step={currentInstallGuideStep} />
              <div className="home-screen-dialog-copy" aria-live="polite">
                <span>Steg {installGuideStep + 1} av {homeScreenGuideSteps.length}</span>
                <h4>{currentInstallGuideStep.title}</h4>
                <p>{currentInstallGuideStep.body}</p>
                <div className="home-screen-tip">
                  <strong>Tips</strong>
                  <p>{currentInstallGuideStep.hint}</p>
                </div>
              </div>
            </div>

            <div className="home-screen-dialog-actions">
              <button className="home-screen-skip" type="button" onClick={handleSnoozeInstallGuide}>
                Påminn mig senare
              </button>
              <div>
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
                      setInstallGuideOpen(false);
                      return;
                    }
                    setInstallGuideStep((current) => Math.min(homeScreenGuideSteps.length - 1, current + 1));
                  }}
                >
                  {installGuideStep === homeScreenGuideSteps.length - 1 ? 'Klart' : 'Nästa'}
                </button>
              </div>
            </div>
          </section>
        </div>
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
