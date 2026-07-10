import { FormEvent, useEffect, useState } from 'react';
import { ControlTypeDetailView } from './ControlTypeDetailView';
import { ActionButton } from './ui/ActionButton';
import { AssetIcon } from './ui/AssetIcon';
import { BackButton } from './ui/BackButton';
import { readControlTypeIcon } from '../config/assets';
import { formatFrequencyLabel, getFrequencyConfigWithWeekday, weekdayOptions } from '../services/scheduleService';
import {
  createControlType,
  listControlTypes,
  setControlTypeActive,
} from '../services/controlAdminService';
import type { ControlCategory, ControlFrequency, ControlType } from '../types/database';
import type { IsoWeekday } from '../services/scheduleService';
import './ControlTypesView.css';

type ControlTypesViewProps = {
  organizationId: string;
  userId: string;
  canManage: boolean;
  onBack?: () => void;
};

const categoryMeta: Record<ControlCategory, { icon: string; label: string; className: string }> = {
  temperature: { icon: '°C', label: 'Temperatur', className: 'temperature' },
  checklist: { icon: 'OK', label: 'Checklista', className: 'checklist' },
  receiving: { icon: 'IN', label: 'Varumottagning', className: 'receiving' },
  traceability: { icon: 'SP', label: 'Spårbarhet', className: 'traceability' },
  round: { icon: 'R', label: 'Runda', className: 'round' },
  custom: { icon: '+', label: 'Egen', className: 'custom' },
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
  { value: 'per_delivery', label: 'Vid leverans' },
  { value: 'custom', label: 'Anpassad' },
];

type ControlTypeRowProps = {
  controlType: ControlType;
  canManage: boolean;
  saving: boolean;
  onOpen: () => void;
  onToggleActive: () => void;
};

function ControlTypeRow({
  controlType,
  canManage,
  saving,
  onOpen,
  onToggleActive,
}: ControlTypeRowProps) {
  const meta = categoryMeta[controlType.category] ?? categoryMeta.custom;
  const iconSrc = readControlTypeIcon({ category: controlType.category, name: controlType.name });

  return (
    <article className={controlType.active ? 'control-type-row' : 'control-type-row inactive'}>
      <span className={`control-type-icon ${meta.className}`} aria-hidden="true">
        <AssetIcon src={iconSrc} fallback={meta.icon} />
      </span>
      <div className="control-type-copy">
        <button className="control-type-open-button" type="button" aria-label={`Öppna ${controlType.name}`} onClick={onOpen}>
          <span>
            <strong>{controlType.name}</strong>
            <span>{formatFrequencyLabel(controlType) ?? meta.label}</span>
          </span>
        </button>
        <span className={controlType.active ? 'control-type-status active' : 'control-type-status inactive'}>
          {controlType.active ? 'Aktiv' : 'Inaktiv'}
        </span>
      </div>

      {canManage ? (
        <div className="control-type-actions" aria-label={`Åtgärder för ${controlType.name}`}>
          <ActionButton type="button" variant="secondary" onClick={onOpen} disabled={saving}>
            Redigera
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={onToggleActive} disabled={saving}>
            {controlType.active ? 'Inaktivera' : 'Aktivera'}
          </ActionButton>
        </div>
      ) : null}
    </article>
  );
}

function readControlTypeIdFromHash(): string | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash).get('controlTypeId');
}

function writeControlTypeIdToHash(controlTypeId: string | null) {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  params.set('view', 'menu');
  params.set('menu', 'controlTypes');

  if (controlTypeId) {
    params.set('controlTypeId', controlTypeId);
  } else {
    params.delete('controlTypeId');
  }

  const nextUrl = `${window.location.pathname}${window.location.search}#${params.toString()}`;
  window.history.replaceState(null, '', nextUrl);
}

