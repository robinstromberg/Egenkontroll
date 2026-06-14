import { FormEvent, useEffect, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  createControlObject,
  createControlType,
  listControlObjects,
  listControlTypes,
  setControlObjectActive,
  setControlTypeActive,
} from '../services/controlAdminService';
import type { ControlCategory, ControlFrequency, ControlObject, ControlType } from '../types/database';
import './AdminControls.css';

export type AdminControlsProps = {
  organizationId: string;
  userId: string;
};

const categories: Array<{ value: ControlCategory; label: string }> = [
  { value: 'temperature', label: 'Temperatur' },
  { value: 'checklist', label: 'Checklista' },
  { value: 'receiving', label: 'Varumottagning' },
  { value: 'traceability', label: 'Spårbarhet' },
  { value: 'round', label: 'Egenkontrollrunda' },
  { value: 'custom', label: 'Anpassad' },
];

const frequencies: Array<{ value: ControlFrequency; label: string }> = [
  { value: 'daily', label: 'Dagligen' },
  { value: 'weekly', label: 'Veckovis' },
  { value: 'per_delivery', label: 'Per leverans' },
  { value: 'custom', label: 'Anpassad' },
];

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

export function AdminControls({ organizationId, userId }: AdminControlsProps) {
  const [controlTypes, setControlTypes] = useState<ControlType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [objects, setObjects] = useState<ControlObject[]>([]);
  const [typeName, setTypeName] = useState('');
  const [category, setCategory] = useState<ControlCategory>('custom');
  const [frequency, setFrequency] = useState<ControlFrequency>('daily');
  const [objectName, setObjectName] = useState('');
  const [objectLocation, setObjectLocation] = useState('');
  const [limitMax, setLimitMax] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function refreshControlTypes() {
    const nextTypes = await listControlTypes(organizationId);
    setControlTypes(nextTypes);
    if (!selectedTypeId && nextTypes[0]) {
      setSelectedTypeId(nextTypes[0].id);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const nextTypes = await listControlTypes(organizationId);
        if (!active) return;
        setControlTypes(nextTypes);
        setSelectedTypeId((current) => current || nextTypes[0]?.id || '');
      } catch (error) {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : 'Kunde inte läsa kontrolltyper.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [organizationId]);

  useEffect(() => {
    let active = true;

    async function loadObjects() {
      if (!selectedTypeId) {
        setObjects([]);
        return;
      }

      try {
        const nextObjects = await listControlObjects(organizationId, selectedTypeId);
        if (active) setObjects(nextObjects);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa objekt.');
      }
    }

    void loadObjects();

    return () => {
      active = false;
    };
  }, [organizationId, selectedTypeId]);

  async function handleCreateType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      const created = await createControlType({
        organizationId,
        name: typeName.trim(),
        category,
        frequency,
        createdBy: userId,
      });
      setTypeName('');
      setCategory('custom');
      setFrequency('daily');
      await refreshControlTypes();
      setSelectedTypeId(created.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa kontrolltyp.');
    }
  }

  async function handleCreateObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!selectedTypeId) return;

    try {
      await createControlObject({
        organizationId,
        controlTypeId: selectedTypeId,
        name: objectName.trim(),
        location: objectLocation.trim() || undefined,
        limitMax: limitMax ? Number(limitMax) : null,
      });
      setObjectName('');
      setObjectLocation('');
      setLimitMax('');
      setObjects(await listControlObjects(organizationId, selectedTypeId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa objekt.');
    }
  }

  async function toggleType(controlType: ControlType) {
    await setControlTypeActive(controlType.id, organizationId, !controlType.active);
    await refreshControlTypes();
  }

  async function toggleObject(controlObject: ControlObject) {
    await setControlObjectActive(controlObject.id, organizationId, !controlObject.active);
    if (selectedTypeId) {
      setObjects(await listControlObjects(organizationId, selectedTypeId));
    }
  }

  const selectedType = controlTypes.find((item) => item.id === selectedTypeId);

  return (
    <section className="admin-controls" aria-labelledby="admin-controls-title">
      <div>
        <p className="eyebrow">Admin</p>
        <h3 id="admin-controls-title">Kontrolltyper och objekt</h3>
        <p className="muted-copy">
          Här kan du lägga till och inaktivera verksamhetens kontroller utan att förstöra historik.
        </p>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}
      {loading ? <p className="muted-copy">Laddar kontrollstruktur...</p> : null}

      <div className="admin-grid">
        <form className="admin-form" onSubmit={handleCreateType}>
          <h4>Ny kontrolltyp</h4>
          <label>
            <span>Namn</span>
            <input
              className="text-input"
              value={typeName}
              onChange={(event) => setTypeName(event.target.value)}
              placeholder="Exempel: Diskkontroll"
              required
            />
          </label>
          <label>
            <span>Kategori</span>
            <select className="text-input" value={category} onChange={(event) => setCategory(event.target.value as ControlCategory)}>
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Frekvens</span>
            <select className="text-input" value={frequency} onChange={(event) => setFrequency(event.target.value as ControlFrequency)}>
              {frequencies.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <ActionButton type="submit">Lägg till kontrolltyp</ActionButton>
        </form>

        <div className="admin-list">
          <h4>Befintliga kontrolltyper</h4>
          {controlTypes.map((controlType) => (
            <article className={controlType.id === selectedTypeId ? 'admin-row selected' : 'admin-row'} key={controlType.id}>
              <div className="admin-row-header">
                <button className="template-toggle" type="button" onClick={() => setSelectedTypeId(controlType.id)}>
                  {controlType.name}
                </button>
                <button className={controlType.active ? 'admin-small-button' : 'admin-small-button inactive'} type="button" onClick={() => toggleType(controlType)}>
                  {controlType.active ? 'Inaktivera' : 'Aktivera'}
                </button>
              </div>
              <p>{frequencyLabels[controlType.frequency]} · {categoryLabels[controlType.category]}</p>
              <span className={controlType.active ? 'admin-status active' : 'admin-status inactive'}>
                {controlType.active ? 'Aktiv' : 'Inaktiv'}
              </span>
            </article>
          ))}
        </div>
      </div>

      <div className="admin-object-panel">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Kontrollpunkter</p>
            <h4>{selectedType?.name ?? 'Ingen kontrolltyp vald'}</h4>
          </div>
          {selectedType ? <span className="admin-status active">{objects.filter((item) => item.active).length} aktiva</span> : null}
        </div>

        <form className="admin-form" onSubmit={handleCreateObject}>
          <h4>Lägg till kontrollpunkt</h4>
          <label>
            <span>Namn</span>
            <input
              className="text-input"
              value={objectName}
              onChange={(event) => setObjectName(event.target.value)}
              placeholder="Exempel: Kyl 3 – Beredning"
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
          <ActionButton type="submit" disabled={!selectedTypeId}>Lägg till kontrollpunkt</ActionButton>
        </form>

        <div className="admin-list object-list">
          {objects.length === 0 ? <p className="muted-copy">Inga kontrollpunkter finns för vald kontrolltyp ännu.</p> : null}
          {objects.map((controlObject) => (
            <article className={controlObject.active ? 'admin-object-card' : 'admin-object-card inactive'} key={controlObject.id}>
              <div className="admin-object-icon" aria-hidden="true">{selectedType?.category === 'temperature' ? '°C' : '✓'}</div>
              <div>
                <h4>{controlObject.name}</h4>
                <p>
                  {controlObject.location ?? 'Ingen plats'} · {controlObject.limit_max ?? 'Ingen gräns'} {controlObject.unit ?? ''}
                </p>
              </div>
              <button className={controlObject.active ? 'admin-small-button' : 'admin-small-button inactive'} type="button" onClick={() => toggleObject(controlObject)}>
                {controlObject.active ? 'Inaktivera' : 'Aktivera'}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
