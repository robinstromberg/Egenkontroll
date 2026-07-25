import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Field, LinkButton, SearchField, TextField } from '@min-egenkontroll/design-system';
import { getAppThemeRuntime, type ThemePreference } from '../theme/appTheme';
import {
  AppIconButton,
  AppSectionCard,
  AppStatusIndicator,
  AppSurface,
} from './ui/AppPrimitives';
import { AppBottomNav, type AppView } from './AppBottomNav';
import './DesignSystemShowcase.css';

const themeLabels: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Ljust',
  dark: 'Mörkt',
};

export function DesignSystemShowcase() {
  const themeRuntime = getAppThemeRuntime();
  const [themeState, setThemeState] = useState(() => themeRuntime.getState());
  const [searchMessage, setSearchMessage] = useState('');
  const [showcaseView, setShowcaseView] = useState<AppView>('today');

  useEffect(() => themeRuntime.subscribe(setThemeState), [themeRuntime]);

  return (
    <main className="ds-showcase">
      <div className="ds-showcase__shell">
        <header className="ds-showcase__header">
          <div>
            <p>Utvecklingsyta · inte indexerad</p>
            <h1>Designsystemets kärna</h1>
            <p>Semantiska tokens, generella primitiver och appkompositioner i samma temaruntime som produkten.</p>
          </div>
          <div className="ds-showcase__theme" aria-label="Temaläge">
            {(Object.keys(themeLabels) as ThemePreference[]).map((preference) => (
              <Button
                aria-pressed={themeState.preference === preference}
                key={preference}
                onClick={() => setThemeState(themeRuntime.setPreference(preference))}
                variant={themeState.preference === preference ? 'primary' : 'secondary'}
              >
                {themeLabels[preference]}
              </Button>
            ))}
            <small>Aktivt tema: {themeLabels[themeState.resolvedTheme]}</small>
          </div>
        </header>

        <div className="ds-showcase__grid">
          <Card className="ds-showcase__card" elevated>
            <h2>Handlingar och status</h2>
            <div className="ds-showcase__actions">
              <Button>Primär handling</Button>
              <Button variant="secondary">Sekundär</Button>
              <Button variant="danger">Åtgärd krävs</Button>
              <Button variant="ghost">Diskret</Button>
              <Button disabled>Inaktiverad</Button>
              <Button loading loadingText="Sparar...">Spara</Button>
              <LinkButton href="#falt">Länkhandling</LinkButton>
            </div>
            <div className="ds-showcase__badges" aria-label="Statusexempel">
              <Badge tone="success">Klar</Badge>
              <Badge tone="warning">Väntar på kontroll</Badge>
              <Badge tone="danger">Avvikelse</Badge>
              <Badge>Planerad</Badge>
            </div>
            <Alert tone="success" title="Kontrollen är sparad">Resultatet finns nu i historiken.</Alert>
            <Alert tone="warning" title="Kontrollera före användning">Anpassa alltid rutinen till verksamheten.</Alert>
            <Alert tone="danger" title="Åtgärd krävs">Beskriv åtgärden innan kontrollen sparas.</Alert>
            <Alert title="Information">Detta är ett neutralt meddelande.</Alert>
          </Card>

          <Card className="ds-showcase__card" id="falt">
            <h2>Fält och återkoppling</h2>
            <Field id="showcase-name" label="Verksamhetens namn" hint="Använd namnet som personalen känner igen." required>
              {(controlProps) => <TextField {...controlProps} placeholder="Exempel Café Eken" />}
            </Field>
            <Field id="showcase-temperature" label="Kontrollvärde" error="Ange ett värde i grader, till exempel 6,8.">
              {(controlProps) => <TextField {...controlProps} inputMode="decimal" placeholder="6,8" />}
            </Field>
            <SearchField
              label="Sök i vägledning"
              placeholder="Sök i mallar och checklistor"
              onSearch={(value) => setSearchMessage(value ? `Sökningen “${value}” är bara ett showcase-exempel.` : 'Skriv en sökfras för att prova sökfältet.')}
            />
            {searchMessage ? <Alert live="polite" title="Sökfält" tone="neutral">{searchMessage}</Alert> : null}
          </Card>

          <AppSurface className="ds-showcase__app-surface">
            <div className="ds-showcase__app-heading">
              <div>
                <p>Appkomposition</p>
                <h2>Återkommande produktmönster</h2>
              </div>
              <AppIconButton aria-label="Fler alternativ"><span aria-hidden="true">•••</span></AppIconButton>
            </div>
            <div className="ds-showcase__badges">
              <AppStatusIndicator tone="success">Klar</AppStatusIndicator>
              <AppStatusIndicator tone="warning">Behöver kontrolleras</AppStatusIndicator>
              <AppStatusIndicator tone="danger">Avvikelse</AppStatusIndicator>
            </div>
            <AppSectionCard>
              <strong>Temperaturkontroll</strong>
              <span>Appkortet behåller produktens etablerade mått och använder semantiska tokens.</span>
            </AppSectionCard>
            <div className="ds-showcase__app-nav">
              <AppBottomNav activeView={showcaseView} onChangeView={setShowcaseView} />
            </div>
          </AppSurface>
        </div>
      </div>
    </main>
  );
}
