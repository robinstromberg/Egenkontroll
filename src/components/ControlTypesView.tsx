import { useEffect, useState } from 'react';
import { AdminControls } from './AdminControls';
import { ControlTypeDetailView } from './ControlTypeDetailView';
import { ActionButton } from './ui/ActionButton';
import { listControlTypes } from '../services/controlAdminService';
import { getControlTypeVisual } from '../utils/controlTypeVisuals';
import type { ControlFrequency, ControlType } from '../types/database';
import './ControlTypesView.css';

type ControlTypesViewProps = {
  organizationId: string;
  userId: string;
  canManage: boolean;
};

const frequencyLabels: Record<ControlFrequency, string> = {
  daily: 'Dagligen',
  weekly: 'Veckovis',
  per_delivery: 'Vid leverans',
  custom: 'Anpassad',
};

function ControlTypeRow({ controlType, onOpen }: { controlType: ControlType; onOpen: () => void }) {
  const visual = getControlTypeVisual(controlType);

  return (
    <button className="control-type-row" type="button" aria-label={`Öppna ${controlType.name}`} onClick={onOpen}>
      <span className={`control-type-icon ${visual.className}${visual.imageSrc ? ' has-image' : ''}`} aria-hidden="true">
        {visual.imageSrc ? <img src={visual.imageSrc} alt="" /> : visual.icon}
      </span>
      <span className="control-type-copy">
        <strong>{controlType.name}</strong>
        <span>{frequencyLabels[controlType.frequency] ?? visual.label}</span>
      </span>
      <span className="control-type-chevron" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

export function ControlTypesView({ organizationId, userId, canManage }: ControlTypesViewProps) {
  const [controlTypes, setControlTypes] = useState<ControlType[]>([]);
  const [selectedControlTypeId, setSelectedControlTypeId] = useState<string | null>(null);
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

  if (selectedControlType) {
    return (
      <ControlTypeDetailView
        organizationId={organizationId}
        controlType={selectedControlType}
        canManage={canManage}
        onBack={() => setSelectedControlTypeId(null)}
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
          <ActionButton variant="secondary" type="button" onClick={() => setShowAdminControls(false)}>
            Tillbaka
          </ActionButton>
          <h3 id="control-types-title">Lägg till kontrolltyp</h3>
        </div>
        <AdminControls organizationId={organizationId} userId={userId} />
      </section>
    );
  }

  return (
    <section className="control-types-view" aria-labelledby="control-types-title">
      <div className="control-types-topbar">
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
              onOpen={() => setSelectedControlTypeId(controlType.id)}
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
