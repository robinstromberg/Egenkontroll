import { FormEvent, useEffect, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  createControlField,
  createControlObject,
  listControlFields,
  listControlObjects,
  setControlObjectActive,
  setControlTypeActive,
  updateControlObject,
  updateControlType,
  updateControlField,
} from '../services/controlAdminService';
import type {
  ControlCategory,
  ControlFieldDefinition,
  ControlFrequency,
  ControlObject,
  ControlType,
} from '../types/database';
import './ControlTypeDetailView.css';

type ControlTypeDetailViewProps = {
  organizationId: string;
  controlType: ControlType;
  canManage: boolean;
  onBack: () => void;
  onChanged: () => Promise<void>;
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

const fieldTypeOptions: Array<{
  fieldType: ControlFieldDefinition['field_type'];
  label: string;
  description: string;
  defaultLabel: string;
}> = [
  { fieldType: 'ok_not_ok', label: 'OK/Ej OK', description: 'För ja/nej-kontroller och avvikelser.', defaultLabel: 'Status' },
  { fieldType: 'textarea', label: 'Kommentar', description: 'Fri text när personalen behöver beskriva något.', defaultLabel: 'Kommentar' },
  { fieldType: 'temperature', label: 'Temperatur', description: 'Temperaturvärde som kan jämföras mot gränsvärden.', defaultLabel: 'Temperatur' },
  { fieldType: 'text', label: 'Text', description: 'Kort text, till exempel batchnummer eller märkning.', defaultLabel: 'Text' },
  { fieldType: 'date', label: 'Datum', description: 'Datumfält, till exempel bäst före.', defaultLabel: 'Datum' },
  { fieldType: 'datetime', label: 'Datum och tid', description: 'Tidpunkt eller tidssteg, till exempel start/slut.', defaultLabel: 'Tidpunkt' },
  { fieldType: 'select', label: 'Val', description: 'Fördefinierat val när alternativen kommer från mall.', defaultLabel: 'Val' },
  { fieldType: 'photo', label: 'Foto', description: 'Bild eller dokumentation från mobilen.', defaultLabel: 'Foto' },
];

function getControlPointLabel(category: ControlCategory): string {
  if (category === 'temperature') return 'Enheter';
  if (category === 'checklist') return 'Områden eller punkter';
  if (category === 'receiving') return 'Mottagningspunkter';
  if (category === 'traceability') return 'Spårbarhetspunkter';
  return 'Kontrollpunkter';
}

function getPlaceholder(category: ControlCategory): string {
  if (category === 'temperature') return 'Exempel: Kyl 3 – Beredning';
  if (category === 'checklist') return 'Exempel: Kök';
  if (category === 'receiving') return 'Exempel: Kylvaror';
  if (category === 'traceability') return 'Exempel: Etikettkontroll';
  return 'Exempel: Kontrollpunkt';
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
  const [fieldLabel, setFieldLabel] = useState('Status');
  const [fieldType, setFieldType] = useState<ControlFieldDefinition['field_type']>('ok_not_ok');
  const [fieldRequired, setFieldRequired] = useState(true);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState('');
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
  const [typeInstructions, setTypeInstructions] = useState(controlType.instructions ?? '');
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState(false);
  const [message, setMessage] = useState('');

  async function refreshObjects() {
    const nextObjects = await listControlObjects(organizationId, controlType.id);
    setObjects(nextObjects);
  }

  async function refreshFields() {
    const nextFields = await listControlFields(organizationId, controlType.id);
    setFields(nextFields);
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
    setTypeInstructions(controlType.instructions ?? '');
  }, [controlType.category, controlType.frequency, controlType.id, controlType.instructions, controlType.name]);

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

  async function handleCreateObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      await createControlObject({
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
      await refreshObjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa kontrollpunkt.');
    }
  }

  async function handleCreateField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      await createControlField({
        organizationId,
        controlTypeId: controlType.id,
        label: fieldLabel.trim(),
        fieldType,
        required: fieldRequired,
      });
      const selectedOption = fieldTypeOptions.find((option) => option.fieldType === fieldType);
      setFieldLabel(selectedOption?.defaultLabel ?? '');
      setFieldRequired(fieldType === 'ok_not_ok' || fieldType === 'temperature');
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa formulärfält.');
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

  async function handleToggleObject(controlObject: ControlObject) {
    setMessage('');
    try {
      await setControlObjectActive(controlObject.id, organizationId, !controlObject.active);
      await refreshObjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra kontrollpunkten.');
    }
  }

  function handleStartEditObject(controlObject: ControlObject) {
    setEditingObjectId(controlObject.id);
    setEditObjectName(controlObject.name);
    setEditObjectLocation(controlObject.location ?? '');
    setEditObjectInstructions(controlObject.instructions ?? '');
    setEditObjectLimitMax(controlObject.limit_max === null ? '' : String(controlObject.limit_max));
    setEditObjectActive(controlObject.active);
  }

  async function handleSaveObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingObjectId) return;
    setMessage('');

    try {
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
    }
  }

  function handleSelectFieldType(nextFieldType: ControlFieldDefinition['field_type']) {
    const selectedOption = fieldTypeOptions.find((option) => option.fieldType === nextFieldType);
    setFieldType(nextFieldType);
    setFieldLabel(selectedOption?.defaultLabel ?? '');
    setFieldRequired(nextFieldType === 'ok_not_ok' || nextFieldType === 'temperature');
  }

  function handleStartEditField(field: ControlFieldDefinition) {
    setEditingFieldId(field.id);
    setEditFieldLabel(field.label);
    setEditFieldRequired(field.required);
    setEditFieldActive(field.active);
  }

  async function handleSaveField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingFieldId) return;
    setMessage('');

    try {
      await updateControlField({
        fieldDefinitionId: editingFieldId,
        organizationId,
        label: editFieldLabel.trim(),
        required: editFieldRequired,
        active: editFieldActive,
      });
      setEditingFieldId(null);
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte uppdatera formulärfältet.');
    }
  }

  const pointLabel = getControlPointLabel(controlType.category);
  const activeFieldCount = fields.filter((field) => field.active).length;

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
        </div>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      <div className="control-type-detail-card">
        <div>
          <span>Kategori</span>
          <strong>{categoryLabels[controlType.category]}</strong>
        </div>
        <div>
          <span>Frekvens</span>
          <strong>{frequencyLabels[controlType.frequency]}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{controlType.active ? 'Aktiv' : 'Inaktiv'}</strong>
        </div>
      </div>

      {canManage ? (
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
            {savingType ? 'Sparar...' : 'Spara kontrolltyp'}
          </ActionButton>
        </form>
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

      <div className="control-field-section">
        <div className="control-point-heading">
          <div>
            <p className="eyebrow">Formulärfält</p>
            <h4>Vad ska fyllas i?</h4>
          </div>
          <span className="control-point-count">{activeFieldCount} aktiva</span>
        </div>

        {loading ? <p className="muted-copy">Laddar formulärfält...</p> : null}
        {!loading && fields.length === 0 ? (
          <div className="control-detail-empty">
            <strong>Inga formulärfält finns ännu</strong>
            <p className="muted-copy">
              {canManage
                ? 'Lägg till minst ett fält, till exempel OK/Ej OK eller temperatur. Annars kan kontrollen inte sparas.'
                : 'En administratör behöver lägga till fält innan kontrollen kan utföras.'}
            </p>
          </div>
        ) : null}

        <div className="control-field-list">
          {fields.map((field) => (
            <article className={field.active ? 'control-field-card' : 'control-field-card inactive'} key={field.id}>
              <div className="control-field-icon" aria-hidden="true">
                {field.field_type === 'photo' ? 'F' : field.field_type === 'date' ? 'D' : field.field_type === 'temperature' ? '°C' : 'OK'}
              </div>

              {editingFieldId === field.id ? (
                <form className="control-field-edit-form" onSubmit={handleSaveField}>
                  <label>
                    <span>Fråga eller fält</span>
                    <input
                      className="text-input"
                      value={editFieldLabel}
                      onChange={(event) => setEditFieldLabel(event.target.value)}
                      required
                    />
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
                    <button className="control-point-action" type="submit">Spara</button>
                    <button className="control-point-action" type="button" onClick={() => setEditingFieldId(null)}>
                      Avbryt
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h4>{field.label}</h4>
                    <p>
                      {fieldTypeLabels[field.field_type]} · {field.required ? 'Obligatoriskt' : 'Frivilligt'} ·{' '}
                      {field.active ? 'Aktivt' : 'Inaktivt'}
                    </p>
                  </div>
                  {canManage ? (
                    <button className="control-point-action" type="button" onClick={() => handleStartEditField(field)}>
                      Redigera
                    </button>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>

        {canManage ? (
          <form className="control-field-form" onSubmit={handleCreateField}>
            <h4>Lägg till fråga eller fält</h4>
            <div className="field-type-grid" role="group" aria-label="Fälttyp">
              {fieldTypeOptions.map((option) => (
                <button
                  className={fieldType === option.fieldType ? 'field-type-option selected' : 'field-type-option'}
                  key={option.fieldType}
                  onClick={() => handleSelectFieldType(option.fieldType)}
                  type="button"
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
            <label>
              <span>Fråga eller fält</span>
              <input
                className="text-input"
                value={fieldLabel}
                onChange={(event) => setFieldLabel(event.target.value)}
                required
              />
            </label>
            <label className="control-field-checkbox">
              <input
                checked={fieldRequired}
                onChange={(event) => setFieldRequired(event.target.checked)}
                type="checkbox"
              />
              Obligatoriskt
            </label>
            <ActionButton type="submit">Lägg till fält</ActionButton>
          </form>
        ) : null}
      </div>

      <div className="control-point-section">
        <div className="control-point-heading">
          <div>
            <p className="eyebrow">{pointLabel}</p>
            <h4>Kontrollpunkter för {controlType.name}</h4>
          </div>
          <span className="control-point-count">{objects.filter((item) => item.active).length} aktiva</span>
        </div>

        {loading ? <p className="muted-copy">Laddar kontrollpunkter...</p> : null}
        {!loading && objects.length === 0 ? (
          <div className="control-detail-empty">
            <strong>Inga kontrollpunkter finns ännu</strong>
            <p className="muted-copy">
              {canManage
                ? 'Lägg till kontrollpunkter som personalen ska gå igenom, till exempel kylar, områden eller produkter.'
                : 'En administratör behöver lägga till kontrollpunkter om kontrollen ska utföras per plats eller produkt.'}
            </p>
          </div>
        ) : null}

        <div className="control-point-list">
          {objects.map((controlObject) => (
            <article className={controlObject.active ? 'control-point-card' : 'control-point-card inactive'} key={controlObject.id}>
              <div className="control-point-icon" aria-hidden="true">
                {controlType.category === 'temperature' ? '°C' : '✓'}
              </div>
              {editingObjectId === controlObject.id ? (
                <form className="control-point-edit-form" onSubmit={handleSaveObject}>
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
                    <button className="control-point-action" type="submit">Spara</button>
                    <button className="control-point-action" type="button" onClick={() => setEditingObjectId(null)}>
                      Avbryt
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h4>{controlObject.name}</h4>
                    <p>
                      {controlObject.location ?? 'Ingen plats'} · {controlObject.limit_max ?? 'Ingen gräns'} {controlObject.unit ?? ''}
                    </p>
                    {controlObject.instructions ? (
                      <p className="control-point-instructions">{controlObject.instructions}</p>
                    ) : null}
                  </div>
                  {canManage ? (
                    <div className="control-field-actions">
                      <button className="control-point-action" type="button" onClick={() => handleStartEditObject(controlObject)}>
                        Redigera
                      </button>
                      <button className="control-point-action" type="button" onClick={() => handleToggleObject(controlObject)}>
                        {controlObject.active ? 'Arkivera' : 'Återaktivera'}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>

        {canManage ? (
          <form className="control-point-form" onSubmit={handleCreateObject}>
            <h4>Lägg till kontrollpunkt</h4>
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
            <ActionButton type="submit">Lägg till kontrollpunkt</ActionButton>
          </form>
        ) : null}
      </div>
    </section>
  );
}
