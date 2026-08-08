import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { ColdStorageControlFields } from './ColdStorageControlFields';
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
import {
  getProductEventErrorCategory,
  trackProductEvent,
} from '../services/productEventService';
import { listSuppliers } from '../services/supplierService';
import type {
  ControlResponse,
  ControlRunDefinition,
} from '../services/controlRunWithAttachmentsService';
import type { SavedControlSummary } from './SavedControlView';
import type { ControlFieldDefinition, Supplier } from '../types/database';
import {
  buildColdStorageDefinitionFingerprint,
  buildColdStorageDraftKey,
  buildColdStorageResponse,
  buildColdStorageResultSummary,
  createEmptyColdStorageEntry,
  getColdStorageBindings,
  isColdStorageEntryComplete,
  parseColdStorageDraft,
} from '../services/coldStorageControl';
import type { ColdStorageEntry } from '../services/coldStorageControl';
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

function fieldAppliesToObject(field: ControlFieldDefinition, objectId: string | null): boolean {
  return !field.control_object_id || field.control_object_id === objectId;
}

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
  const [coldStorageEntries, setColdStorageEntries] = useState<Record<string, ColdStorageEntry>>({});
  const [coldStorageDraftReady, setColdStorageDraftReady] = useState(false);
  const [coldStorageDraftStarted, setColdStorageDraftStarted] = useState(false);
  const [coldStorageDraftRestored, setColdStorageDraftRestored] = useState(false);
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
        setColdStorageDraftReady(false);
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
          const objectId = object?.id ?? null;
          for (const field of nextDefinition.fields) {
            if (!fieldAppliesToObject(field, objectId)) continue;
            nextResponses[responseKey(objectId, field.id)] = getDefaultValue(field);
          }
        }
        setResponses(nextResponses);
        setActions({});
        setFiles({});

        const nextBindings = getColdStorageBindings(nextDefinition);
        if (nextBindings.length > 0) {
          const definitionFingerprint = buildColdStorageDefinitionFingerprint(nextDefinition.controlType, nextBindings);
          const draftKey = buildColdStorageDraftKey(userId, organizationId, controlTypeId);
          let restoredDraft = null;
          try {
            restoredDraft = parseColdStorageDraft(window.localStorage.getItem(draftKey), definitionFingerprint);
          } catch {
            restoredDraft = null;
          }

          const initialEntries = Object.fromEntries(nextBindings.map((binding) => [
            binding.key,
            restoredDraft?.entries[binding.key] ?? createEmptyColdStorageEntry(),
          ]));
          setColdStorageEntries(initialEntries);
          setColdStorageDraftStarted(Boolean(restoredDraft));
          setColdStorageDraftRestored(Boolean(restoredDraft));
        } else {
          setColdStorageEntries({});
          setColdStorageDraftStarted(false);
          setColdStorageDraftRestored(false);
        }
        setColdStorageDraftReady(true);
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
  }, [controlTypeId, organizationId, userId]);

  const coldStorageBindings = useMemo(
    () => definition ? getColdStorageBindings(definition) : [],
    [definition],
  );
  const isColdStorageFlow = coldStorageBindings.length > 0;
  const coldStorageFingerprint = useMemo(
    () => definition && isColdStorageFlow
      ? buildColdStorageDefinitionFingerprint(definition.controlType, coldStorageBindings)
      : '',
    [coldStorageBindings, definition, isColdStorageFlow],
  );

  useEffect(() => {
    if (!coldStorageDraftReady || !coldStorageDraftStarted || !definition || !isColdStorageFlow) return;
    const draftKey = buildColdStorageDraftKey(userId, organizationId, controlTypeId);
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({
        schema: 'cold_storage_v1',
        definitionFingerprint: coldStorageFingerprint,
        entries: coldStorageEntries,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // Component state still preserves the draft while this view remains mounted.
    }
  }, [
    coldStorageDraftReady,
    coldStorageDraftStarted,
    coldStorageEntries,
    coldStorageFingerprint,
    controlTypeId,
    definition,
    isColdStorageFlow,
    organizationId,
    userId,
  ]);

  const responseList = useMemo(() => {
    if (!definition) return [];
    const objects = definition.objects.length ? definition.objects : [null];
    const result: ControlResponse[] = [];
    const handledColdStorageKeys = new Set(coldStorageBindings.map((binding) => binding.key));

    for (const object of objects) {
      const objectId = object?.id ?? null;
      for (const field of definition.fields) {
        if (!fieldAppliesToObject(field, objectId)) continue;
        const key = responseKey(objectId, field.id);
        if (handledColdStorageKeys.has(key)) continue;
        const value = responses[key] ?? '';
        const reason = getDeviationReason(field, object, value);
        result.push({
          controlObjectId: objectId,
          fieldDefinitionId: field.id,
          value,
          file: files[key] ?? null,
          deviationDetected: Boolean(reason),
          deviationReason: reason,
          actionText: reason ? actions[key] ?? null : null,
        });
      }
    }

    for (const binding of coldStorageBindings) {
      const entry = coldStorageEntries[binding.key] ?? createEmptyColdStorageEntry();
      if (isColdStorageEntryComplete(binding, entry)) {
        result.push(buildColdStorageResponse(binding, entry));
      }
    }

    return result;
  }, [actions, coldStorageBindings, coldStorageEntries, definition, files, responses]);

  const missingAction = responseList.some((response) => response.deviationDetected && !response.actionText?.trim());
  const coldStorageComplete = !isColdStorageFlow || coldStorageBindings.every((binding) => (
    isColdStorageEntryComplete(binding, coldStorageEntries[binding.key] ?? createEmptyColdStorageEntry())
  ));

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

  function updateColdStorageEntry(key: string, entry: ColdStorageEntry) {
    setColdStorageEntries((current) => ({ ...current, [key]: entry }));
    setColdStorageDraftStarted(true);
    setColdStorageDraftRestored(false);
  }

  function discardColdStorageDraft() {
    const draftKey = buildColdStorageDraftKey(userId, organizationId, controlTypeId);
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // Resetting component state still discards the visible draft.
    }
    setColdStorageEntries(Object.fromEntries(coldStorageBindings.map((binding) => [
      binding.key,
      createEmptyColdStorageEntry(),
    ])));
    setColdStorageDraftStarted(false);
    setColdStorageDraftRestored(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!definition || missingAction || !coldStorageComplete) return;
    if (!isOnline) {
      trackProductEvent({
        eventName: 'control_save_failed',
        userId,
        organizationId,
        metadata: {
          control_category: definition.controlType.category,
          control_frequency: definition.controlType.frequency,
          control_type_id: controlTypeId,
          error_category: 'offline',
          field_count: definition.fields.length,
          has_photo: responseList.some((response) => Boolean(response.file)),
          is_online: false,
          object_count: definition.objects.length,
        },
      });
      setMessage('Internet saknas. Vänta tills anslutningen är tillbaka innan du sparar kontrollen.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      const savedRun = await saveControlRun(organizationId, controlTypeId, userId, definition, responseList);
      trackProductEvent({
        eventName: 'control_saved',
        userId,
        organizationId,
        metadata: {
          control_category: definition.controlType.category,
          control_frequency: definition.controlType.frequency,
          control_type_id: controlTypeId,
          field_count: definition.fields.length,
          has_photo: responseList.some((response) => Boolean(response.file)),
          is_online: isOnline,
          object_count: definition.objects.length,
        },
      });
      const coldStorageSummary = isColdStorageFlow
        ? buildColdStorageResultSummary(coldStorageBindings, coldStorageEntries)
        : null;
      if (isColdStorageFlow) {
        try {
          window.localStorage.removeItem(buildColdStorageDraftKey(userId, organizationId, controlTypeId));
        } catch {
          // The confirmed server save is still authoritative.
        }
        setColdStorageDraftStarted(false);
        setColdStorageDraftRestored(false);
      }
      await onSaved({
        controlName: definition.controlType.name,
        savedAt: savedRun.performed_at,
        performedBy: performedByName,
        resultText: coldStorageSummary?.text,
        hasOpenDeviation: coldStorageSummary?.hasOpenDeviation,
      });
    } catch (error) {
      trackProductEvent({
        eventName: 'control_save_failed',
        userId,
        organizationId,
        metadata: {
          control_category: definition.controlType.category,
          control_frequency: definition.controlType.frequency,
          control_type_id: controlTypeId,
          error_category: getProductEventErrorCategory(error, isOnline),
          field_count: definition.fields.length,
          has_photo: responseList.some((response) => Boolean(response.file)),
          is_online: isOnline,
          object_count: definition.objects.length,
        },
      });
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara kontrollen.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted-copy">Laddar kontroll...</p>;
  if (!definition) return <p className="form-message error-message">Kontrollen kunde inte visas.</p>;

  const handledColdStorageFieldIds = new Set(coldStorageBindings.map((binding) => binding.field.id));
  const genericFields = definition.fields.filter((field) => !handledColdStorageFieldIds.has(field.id));
  const canRunControl = definition.fields.length > 0;
  const globalFields = genericFields.filter((field) => !field.control_object_id);
  const objectScopedFields = genericFields.filter((field) => Boolean(field.control_object_id));
  const objectIdsWithScopedFields = new Set(
    objectScopedFields
      .map((field) => field.control_object_id)
      .filter((objectId): objectId is string => Boolean(objectId)),
  );
  const objectsWithScopedFields = definition.objects.filter((object) => objectIdsWithScopedFields.has(object.id));

  const canvasProps = {
    controlType: definition.controlType,
    responses,
    actions,
    files,
    suppliers,
    onResponseChange: updateResponse,
    onActionChange: updateAction,
    onFileChange: updateFile,
  };

  return (
    <form className={`control-form control-form-${definition.controlType.category}${isColdStorageFlow ? ' control-form-cold-storage' : ''}`} onSubmit={handleSubmit}>
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

      {canRunControl && isColdStorageFlow ? (
        <ColdStorageControlFields
          bindings={coldStorageBindings}
          entries={coldStorageEntries}
          draftStarted={coldStorageDraftStarted}
          draftRestored={coldStorageDraftRestored}
          onChange={updateColdStorageEntry}
          onDiscardDraft={discardColdStorageDraft}
        />
      ) : null}

      {canRunControl && globalFields.length > 0 ? (
        <ControlDefinitionCanvas
          {...canvasProps}
          objects={definition.objects}
          fields={globalFields}
        />
      ) : null}

      {canRunControl && objectScopedFields.length > 0 ? (
        <ControlDefinitionCanvas
          {...canvasProps}
          objects={objectsWithScopedFields}
          fields={objectScopedFields}
        />
      ) : null}

      {missingAction ? (
        <p className="form-message error-message">Alla avvikelser måste ha en åtgärdstext innan kontrollen kan sparas.</p>
      ) : null}

      {isColdStorageFlow && !coldStorageComplete ? (
        <p className="form-message error-message">Alla aktiva enheter behöver ett giltigt värde eller ett komplett Ej i drift-val.</p>
      ) : null}

      {!isOnline ? (
        <p className="form-message error-message">Internet saknas. Du kan fortsätta fylla i, men kontrollen kan sparas först när anslutningen är tillbaka.</p>
      ) : null}

      <div className="form-actions">
        <ActionButton type="submit" disabled={saving || definition.fields.length === 0 || missingAction || !coldStorageComplete || !isOnline}>
          {saving ? 'Sparar...' : 'Spara kontroll'}
        </ActionButton>
        <ActionButton type="button" variant="secondary" onClick={onCancel}>
          Avbryt
        </ActionButton>
      </div>
    </form>
  );
}
