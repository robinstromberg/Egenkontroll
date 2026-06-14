import { useEffect, useState } from 'react';
import { AdminControls } from './AdminControls';
import { ActionButton } from './ui/ActionButton';
import { listControlTypes } from '../services/controlAdminService';
import type { ControlCategory, ControlFrequency, ControlType } from '../types/database';
import './ControlTypesView.css';

type ControlTypesViewProps = {
  organizationId: string;
  userId: string;
  canManage: boolean;
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

function ControlTypeRow({ controlType }: { controlType: ControlType }) {
  const meta = categoryMeta[controlType.category] ?? categoryMeta.custom;

  return (
    <button className="control-type-row" type="button" aria-label={`Öppna ${controlType.name}`}>
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

export function ControlTypesView({ organizationId, userId, canManage }: ControlTypesViewProps) {
  const [controlTypes, setControlTypes] = useState<ControlType[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showAdminControls, setShowAdminControls] = useState(false);

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

  if (showAdminControls) {
    return (
      <section className="control-types-view" aria-labelledby="control-types-title">
        <div className="control-types-topbar">
          <ActionButton variant="secondary" type="button" onClick={() => setShowAdminControls(false)}>
            Tillbaka
          </ActionButton>
          <h3 id="control-types-title">Hantera kontrolltyper</h3>
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
            <ControlTypeRow controlType={controlType} key={controlType.id} />
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
