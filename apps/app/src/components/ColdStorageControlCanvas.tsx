import { SegmentedChoice } from './ui/SegmentedChoice';
import {
  createEmptyColdStorageUnitState,
  getColdStorageTemperatureField,
  validateColdStorageUnit,
} from '../services/coldStorageControl';
import type {
  ColdStorageEquipmentAction,
  ColdStorageGoodsAction,
  ColdStorageNotApplicableReason,
  ColdStorageResolution,
  ColdStorageUnitState,
  ColdStorageUnitStateMap,
} from '../services/coldStorageControl';
import {
  getTemperatureDeviationReason,
  getTemperatureLimitText,
  getTemperatureUnit,
  parseTemperatureInput,
} from '../services/controlFieldRules';
import type { ControlFieldDefinition, ControlObject } from '../types/database';
import { responseKey } from './ControlDefinitionCanvasLogic';

type ColdStorageControlCanvasProps = {
  objects: ControlObject[];
  fields: ControlFieldDefinition[];
  responses: Record<string, string>;
  units: ColdStorageUnitStateMap;
  onResponseChange: (key: string, value: string) => void;
  onUnitChange: (key: string, patch: Partial<ColdStorageUnitState>) => void;
  onNotApplicableChange: (key: string, enabled: boolean) => void;
};

const notApplicableOptions: Array<{ label: string; value: ColdStorageNotApplicableReason }> = [
  { label: 'Tom och avstängd', value: 'empty_powered_off' },
  { label: 'Tillfälligt ur bruk', value: 'temporarily_out_of_service' },
  { label: 'Annan orsak', value: 'other' },
];

const goodsActionOptions: Array<{ label: string; value: ColdStorageGoodsAction }> = [
  { label: 'Inga varor påverkades', value: 'unaffected' },
  { label: 'Varorna flyttades', value: 'moved' },
  { label: 'Varorna kasserades', value: 'discarded' },
  { label: 'Annan åtgärd', value: 'other' },
];

const equipmentActionOptions: Array<{ label: string; value: ColdStorageEquipmentAction }> = [
  { label: 'Enheten justerades', value: 'adjusted' },
  { label: 'Enheten stängdes av', value: 'shut_down' },
  { label: 'Service kontaktades', value: 'service_contacted' },
  { label: 'Ingen åtgärd behövdes', value: 'no_action_needed' },
  { label: 'Annan åtgärd', value: 'other' },
];

