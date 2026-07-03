import { FormEvent, useEffect, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  createControlType,
  listControlTypes,
  setControlTypeActive,
} from '../services/controlAdminService';
import { formatFrequencyLabel, getFrequencyConfigWithWeekday, weekdayOptions } from '../services/scheduleService';
import type { ControlCategory, ControlFrequency, ControlType } from '../types/database';
import type { IsoWeekday } from '../services/scheduleService';
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
  const [typeName, setTypeName] = useState('');
  const [category, setCategory] = useState<ControlCategory>('custom');
  const [frequency, setFrequency] = useState<ControlFrequency>('daily');
  const [weekday, setWeekday] = useState<IsoWeekday>(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function refreshControlTypes() {
    const nextTypes = await listControlTypes(organizationId);
    setControlTypes(nextTypes);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const nextTypes = await listControlTypes(organizationId);
        if (!active) return;
        setControlTypes(nextTypes);
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

  async function handleCreateType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      await createControlType({
        organizationId,
        name: typeName.trim(),
        category,
        frequency,
        frequencyConfig: frequency === 'weekly' ? getFrequencyConfigWithWeekday({}, weekday) : undefined,
        createdBy: userId,
      });
      setTypeName('');
      setCategory('custom');
      setFrequency('daily');
      setWeekday(1);
      await refreshControlTypes();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa kontrolltyp.');
    }
  }

  async function toggleType(controlType: ControlType) {
    await setControlTypeActive(controlType.id, organizationId, !controlType.active);
    await refreshControlTypes();
  }

  return (
    <section className="admin-controls" aria-labelledby="admin-controls-title">
      <div>
        <p className="eyebrow">Admin</p>
        <h3 id="admin-controls-title">Lägg till kontrolltyp</h3>
        <p className="muted-copy">
          Skapa nya kontrolltyper här. Kontrollpunkter hanteras sedan inne i respektive kontrolltyp.
        </p>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}
      {loading ? <p className="muted-copy">Laddar kontrolltyper...</p> : null}

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
          {frequency === 'weekly' ? (
            <label>
              <span>Veckodag</span>
              <select className="text-input" value={weekday} onChange={(event) => setWeekday(Number(event.target.value) as IsoWeekday)}>
                {weekdayOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          ) : null}
          <ActionButton type="submit">Lägg till kontrolltyp</ActionButton>
        </form>

        <div className="admin-list">
          <h4>Befintliga kontrolltyper</h4>
          {controlTypes.map((controlType) => (
            <article className="admin-row" key={controlType.id}>
              <div className="admin-row-header">
                <h4>{controlType.name}</h4>
                <button className={controlType.active ? 'admin-small-button' : 'admin-small-button inactive'} type="button" onClick={() => toggleType(controlType)}>
                  {controlType.active ? 'Inaktivera' : 'Aktivera'}
                </button>
              </div>
              <p>{formatFrequencyLabel(controlType)} · {categoryLabels[controlType.category]}</p>
              <span className={controlType.active ? 'admin-status active' : 'admin-status inactive'}>
                {controlType.active ? 'Aktiv' : 'Inaktiv'}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
