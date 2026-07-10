import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BackButton } from './ui/BackButton';
import { ControlDefinitionCanvas } from './ControlDefinitionCanvas';
import {
  createControlField,
  createControlObject,
  listControlFields,
  listControlObjects,
  setControlTypeActive,
  updateControlObject,
  updateControlType,
  updateControlField,
} from '../services/controlAdminService';
import {
  formatFrequencyLabel,
  getFrequencyConfigWithWeekday,
  readWeeklyWeekday,
  weekdayOptions,
} from '../services/scheduleService';
import {
  buildTemperatureDeviationRule,
  readFieldTemperatureRule,
} from '../services/controlFieldRules';
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

type FieldPreset = {
  fieldType: ControlFieldDefinition['field_type'];
  label: string;
  defaultLabel?: string;
  required: boolean;
  deviationRule?: Record<string, unknown>;
};

type FieldOption = FieldPreset & {
  description: string;
  icon: string;
};

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

const fieldTypeOptions: FieldOption[] = [
  { fieldType: 'ok_not_ok', label: 'OK/Ej OK', defaultLabel: 'Avcheckning', required: true, description: 'Vad ska checkas av?', icon: 'OK' },
  { fieldType: 'text', label: 'Text', required: true, description: 'Kort text, t.ex. produkt eller batch.', icon: 'Aa' },
  { fieldType: 'textarea', label: 'Kommentar', required: false, description: 'Längre fri text.', icon: 'TXT' },
  { fieldType: 'date', label: 'Datum', required: false, description: 'Ett datumfält.', icon: 'DAT' },
  { fieldType: 'datetime', label: 'Datum och tid', required: false, description: 'Datum med klockslag.', icon: 'TID' },
  { fieldType: 'photo', label: 'Foto', required: false, description: 'Bild eller etikett.', icon: 'IMG' },
  { fieldType: 'temperature', label: 'Temperatur', required: true, description: 'Temperatur mot gränsvärde.', icon: '°C' },
  { fieldType: 'number', label: 'Nummer', required: true, description: 'Ett numeriskt värde.', icon: '123' },
  { fieldType: 'text', label: 'Leverantör', required: true, description: 'Välj eller ange leverantör.', icon: 'LEV' },
  { fieldType: 'select', label: 'Val', required: true, description: 'Ett fördefinierat val.', icon: 'VAL' },
];

const traceabilityPresets: FieldPreset[] = [
  { fieldType: 'text', label: 'Produkt', required: true },
  { fieldType: 'text', label: 'Batchnummer', required: true },
  { fieldType: 'date', label: 'Bäst före', required: false },
  { fieldType: 'text', label: 'Leverantör', required: true },
  { fieldType: 'photo', label: 'Foto / etikett', required: false },
];

const receivingPresets: FieldPreset[] = [
  { fieldType: 'text', label: 'Leverantör', required: true },
  { fieldType: 'temperature', label: 'Temperatur', required: true },
  { fieldType: 'ok_not_ok', label: 'Korrekt märkning', required: true },
  { fieldType: 'photo', label: 'Följesedel / foto', required: false },
];

function getFieldOptions(category: ControlCategory) {
  if (category === 'traceability') {
    return fieldTypeOptions.filter((option) => ['text', 'date', 'photo', 'select'].includes(option.fieldType));
  }
  if (category === 'receiving') {
    return fieldTypeOptions.filter((option) => ['text', 'temperature', 'ok_not_ok', 'date', 'photo', 'select'].includes(option.fieldType));
  }
  return fieldTypeOptions;
}

function readControlMode(category: ControlCategory): 'point' | 'field' | 'mixed' {
  if (category === 'traceability') return 'field';
  if (category === 'receiving') return 'mixed';
  return 'point';
}

function readFixedFieldType(category: ControlCategory): ControlFieldDefinition['field_type'] | null {
  if (category === 'temperature') return 'temperature';
  if (category === 'checklist' || category === 'round') return 'ok_not_ok';
  return null;
}

