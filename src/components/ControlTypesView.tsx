import { useEffect, useState } from 'react';
import { AdminControls } from './AdminControls';
import { ControlTypeDetailView } from './ControlTypeDetailView';
import { BackButton } from './ui/BackButton';
import { listControlTypes } from '../services/controlAdminService';
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

function ControlTypeRow({ controlType, onOpen }: { controlType: ControlType; onOpen: () => void }) {
  const meta = categoryMeta[controlType.category] ?? categoryMeta.custom;

  return (
    <button className="control-type-row" type="button" aria-label={`Öppna ${controlType.name}`} onClick={onOpen}>
      <span className={`control-type-icon ${meta.className}`} aria-hidden="true">
        {meta.icon}
      </span>
      <span className="control-type-copy">
        <strong>{controlType.name}</strong>
        <span>{frequencyLabels[controlType.frequency] ?? meta.label}</span>
      </span>
      <span className="control-type-chevron" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

function readControlTypeIdFromHash(): string | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash).get('controlTypeId');
}

function writeControlTypeIdToHash(controlTypeId: string | null) {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  params.set('view', 'add');

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
              controlType={controlType}
              key={controlType.id}
              onOpen={() => openControlType(controlType.id)}
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
