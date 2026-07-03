import { FormEvent, useEffect, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { ControlDefinitionCanvas } from './ControlDefinitionCanvas';
import {
  createControlField,
  createControlObject,
  duplicateControlField,
  duplicateControlObject,
  listControlFields,
  listControlObjects,
  setControlObjectActive,
  setControlTypeActive,
  updateControlField,
  updateControlFieldOrder,
  updateControlObject,
  updateControlObjectOrder,
  updateControlType,
} from '../services/controlAdminService';
import {
  formatFrequencyLabel,
  getFrequencyConfigWithWeekday,
  readWeeklyWeekday,
  weekdayOptions,
} from '../services/scheduleService';
import type {
  ControlCategory,
  ControlFieldDefinition,
  ControlFrequency,
  ControlObject,
  ControlType,
} from '../types/database';
import type { IsoWeekday } from '../services/scheduleService';
import './ControlTypeDetailView.css';

type ControlTypeDetailViewProps = {
  organizationId: string;
  controlType: ControlType;
  canManage: boolean;
  onBack: () => void;
  onChanged: () => Promise<void>;
};

type MoveDirection = 'up' | 'down';

const frequencyLabels: Record<ControlFrequency, string> = {
  daily: 'Dagligen',
  weekly: 'Veckovis',
  per_delivery: 'Vid leverans',
  custom: 'Anpassad',
};

const categoryLabels: Record<ControlCategory, string> = {
  temperature: 'Temperatur',
  checklist: 'Checklista',
  receiving: 'Varumottagning',
  traceability: 'Spårbarhet',
  round: 'Egenkontrollrunda',
  custom: 'Anpassad',
};

const fieldTypeLabels: Record<ControlFieldDefinition['field_type'], string> = {
  text: 'Text',
  textarea: 'Kommentar',
  number: 'Nummer',
  temperature: 'Temperatur',
  boolean: 'Ja/nej',
  ok_not_ok: 'OK/Ej OK',
  date: 'Datum',
  datetime: 'Datum och tid',
  photo: 'Foto',
  select: 'Val',
};

const fieldTypeIconPaths: Record<ControlFieldDefinition['field_type'], string> = {
  text: '/ui-icons/dokument.png',
  textarea: '/ui-icons/dokument.png',
  number: '/ui-icons/dokument.png',
  temperature: '/ui-icons/kyltemperatur.png',
  boolean: '/ui-icons/verifiering.png',
  ok_not_ok: '/ui-icons/verifiering.png',
  date: '/ui-icons/datum.png',
  datetime: '/ui-icons/datum.png',
  photo: '/ui-icons/foto.png',
  select: '/ui-icons/installningar.png',
};

const categoryIconPaths: Record<ControlCategory, string> = {
  temperature: '/ui-icons/kyltemperatur.png',
  checklist: '/ui-icons/stadning.png',
  receiving: '/ui-icons/varumottagning.png',
  traceability: '/ui-icons/sparbarhet.png',
  round: '/ui-icons/Egenkontrollrunda.png',
  custom: '/ui-icons/kontroll.svg',
};

const fieldTypeOptions: Array<{
  fieldType: ControlFieldDefinition['field_type'];
  label: string;
  description: string;
  defaultLabel: string;
}> = [
  { fieldType: 'text', label: 'Text', description: 'Kort text, till exempel batchnummer.', defaultLabel: 'Text' },
  { fieldType: 'date', label: 'Datum', description: 'Datum, till exempel bäst före.', defaultLabel: 'Datum' },
  { fieldType: 'datetime', label: 'Datum & tid', description: 'Tidpunkt eller tidssteg.', defaultLabel: 'Tidpunkt' },
  { fieldType: 'select', label: 'Val', description: 'Ett fördefinierat val.', defaultLabel: 'Val' },
  { fieldType: 'boolean', label: 'Ja / Nej', description: 'En enkel bekräftelse.', defaultLabel: 'Bekräftelse' },
  { fieldType: 'ok_not_ok', label: 'OK / Ej OK', description: 'Status som kan skapa avvikelse.', defaultLabel: 'Status' },
  { fieldType: 'number', label: 'Nummer', description: 'Ett numeriskt värde.', defaultLabel: 'Värde' },
  { fieldType: 'temperature', label: 'Temperatur', description: 'Temperatur mot gränsvärde.', defaultLabel: 'Temperatur' },
  { fieldType: 'photo', label: 'Foto', description: 'Bild eller etikett.', defaultLabel: 'Foto' },
  { fieldType: 'textarea', label: 'Kommentar', description: 'Längre fri text.', defaultLabel: 'Kommentar' },
];

function getControlPointLabel(category: ControlCategory): string {
  if (category === 'temperature') return 'Objekt och enheter';
  if (category === 'checklist') return 'Områden och punkter';
  if (category === 'receiving') return 'Mottagningspunkter';
  if (category === 'traceability') return 'Spårbarhetspunkter';
  return 'Kontrollpunkter';
}

function getPlaceholder(category: ControlCategory): string {
  if (category === 'temperature') return 'Exempel: Kyl 3 - Beredning';
  if (category === 'checklist') return 'Exempel: Kök';
  if (category === 'receiving') return 'Exempel: Kylvaror';
  if (category === 'traceability') return 'Exempel: Etikettkontroll';
  return 'Exempel: Kontrollpunkt';
}

function isRequiredByDefault(fieldType: ControlFieldDefinition['field_type']): boolean {
  return fieldType === 'ok_not_ok' || fieldType === 'temperature';
}

function moveItem<T extends { id: string }>(items: T[], itemId: string, direction: MoveDirection): T[] {
  const index = items.findIndex((item) => item.id === itemId);
  if (index < 0) return items;

  const nextIndex = direction === 'up' ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= items.length) return items;

  const nextItems = [...items];
  const currentItem = nextItems[index];
  nextItems[index] = nextItems[nextIndex];
  nextItems[nextIndex] = currentItem;
  return nextItems;
}

