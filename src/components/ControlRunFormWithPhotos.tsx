import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { SegmentedChoice } from './ui/SegmentedChoice';
import {
  getControlRunDefinition,
  saveControlRun,
} from '../services/controlRunWithAttachmentsService';
import { listSuppliers } from '../services/supplierService';
import type {
  ControlResponse,
  ControlRunDefinition,
} from '../services/controlRunWithAttachmentsService';
import type { SavedControlSummary } from './SavedControlView';
import type { ControlFieldDefinition, ControlObject, Supplier } from '../types/database';
import './ControlRunForm.css';

export type ControlRunFormWithPhotosProps = {
  organizationId: string;
  controlTypeId: string;
  userId: string;
  performedBy: string;
  onCancel: () => void;
  onSaved: (summary: SavedControlSummary) => Promise<void>;
};

type ResponseState = Record<string, string>;
type DeviationState = Record<string, string>;
type FileState = Record<string, File | null>;

type PhotoCaptureFieldProps = {
  id: string;
  label: string;
  file: File | null;
  required: boolean;
  onChange: (file: File | null) => void;
};

type TemperatureFieldProps = {
  id: string;
  label: string;
  object: ControlObject | null;
  value: string;
  required: boolean;
  reason: string | null;
  onChange: (value: string) => void;
};

type ChecklistMatrixProps = {
  field: ControlFieldDefinition;
  objects: ControlObject[];
  responses: ResponseState;
  actions: DeviationState;
  onChange: (key: string, value: string) => void;
  onActionChange: (key: string, value: string) => void;
};

type SupplierSelectFieldProps = {
  id: string;
  label: string;
  value: string;
  required: boolean;
  suppliers: Supplier[];
  onChange: (value: string) => void;
};

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

function isSupplierField(field: ControlFieldDefinition): boolean {
  return field.field_key === 'supplier' || field.label.trim().toLowerCase() === 'leverantör';
}

function getLimitText(object: ControlObject | null): string | null {
  if (!object) return null;
  const unit = object.unit ?? '°C';
  if (object.limit_min !== null && object.limit_min !== undefined && object.limit_max !== null && object.limit_max !== undefined) {
    return `${object.limit_min}${unit}–${object.limit_max}${unit}`;
  }
  if (object.limit_max !== null && object.limit_max !== undefined) return `Max ${object.limit_max}${unit}`;
  if (object.limit_min !== null && object.limit_min !== undefined) return `Min ${object.limit_min}${unit}`;
  return null;
}

function PhotoCaptureField({ id, label, file, required, onChange }: PhotoCaptureFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return (
    <div className="photo-capture-field">
      <label htmlFor={id}>{label}</label>
      <div className="photo-capture-row">
        <div className="photo-thumbnail-strip" aria-live="polite">
          {previewUrl ? (
            <img className="photo-thumbnail" src={previewUrl} alt="Vald bild" />
          ) : (
            <span className="photo-empty-slot">Ingen bild vald</span>
          )}
        </div>

        <label className="photo-camera-button" htmlFor={id} aria-label="Ta eller välj bild">
          <span aria-hidden="true">▣</span>
        </label>
      </div>

      <input
        accept="image/*"
        capture="environment"
        className="photo-file-input"
        id={id}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        type="file"
        required={required}
      />

      {file ? <p className="photo-file-name">{file.name}</p> : null}
    </div>
  );
}

function TemperatureField({ id, label, object, value, required, reason, onChange }: TemperatureFieldProps) {
  const limitText = getLimitText(object);
  const hasValue = value.trim().length > 0;
  const statusClass = reason ? 'temperature-status bad' : 'temperature-status good';
  const statusText = reason ? 'Utanför gränsvärde' : 'Inom gränsvärde';

  return (
    <div className={reason ? 'temperature-field deviation' : 'temperature-field'}>
      <label htmlFor={id}>{label}</label>
      <div className="temperature-input-row">
        <input
          className="text-input temperature-input"
          id={id}
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        />
        <span className="temperature-unit">{object?.unit ?? '°C'}</span>
      </div>
      <div className="temperature-meta-row">
        {limitText ? <span>{limitText}</span> : <span>Gränsvärde saknas</span>}
        {hasValue ? <span className={statusClass}>{statusText}</span> : null}
      </div>
    </div>
  );
}

