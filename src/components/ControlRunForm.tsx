import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { SegmentedChoice } from './ui/SegmentedChoice';
import {
  getControlRunDefinition,
  saveControlRun,
} from '../services/controlRunService';
import type {
  ControlResponse,
  ControlRunDefinition,
} from '../services/controlRunService';
import type { ControlFieldDefinition, ControlObject } from '../types/database';
import './ControlRunForm.css';

export type ControlRunFormProps = {
  organizationId: string;
  controlTypeId: string;
  userId: string;
  onCancel: () => void;
  onSaved: () => Promise<void>;
};

type ResponseState = Record<string, string>;
type DeviationState = Record<string, string>;

function responseKey(objectId: string | null, fieldId: string): string {
  return `${objectId ?? 'global'}:${fieldId}`;
}

function getFieldInputType(field: ControlFieldDefinition): string {
  if (field.field_type === 'temperature' || field.field_type === 'number') return 'number';
  if (field.field_type === 'date') return 'date';
  return 'text';
}

function getDeviationReason(field: ControlFieldDefinition, object: ControlObject | null, value: string): string | null {
  if (field.field_type === 'ok_not_ok' && value === 'not_ok') return `${field.label} är ej OK.`;
  if (field.field_type === 'boolean' && value === 'false') return `${field.label} är inte uppfyllt.`;

  if (field.field_type === 'temperature') {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    if (object?.limit_max !== null && object?.limit_max !== undefined && parsed > object.limit_max) {
      return `${field.label} är över maxgräns ${object.limit_max}${object.unit ?? ''}.`;
    }
    if (object?.limit_min !== null && object?.limit_min !== undefined && parsed < object.limit_min) {
      return `${field.label} är under mingräns ${object.limit_min}${object.unit ?? ''}.`;
    }
  }

  return null;
}

function getDefaultValue(field: ControlFieldDefinition): string {
  if (field.field_type === 'ok_not_ok') return 'ok';
  if (field.field_type === 'boolean') return 'true';
  return '';
}