function getPointWords(category: ControlCategory) {
  if (category === 'temperature') {
    return {
      singular: 'kyl/frys',
      plural: 'Kylar och frysar',
      add: 'Lägg till kyl/frys',
      name: 'Namn (obligatoriskt)',
      namePlaceholder: 'Exempel: Kyl 1 - Kök',
      location: 'Plats (frivilligt)',
      locationPlaceholder: 'Kök, servering...',
      limit: 'Maxgräns',
      instruction: 'Instruktion (frivilligt)',
    };
  }

  if (category === 'receiving') {
    return {
      singular: 'mottagningspunkt',
      plural: 'Mottagningspunkter',
      add: 'Lägg till mottagningspunkt',
      name: 'Namn (obligatoriskt)',
      namePlaceholder: 'Exempel: Kylvaror',
      location: 'Plats eller grupp (frivilligt)',
      locationPlaceholder: 'Frivilligt',
      limit: 'Maxgräns',
      instruction: 'Instruktion (frivilligt)',
    };
  }

  return {
    singular: 'punkt',
    plural: category === 'round' ? 'Områden' : 'Punkter',
    add: category === 'round' ? 'Lägg till kontrollpunkt' : 'Lägg till kontrollpunkt',
    name: 'Vad ska checkas? (obligatoriskt)',
    namePlaceholder: category === 'round' ? 'Exempel: Hygien och rengöring' : 'Exempel: Kök',
    location: 'Plats (frivilligt)',
    locationPlaceholder: 'Frivilligt',
    limit: 'Maxgräns',
    instruction: 'Instruktion (frivilligt)',
  };
}