function ChecklistMatrix({ field, objects, responses, actions, onChange, onActionChange }: ChecklistMatrixProps) {
  return (
    <section className="check-matrix" aria-labelledby={`matrix-${field.id}`}>
      <div className="check-matrix-header">
        <strong id={`matrix-${field.id}`}>{field.label}</strong>
        <span>OK</span>
        <span>Ej OK</span>
      </div>

      {objects.map((object) => {
        const key = responseKey(object.id, field.id);
        const actionId = `${key}:action`;
        const value = responses[key] ?? 'ok';
        const showAction = value === 'not_ok';

        return (
          <div className={showAction ? 'check-matrix-item has-action' : 'check-matrix-item'} key={object.id}>
            <div className="check-matrix-row">
              <span className="check-matrix-name">{object.name}</span>
              <button
                type="button"
                className={value === 'ok' ? 'matrix-choice ok selected' : 'matrix-choice ok'}
                aria-pressed={value === 'ok'}
                onClick={() => {
                  onChange(key, 'ok');
                  onActionChange(key, '');
                }}
              >
                ✓
              </button>
              <button
                type="button"
                className={value === 'not_ok' ? 'matrix-choice not-ok selected' : 'matrix-choice not-ok'}
                aria-pressed={value === 'not_ok'}
                onClick={() => onChange(key, 'not_ok')}
              >
                ×
              </button>
            </div>

            {showAction ? (
              <div className="matrix-action-box">
                <strong>Avvikelse: {field.label} är ej OK.</strong>
                <label className="action-label" htmlFor={actionId}>Vad är fel / åtgärd?</label>
                <textarea
                  className="text-input"
                  id={actionId}
                  value={actions[key] ?? ''}
                  onChange={(event) => onActionChange(key, event.target.value)}
                  required
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}

function SupplierSelectField({
  id,
  label,
  value,
  required,
  suppliers,
  onChange,
}: SupplierSelectFieldProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select
        className="text-input supplier-select"
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={suppliers.length === 0}
      >
        <option value="">{suppliers.length ? 'Välj leverantör' : 'Inga aktiva leverantörer'}</option>
        {suppliers.map((supplier) => (
          <option value={supplier.name} key={supplier.id}>
            {supplier.name}
          </option>
        ))}
      </select>
      {suppliers.length === 0 ? (
        <p className="field-hint">Lägg till leverantörer under Meny innan fältet används.</p>
      ) : null}
    </>
  );
}

export function ControlRunFormWithPhotos({
  organizationId,
  controlTypeId,
  userId,
  performedBy,
  onCancel,
  onSaved,
}: ControlRunFormWithPhotosProps) {
  const [definition, setDefinition] = useState<ControlRunDefinition | null>(null);
  const [responses, setResponses] = useState<ResponseState>({});
  const [files, setFiles] = useState<FileState>({});
  const [actions, setActions] = useState<DeviationState>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
        if (nextDefinition.fields.some(isSupplierField)) {
          const nextSuppliers = await listSuppliers(organizationId);
          if (!active) return;
          setSuppliers(nextSuppliers);
        } else {
          setSuppliers([]);
        }

        const nextResponses: ResponseState = {};
        const objects = nextDefinition.objects.length ? nextDefinition.objects : [null];
        for (const object of objects) {
          for (const field of nextDefinition.fields) {
            nextResponses[responseKey(object?.id ?? null, field.id)] = getDefaultValue(field);
          }
        }
        setResponses(nextResponses);
        setActions({});
        setFiles({});
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
          file: files[key] ?? null,
          deviationDetected: Boolean(reason),
          deviationReason: reason,
          actionText: reason ? actions[key] ?? null : null,
        });
      }
    }

    return result;
  }, [actions, definition, files, responses]);

  const missingAction = responseList.some((response) => response.deviationDetected && !response.actionText?.trim());

  function updateResponse(key: string, value: string) {
    setResponses((current) => ({ ...current, [key]: value }));
  }

  function updateAction(key: string, value: string) {
    setActions((current) => ({ ...current, [key]: value }));
  }

  function updateFile(key: string, file: File | null) {
    setFiles((current) => ({ ...current, [key]: file }));
    setResponses((current) => ({ ...current, [key]: file?.name ?? '' }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!definition || missingAction) return;

    try {
      setSaving(true);
      setMessage('');
      const savedAt = new Date().toISOString();
      await saveControlRun(organizationId, controlTypeId, userId, definition, responseList);
      await onSaved({
        controlName: definition.controlType.name,
        savedAt,
        performedBy,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara kontrollen.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted-copy">Laddar kontroll...</p>;
  if (!definition) return <p className="form-message error-message">Kontrollen kunde inte visas.</p>;

  const objects = definition.objects.length ? definition.objects : [null];
  const matrixObjects = definition.objects;
  const matrixField = matrixObjects.length > 1 ? definition.fields.find((field) => field.field_type === 'ok_not_ok') : undefined;

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

      {matrixField ? (
        <ChecklistMatrix
          field={matrixField}
          objects={matrixObjects}
          responses={responses}
          actions={actions}
          onChange={updateResponse}
          onActionChange={updateAction}
        />
      ) : null}

      {objects.map((object) => {
        const visibleFields = matrixField
          ? definition.fields.filter((field) => field.id !== matrixField.id && field.field_type !== 'textarea')
          : definition.fields;
        if (visibleFields.length === 0) return null;

        return (
          <section className="control-group" key={object?.id ?? 'global'}>
            <div>
              <h4>{object?.name ?? definition.controlType.name}</h4>
              {object?.location ? <p className="muted-copy">{object.location}</p> : null}
            </div>

            {visibleFields.map((field) => {
              const key = responseKey(object?.id ?? null, field.id);
              const value = responses[key] ?? '';
              const reason = getDeviationReason(field, object, value);

              return (
                <div className="control-field" key={key}>
                  {field.field_type === 'photo' ? (
                    <PhotoCaptureField
                      id={key}
                      label={field.label}
                      file={files[key] ?? null}
                      required={field.required}
                      onChange={(nextFile) => updateFile(key, nextFile)}
                    />
                  ) : field.field_type === 'temperature' ? (
                    <TemperatureField
                      id={key}
                      label={field.label}
                      object={object}
                      value={value}
                      required={field.required}
                      reason={reason}
                      onChange={(nextValue) => updateResponse(key, nextValue)}
                    />
                  ) : field.field_type === 'ok_not_ok' ? (
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
                  ) : isSupplierField(field) ? (
                    <SupplierSelectField
                      id={key}
                      label={field.label}
                      value={value}
                      required={field.required}
                      suppliers={suppliers}
                      onChange={(nextValue) => updateResponse(key, nextValue)}
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
        );
      })}

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
