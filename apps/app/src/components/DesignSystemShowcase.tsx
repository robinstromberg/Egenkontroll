import { useState } from 'react';
import { Alert, Badge, Button, Card, Field, LinkButton, SearchField, TextField } from '@min-egenkontroll/design-system';
import './DesignSystemShowcase.css';

type Theme = 'light' | 'dark';

export function DesignSystemShowcase() {
  const [theme, setTheme] = useState<Theme>(() => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [searchMessage, setSearchMessage] = useState('');

  return (
    <main className="ds-showcase" data-theme={theme}>
      <div className="ds-showcase__shell">
        <header className="ds-showcase__header">
          <div>
            <p>Utvecklingsyta · inte indexerad</p>
            <h1>Designsystemets kärna</h1>
            <p>Semantiska tokens och små produktionsanpassade primitiver. Ytan finns endast i utvecklingsläge.</p>
          </div>
          <Button variant="secondary" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}>
            Växla till {theme === 'light' ? 'mörkt' : 'ljust'} läge
          </Button>
        </header>

        <div className="ds-showcase__grid">
          <Card className="ds-showcase__card" elevated>
            <h2>Handlingar och status</h2>
            <div className="ds-showcase__actions">
              <Button>Primär handling</Button>
              <Button variant="secondary">Sekundär</Button>
              <Button variant="danger">Åtgärd krävs</Button>
              <LinkButton href="#falt">Länkhandling</LinkButton>
            </div>
            <div className="ds-showcase__badges" aria-label="Statusexempel">
              <Badge tone="success">Klar</Badge>
              <Badge tone="warning">Väntar på kontroll</Badge>
              <Badge tone="danger">Avvikelse</Badge>
              <Badge>Planerad</Badge>
            </div>
            <Alert tone="warning" title="Kontrollera före användning">
              En mall eller guide behöver alltid anpassas till verksamhetens faktiska rutiner.
            </Alert>
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
        </div>
      </div>
    </main>
  );
}