function formatObjectMeta(controlObject: ControlObject, category: ControlCategory): string {
  if (category === 'temperature' || category === 'receiving') {
    const unit = controlObject.unit ?? '°C';
    const limit = controlObject.limit_max === null || controlObject.limit_max === undefined
      ? null
      : `Max ${controlObject.limit_max}${unit}`;
    return [controlObject.location, limit].filter(Boolean).join(' · ') || 'Ingen gräns';
  }

  return controlObject.location || 'OK / Ej OK';
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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [savingType, setSavingType] = useState(false);
  const [creatingObject, setCreatingObject] = useState(false);
  const [creatingField, setCreatingField] = useState(false);
  const [creatingFieldForObjectId, setCreatingFieldForObjectId] = useState<string | null>(null);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const [objectName, setObjectName] = useState('');
  const [objectLocation, setObjectLocation] = useState('');
  const [objectInstructions, setObjectInstructions] = useState('');
  const [limitMax, setLimitMax] = useState('');

  const availableFieldOptions = useMemo(() => getFieldOptions(controlType.category), [controlType.category]);

  const [editObjectName, setEditObjectName] = useState('');
  const [editObjectLocation, setEditObjectLocation] = useState('');
  const [editObjectInstructions, setEditObjectInstructions] = useState('');
  const [editObjectLimitMax, setEditObjectLimitMax] = useState('');

  const [editFieldLabel, setEditFieldLabel] = useState('');
  const [editFieldRequired, setEditFieldRequired] = useState(true);
  const [editFieldLimitMin, setEditFieldLimitMin] = useState('');
  const [editFieldLimitMax, setEditFieldLimitMax] = useState('');
  const [editFieldUnit, setEditFieldUnit] = useState('°C');

  const [typeName, setTypeName] = useState(controlType.name);
  const [typeFrequency, setTypeFrequency] = useState<ControlFrequency>(controlType.frequency);
  const [typeWeekday, setTypeWeekday] = useState<IsoWeekday>(readWeeklyWeekday(controlType.frequency_config) ?? 1);
  const [typeInstructions, setTypeInstructions] = useState(controlType.instructions ?? '');

  const mode = readControlMode(controlType.category);
  const fixedFieldType = readFixedFieldType(controlType.category);
  const usesPointScopedFields = mode === 'point';
  const words = getPointWords(controlType.category);
  const activeObjects = objects.filter((item) => item.active);
  const inactiveObjects = objects.filter((item) => !item.active);
  const activeFields = fields.filter((item) => item.active);
  const inactiveFields = fields.filter((item) => !item.active);
  const lockedBaseField = fixedFieldType
    ? fields.find((field) => field.field_type === fixedFieldType && !field.control_object_id)
    : null;
  const lockedFieldIds = lockedBaseField ? [lockedBaseField.id] : [];
  const visibleInactiveFields = inactiveFields.filter((field) => field.id !== lockedBaseField?.id);
  const inactiveItemCount = inactiveObjects.length + visibleInactiveFields.length;
  const fixedFields = fixedFieldType ? activeFields.filter((field) => field.field_type === fixedFieldType) : [];
  const canvasFields = activeFields;
  const canvasObjects = mode === 'field' ? [] : activeObjects;
  const canShowCanvas = mode === 'point'
    ? canvasObjects.length > 0
    : canvasFields.length > 0;
  const presets = controlType.category === 'traceability'
    ? traceabilityPresets
    : controlType.category === 'receiving'
      ? receivingPresets
      : [];

  async function refreshFields() {
    const nextFields = await listControlFields(organizationId, controlType.id);
    setFields(nextFields);
  }

  async function refreshObjects() {
    const nextObjects = await listControlObjects(organizationId, controlType.id);
    setObjects(nextObjects);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setMessage('');
        const [nextFields, nextObjects] = await Promise.all([
          listControlFields(organizationId, controlType.id),
          listControlObjects(organizationId, controlType.id),
        ]);

        if (!active) return;
        setFields(nextFields);
        setObjects(nextObjects);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa kontrolltypen.');
      } finally {
        if (active) setLoading(false);
      }
    }

    setTypeName(controlType.name);
    setTypeFrequency(controlType.frequency);
    setTypeWeekday(readWeeklyWeekday(controlType.frequency_config) ?? 1);
    setTypeInstructions(controlType.instructions ?? '');
    void load();

    return () => {
      active = false;
    };
  }, [controlType, organizationId]);

  function resetObjectForm() {
    setObjectName('');
    setObjectLocation('');
    setObjectInstructions('');
    setLimitMax('');
  }

  function startEditObject(controlObject: ControlObject) {
    setEditingFieldId(null);
    setEditingObjectId(controlObject.id);
    setEditObjectName(controlObject.name);
    setEditObjectLocation(controlObject.location ?? '');
    setEditObjectInstructions(controlObject.instructions ?? '');
    setEditObjectLimitMax(controlObject.limit_max === null || controlObject.limit_max === undefined ? '' : String(controlObject.limit_max));
  }

  function startEditField(field: ControlFieldDefinition) {
    const temperatureRule = readFieldTemperatureRule(field);
    setEditingObjectId(null);
    setEditingFieldId(field.id);
    setEditFieldLabel(field.label);
    setEditFieldRequired(field.required);
    setEditFieldLimitMin(temperatureRule.limitMin);
    setEditFieldLimitMax(temperatureRule.limitMax);
    setEditFieldUnit(temperatureRule.unit);
  }

  async function handleCreateObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      await createControlObject({
        organizationId,
        controlTypeId: controlType.id,
        name: objectName.trim(),
        location: objectLocation.trim() || undefined,
        instructions: objectInstructions.trim() || undefined,
        limitMax: limitMax ? Number(limitMax) : null,
        unit: controlType.category === 'temperature' || controlType.category === 'receiving' ? '°C' : undefined,
      });
      await refreshObjects();
      setCreatingObject(false);
      resetObjectForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa punkten.');
    }
  }

  async function createField(preset: FieldPreset, openAfterCreate = false, controlObjectId: string | null = null) {
    setMessage('');

    try {
      const created = await createControlField({
        organizationId,
        controlTypeId: controlType.id,
        controlObjectId,
        label: (preset.defaultLabel ?? preset.label).trim(),
        fieldType: preset.fieldType,
        required: preset.required,
        deviationRule: preset.deviationRule,
      });
      await refreshFields();
      setCreatingField(false);
      setCreatingFieldForObjectId(null);
      if (openAfterCreate) {
        startEditField(created);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa fältet.');
    }
  }

  async function handleCreateFixedField() {
    if (!fixedFieldType) return;

    await createField({
      fieldType: fixedFieldType,
      label: fixedFieldType === 'temperature' ? 'Temperatur' : 'Status',
      required: true,
    });
  }

  async function handleSaveObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingObjectId) return;

    try {
      await updateControlObject({
        controlObjectId: editingObjectId,
        organizationId,
        name: editObjectName,
        location: editObjectLocation,
        instructions: editObjectInstructions,
        limitMax: (controlType.category === 'temperature' || controlType.category === 'receiving') && editObjectLimitMax
          ? Number(editObjectLimitMax)
          : null,
        active: true,
      });
      await refreshObjects();
      setEditingObjectId(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara punkten.');
    }
  }

  async function handleSaveField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingFieldId) return;
    const editingField = fields.find((field) => field.id === editingFieldId);
    if (!editingField) return;

    const parsedLimitMin = editFieldLimitMin.trim() ? Number(editFieldLimitMin) : null;
    const parsedLimitMax = editFieldLimitMax.trim() ? Number(editFieldLimitMax) : null;

    if (
      editingField.field_type === 'temperature'
      && parsedLimitMin !== null
      && parsedLimitMax !== null
      && Number.isFinite(parsedLimitMin)
      && Number.isFinite(parsedLimitMax)
      && parsedLimitMin > parsedLimitMax
    ) {
      setMessage('Minvärde kan inte vara högre än maxvärde.');
      return;
    }

    try {
      await updateControlField({
        fieldDefinitionId: editingFieldId,
        organizationId,
        label: editFieldLabel,
        required: editFieldRequired,
        active: true,
        deviationRule: editingField.field_type === 'temperature'
          ? buildTemperatureDeviationRule({
            limitMin: editFieldLimitMin,
            limitMax: editFieldLimitMax,
            unit: editFieldUnit,
          })
          : undefined,
      });
      await refreshFields();
      setEditingFieldId(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara fältet.');
    }
  }

  async function setObjectActive(controlObject: ControlObject, active: boolean) {
    try {
      await updateControlObject({
        controlObjectId: controlObject.id,
        organizationId,
        name: controlObject.name,
        location: controlObject.location,
        instructions: controlObject.instructions,
        limitMax: controlObject.limit_max,
        active,
      });
      await refreshObjects();
      if (!active && editingObjectId === controlObject.id) setEditingObjectId(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra punkten.');
    }
  }

  async function setFieldActive(field: ControlFieldDefinition, active: boolean) {
    try {
      await updateControlField({
        fieldDefinitionId: field.id,
        organizationId,
        label: field.label,
        required: field.required,
        active,
      });
      await refreshFields();
      if (!active && editingFieldId === field.id) setEditingFieldId(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra fältet.');
    }
  }

  async function duplicateObject(controlObject: ControlObject) {
    try {
      const created = await createControlObject({
        organizationId,
        controlTypeId: controlType.id,
        name: `${controlObject.name} kopia`,
        location: controlObject.location ?? undefined,
        instructions: controlObject.instructions ?? undefined,
        limitMin: controlObject.limit_min,
        limitMax: controlObject.limit_max,
        unit: controlObject.unit ?? undefined,
      });
      await refreshObjects();
      startEditObject(created);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte duplicera punkten.');
    }
  }

  async function duplicateField(field: ControlFieldDefinition) {
    await createField({
      fieldType: field.field_type,
      label: `${field.label} kopia`,
      defaultLabel: `${field.label} kopia`,
      required: field.required,
      deviationRule: field.deviation_rule,
    }, true, field.control_object_id ?? null);
  }

  async function handleSaveType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSavingType(true);
      const updated = await updateControlType(controlType.id, organizationId, {
        name: typeName,
        active: controlType.active,
        frequency: typeFrequency,
        frequencyConfig: typeFrequency === 'weekly'
          ? getFrequencyConfigWithWeekday(controlType.frequency_config, typeWeekday)
          : {},
        instructions: typeInstructions,
      });
      setTypeName(updated.name);
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara inställningar.');
    } finally {
      setSavingType(false);
    }
  }

  async function handleToggleType() {
    try {
      await setControlTypeActive(controlType.id, organizationId, !controlType.active);
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra kontrolltypen.');
    }
  }

  function renderObjectEditor(controlObject: ControlObject) {
    return (
      <form className="canvas-inline-edit-form" onSubmit={handleSaveObject}>
        <label>
          <span>{words.name}</span>
          <input className="text-input" value={editObjectName} onChange={(event) => setEditObjectName(event.target.value)} required />
        </label>
        <label>
          <span>{words.location}</span>
          <input className="text-input" value={editObjectLocation} onChange={(event) => setEditObjectLocation(event.target.value)} />
        </label>
        {controlType.category === 'temperature' || controlType.category === 'receiving' ? (
          <label>
            <span>{words.limit}</span>
            <div className="limit-input-row">
              <input
                className="text-input"
                value={editObjectLimitMax}
                onChange={(event) => setEditObjectLimitMax(event.target.value)}
                required={controlType.category === 'temperature'}
                type="number"
              />
              <span>°C</span>
            </div>
          </label>
        ) : null}
        <label>
          <span>{words.instruction}</span>
          <textarea
            className="text-input control-type-instructions-input"
            value={editObjectInstructions}
            onChange={(event) => setEditObjectInstructions(event.target.value)}
            rows={3}
          />
        </label>
        <div className="editor-action-row">
          <button className="control-point-action primary" type="submit">Spara</button>
          <button className="control-point-action" type="button" onClick={() => setEditingObjectId(null)}>Avbryt</button>
          <button className="control-point-action" type="button" onClick={() => void duplicateObject(controlObject)}>Duplicera</button>
          <button className="control-point-action danger" type="button" onClick={() => void setObjectActive(controlObject, false)}>
            Inaktivera
          </button>
        </div>
      </form>
    );
  }

  function renderFieldEditor(field: ControlFieldDefinition) {
    return (
      <form className="canvas-inline-edit-form" onSubmit={handleSaveField}>
        <label>
          <span>{field.field_type === 'ok_not_ok' ? 'Vad ska checkas av?' : 'Namn'}</span>
          <input
            className="text-input"
            value={editFieldLabel}
            onChange={(event) => setEditFieldLabel(event.target.value)}
            placeholder={field.field_type === 'ok_not_ok' ? 'Vad ska checkas av?' : undefined}
            required
          />
        </label>
        <p className="field-editor-type">{fieldTypeLabels[field.field_type]}</p>
        {field.field_type === 'temperature' ? (
          <div className="temperature-rule-editor">
            <div className="temperature-rule-grid">
              <label>
                <span>Minvärde</span>
                <input
                  className="text-input"
                  value={editFieldLimitMin}
                  onChange={(event) => setEditFieldLimitMin(event.target.value)}
                  placeholder="Frivilligt"
                  type="number"
                />
              </label>
              <label>
                <span>Maxvärde</span>
                <input
                  className="text-input"
                  value={editFieldLimitMax}
                  onChange={(event) => setEditFieldLimitMax(event.target.value)}
                  placeholder="Frivilligt"
                  type="number"
                />
              </label>
            </div>
            <label>
              <span>Enhet</span>
              <input
                className="text-input"
                value={editFieldUnit}
                onChange={(event) => setEditFieldUnit(event.target.value)}
                placeholder="°C"
              />
            </label>
          </div>
        ) : null}
        <label className="control-field-checkbox">
          <input checked={editFieldRequired} onChange={(event) => setEditFieldRequired(event.target.checked)} type="checkbox" />
          Obligatoriskt
        </label>
        <div className="editor-action-row">
          <button className="control-point-action primary" type="submit">Spara</button>
          <button className="control-point-action" type="button" onClick={() => setEditingFieldId(null)}>Avbryt</button>
          <button className="control-point-action" type="button" onClick={() => void duplicateField(field)}>Duplicera</button>
          <button className="control-point-action danger" type="button" onClick={() => void setFieldActive(field, false)}>
            Inaktivera
          </button>
        </div>
      </form>
    );
  }

  function renderFieldPalette(controlObjectId: string | null) {
    const isObjectPalette = Boolean(controlObjectId);

    return (
      <div className="quick-create-panel object-field-palette" aria-label="Lägg till svarsfält">
        <div className="field-palette-heading">
          <div>
            <p className="eyebrow">Svarsfält</p>
            <h5>{isObjectPalette ? 'Vad ska fyllas i här?' : 'Vad ska fyllas i per kontrollpunkt?'}</h5>
          </div>
          <button
            className="control-point-action"
            type="button"
            onClick={() => {
              setCreatingField(false);
              setCreatingFieldForObjectId(null);
            }}
          >
            Stäng
          </button>
        </div>
        {presets.length > 0 && !isObjectPalette ? (
          <div className="preset-strip" aria-label="Vanliga fält">
            {presets.map((preset) => (
              <button
                className="preset-chip"
                key={`${preset.fieldType}-${preset.label}`}
                type="button"
                onClick={() => void createField(preset, true, controlObjectId)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="field-type-palette">
          {availableFieldOptions.map((option) => (
            <button
              className="field-type-card"
              key={`${option.fieldType}-${option.label}`}
              type="button"
              onClick={() => void createField(option, true, controlObjectId)}
            >
              <span className="field-type-icon">{option.icon}</span>
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderObjectFieldTools(controlObject: ControlObject) {
    return (
      <div className="object-field-tools">
        <button
          className="control-point-action primary"
          type="button"
          onClick={() => {
            setCreatingField(false);
            setCreatingFieldForObjectId((current) => current === controlObject.id ? null : controlObject.id);
          }}
        >
          + Lägg till svarsfält
        </button>
        {creatingFieldForObjectId === controlObject.id ? renderFieldPalette(controlObject.id) : null}
      </div>
    );
  }

  const activeCountLabel = mode === 'field'
    ? `${activeFields.length} fält`
    : `${activeObjects.length} punkter · ${canvasFields.length} fält`;

  return (
    <section className="control-type-detail" aria-labelledby="control-type-detail-title">
      <div className="control-type-detail-topbar">
        <BackButton onClick={onBack} />
        <div>
          <p className="eyebrow">Redigera kontroll</p>
          <h3 id="control-type-detail-title">{controlType.name}</h3>
          <p>{formatFrequencyLabel(controlType) ?? categoryLabels[controlType.category]}</p>
        </div>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      <section className="control-editor-canvas-shell">
        <div className="control-editor-heading">
          <div>
            <p className="eyebrow">{mode === 'field' ? 'Information att fylla i' : words.plural}</p>
            <h4>{mode === 'field' ? 'Bygg genom att klicka på fälten' : 'Bygg genom att klicka direkt i listan'}</h4>
          </div>
          <span className="control-point-count">{activeCountLabel}</span>
        </div>

        {canManage ? (
          <div className="control-editor-actions">
            {mode !== 'field' ? (
              <button className="control-point-action primary" type="button" onClick={() => setCreatingObject((current) => !current)}>
                {words.add}
              </button>
            ) : null}
            {mode !== 'point' ? (
              <button className="control-point-action primary" type="button" onClick={() => setCreatingField((current) => !current)}>
                Lägg till svarsfält
              </button>
            ) : null}
            {!usesPointScopedFields && fixedFieldType && fixedFields.length === 0 ? (
              <button className="control-point-action" type="button" onClick={() => void handleCreateFixedField()}>
                Återställ basfält
              </button>
            ) : null}
          </div>
        ) : null}

        {creatingObject ? (
          <form className="quick-create-panel" onSubmit={handleCreateObject}>
            <label>
              <span>{words.name}</span>
              <input
                className="text-input"
                value={objectName}
                onChange={(event) => setObjectName(event.target.value)}
                placeholder={words.namePlaceholder}
                required
              />
            </label>
            <label>
              <span>{words.location}</span>
              <input
                className="text-input"
                value={objectLocation}
                onChange={(event) => setObjectLocation(event.target.value)}
                placeholder={words.locationPlaceholder}
              />
            </label>
            {controlType.category === 'temperature' || controlType.category === 'receiving' ? (
              <label>
                <span>{words.limit}</span>
                <div className="limit-input-row">
                  <input
                    className="text-input"
                    value={limitMax}
                    onChange={(event) => setLimitMax(event.target.value)}
                    placeholder="8"
                    required={controlType.category === 'temperature'}
                    type="number"
                  />
                  <span>°C</span>
                </div>
              </label>
            ) : null}
            <label>
              <span>{words.instruction}</span>
              <textarea
                className="text-input control-type-instructions-input"
                value={objectInstructions}
                onChange={(event) => setObjectInstructions(event.target.value)}
                rows={3}
              />
            </label>
            <div className="editor-action-row">
              <button className="control-point-action primary" type="submit">Skapa</button>
              <button className="control-point-action" type="button" onClick={() => setCreatingObject(false)}>Avbryt</button>
            </div>
          </form>
        ) : null}

        {creatingField ? (
          renderFieldPalette(null)
        ) : null}

        {loading ? <p className="muted-copy">Laddar...</p> : null}
        {!loading && canShowCanvas ? (
          <ControlDefinitionCanvas
            controlType={controlType}
            objects={canvasObjects}
            fields={canvasFields}
            mode={canManage ? 'edit' : 'preview'}
            selectedFieldId={editingFieldId}
            selectedObjectId={editingObjectId}
            onEditField={startEditField}
            onEditObject={startEditObject}
            lockedFieldIds={lockedFieldIds}
            renderFieldEditor={renderFieldEditor}
            renderObjectEditor={renderObjectEditor}
            renderObjectFieldTools={usesPointScopedFields ? renderObjectFieldTools : undefined}
          />
        ) : null}
        {!loading && !canShowCanvas ? (
          <div className="control-detail-empty compact">
            <strong>{fixedFieldType && fixedFields.length === 0 ? 'Basfält saknas' : 'Inget att redigera ännu'}</strong>
            <p className="muted-copy">
              {mode === 'field'
                ? 'Lägg till ett fält för att börja.'
                : 'Lägg till en punkt för att börja.'}
            </p>
          </div>
        ) : null}
      </section>

      {inactiveItemCount > 0 ? (
        <details className="inactive-editor-list">
          <summary>Inaktiva saker ({inactiveItemCount})</summary>
          <div className="inactive-editor-grid">
            {inactiveObjects.map((controlObject) => (
              <article className="inactive-editor-row" key={controlObject.id}>
                <div>
                  <strong>{controlObject.name}</strong>
                  <span>{formatObjectMeta(controlObject, controlType.category)}</span>
                </div>
                <button className="control-point-action" type="button" onClick={() => void setObjectActive(controlObject, true)}>
                  Aktivera
                </button>
              </article>
            ))}
            {visibleInactiveFields.map((field) => (
              <article className="inactive-editor-row" key={field.id}>
                <div>
                  <strong>{field.label}</strong>
                  <span>{fieldTypeLabels[field.field_type]}</span>
                </div>
                <button className="control-point-action" type="button" onClick={() => void setFieldActive(field, true)}>
                  Aktivera
                </button>
              </article>
            ))}
          </div>
        </details>
      ) : null}

      <details className="control-type-settings-panel">
        <summary>Inställningar</summary>
        <form className="control-type-settings-form compact" onSubmit={handleSaveType}>
          <label>
            <span>Namn</span>
            <input className="text-input" value={typeName} onChange={(event) => setTypeName(event.target.value)} required />
          </label>
          <label>
            <span>Frekvens</span>
            <select className="text-input" value={typeFrequency} onChange={(event) => setTypeFrequency(event.target.value as ControlFrequency)}>
              {Object.entries(frequencyLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>
          {typeFrequency === 'weekly' ? (
            <label>
              <span>Veckodag</span>
              <select className="text-input" value={typeWeekday} onChange={(event) => setTypeWeekday(Number(event.target.value) as IsoWeekday)}>
                {weekdayOptions.map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span>Instruktion</span>
            <textarea className="text-input control-type-instructions-input" value={typeInstructions} onChange={(event) => setTypeInstructions(event.target.value)} rows={4} />
          </label>
          <div className="editor-action-row">
            <button className="control-point-action primary" type="submit" disabled={savingType}>
              {savingType ? 'Sparar...' : 'Spara'}
            </button>
            {canManage ? (
              <button className="control-point-action danger" type="button" onClick={() => void handleToggleType()}>
                {controlType.active ? 'Inaktivera kontrolltyp' : 'Aktivera kontrolltyp'}
              </button>
            ) : null}
          </div>
        </form>
      </details>
    </section>
  );
}