export function ControlTypesView({ organizationId, userId, canManage, onBack }: ControlTypesViewProps) {
  const [controlTypes, setControlTypes] = useState<ControlType[]>([]);
  const [selectedControlTypeId, setSelectedControlTypeId] = useState<string | null>(() => readControlTypeIdFromHash());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [category, setCategory] = useState<ControlCategory>('temperature');
  const [frequency, setFrequency] = useState<ControlFrequency>('daily');
  const [weekday, setWeekday] = useState<IsoWeekday>(1);

  async function refreshControlTypes() {
    const nextTypes = await listControlTypes(organizationId);
    setControlTypes(nextTypes);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setMessage('');
        const nextTypes = await listControlTypes(organizationId);
        if (active) setControlTypes(nextTypes);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa kontrolltyper.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [organizationId]);

  const selectedControlType = selectedControlTypeId
    ? controlTypes.find((controlType) => controlType.id === selectedControlTypeId) ?? null
    : null;

  useEffect(() => {
    if (loading || !selectedControlTypeId) return;
    if (selectedControlType) return;

    setSelectedControlTypeId(null);
    writeControlTypeIdToHash(null);
  }, [loading, selectedControlType, selectedControlTypeId]);

  function openControlType(controlTypeId: string) {
    setSelectedControlTypeId(controlTypeId);
    writeControlTypeIdToHash(controlTypeId);
  }

  function closeControlType() {
    setSelectedControlTypeId(null);
    writeControlTypeIdToHash(null);
  }

  async function handleToggleActive(controlType: ControlType) {
    try {
      setSaving(true);
      setMessage('');
      await setControlTypeActive(controlType.id, organizationId, !controlType.active);
      setControlTypes((current) => current.map((item) => (
        item.id === controlType.id ? { ...item, active: !item.active } : item
      )));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra kontrolltypen.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage('');
      const created = await createControlType({
        organizationId,
        name: typeName.trim(),
        category,
        frequency,
        frequencyConfig: frequency === 'weekly' ? getFrequencyConfigWithWeekday({}, weekday) : undefined,
        createdBy: userId,
      });
      setTypeName('');
      setCategory('temperature');
      setFrequency('daily');
      setWeekday(1);
      setShowCreateForm(false);
      await refreshControlTypes();
      openControlType(created.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa kontrolltyp.');
    } finally {
      setSaving(false);
    }
  }

  if (selectedControlType) {
    return (
      <ControlTypeDetailView
        organizationId={organizationId}
        controlType={selectedControlType}
        canManage={canManage}
        onBack={closeControlType}
        onChanged={async () => {
          await refreshControlTypes();
        }}
      />
    );
  }

  const activeControlTypes = controlTypes.filter((controlType) => controlType.active);
  const inactiveControlTypes = controlTypes.filter((controlType) => !controlType.active);

  return (
    <section className="control-types-view" aria-labelledby="control-types-title">
      <div className="control-types-topbar">
        {onBack ? (
          <BackButton onClick={onBack} />
        ) : null}
        <p className="eyebrow">Lägg till</p>
        <h3 id="control-types-title">Kontrolltyper</h3>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      {showCreateForm ? (
        <form className="control-type-create-card" onSubmit={handleCreateType}>
          <label>
            <span>Namn</span>
            <input
              className="text-input"
              value={typeName}
              onChange={(event) => setTypeName(event.target.value)}
              placeholder="Exempel: Kyltemperaturer"
              required
            />
          </label>
          <label>
            <span>Typ</span>
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
          <div className="control-type-create-actions">
            <ActionButton type="submit" disabled={saving || !typeName.trim()}>
              {saving ? 'Skapar...' : 'Skapa och öppna'}
            </ActionButton>
            <ActionButton type="button" variant="secondary" onClick={() => setShowCreateForm(false)} disabled={saving}>
              Avbryt
            </ActionButton>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="muted-copy">Laddar kontrolltyper...</p>
      ) : controlTypes.length > 0 ? (
        <div className="control-type-list">
          {activeControlTypes.map((controlType) => (
            <ControlTypeRow
              canManage={canManage}
              controlType={controlType}
              key={controlType.id}
              saving={saving}
              onOpen={() => openControlType(controlType.id)}
              onToggleActive={() => handleToggleActive(controlType)}
            />
          ))}

          {inactiveControlTypes.length > 0 ? (
            <details className="inactive-control-types">
              <summary>Inaktiva kontrolltyper ({inactiveControlTypes.length})</summary>
              <div className="control-type-list inactive-list">
                {inactiveControlTypes.map((controlType) => (
                  <ControlTypeRow
                    canManage={canManage}
                    controlType={controlType}
                    key={controlType.id}
                    saving={saving}
                    onOpen={() => openControlType(controlType.id)}
                    onToggleActive={() => handleToggleActive(controlType)}
                  />
                ))}
              </div>
            </details>
          ) : null}
        </div>
      ) : (
        <div className="empty-view-card">
          <p className="eyebrow">Tomt läge</p>
          <h3>Inga kontrolltyper ännu</h3>
          <p className="muted-copy">
            {canManage
              ? 'Lägg till minst en kontrolltyp för att personalen ska kunna utföra dagens arbete.'
              : 'En administratör behöver lägga till kontrolltyper innan dagens arbete kan utföras.'}
          </p>
        </div>
      )}

      {canManage ? (
        <button className="add-control-type-button" type="button" onClick={() => setShowCreateForm(true)}>
          <span aria-hidden="true">+</span>
          Lägg till kontrolltyp
        </button>
      ) : (
        <p className="muted-copy">Endast admin kan lägga till eller ändra kontrolltyper.</p>
      )}
    </section>
  );
}