export function ColdStorageControlCanvas({
  objects,
  fields,
  responses,
  units,
  onResponseChange,
  onUnitChange,
  onNotApplicableChange,
}: ColdStorageControlCanvasProps) {
  const rows = objects.flatMap((object) => {
    const field = getColdStorageTemperatureField(fields, object);
    return field ? [{ field, object, key: responseKey(object.id, field.id) }] : [];
  });

  function focusNextTemperature(currentIndex: number) {
    const next = rows[currentIndex + 1];
    if (next) document.getElementById(next.key)?.focus();
  }

  return (
    <div className="cold-storage-canvas">
      {rows.map(({ field, object, key }, index) => {
        const value = responses[key] ?? '';
        const unitState = units[key] ?? createEmptyColdStorageUnitState();
        const parsed = parseTemperatureInput(value);
        const reason = unitState.notApplicable ? null : getTemperatureDeviationReason(field, object, value);
        const validation = validateColdStorageUnit(value, unitState, Boolean(reason));
        const status = unitState.notApplicable
          ? { className: 'neutral', icon: '–', text: 'Ej i drift' }
          : parsed.status === 'empty'
            ? { className: 'neutral', icon: '○', text: 'Väntar på värde' }
            : parsed.status === 'invalid'
              ? { className: 'bad', icon: '!', text: 'Ogiltigt värde' }
              : reason
                ? { className: 'bad', icon: '!', text: 'Utanför gränsvärde' }
                : { className: 'good', icon: '✓', text: 'Inom gränsvärde' };
        const showOtherAction = unitState.goodsAction === 'other' || unitState.equipmentAction === 'other';
        const showValidation = parsed.status === 'invalid'
          || (unitState.notApplicable && Boolean(validation))
          || (Boolean(reason) && Boolean(
            unitState.goodsAction
            || unitState.equipmentAction
            || unitState.recheckTemperature
            || unitState.resolution
            || unitState.note,
          ) && Boolean(validation));

        return (
          <section className="control-group cold-storage-unit" key={key} aria-labelledby={`${key}:title`}>
            <div className="cold-storage-unit-heading">
              <div>
                <h4 id={`${key}:title`}>{object.name}</h4>
                {object.location ? <p className="muted-copy">{object.location}</p> : null}
              </div>
              <span className={`cold-storage-status ${status.className}`}>
                <span aria-hidden="true">{status.icon}</span>
                {status.text}
              </span>
            </div>

            {object.instructions ? <p className="cold-storage-instruction">{object.instructions}</p> : null}

            <div className="control-field">
              <label htmlFor={key}>{field.label}</label>
              <div className="temperature-input-row">
                <input
                  aria-describedby={`${key}:temperature-meta`}
                  aria-invalid={parsed.status === 'invalid'}
                  aria-label={`${field.label}, ${object.name}`}
                  className="text-input temperature-input"
                  disabled={unitState.notApplicable}
                  enterKeyHint={index === rows.length - 1 ? 'done' : 'next'}
                  id={key}
                  inputMode="decimal"
                  placeholder="Ange temperatur"
                  required={!unitState.notApplicable}
                  type="text"
                  value={value}
                  onChange={(event) => onResponseChange(key, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' || index === rows.length - 1) return;
                    event.preventDefault();
                    focusNextTemperature(index);
                  }}
                />
                <span className="temperature-unit">{getTemperatureUnit(field, object)}</span>
              </div>
              <div className="temperature-meta-row" id={`${key}:temperature-meta`}>
                <span>Åtgärdsgräns: {getTemperatureLimitText(field, object) ?? 'saknas'}</span>
                <span>Obligatorisk</span>
              </div>
            </div>

            <button
              aria-label={`Ej i drift, ${object.name}`}
              aria-pressed={unitState.notApplicable}
              className={unitState.notApplicable ? 'cold-storage-na-toggle selected' : 'cold-storage-na-toggle'}
              type="button"
              onClick={() => onNotApplicableChange(key, !unitState.notApplicable)}
            >
              <span aria-hidden="true">{unitState.notApplicable ? '✓' : '○'}</span>
              Ej i drift
            </button>

            {unitState.notApplicable ? (
              <div className="cold-storage-exception-panel neutral">
                <label htmlFor={`${key}:not-applicable-reason`}>Varför är enheten inte i drift?</label>
                <select
                  className="text-input"
                  id={`${key}:not-applicable-reason`}
                  value={unitState.notApplicableReason}
                  onChange={(event) => onUnitChange(key, {
                    notApplicableReason: event.target.value as ColdStorageNotApplicableReason | '',
                  })}
                  required
                >
                  <option value="">Välj orsak</option>
                  {notApplicableOptions.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>
                {unitState.notApplicableReason === 'other' ? (
                  <>
                    <label htmlFor={`${key}:not-applicable-note`}>Beskriv orsaken</label>
                    <textarea
                      className="text-input"
                      id={`${key}:not-applicable-note`}
                      value={unitState.notApplicableNote}
                      onChange={(event) => onUnitChange(key, { notApplicableNote: event.target.value })}
                      required
                    />
                  </>
                ) : null}
                <p className="field-hint">
                  Vid temperaturproblem: ange den uppmätta temperaturen och dokumentera avvikelsen i stället.
                </p>
              </div>
            ) : null}

            {reason ? (
              <div className="cold-storage-exception-panel deviation">
                <strong>{'Värdet ligger utanför företagets åtgärdsgräns.'}</strong>

                <label htmlFor={`${key}:goods-action`}>Hur hanterades varorna?</label>
                <select
                  className="text-input"
                  id={`${key}:goods-action`}
                  value={unitState.goodsAction}
                  onChange={(event) => onUnitChange(key, { goodsAction: event.target.value as ColdStorageGoodsAction | '' })}
                  required
                >
                  <option value="">Välj åtgärd</option>
                  {goodsActionOptions.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>

                <label htmlFor={`${key}:equipment-action`}>Vad gjordes med enheten?</label>
                <select
                  className="text-input"
                  id={`${key}:equipment-action`}
                  value={unitState.equipmentAction}
                  onChange={(event) => onUnitChange(key, { equipmentAction: event.target.value as ColdStorageEquipmentAction | '' })}
                  required
                >
                  <option value="">Välj åtgärd</option>
                  {equipmentActionOptions.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>

                <label htmlFor={`${key}:recheck`}>Kontrollmätning (frivillig)</label>
                <div className="temperature-input-row">
                  <input
                    className="text-input temperature-input"
                    id={`${key}:recheck`}
                    inputMode="decimal"
                    placeholder="Ange temperatur"
                    type="text"
                    value={unitState.recheckTemperature}
                    onChange={(event) => onUnitChange(key, { recheckTemperature: event.target.value })}
                  />
                  <span className="temperature-unit">{getTemperatureUnit(field, object)}</span>
                </div>

                <label htmlFor={`${key}:deviation-note`}>
                  {showOtherAction ? 'Beskriv den andra åtgärden' : 'Komplettering (frivillig)'}
                </label>
                <textarea
                  className="text-input"
                  id={`${key}:deviation-note`}
                  placeholder={showOtherAction ? undefined : 'Om snabbvalen inte räcker'}
                  value={unitState.note}
                  onChange={(event) => onUnitChange(key, { note: event.target.value })}
                  required={showOtherAction}
                />

                <SegmentedChoice
                  id={`${key}:resolution`}
                  label="Är avvikelsen löst?"
                  value={unitState.resolution}
                  onChange={(value) => onUnitChange(key, { resolution: value as ColdStorageResolution })}
                  options={[
                    { label: 'Löst', tone: 'good', value: 'resolved' },
                    { label: 'Behöver följas upp', tone: 'bad', value: 'follow_up' },
                  ]}
                />
              </div>
            ) : null}

            {showValidation ? <p className="form-message error-message">{validation}</p> : null}
          </section>
        );
      })}
    </div>
  );
}