export function ControlRunForm({
  organizationId,
  controlTypeId,
  userId,
  onCancel,
  onSaved,
}: ControlRunFormProps) {
  const [definition, setDefinition] = useState<ControlRunDefinition | null>(null);
  const [responses, setResponses] = useState<ResponseState>({});
  const [actions, setActions] = useState<DeviationState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const nextDefinition = await getControlRunDefinition(organizationId, controlTypeId);
        if (!active) return;
        setDefinition(nextDefinition);

        const nextResponses: ResponseState = {};
        const objects = nextDefinition.objects.length ? nextDefinition.objects : [null];
        for (const object of objects) {
          for (const field of nextDefinition.fields) {
            nextResponses[responseKey(object?.id ?? null, field.id)] = getDefaultValue(field);
          }
        }
        setResponses(nextResponses);
      } catch (error) {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : 'Kunde inte läsa kontrollen.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [controlTypeId, organizationId]);

  const responseList = useMemo(() => {
    if (!definition) return [];
    const objects = definition.objects.length ? definition.objects : [null];
    const result: ControlResponse[] = [];

    for (const object of objects) {
      for (const field of definition.fields) {
        const key = responseKey(object?.id ?? null, field.id);
        const value = responses[key] ?? '';
        const reason = getDeviationReason(field, object, value);
        result.push({
          controlObjectId: object?.id ?? null,
          fieldDefinitionId: field.id,
          value,
          deviationDetected: Boolean(reason),
          deviationReason: reason,
          actionText: actions[key] ?? null,
        });
      }
    }

    return result;
  }, [actions, definition, responses]);

  const missingAction = responseList.some((response) => response.deviationDetected && !response.actionText?.trim());

  function updateResponse(key: string, value: string) {
    setResponses((current) => ({ ...current, [key]: value }));
  }

  function updateAction(key: string, value: string) {
    setActions((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!definition || missingAction) return;

    try {
      setSaving(true);
      setMessage('');
      await saveControlRun(organizationId, controlTypeId, userId, definition, responseList);
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara kontrollen.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted-copy">Laddar kontroll...</p>;
  if (!definition) return <p className="form-message error-message">Kontrollen kunde inte visas.</p>;

  const objects = definition.objects.length ? definition.objects : [null];

  return (
    <form className="control-form" onSubmit={handleSubmit}>
      <div className="control-form-header">
        <div className="control-form-topbar">
          <div>
            <p className="eyebrow">Utför kontroll</p>
            <h3>{definition.controlType.name}</h3>
          </div>
          <ActionButton className="nav-back-button" type="button" variant="secondary" onClick={onCancel}>
            <span aria-hidden="true">←</span>
            Tillbaka
          </ActionButton>
        </div>
        <p className="muted-copy">{definition.controlType.instructions ?? 'Fyll i kontrollpunkterna nedan.'}</p>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      {definition.fields.length === 0 ? (
        <p className="muted-copy">Den här kontrolltypen saknar formulärfält ännu.</p>
      ) : null}

      {objects.map((object) => (
        <section className="control-group" key={object?.id ?? 'global'}>
          <div>
            <h4>{object?.name ?? definition.controlType.name}</h4>
            {object?.location ? <p className="muted-copy">{object.location}</p> : null}
          </div>

          {definition.fields.map((field) => {
            const key = responseKey(object?.id ?? null, field.id);
            const value = responses[key] ?? '';
            const reason = getDeviationReason(field, object, value);

            return (
              <div className="control-field" key={key}>
                {field.field_type === 'ok_not_ok' ? (
                  <SegmentedChoice
                    id={key}
                    label={field.label}
                    value={value}
                    onChange={(nextValue) => updateResponse(key, nextValue)}
                    options={[
                      { label: 'OK', tone: 'good', value: 'ok' },
                      { label: 'Ej OK', tone: 'bad', value: 'not_ok' },
                    ]}
                  />
                ) : field.field_type === 'boolean' ? (
                  <SegmentedChoice
                    id={key}
                    label={field.label}
                    value={value}
                    onChange={(nextValue) => updateResponse(key, nextValue)}
                    options={[
                      { label: 'Ja', tone: 'good', value: 'true' },
                      { label: 'Nej', tone: 'bad', value: 'false' },
                    ]}
                  />
                ) : field.field_type === 'textarea' ? (
                  <>
                    <label htmlFor={key}>{field.label}</label>
                    <textarea className="text-input" id={key} value={value} onChange={(event) => updateResponse(key, event.target.value)} />
                  </>
                ) : (
                  <>
                    <label htmlFor={key}>{field.label}</label>
                    <input
                      className="text-input"
                      id={key}
                      type={getFieldInputType(field)}
                      value={value}
                      onChange={(event) => updateResponse(key, event.target.value)}
                      required={field.required}
                    />
                  </>
                )}

                {reason ? (
                  <div className="deviation-box">
                    <strong>Avvikelse: {reason}</strong>
                    <label className="action-label" htmlFor={`${key}:action`}>Åtgärd</label>
                    <textarea
                      className="text-input"
                      id={`${key}:action`}
                      value={actions[key] ?? ''}
                      onChange={(event) => updateAction(key, event.target.value)}
                      required
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ))}

      {missingAction ? (
        <p className="form-message error-message">Alla avvikelser måste ha en åtgärdstext innan kontrollen kan sparas.</p>
      ) : null}

      <div className="form-actions">
        <ActionButton type="submit" disabled={saving || definition.fields.length === 0 || missingAction}>
          {saving ? 'Sparar...' : 'Spara kontroll'}
        </ActionButton>
        <ActionButton type="button" variant="secondary" onClick={onCancel}>
          Avbryt
        </ActionButton>
      </div>
    </form>
  );
}
