import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { ColdStorageControlCanvas } from './ColdStorageControlCanvas';
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
import {
  buildColdStorageResponse,
  clearColdStorageDraft,
  createEmptyColdStorageUnitState,
  filterColdStorageDraftResponses,
  getColdStorageDefinitionFingerprint,
  getColdStorageDraftKey,
  getColdStorageTemperatureField,
  hasColdStorageDraftData,
  isColdStorageControlType,
  readColdStorageDraft,
  summarizeColdStorageOutcomes,
  validateColdStorageUnit,
  writeColdStorageDraft,
} from '../services/coldStorageControl';
import type {
  ColdStorageUnitState,
  ColdStorageUnitStateMap,
} from '../services/coldStorageControl';
import type {
  ControlResponse,
  ControlRunDefinition,
} from '../services/controlRunWithAttachmentsService';
import type { SavedControlSummary } from './SavedControlView';
import type { ControlFieldDefinition, Supplier } from '../types/database';
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [coldStorageUnits, setColdStorageUnits] = useState<ColdStorageUnitStateMap>({});
  const [coldStorageDraftReady, setColdStorageDraftReady] = useState(false);
  const [coldStorageDraftRestored, setColdStorageDraftRestored] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const isOnline = useOnlineStatus();

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setMessage('');
        setColdStorageDraftReady(false);
        setColdStorageDraftRestored(false);
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
        const definitionFingerprint = getColdStorageDefinitionFingerprint(
          nextDefinition.controlType,
          nextDefinition.objects,
          nextDefinition.fields,
        );
        const draftKey = getColdStorageDraftKey(organizationId, controlTypeId, userId);
        const restoredDraft = isColdStorageControlType(nextDefinition.controlType)
          ? readColdStorageDraft(window.localStorage, draftKey, definitionFingerprint)
          : null;

        setResponses(restoredDraft ? {
          ...nextResponses,
          ...filterColdStorageDraftResponses(restoredDraft.responses, nextDefinition.fields),
        } : nextResponses);
        setActions(restoredDraft?.actions ?? {});
        setColdStorageUnits(restoredDraft?.units ?? {});
        setColdStorageDraftRestored(Boolean(restoredDraft));
        setColdStorageDraftReady(true);
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
  }, [controlTypeId, organizationId, userId]);

  const isColdStorage = Boolean(definition && isColdStorageControlType(definition.controlType));
  const coldStorageDefinitionFingerprint = useMemo(() => {
    if (!definition || !isColdStorage) return '';
    return getColdStorageDefinitionFingerprint(definition.controlType, definition.objects, definition.fields);
  }, [definition, isColdStorage]);
  const coldStorageDraftKey = useMemo(
    () => getColdStorageDraftKey(organizationId, controlTypeId, userId),
    [controlTypeId, organizationId, userId],
  );

  useEffect(() => {
    if (!isColdStorage || !coldStorageDraftReady || !coldStorageDefinitionFingerprint) return;

    writeColdStorageDraft(window.localStorage, coldStorageDraftKey, {
      definitionFingerprint: coldStorageDefinitionFingerprint,
      responses: filterColdStorageDraftResponses(responses, definition?.fields ?? []),
      actions,
      units: coldStorageUnits,
    });
  }, [
    actions,
    coldStorageDefinitionFingerprint,
    coldStorageDraftKey,
    coldStorageDraftReady,
    coldStorageUnits,
    isColdStorage,
    responses,
    definition,
  ]);

  const coldStorageRows = useMemo(() => {
    if (!definition || !isColdStorage) return [];

    return definition.objects.flatMap((object) => {
      const field = getColdStorageTemperatureField(definition.fields, object);
      return field ? [{ field, object, key: responseKey(object.id, field.id) }] : [];
    });
  }, [definition, isColdStorage]);

  const responseList = useMemo(() => {
    if (!definition) return [];
    const objects = definition.objects.length ? definition.objects : [null];
    const result: ControlResponse[] = [];

    for (const object of objects) {
      const objectId = object?.id ?? null;
      for (const field of definition.fields) {
        if (!fieldAppliesToObject(field, objectId)) continue;
        const key = responseKey(objectId, field.id);
        const value = responses[key] ?? '';
        const reason = getDeviationReason(field, object, value);

        if (isColdStorage && object && field.field_type === 'temperature') {
          const coldStorageResponse = buildColdStorageResponse(
            value,
            coldStorageUnits[key] ?? createEmptyColdStorageUnitState(),
            Boolean(reason),
          );
          result.push({
            controlObjectId: objectId,
            fieldDefinitionId: field.id,
            file: null,
            ...coldStorageResponse,
          });
          continue;
        }

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

    return result;
  }, [actions, coldStorageUnits, definition, files, isColdStorage, responses]);

  const missingAction = responseList.some((response) => response.deviationDetected && !response.actionText?.trim());
  const coldStorageValidation = useMemo(() => coldStorageRows.map(({ field, object, key }) => {
    const value = responses[key] ?? '';
    const reason = getDeviationReason(field, object, value);
    return {
      key,
      error: validateColdStorageUnit(
        value,
        coldStorageUnits[key] ?? createEmptyColdStorageUnitState(),
        Boolean(reason),
      ),
    };
  }), [coldStorageRows, coldStorageUnits, responses]);
  const completedColdStorageCount = coldStorageValidation.filter((item) => !item.error).length;
  const incompleteColdStorage = isColdStorage && (
    coldStorageRows.length === 0
    || coldStorageValidation.some((item) => Boolean(item.error))
  );
  const hasColdStorageDraft = isColdStorage && hasColdStorageDraftData({
    responses,
    actions,
    units: coldStorageUnits,
  });

  function updateResponse(key: string, value: string) {
    setResponses((current) => ({ ...current, [key]: value }));
  }

  function updateAction(key: string, value: string) {
    setActions((current) => ({ ...current, [key]: value }));
  }

  function updateColdStorageUnit(key: string, patch: Partial<ColdStorageUnitState>) {
    setColdStorageUnits((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? createEmptyColdStorageUnitState()),
        ...patch,
      },
    }));
  }

  function toggleColdStorageNotApplicable(key: string, enabled: boolean) {
    setColdStorageUnits((current) => ({
      ...current,
      [key]: enabled
        ? { ...createEmptyColdStorageUnitState(), notApplicable: true }
        : createEmptyColdStorageUnitState(),
    }));
    if (enabled) updateResponse(key, '');
  }

  function persistColdStorageDraft() {
    if (!isColdStorage || !coldStorageDefinitionFingerprint) return;
    writeColdStorageDraft(window.localStorage, coldStorageDraftKey, {
      definitionFingerprint: coldStorageDefinitionFingerprint,
      responses: filterColdStorageDraftResponses(responses, definition?.fields ?? []),
      actions,
      units: coldStorageUnits,
    });
  }

  function handleCancel() {
    persistColdStorageDraft();
    onCancel();
  }

  function handleDiscardColdStorageDraft() {
    if (!window.confirm('Kassera det påbörjade utkastet? Uppgifterna kan inte återställas.')) return;
    clearColdStorageDraft(window.localStorage, coldStorageDraftKey);
    setColdStorageUnits({});
    setColdStorageDraftRestored(false);
    onCancel();
  }

  function updateFile(key: string, file: File | null) {
    setFiles((current) => ({ ...current, [key]: file }));
    setResponses((current) => ({ ...current, [key]: file?.name ?? '' }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!definition || missingAction || incompleteColdStorage) return;
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
      const coldStorageOutcomeSource = savedRun.responseOutcomes?.length
        ? savedRun.responseOutcomes
        : responseList;
      const coldStorageOutcomes = isColdStorage
        ? coldStorageOutcomeSource.filter((response) => coldStorageRows.some((row) => (
          row.object.id === response.controlObjectId && row.field.id === response.fieldDefinitionId
        ))).map((response) => ({
          status: response.status ?? (response.deviationDetected ? 'deviation' : 'ok'),
          deviationDetected: response.deviationDetected,
          deviationStatus: response.deviationStatus ?? null,
        }))
        : [];
      if (isColdStorage) clearColdStorageDraft(window.localStorage, coldStorageDraftKey);
      await onSaved({
        controlName: definition.controlType.name,
        savedAt: savedRun.performed_at,
        performedBy: performedByName,
        resultText: isColdStorage ? summarizeColdStorageOutcomes(coldStorageOutcomes) : undefined,
        hasOpenDeviation: coldStorageOutcomes.some((outcome) => outcome.deviationStatus === 'open'),
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

  const canRunControl = definition.fields.length > 0;
  const executionFields = isColdStorage
    ? definition.fields.filter((field) => field.field_type !== 'temperature')
    : definition.fields;
  const globalFields = executionFields.filter((field) => !field.control_object_id);
  const objectScopedFields = executionFields.filter((field) => Boolean(field.control_object_id));
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
    <form className={`control-form control-form-${definition.controlType.category}`} onSubmit={handleSubmit}>
      <div className="control-form-header">
        <div className="control-form-topbar">
          <div>
            <p className="eyebrow">Utför kontroll</p>
            <h3>{definition.controlType.name}</h3>
          </div>
          <ActionButton className="nav-back-button" type="button" variant="secondary" onClick={handleCancel}>
            <span aria-hidden="true">←</span>
            Tillbaka
          </ActionButton>
        </div>
      <p className="muted-copy">{definition.controlType.instructions ?? 'Fyll i kontrollpunkterna nedan.'}</p>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}
      {coldStorageDraftRestored ? (
        <p className="form-message" role="status">Ditt lokala utkast har återställts.</p>
      ) : null}

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
            <ActionButton type="button" variant="secondary" onClick={handleCancel}>
              Tillbaka till Idag
            </ActionButton>
          </div>
        </section>
      ) : null}

      {canRunControl && globalFields.length > 0 ? (
        <ControlDefinitionCanvas
          {...canvasProps}
          objects={definition.objects}
          fields={globalFields}
        />
      ) : null}

      {canRunControl && isColdStorage ? (
        <ColdStorageControlCanvas
          objects={definition.objects}
          fields={definition.fields}
          responses={responses}
          units={coldStorageUnits}
          onResponseChange={updateResponse}
          onUnitChange={updateColdStorageUnit}
          onNotApplicableChange={toggleColdStorageNotApplicable}
        />
      ) : null}

      {canRunControl && objectScopedFields.length > 0 ? (
        <ControlDefinitionCanvas
          {...canvasProps}
          objects={objectsWithScopedFields}
          fields={objectScopedFields}
        />
      ) : null}

      {isColdStorage ? (
        <div className="cold-storage-progress" role="status">
          <span>Kontrollpunkter klara</span>
          <strong>{completedColdStorageCount} av {coldStorageRows.length}</strong>
        </div>
      ) : null}

      {missingAction ? (
        <p className="form-message error-message">Alla avvikelser måste ha en åtgärdstext innan kontrollen kan sparas.</p>
      ) : null}

      {!isOnline ? (
        <p className="form-message error-message">Internet saknas. Du kan fortsätta fylla i, men kontrollen kan sparas först när anslutningen är tillbaka.</p>
      ) : null}

      <div className="form-actions">
        <ActionButton type="submit" disabled={saving || definition.fields.length === 0 || missingAction || incompleteColdStorage || !isOnline}>
          {saving ? 'Sparar...' : 'Spara kontroll'}
        </ActionButton>
        <ActionButton type="button" variant="secondary" onClick={handleCancel}>
          Avbryt
        </ActionButton>
        {hasColdStorageDraft ? (
          <ActionButton type="button" variant="secondary" onClick={handleDiscardColdStorageDraft}>
            Kassera utkast
          </ActionButton>
        ) : null}
      </div>
    </form>
  );
}