function getObjectMeta(controlObject: ControlObject, category: ControlCategory): string {
  const parts: string[] = [];
  if (controlObject.location) parts.push(controlObject.location);
  if (category === 'temperature') {
    const unit = controlObject.unit ?? '°C';
    if (controlObject.limit_min !== null && controlObject.limit_max !== null) {
      parts.push(`Min: ${controlObject.limit_min}${unit} Max: ${controlObject.limit_max}${unit}`);
    } else if (controlObject.limit_max !== null) {
      parts.push(`Max: ${controlObject.limit_max}${unit}`);
    } else if (controlObject.limit_min !== null) {
      parts.push(`Min: ${controlObject.limit_min}${unit}`);
    }
  }

  return parts.length ? parts.join(' · ') : 'Ingen extra information';
}

export function ControlTypeDetailView({
  organizationId,
  controlType,
  canManage,
  onBack,
  onChanged,
}: ControlTypeDetailViewProps) {
  const [objects, setObjects] = useState<ControlObject[]>([]);
  const [fields, setFields] = useState<ControlFieldDefinition[]>([]);
  const [objectName, setObjectName] = useState('');
  const [objectLocation, setObjectLocation] = useState('');
  const [objectInstructions, setObjectInstructions] = useState('');
  const [limitMax, setLimitMax] = useState('');
  const [showObjectCreator, setShowObjectCreator] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState('');
  const [editFieldType, setEditFieldType] = useState<ControlFieldDefinition['field_type']>('ok_not_ok');
  const [editFieldRequired, setEditFieldRequired] = useState(false);
  const [editFieldActive, setEditFieldActive] = useState(true);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  const [editObjectName, setEditObjectName] = useState('');
  const [editObjectLocation, setEditObjectLocation] = useState('');
  const [editObjectInstructions, setEditObjectInstructions] = useState('');
  const [editObjectLimitMax, setEditObjectLimitMax] = useState('');
  const [editObjectActive, setEditObjectActive] = useState(true);
  const [typeName, setTypeName] = useState(controlType.name);
  const [typeCategory, setTypeCategory] = useState<ControlCategory>(controlType.category);
  const [typeFrequency, setTypeFrequency] = useState<ControlFrequency>(controlType.frequency);
  const [typeWeekday, setTypeWeekday] = useState<IsoWeekday>(() => readWeeklyWeekday(controlType.frequency_config));
  const [typeInstructions, setTypeInstructions] = useState(controlType.instructions ?? '');
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState(false);
  const [savingStructure, setSavingStructure] = useState(false);
  const [message, setMessage] = useState('');

  async function refreshObjects() {
    const nextObjects = await listControlObjects(organizationId, controlType.id);
    setObjects(nextObjects);
    return nextObjects;
  }

  async function refreshFields() {
    const nextFields = await listControlFields(organizationId, controlType.id);
    setFields(nextFields);
    return nextFields;
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setMessage('');
        const [nextObjects, nextFields] = await Promise.all([
          listControlObjects(organizationId, controlType.id),
          listControlFields(organizationId, controlType.id),
        ]);
        if (active) {
          setObjects(nextObjects);
          setFields(nextFields);
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa kontrolltypen.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [organizationId, controlType.id]);

  useEffect(() => {
    setTypeName(controlType.name);
    setTypeCategory(controlType.category);
    setTypeFrequency(controlType.frequency);
    setTypeWeekday(readWeeklyWeekday(controlType.frequency_config));
    setTypeInstructions(controlType.instructions ?? '');
  }, [
    controlType.category,
    controlType.frequency,
    controlType.frequency_config,
    controlType.id,
    controlType.instructions,
    controlType.name,
  ]);

  async function handleSaveControlType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!typeName.trim()) return;

    try {
      setSavingType(true);
      setMessage('');
      await updateControlType(controlType.id, organizationId, {
        name: typeName,
        active: controlType.active,
        category: typeCategory,
        frequency: typeFrequency,
        frequencyConfig: typeFrequency === 'weekly'
          ? getFrequencyConfigWithWeekday(controlType.frequency_config, typeWeekday)
          : controlType.frequency_config,
        instructions: typeInstructions,
      });
      await onChanged();
      setMessage('Kontrolltypen sparades.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara kontrolltypen.');
    } finally {
      setSavingType(false);
    }
  }

  function handleStartEditField(field: ControlFieldDefinition) {
    setEditingObjectId(null);
    setEditingFieldId(field.id);
    setEditFieldLabel(field.label);
    setEditFieldType(field.field_type);
    setEditFieldRequired(field.required);
    setEditFieldActive(field.active);
  }

  function handleStartEditObject(controlObject: ControlObject) {
    setEditingFieldId(null);
    setEditingObjectId(controlObject.id);
    setEditObjectName(controlObject.name);
    setEditObjectLocation(controlObject.location ?? '');
    setEditObjectInstructions(controlObject.instructions ?? '');
    setEditObjectLimitMax(controlObject.limit_max === null ? '' : String(controlObject.limit_max));
    setEditObjectActive(controlObject.active);
  }

  async function handleCreateField(fieldType: ControlFieldDefinition['field_type']) {
    const option = fieldTypeOptions.find((item) => item.fieldType === fieldType);
    if (!option) return;

    try {
      setSavingStructure(true);
      setMessage('');
      const createdField = await createControlField({
        organizationId,
        controlTypeId: controlType.id,
        label: option.defaultLabel,
        fieldType,
        required: isRequiredByDefault(fieldType),
      });
      await refreshFields();
      handleStartEditField(createdField);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa fältet.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleSaveField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingFieldId) return;
    setMessage('');

    try {
      setSavingStructure(true);
      await updateControlField({
        fieldDefinitionId: editingFieldId,
        organizationId,
        label: editFieldLabel.trim(),
        fieldType: editFieldType,
        required: editFieldRequired,
        active: editFieldActive,
      });
      setEditingFieldId(null);
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte uppdatera fältet.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleToggleField(field: ControlFieldDefinition) {
    try {
      setSavingStructure(true);
      setMessage('');
      await updateControlField({
        fieldDefinitionId: field.id,
        organizationId,
        label: field.label,
        fieldType: field.field_type,
        required: field.required,
        active: !field.active,
      });
      if (editingFieldId === field.id && field.active) setEditingFieldId(null);
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra fältet.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleDuplicateField(field: ControlFieldDefinition) {
    try {
      setSavingStructure(true);
      setMessage('');
      const duplicatedField = await duplicateControlField({
        fieldDefinitionId: field.id,
        organizationId,
      });
      await refreshFields();
      handleStartEditField(duplicatedField);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte duplicera fältet.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleMoveField(field: ControlFieldDefinition, direction: MoveDirection) {
    const activeFields = fields.filter((item) => item.active);
    const inactiveFields = fields.filter((item) => !item.active);
    const movedFields = moveItem(activeFields, field.id, direction);
    const nextOrder = [...movedFields, ...inactiveFields].map((item) => item.id);

    try {
      setSavingStructure(true);
      setMessage('');
      await updateControlFieldOrder({ organizationId, orderedIds: nextOrder });
      setFields([...movedFields, ...inactiveFields].map((item, index) => ({ ...item, sort_order: index })));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte flytta fältet.');
      await refreshFields();
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleCreateObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      setSavingStructure(true);
      const createdObject = await createControlObject({
        organizationId,
        controlTypeId: controlType.id,
        name: objectName.trim(),
        location: objectLocation.trim() || undefined,
        instructions: objectInstructions,
        limitMax: limitMax ? Number(limitMax) : null,
        unit: controlType.category === 'temperature' ? '°C' : undefined,
      });
      setObjectName('');
      setObjectLocation('');
      setObjectInstructions('');
      setLimitMax('');
      setShowObjectCreator(false);
      await refreshObjects();
      handleStartEditObject(createdObject);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa kontrollpunkten.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleSaveObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingObjectId) return;
    setMessage('');

    try {
      setSavingStructure(true);
      await updateControlObject({
        controlObjectId: editingObjectId,
        organizationId,
        name: editObjectName,
        location: editObjectLocation,
        instructions: editObjectInstructions,
        limitMax: controlType.category === 'temperature' && editObjectLimitMax ? Number(editObjectLimitMax) : null,
        active: editObjectActive,
      });
      setEditingObjectId(null);
      await refreshObjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte uppdatera kontrollpunkten.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleToggleObject(controlObject: ControlObject) {
    try {
      setSavingStructure(true);
      setMessage('');
      await setControlObjectActive(controlObject.id, organizationId, !controlObject.active);
      if (editingObjectId === controlObject.id && controlObject.active) setEditingObjectId(null);
      await refreshObjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra kontrollpunkten.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleDuplicateObject(controlObject: ControlObject) {
    try {
      setSavingStructure(true);
      setMessage('');
      const duplicatedObject = await duplicateControlObject({
        controlObjectId: controlObject.id,
        organizationId,
      });
      await refreshObjects();
      handleStartEditObject(duplicatedObject);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte duplicera kontrollpunkten.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleMoveObject(controlObject: ControlObject, direction: MoveDirection) {
    const activeObjects = objects.filter((item) => item.active);
    const inactiveObjects = objects.filter((item) => !item.active);
    const movedObjects = moveItem(activeObjects, controlObject.id, direction);
    const nextOrder = [...movedObjects, ...inactiveObjects].map((item) => item.id);

    try {
      setSavingStructure(true);
      setMessage('');
      await updateControlObjectOrder({ organizationId, orderedIds: nextOrder });
      setObjects([...movedObjects, ...inactiveObjects].map((item, index) => ({ ...item, sort_order: index })));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte flytta kontrollpunkten.');
      await refreshObjects();
    } finally {
      setSavingStructure(false);
    }
  }

  async function handleToggleType() {
    setMessage('');
    try {
      await setControlTypeActive(controlType.id, organizationId, !controlType.active);
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra kontrolltypen.');
    }
  }

  function renderFieldEditor(field: ControlFieldDefinition) {
    if (editingFieldId !== field.id) return null;

    return (
      <form className="builder-inline-form" onSubmit={handleSaveField}>
        <label>
          <span>Fältnamn</span>
          <input
            className="text-input"
            value={editFieldLabel}
            onChange={(event) => setEditFieldLabel(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Typ</span>
          <select
            className="text-input"
            value={editFieldType}
            onChange={(event) => setEditFieldType(event.target.value as ControlFieldDefinition['field_type'])}
          >
            {fieldTypeOptions.map((option) => (
              <option value={option.fieldType} key={option.fieldType}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="control-field-checkbox">
          <input
            checked={editFieldRequired}
            onChange={(event) => setEditFieldRequired(event.target.checked)}
            type="checkbox"
          />
          Obligatoriskt
        </label>
        <label className="control-field-checkbox">
          <input
            checked={editFieldActive}
            onChange={(event) => setEditFieldActive(event.target.checked)}
            type="checkbox"
          />
          Aktivt
        </label>
        <div className="control-field-actions">
          <button className="control-point-action" type="submit" disabled={savingStructure}>Spara</button>
          <button className="control-point-action" type="button" onClick={() => setEditingFieldId(null)}>
            Avbryt
          </button>
        </div>
      </form>
    );
  }

  function renderObjectEditor(controlObject: ControlObject) {
    if (editingObjectId !== controlObject.id) return null;

    return (
      <form className="builder-inline-form" onSubmit={handleSaveObject}>
        <label>
          <span>Namn</span>
          <input
            className="text-input"
            value={editObjectName}
            onChange={(event) => setEditObjectName(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Plats</span>
          <input
            className="text-input"
            value={editObjectLocation}
            onChange={(event) => setEditObjectLocation(event.target.value)}
          />
        </label>
        {controlType.category === 'temperature' ? (
          <label>
            <span>Maxgräns</span>
            <input
              className="text-input"
              value={editObjectLimitMax}
              onChange={(event) => setEditObjectLimitMax(event.target.value)}
              type="number"
            />
          </label>
        ) : null}
        <label>
          <span>Instruktion</span>
          <textarea
            className="text-input control-type-instructions-input"
            value={editObjectInstructions}
            onChange={(event) => setEditObjectInstructions(event.target.value)}
            rows={4}
          />
        </label>
        <label className="control-field-checkbox">
          <input
            checked={editObjectActive}
            onChange={(event) => setEditObjectActive(event.target.checked)}
            type="checkbox"
          />
          Aktiv
        </label>
        <div className="control-field-actions">
          <button className="control-point-action" type="submit" disabled={savingStructure}>Spara</button>
          <button className="control-point-action" type="button" onClick={() => setEditingObjectId(null)}>
            Avbryt
          </button>
        </div>
      </form>
    );
  }

  const activeFields = fields.filter((field) => field.active);
  const activeObjects = objects.filter((item) => item.active);
  const inactiveFields = fields.filter((field) => !field.active);
  const inactiveObjects = objects.filter((item) => !item.active);
  const pointLabel = getControlPointLabel(controlType.category);

  return (
    <section className="control-type-detail" aria-labelledby="control-type-detail-title">
      <div className="control-type-detail-topbar">
        <ActionButton className="nav-back-button" variant="secondary" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Tillbaka
        </ActionButton>
        <div>
          <p className="eyebrow">Redigera kontrolltyp</p>
          <h3 id="control-type-detail-title">{controlType.name}</h3>
          <p className="muted-copy">Bygg kontrollen i samma logik som personalen fyller i den.</p>
        </div>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      <div className="control-type-detail-card control-type-context-card">
        <div>
          <span>Kategori</span>
          <strong>{categoryLabels[controlType.category]}</strong>
        </div>
        <div>
          <span>Frekvens</span>
          <strong>{formatFrequencyLabel(controlType)}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{controlType.active ? 'Aktiv' : 'Inaktiv'}</strong>
        </div>
      </div>

      {canManage ? (
        <section className="control-builder-section" aria-labelledby="control-builder-title">
          <div className="control-point-heading">
            <div>
              <p className="eyebrow">Bygg / redigera</p>
              <h4 id="control-builder-title">{controlType.name}</h4>
            </div>
            <span className="control-point-count">{activeFields.length} fält · {activeObjects.length} punkter</span>
          </div>

          {loading ? <p className="muted-copy">Laddar byggvyn...</p> : null}

          <div className="control-builder-layout">
            <section className="builder-panel" aria-labelledby="builder-fields-title">
              <div className="builder-panel-heading">
                <div>
                  <p className="eyebrow">Vad ska fyllas i?</p>
                  <h4 id="builder-fields-title">Fält</h4>
                </div>
                <span>{activeFields.length} aktiva</span>
              </div>

              <div className="field-type-grid builder-field-palette" role="group" aria-label="Lägg till fält">
                {fieldTypeOptions.map((option) => (
                  <button
                    className="field-type-option builder-field-option"
                    key={option.fieldType}
                    onClick={() => handleCreateField(option.fieldType)}
                    type="button"
                    disabled={savingStructure}
                  >
                    <span className="control-field-icon" aria-hidden="true">
                      <img src={fieldTypeIconPaths[option.fieldType]} alt="" />
                    </span>
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>

              {activeFields.length === 0 ? (
                <div className="control-detail-empty">
                  <strong>Inga fält ännu</strong>
                  <p className="muted-copy">Lägg till minst ett fält för att kontrollen ska gå att spara.</p>
                </div>
              ) : (
                <div className="builder-card-list">
                  {activeFields.map((field, index) => (
                    <article
                      className={editingFieldId === field.id ? 'builder-card selected' : 'builder-card'}
                      key={field.id}
                    >
                      <span className="builder-drag-handle" aria-hidden="true">::</span>
                      <span className="control-field-icon" aria-hidden="true">
                        <img src={fieldTypeIconPaths[field.field_type]} alt="" />
                      </span>
                      <button className="builder-card-main" type="button" onClick={() => handleStartEditField(field)}>
                        <strong>{field.label}</strong>
                        <span>{fieldTypeLabels[field.field_type]} · {field.required ? 'Obligatoriskt' : 'Frivilligt'}</span>
                      </button>
                      <details className="builder-card-menu">
                        <summary aria-label={`Åtgärder för ${field.label}`}>...</summary>
                        <div className="builder-card-menu-panel">
                          <button type="button" onClick={() => handleStartEditField(field)}>Redigera</button>
                          <button type="button" onClick={() => handleDuplicateField(field)}>Duplicera</button>
                          <button type="button" onClick={() => handleMoveField(field, 'up')} disabled={index === 0}>Flytta upp</button>
                          <button type="button" onClick={() => handleMoveField(field, 'down')} disabled={index === activeFields.length - 1}>Flytta ner</button>
                          <button type="button" onClick={() => handleToggleField(field)}>Arkivera</button>
                        </div>
                      </details>
                      {renderFieldEditor(field)}
                    </article>
                  ))}
                </div>
              )}

              {inactiveFields.length > 0 ? (
                <details className="builder-archive-panel">
                  <summary>Arkiverade fält ({inactiveFields.length})</summary>
                  <div className="builder-card-list">
                    {inactiveFields.map((field) => (
                      <article className="builder-card inactive" key={field.id}>
                        <span className="control-field-icon" aria-hidden="true">
                          <img src={fieldTypeIconPaths[field.field_type]} alt="" />
                        </span>
                        <button className="builder-card-main" type="button" onClick={() => handleStartEditField(field)}>
                          <strong>{field.label}</strong>
                          <span>{fieldTypeLabels[field.field_type]} · Arkiverat</span>
                        </button>
                        <button className="control-point-action" type="button" onClick={() => handleToggleField(field)}>
                          Återaktivera
                        </button>
                        {renderFieldEditor(field)}
                      </article>
                    ))}
                  </div>
                </details>
              ) : null}
            </section>

            <section className="builder-panel" aria-labelledby="builder-objects-title">
              <div className="builder-panel-heading">
                <div>
                  <p className="eyebrow">{pointLabel}</p>
                  <h4 id="builder-objects-title">Objekt</h4>
                </div>
                <button className="control-point-action" type="button" onClick={() => setShowObjectCreator((current) => !current)}>
                  + Lägg till
                </button>
              </div>

              {showObjectCreator ? (
                <form className="builder-inline-form" onSubmit={handleCreateObject}>
                  <label>
                    <span>Namn</span>
                    <input
                      className="text-input"
                      value={objectName}
                      onChange={(event) => setObjectName(event.target.value)}
                      placeholder={getPlaceholder(controlType.category)}
                      required
                    />
                  </label>
                  <label>
                    <span>Plats</span>
                    <input
                      className="text-input"
                      value={objectLocation}
                      onChange={(event) => setObjectLocation(event.target.value)}
                      placeholder="Plats, frivilligt"
                    />
                  </label>
                  {controlType.category === 'temperature' ? (
                    <label>
                      <span>Maxgräns</span>
                      <input
                        className="text-input"
                        value={limitMax}
                        onChange={(event) => setLimitMax(event.target.value)}
                        placeholder="Exempel: 8"
                        type="number"
                      />
                    </label>
                  ) : null}
                  <label>
                    <span>Instruktion</span>
                    <textarea
                      className="text-input control-type-instructions-input"
                      value={objectInstructions}
                      onChange={(event) => setObjectInstructions(event.target.value)}
                      placeholder="Instruktion för just den här kontrollpunkten, frivilligt"
                      rows={4}
                    />
                  </label>
                  <div className="control-field-actions">
                    <button className="control-point-action" type="submit" disabled={savingStructure}>Spara</button>
                    <button className="control-point-action" type="button" onClick={() => setShowObjectCreator(false)}>
                      Avbryt
                    </button>
                  </div>
                </form>
              ) : null}

              {activeObjects.length === 0 ? (
                <div className="control-detail-empty">
                  <strong>Inga objekt ännu</strong>
                  <p className="muted-copy">Kontrollen kan vara utan objekt, men objekt gör exempelvis kylar, områden och produkter tydliga.</p>
                </div>
              ) : (
                <div className="builder-card-list">
                  {activeObjects.map((controlObject, index) => (
                    <article
                      className={editingObjectId === controlObject.id ? 'builder-card selected' : 'builder-card'}
                      key={controlObject.id}
                    >
                      <span className="builder-drag-handle" aria-hidden="true">::</span>
                      <span className="control-point-icon" aria-hidden="true">
                        <img src={categoryIconPaths[controlType.category]} alt="" />
                      </span>
                      <button className="builder-card-main" type="button" onClick={() => handleStartEditObject(controlObject)}>
                        <strong>{controlObject.name}</strong>
                        <span>{getObjectMeta(controlObject, controlType.category)}</span>
                      </button>
                      <details className="builder-card-menu">
                        <summary aria-label={`Åtgärder för ${controlObject.name}`}>...</summary>
                        <div className="builder-card-menu-panel">
                          <button type="button" onClick={() => handleStartEditObject(controlObject)}>Redigera</button>
                          <button type="button" onClick={() => handleDuplicateObject(controlObject)}>Duplicera</button>
                          <button type="button" onClick={() => handleMoveObject(controlObject, 'up')} disabled={index === 0}>Flytta upp</button>
                          <button type="button" onClick={() => handleMoveObject(controlObject, 'down')} disabled={index === activeObjects.length - 1}>Flytta ner</button>
                          <button type="button" onClick={() => handleToggleObject(controlObject)}>Arkivera</button>
                        </div>
                      </details>
                      {renderObjectEditor(controlObject)}
                    </article>
                  ))}
                </div>
              )}

              {inactiveObjects.length > 0 ? (
                <details className="builder-archive-panel">
                  <summary>Arkiverade objekt ({inactiveObjects.length})</summary>
                  <div className="builder-card-list">
                    {inactiveObjects.map((controlObject) => (
                      <article className="builder-card inactive" key={controlObject.id}>
                        <span className="control-point-icon" aria-hidden="true">
                          <img src={categoryIconPaths[controlType.category]} alt="" />
                        </span>
                        <button className="builder-card-main" type="button" onClick={() => handleStartEditObject(controlObject)}>
                          <strong>{controlObject.name}</strong>
                          <span>Arkiverat · {getObjectMeta(controlObject, controlType.category)}</span>
                        </button>
                        <button className="control-point-action" type="button" onClick={() => handleToggleObject(controlObject)}>
                          Återaktivera
                        </button>
                        {renderObjectEditor(controlObject)}
                      </article>
                    ))}
                  </div>
                </details>
              ) : null}
            </section>
          </div>
        </section>
      ) : null}

      <section className="control-type-preview-section" aria-labelledby="control-type-preview-title">
        <div className="control-point-heading">
          <div>
            <p className="eyebrow">Förhandsvisning</p>
            <h4 id="control-type-preview-title">Så här ser kontrollen ut för personalen</h4>
          </div>
          <span className="control-point-count">{activeFields.length} saker att fylla i</span>
        </div>

        {loading ? <p className="muted-copy">Laddar kontrollen...</p> : null}
        {!loading && activeFields.length === 0 ? (
          <div className="control-detail-empty">
            <strong>Kontrollen saknar innehåll</strong>
            <p className="muted-copy">Lägg till minst en fråga, temperatur, datum eller annan uppgift som personalen ska fylla i.</p>
          </div>
        ) : null}
        {!loading && activeFields.length > 0 ? (
          <ControlDefinitionCanvas
            controlType={controlType}
            objects={activeObjects}
            fields={activeFields}
            mode="preview"
          />
        ) : null}
      </section>

      {canManage ? (
        <details className="control-admin-panel">
          <summary>
            <span>
              <strong>Inställningar</strong>
              <small>Namn, rutin och schema som styr när kontrollen visas.</small>
            </span>
          </summary>
          <form className="control-type-settings-form" onSubmit={handleSaveControlType}>
            <div className="control-point-heading">
              <div>
                <p className="eyebrow">Grunduppgifter</p>
                <h4>Namn och rutin</h4>
              </div>
            </div>
            <label>
              <span>Namn</span>
              <input
                className="text-input"
                value={typeName}
                onChange={(event) => setTypeName(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Kategori</span>
              <select
                className="text-input"
                value={typeCategory}
                onChange={(event) => setTypeCategory(event.target.value as ControlCategory)}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Frekvens</span>
              <select
                className="text-input"
                value={typeFrequency}
                onChange={(event) => setTypeFrequency(event.target.value as ControlFrequency)}
              >
                {Object.entries(frequencyLabels).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>
            {typeFrequency === 'weekly' ? (
              <label>
                <span>Veckodag</span>
                <select
                  className="text-input"
                  value={typeWeekday}
                  onChange={(event) => setTypeWeekday(Number(event.target.value) as IsoWeekday)}
                >
                  {weekdayOptions.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span>Rutin eller instruktion</span>
              <textarea
                className="text-input control-type-instructions-input"
                value={typeInstructions}
                onChange={(event) => setTypeInstructions(event.target.value)}
                placeholder="Beskriv hur kontrollen ska göras, när den ska göras och vad personalen ska göra vid avvikelse."
                rows={5}
              />
            </label>
            <ActionButton type="submit" disabled={savingType || !typeName.trim()}>
              {savingType ? 'Sparar...' : 'Spara inställningar'}
            </ActionButton>
          </form>
        </details>
      ) : controlType.instructions ? (
        <div className="control-type-settings-form">
          <div>
            <p className="eyebrow">Rutin eller instruktion</p>
            <p className="control-type-instructions-copy">{controlType.instructions}</p>
          </div>
        </div>
      ) : null}

      {canManage ? (
        <ActionButton variant="secondary" type="button" onClick={handleToggleType}>
          {controlType.active ? 'Arkivera kontrolltyp' : 'Återaktivera kontrolltyp'}
        </ActionButton>
      ) : null}
    </section>
  );
}
