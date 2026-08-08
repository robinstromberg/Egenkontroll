import type { KeyboardEvent } from 'react';
import { SegmentedChoice } from './ui/SegmentedChoice';
import {
  createEmptyColdStorageEntry,
  getColdStorageEntryDeviation,
  getColdStorageEntryError,
  isColdStorageEntryComplete,
  parseTemperatureInput,
} from '../services/coldStorageControl';
import type {
  ColdStorageBinding,
  ColdStorageEntry,
  ColdStorageFollowUpStatus,
  ColdStorageFoodAction,
  ColdStorageNotApplicableReason,
  ColdStorageUnitAction,
} from '../services/coldStorageControl';
import { getTemperatureLimits } from '../services/controlFieldRules';

type ColdStorageControlFieldsProps = {
  bindings: ColdStorageBinding[];
  entries: Record<string, ColdStorageEntry>;
  draftStarted: boolean;
  draftRestored: boolean;
  onChange: (key: string, entry: ColdStorageEntry) => void;
  onDiscardDraft: () => void;
};

const notApplicableOptions: Array<{ label: string; value: ColdStorageNotApplicableReason }> = [
  { label: 'Tom och avstängd', value: 'empty_and_off' },
  { label: 'Tillfälligt ur bruk', value: 'temporarily_out_of_service' },
  { label: 'Annan orsak', value: 'other' },
];

const foodActionOptions: Array<{ label: string; value: ColdStorageFoodAction }> = [
  { label: 'Inga varor påverkades', value: 'none_affected' },
  { label: 'Varorna flyttades', value: 'moved' },
  { label: 'Varorna kasserades', value: 'discarded' },
  { label: 'Annan åtgärd', value: 'other' },
];

const unitActionOptions: Array<{ label: string; value: ColdStorageUnitAction }> = [
  { label: 'Enheten justerades', value: 'adjusted' },
  { label: 'Enheten stängdes av', value: 'switched_off' },
  { label: 'Service kontaktades', value: 'service_contacted' },
  { label: 'Ingen åtgärd behövdes', value: 'none_needed' },
  { label: 'Annan åtgärd', value: 'other' },
];

