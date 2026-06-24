import { useEffect, useState } from 'react';
import { AdminControls } from './AdminControls';
import { ControlTypeDetailView } from './ControlTypeDetailView';
import { ActionButton } from './ui/ActionButton';
import { AssetIcon } from './ui/AssetIcon';
import { BackButton } from './ui/BackButton';
import { readControlTypeIcon } from '../config/assets';
import {
  deleteControlType,
  listControlTypes,
  setControlTypeActive,
} from '../services/controlAdminService';
import type { ControlCategory, ControlFrequency, ControlType } from '../types/database';
import './ControlTypesView.css';

type ControlTypesViewProps = {
  organizationId: string;
  userId: string;
  canManage: boolean;
  onBack?: () => void;
};

const categoryMeta: Record<ControlCategory, { icon: string; label: string; className: string }> = {
  temperature: { icon: '♨', label: 'Temperatur', className: 'temperature' },
  checklist: { icon: '✓', label: 'Checklista', className: 'checklist' },
  receiving: { icon: '□', label: 'Varumottagning', className: 'receiving' },
  traceability: { icon: '∞', label: 'Spårbarhet', className: 'traceability' },
  round: { icon: '○', label: 'Runda', className: 'round' },
  custom: { icon: '+', label: 'Egen', className: 'custom' },
};

const frequencyLabels: Record<ControlFrequency, string> = {
  daily: 'Dagligen',
  weekly: 'Veckovis',
  per_delivery: 'Vid leverans',
  custom: 'Anpassad',
};

type ControlTypeRowProps = {
  controlType: ControlType;
  canManage: boolean;
  saving: boolean;
  onDelete: () => void;
  onOpen: () => void;
  onToggleActive: () => void;
};

function ControlTypeRow({
  controlType,
  canManage,
  saving,
  onDelete,
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
            <span>{frequencyLabels[controlType.frequency] ?? meta.label}</span>
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
          <ActionButton type="button" variant="secondary" onClick={onDelete} disabled={saving}>
            Radera
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
  const [showAdminControls, setShowAdminControls] = useState(false);

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
  }, [organizationId, showAdminControls]);

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

  async function handleDelete(controlType: ControlType) {
    const confirmed = window.confirm(
      `Radera kontrolltypen "${controlType.name}"?\n\nOm det finns historik kopplad till kontrolltypen går den inte att radera. Då kan du inaktivera den istället.`,
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      setMessage('');
      await deleteControlType(controlType.id, organizationId);
      setControlTypes((current) => current.filter((item) => item.id !== controlType.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte radera kontrolltypen.');
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

  if (showAdminControls) {
    return (
      <section className="control-types-view" aria-labelledby="control-types-title">
        <div className="control-types-topbar">
          <BackButton onClick={() => setShowAdminControls(false)} />
          <h3 id="control-types-title">Lägg till kontrolltyp</h3>
        </div>
        <AdminControls organizationId={organizationId} userId={userId} />
      </section>
    );
  }

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

      {loading ? (
        <p className="muted-copy">Laddar kontrolltyper...</p>
      ) : controlTypes.length > 0 ? (
        <div className="control-type-list">
          {controlTypes.map((controlType) => (
            <ControlTypeRow
              canManage={canManage}
              controlType={controlType}
              key={controlType.id}
              saving={saving}
              onDelete={() => handleDelete(controlType)}
              onOpen={() => openControlType(controlType.id)}
              onToggleActive={() => handleToggleActive(controlType)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-view-card">
          <h3>Inga kontrolltyper ännu</h3>
          <p className="muted-copy">Lägg till kontrolltyper för verksamheten.</p>
        </div>
      )}

      {canManage ? (
        <button className="add-control-type-button" type="button" onClick={() => setShowAdminControls(true)}>
          <span aria-hidden="true">+</span>
          Lägg till kontrolltyp
        </button>
      ) : (
        <p className="muted-copy">Endast admin kan lägga till eller ändra kontrolltyper.</p>
      )}
    </section>
  );
}
