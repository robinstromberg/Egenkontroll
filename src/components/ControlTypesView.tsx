import { useCallback, useEffect, useState } from 'react';
import { AdminControls } from './AdminControls';
import { ControlTypeDetailView } from './ControlTypeDetailView';
import { AssetIcon } from './ui/AssetIcon';
import { BackButton } from './ui/BackButton';
import { readControlTypeIcon } from '../config/assets';
import { formatFrequencyLabel } from '../services/scheduleService';
import {
  listControlFields,
  listControlObjects,
  listControlTypes,
  setControlTypeActive,
} from '../services/controlAdminService';
import type { ControlCategory, ControlType } from '../types/database';
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

type ControlTypeRowProps = {
  controlType: ControlType;
  counts?: ControlTypeCounts;
  canManage: boolean;
  saving: boolean;
  onOpen: () => void;
  onToggleActive: () => void;
};

type ControlTypeCounts = {
  fields: number;
  objects: number;
};

function ControlTypeRow({
  controlType,
  counts,
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
        <div className="control-type-meta-row" aria-label={`Innehåll i ${controlType.name}`}>
          <span>{counts?.fields ?? 0} fält</span>
          <span>{counts?.objects ?? 0} kontrollpunkter</span>
        </div>
        <span className={controlType.active ? 'control-type-status active' : 'control-type-status inactive'}>
          {controlType.active ? 'Aktiv' : 'Inaktiv'}
        </span>
      </div>

      {canManage ? (
        <details className="control-type-menu">
          <summary aria-label={`Åtgärder för ${controlType.name}`}>...</summary>
          <div className="control-type-menu-panel">
            <button type="button" onClick={onOpen} disabled={saving}>
              Redigera
            </button>
            <button type="button" onClick={onToggleActive} disabled={saving}>
              {controlType.active ? 'Arkivera' : 'Återaktivera'}
            </button>
          </div>
        </details>
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
  const [controlTypeCounts, setControlTypeCounts] = useState<Record<string, ControlTypeCounts>>({});
  const [selectedControlTypeId, setSelectedControlTypeId] = useState<string | null>(() => readControlTypeIdFromHash());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showAdminControls, setShowAdminControls] = useState(false);

  const refreshControlTypeCounts = useCallback(async (nextTypes: ControlType[]) => {
    const entries = await Promise.all(
      nextTypes.map(async (controlType) => {
        const [fields, objects] = await Promise.all([
          listControlFields(organizationId, controlType.id),
          listControlObjects(organizationId, controlType.id),
        ]);

        return [
          controlType.id,
          {
            fields: fields.filter((field) => field.active).length,
            objects: objects.filter((object) => object.active).length,
          },
        ] as const;
      }),
    );

    setControlTypeCounts(Object.fromEntries(entries));
  }, [organizationId]);

  async function refreshControlTypes() {
    const nextTypes = await listControlTypes(organizationId);
    setControlTypes(nextTypes);
    await refreshControlTypeCounts(nextTypes);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setMessage('');
        const nextTypes = await listControlTypes(organizationId);
        if (!active) return;
        setControlTypes(nextTypes);
        await refreshControlTypeCounts(nextTypes);
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
  }, [organizationId, refreshControlTypeCounts, showAdminControls]);

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
        <AdminControls
          organizationId={organizationId}
          userId={userId}
          onCreated={(controlType) => {
            setShowAdminControls(false);
            setControlTypes((current) => [...current, controlType]);
            openControlType(controlType.id);
          }}
        />
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
              counts={controlTypeCounts[controlType.id]}
              key={controlType.id}
              saving={saving}
              onOpen={() => openControlType(controlType.id)}
              onToggleActive={() => handleToggleActive(controlType)}
            />
          ))}
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
        <button className="add-control-type-button" type="button" onClick={() => setShowAdminControls(true)}>
          <span aria-hidden="true">+</span>
          Skapa ny kontrolltyp
        </button>
      ) : (
        <p className="muted-copy">Endast admin kan lägga till eller ändra kontrolltyper.</p>
      )}
    </section>
  );
}