function formatLimitValue(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${String(value).replace('.', ',')}`;
}

function readLimitText(binding: ColdStorageBinding): string {
  const { limitMin, limitMax, unit } = getTemperatureLimits(binding.field, binding.object);
  if (limitMin !== null && limitMax !== null) {
    return `${formatLimitValue(limitMin)} till ${formatLimitValue(limitMax)} ${unit}`;
  }
  if (limitMax !== null) return `Högst ${formatLimitValue(limitMax)} ${unit}`;
  if (limitMin !== null) return `Lägst ${formatLimitValue(limitMin)} ${unit}`;
  return 'Åtgärdsgräns saknas';
}

function readMeasurementMethod(binding: ColdStorageBinding): string | null {
  const metadata = binding.object.metadata;
  const method = metadata.measurement_method ?? metadata.measurementMethod;
  return typeof method === 'string' && method.trim() ? method.trim() : null;
}

function readEntryStatus(binding: ColdStorageBinding, entry: ColdStorageEntry): {
  symbol: string;
  text: string;
  tone: 'neutral' | 'good' | 'bad';
} {
  if (entry.notApplicable) {
    return isColdStorageEntryComplete(binding, entry)
      ? { symbol: '–', text: 'Ej i drift', tone: 'neutral' }
      : { symbol: '○', text: 'Orsak saknas', tone: 'neutral' };
  }
  if (!entry.temperature.trim()) return { symbol: '○', text: 'Ej ifylld', tone: 'neutral' };
  if (!parseTemperatureInput(entry.temperature)) return { symbol: '!', text: 'Ogiltigt värde', tone: 'bad' };
  if (getColdStorageEntryDeviation(binding, entry)) {
    return isColdStorageEntryComplete(binding, entry)
      ? { symbol: '!', text: 'Avvikelse dokumenterad', tone: 'bad' }
      : { symbol: '!', text: 'Avvikelse behöver dokumenteras', tone: 'bad' };
  }
  return { symbol: '✓', text: 'Inom åtgärdsgräns', tone: 'good' };
}

function focusNextTemperature(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  const fields = Array.from(
    event.currentTarget.form?.querySelectorAll<HTMLInputElement>('[data-cold-temperature]:not(:disabled)') ?? [],
  );
  const nextField = fields[fields.indexOf(event.currentTarget) + 1];
  nextField?.focus();
}

export function ColdStorageControlFields({
  bindings,
  entries,
  draftStarted,
  draftRestored,
  onChange,
  onDiscardDraft,
}: ColdStorageControlFieldsProps) {
  const completedCount = bindings.filter((binding) => (
    isColdStorageEntryComplete(binding, entries[binding.key] ?? createEmptyColdStorageEntry())
  )).length;

  function updateEntry(key: string, updates: Partial<ColdStorageEntry>) {
    onChange(key, { ...(entries[key] ?? createEmptyColdStorageEntry()), ...updates });
  }

  return (
    <div className="cold-storage-flow">
      <div className="cold-storage-progress" role="status" aria-live="polite">
        <strong>{completedCount} av {bindings.length} aktiva enheter klara</strong>
        <span>Alla behöver temperatur eller ett komplett Ej i drift-val.</span>
      </div>

      {draftStarted || draftRestored ? (
        <div className="cold-storage-draft-note" role="status">
          <div>
            <strong>{draftRestored ? 'Lokalt utkast återställt' : 'Lokalt utkast bevaras'}</strong>
            <span>Utkastet finns bara på den här enheten. Det är inte en sparad kontroll.</span>
          </div>
          <button className="cold-storage-text-button" type="button" onClick={onDiscardDraft}>
            Kassera utkast
          </button>
        </div>
      ) : null}

      {bindings.map((binding, index) => {
        const entry = entries[binding.key] ?? createEmptyColdStorageEntry();
        const deviation = getColdStorageEntryDeviation(binding, entry);
        const error = getColdStorageEntryError(binding, entry);
        const status = readEntryStatus(binding, entry);
        const measurementMethod = readMeasurementMethod(binding);
        const inputId = `cold-temperature-${binding.object.id}`;

        return (
          <section className={deviation ? 'cold-storage-row has-deviation' : 'cold-storage-row'} key={binding.key}>
            <div className="cold-storage-row-heading">
              <div>
                <h4>{binding.object.name}</h4>
                {binding.object.location ? <p>{binding.object.location}</p> : null}
              </div>
              <span className={`cold-storage-status ${status.tone}`}>
                <span aria-hidden="true">{status.symbol}</span>
                {status.text}
              </span>
            </div>

            <div className="cold-storage-instructions">
              <span><strong>Företagets gräns:</strong> {readLimitText(binding)}</span>
              {measurementMethod ? <span><strong>Mätmetod:</strong> {measurementMethod}</span> : null}
              {binding.object.instructions ? <span><strong>Instruktion:</strong> {binding.object.instructions}</span> : null}
            </div>

            <div className="cold-storage-temperature-field">
              <label htmlFor={inputId}>Temperatur</label>
              <div className="temperature-input-row">
                <input
                  className="text-input temperature-input"
                  data-cold-temperature
                  disabled={entry.notApplicable}
                  enterKeyHint={index === bindings.length - 1 ? 'done' : 'next'}
                  id={inputId}
                  inputMode="decimal"
                  type="text"
                  value={entry.temperature}
                  onChange={(event) => updateEntry(binding.key, { temperature: event.target.value })}
                  onKeyDown={focusNextTemperature}
                  aria-describedby={`${inputId}-hint`}
                />
                <span className="temperature-unit">°C</span>
              </div>
              <span className="field-hint" id={`${inputId}-hint`}>Komma, punkt och negativa decimaler fungerar.</span>
            </div>

            <label className="cold-storage-checkbox">
              <input
                checked={entry.notApplicable}
                type="checkbox"
                onChange={(event) => updateEntry(binding.key, { notApplicable: event.target.checked })}
              />
              Ej i drift
            </label>

            {entry.notApplicable ? (
              <div className="cold-storage-expanded-panel">
                <p>Temperaturproblem ska registreras som temperatur och avvikelse, inte döljas som Ej i drift.</p>
                <label htmlFor={`${inputId}-not-applicable`}>
                  Orsak
                  <select
                    className="text-input"
                    id={`${inputId}-not-applicable`}
                    value={entry.notApplicableReason}
                    onChange={(event) => updateEntry(binding.key, {
                      notApplicableReason: event.target.value as ColdStorageNotApplicableReason | '',
                    })}
                  >
                    <option value="">Välj orsak</option>
                    {notApplicableOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                {entry.notApplicableReason === 'other' ? (
                  <label htmlFor={`${inputId}-not-applicable-note`}>
                    Beskriv orsaken
                    <textarea
                      className="text-input"
                      id={`${inputId}-not-applicable-note`}
                      value={entry.notApplicableNote}
                      onChange={(event) => updateEntry(binding.key, { notApplicableNote: event.target.value })}
                    />
                  </label>
                ) : null}
              </div>
            ) : null}

            {deviation ? (
              <div className="cold-storage-deviation-panel">
                <strong>Värdet ligger utanför företagets åtgärdsgräns.</strong>

                <label htmlFor={`${inputId}-food-action`}>
                  Hur hanterades varorna?
                  <select
                    className="text-input"
                    id={`${inputId}-food-action`}
                    value={entry.foodAction}
                    onChange={(event) => updateEntry(binding.key, {
                      foodAction: event.target.value as ColdStorageFoodAction | '',
                    })}
                  >
                    <option value="">Välj hantering</option>
                    {foodActionOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label htmlFor={`${inputId}-unit-action`}>
                  Vad gjordes med enheten?
                  <select
                    className="text-input"
                    id={`${inputId}-unit-action`}
                    value={entry.unitAction}
                    onChange={(event) => updateEntry(binding.key, {
                      unitAction: event.target.value as ColdStorageUnitAction | '',
                    })}
                  >
                    <option value="">Välj åtgärd</option>
                    {unitActionOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label htmlFor={`${inputId}-check-measurement`}>
                  Kontrollmätning (valfri)
                  <div className="temperature-input-row">
                    <input
                      className="text-input temperature-input"
                      id={`${inputId}-check-measurement`}
                      inputMode="decimal"
                      type="text"
                      value={entry.checkMeasurement}
                      onChange={(event) => updateEntry(binding.key, { checkMeasurement: event.target.value })}
                    />
                    <span className="temperature-unit">°C</span>
                  </div>
                </label>

                <SegmentedChoice
                  id={`${inputId}-follow-up`}
                  label="Uppföljning"
                  value={entry.followUpStatus}
                  onChange={(value) => updateEntry(binding.key, {
                    followUpStatus: value as ColdStorageFollowUpStatus,
                  })}
                  options={[
                    { label: 'Löst', tone: 'good', value: 'resolved' },
                    { label: 'Behöver följas upp', tone: 'bad', value: 'open' },
                  ]}
                />

                <label htmlFor={`${inputId}-action-note`}>
                  Komplettering {entry.foodAction === 'other' || entry.unitAction === 'other' ? '(krävs)' : '(valfri)'}
                  <textarea
                    className="text-input"
                    id={`${inputId}-action-note`}
                    value={entry.actionNote}
                    onChange={(event) => updateEntry(binding.key, { actionNote: event.target.value })}
                  />
                </label>
              </div>
            ) : null}

            {error && (entry.temperature.trim() || entry.notApplicable) ? (
              <p className="form-message error-message" role="alert">{error}</p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
