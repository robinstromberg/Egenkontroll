import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  ControlDefinitionCanvas,
} from './ControlDefinitionCanvas';
import {
  getDefaultValue,
  getDeviationReason,
  isSupplierField,
  responseKey,
} from './ControlDefinitionCanvasLogic';
import type { DeviationState, FileState, ResponseState } from './ControlDefinitionCanvasLogic';
import {
  getControlRunDefinition,
  saveControlRun,
} from '../services/controlRunWithAttachmentsService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { listSuppliers } from '../services/supplierService';
import type {
  ControlResponse,
  ControlRunDefinition,
} from '../services/controlRunWithAttachmentsService';
import type { SavedControlSummary } from './SavedControlView';
import type { Supplier } from '../types/database';
import './ControlRunForm.css';

export type ControlRunFormWithPhotosProps = {
  organizationId: string;
  controlTypeId: string;
  userId: string;
  performedByName: string;
  onCancel: () => void;
  onSaved: (summary: SavedControlSummary) => Promise<void>;
  canManage: boolean;
  onConfigureControlType: () => void;
};

export function ControlRunFormWithPhotos({
  organizationId,
  controlTypeId,
  userId,
  performedByName,
  onCancel,
  onSaved,
  canManage,
  onConfigureControlType,
}: ControlRunFormWithPhotosProps) {
  const [definition, setDefinition] = useState<ControlRunDefinition | null>(null);
  const [responses, setResponses] = useState<ResponseState>({});
  const [files, setFiles] = useState<FileState>({});
  const [actions, setActions] = useState<DeviationState>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const isOnline = useOnlineStatus();

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const nextDefinition = await getControlRunDefinition(organizationId, controlTypeId);
        if (!active) return;
        setDefinition(nextDefinition);
        if (nextDefinition.fields.some(isSupplierField)) {
          const nextSuppliers = await listSuppliers(organizationId);
          if (!active) return;
          setSuppliers(nextSuppliers);
        } else {
          setSuppliers([]);
        }

        const nextResponses: ResponseState = {};
        const objects = nextDefinition.objects.length ? nextDefinition.objects : [null];
        for (const object of objects) {
          for (const field of nextDefinition.fields) {
            nextResponses[responseKey(object?.id ?? null, field.id)] = getDefaultValue(field);
          }
        }
        setResponses(nextResponses);
        setActions({});
        setFiles({});
      } catch (error) {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : 'Kunde inte läsa kontrollen.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [controlTypeId, organizationId]);

  const responseList = useMemo(() => {
    if (!definition) return [];
    const objects = definition.objects.length ? definition.objects : [null];
    const result: ControlResponse[] = [];

    for (const object of objects) {
      for (const field of definition.fields) {
        const key = responseKey(object?.id ?? null, field.id);
        const value = responses[key] ?? '';
        const reason = getDeviationReason(field, object, value);
        result.push({
          controlObjectId: object?.id ?? null,
          fieldDefinitionId: field.id,
          value,
          file: files[key] ?? null,
          deviationDetected: Boolean(reason),
          deviationReason: reason,
          actionText: reason ? actions[key] ?? null : null,
        });
      }
    }

    return result;
  }, [actions, definition, files, responses]);

  const missingAction = responseList.some((response) => response.deviationDetected && !response.actionText?.trim());

  function updateResponse(key: string, value: string) {
    setResponses((current) => ({ ...current, [key]: value }));
  }

  function updateAction(key: string, value: string) {
    setActions((current) => ({ ...current, [key]: value }));
  }

  function updateFile(key: string, file: File | null) {
    setFiles((current) => ({ ...current, [key]: file }));
    setResponses((current) => ({ ...current, [key]: file?.name ?? '' }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!definition || missingAction) return;
    if (!isOnline) {
      setMessage('Internet saknas. Vänta tills anslutningen är tillbaka innan du sparar kontrollen.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      const savedAt = new Date().toISOString();
      await saveControlRun(organizationId, controlTypeId, userId, definition, responseList);
      await onSaved({
        controlName: definition.controlType.name,
        savedAt,
        performedBy: performedByName,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara kontrollen.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted-copy">Laddar kontroll...</p>;
  if (!definition) return <p className="form-message error-message">Kontrollen kunde inte visas.</p>;

  const canRunControl = definition.fields.length > 0;

  return (
    <form className={`control-form control-form-${definition.controlType.category}`} onSubmit={handleSubmit}>
      <div className="control-form-header">
        <div className="control-form-topbar">
          <div>
            <p className="eyebrow">Utför kontroll</p>
            <h3>{definition.controlType.name}</h3>
          </div>
          <ActionButton className="nav-back-button" type="button" variant="secondary" onClick={onCancel}>
            <span aria-hidden="true">←</span>
            Tillbaka
          </ActionButton>
        </div>
      <p className="muted-copy">{definition.controlType.instructions ?? 'Fyll i kontrollpunkterna nedan.'}</p>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      {!canRunControl ? (
        <section className="control-empty-state" aria-labelledby="control-empty-title">
          <p className="eyebrow">Kontrollen saknar innehåll</p>
          <h4 id="control-empty-title">Lägg till formulärfält innan den kan sparas</h4>
          <p className="muted-copy">
            {canManage
              ? 'Öppna kontrolltypen och lägg till minst ett fält, till exempel OK/Ej OK, temperatur eller kommentar.'
              : 'En administratör behöver lägga till fält i kontrolltypen innan personal kan utföra den.'}
          </p>
          <div className="form-actions">
            {canManage ? (
              <ActionButton type="button" onClick={onConfigureControlType}>
                Öppna kontrolltyp
              </ActionButton>
            ) : null}
            <ActionButton type="button" variant="secondary" onClick={onCancel}>
              Tillbaka till Idag
            </ActionButton>
          </div>
        </section>
      ) : null}

      {canRunControl ? (
        <ControlDefinitionCanvas
          controlType={definition.controlType}
          objects={definition.objects}
          fields={definition.fields}
          responses={responses}
          actions={actions}
          files={files}
          suppliers={suppliers}
          onResponseChange={updateResponse}
          onActionChange={updateAction}
          onFileChange={updateFile}
        />
      ) : null}

      {missingAction ? (
        <p className="form-message error-message">Alla avvikelser måste ha en åtgärdstext innan kontrollen kan sparas.</p>
      ) : null}

      {!isOnline ? (
        <p className="form-message error-message">Internet saknas. Du kan fortsätta fylla i, men kontrollen kan sparas först när anslutningen är tillbaka.</p>
      ) : null}

      <div className="form-actions">
        <ActionButton type="submit" disabled={saving || definition.fields.length === 0 || missingAction || !isOnline}>
          {saving ? 'Sparar...' : 'Spara kontroll'}
        </ActionButton>
        <ActionButton type="button" variant="secondary" onClick={onCancel}>
          Avbryt
        </ActionButton>
      </div>
    </form>
  );
}
