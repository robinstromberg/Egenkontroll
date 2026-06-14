import { FormEvent, useEffect, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  createControlObject,
  listControlObjects,
  setControlObjectActive,
  setControlTypeActive,
} from '../services/controlAdminService';
import type { ControlCategory, ControlFrequency, ControlObject, ControlType } from '../types/database';
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
  const [objectName, setObjectName] = useState('');
  const [objectLocation, setObjectLocation] = useState('');
  const [limitMax, setLimitMax] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
        const nextObjects = await listControlObjects(organizationId, controlType.id);
        if (active) setObjects(nextObjects);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa kontrollpunkter.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [organizationId, controlType.id]);

  async function handleCreateObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      await createControlObject({
        organizationId,
        controlTypeId: controlType.id,
        name: objectName.trim(),
        location: objectLocation.trim() || undefined,
        limitMax: limitMax ? Number(limitMax) : null,
        unit: controlType.category === 'temperature' ? '°C' : undefined,
      });
      setObjectName('');
      setObjectLocation('');
      setLimitMax('');
      await refreshObjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa kontrollpunkt.');
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

  const pointLabel = getControlPointLabel(controlType.category);

  return (
    <section className="control-type-detail" aria-labelledby="control-type-detail-title">
      <div className="control-type-detail-topbar">
        <ActionButton variant="secondary" type="button" onClick={onBack}>
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
        <ActionButton variant="secondary" type="button" onClick={handleToggleType}>
          {controlType.active ? 'Inaktivera kontrolltyp' : 'Aktivera kontrolltyp'}
        </ActionButton>
      ) : null}

      <div className="control-point-section">
        <div className="control-point-heading">
          <div>
            <p className="eyebrow">{pointLabel}</p>
            <h4>Kontrollpunkter för {controlType.name}</h4>
          </div>
          <span className="control-point-count">{objects.filter((item) => item.active).length} aktiva</span>
        </div>

        {loading ? <p className="muted-copy">Laddar kontrollpunkter...</p> : null}
        {!loading && objects.length === 0 ? <p className="muted-copy">Inga kontrollpunkter finns ännu.</p> : null}

        <div className="control-point-list">
          {objects.map((controlObject) => (
            <article className={controlObject.active ? 'control-point-card' : 'control-point-card inactive'} key={controlObject.id}>
              <div className="control-point-icon" aria-hidden="true">
                {controlType.category === 'temperature' ? '°C' : '✓'}
              </div>
              <div>
                <h4>{controlObject.name}</h4>
                <p>
                  {controlObject.location ?? 'Ingen plats'} · {controlObject.limit_max ?? 'Ingen gräns'} {controlObject.unit ?? ''}
                </p>
              </div>
              {canManage ? (
                <button className="control-point-action" type="button" onClick={() => handleToggleObject(controlObject)}>
                  {controlObject.active ? 'Inaktivera' : 'Aktivera'}
                </button>
              ) : null}
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
            <ActionButton type="submit">Lägg till kontrollpunkt</ActionButton>
          </form>
        ) : null}
      </div>
    </section>
  );
}
