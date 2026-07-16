import { useEffect, useState, type ReactNode } from 'react';
import { SegmentedChoice } from './ui/SegmentedChoice';
import type { ControlFieldDefinition, ControlObject, ControlType, Supplier } from '../types/database';
import {
  getTemperatureDeviationReason,
  getTemperatureLimitText,
  getTemperatureUnit,
} from '../services/controlFieldRules';
import './ControlRunForm.css';

export type ResponseState = Record<string, string>;
export type DeviationState = Record<string, string>;
export type FileState = Record<string, File | null>;
export type ControlDefinitionCanvasMode = 'use' | 'preview' | 'edit';

type SelectOption = {
  label: string;
  value: string;
};

const fieldTypeLabels: Record<ControlFieldDefinition['field_type'], string> = {
  text: 'Text',
  textarea: 'Kommentar',
  number: 'Nummer',
  temperature: 'Temperatur',
  boolean: 'Ja/Nej',
  ok_not_ok: 'OK/Ej OK',
  date: 'Datum',
  datetime: 'Datum och tid',
  photo: 'Foto',
  select: 'Val',
};

export type ControlDefinitionCanvasProps = {
  controlType: ControlType;
  objects: ControlObject[];
  fields: ControlFieldDefinition[];
  mode?: ControlDefinitionCanvasMode;
  responses?: ResponseState;
  actions?: DeviationState;
  files?: FileState;
  suppliers?: Supplier[];
  selectedFieldId?: string | null;
  selectedObjectId?: string | null;
  onResponseChange?: (key: string, value: string) => void;
  onActionChange?: (key: string, value: string) => void;
  onFileChange?: (key: string, file: File | null) => void;
  onEditField?: (field: ControlFieldDefinition) => void;
  onEditObject?: (object: ControlObject) => void;
  hideFieldEditControls?: boolean;
  lockedFieldIds?: string[];
  renderFieldEditor?: (field: ControlFieldDefinition) => ReactNode;
  renderObjectEditor?: (object: ControlObject) => ReactNode;
  renderObjectFieldTools?: (object: ControlObject) => ReactNode;
};

function responseKey(objectId: string | null, fieldId: string): string {
  return `${objectId ?? 'global'}:${fieldId}`;
}

function getDefaultValue(field: ControlFieldDefinition): string {
  if (field.field_type === 'ok_not_ok') return 'ok';
  if (field.field_type === 'boolean') return 'true';
  return '';
}

function isSupplierField(field: ControlFieldDefinition): boolean {
  return field.field_key === 'supplier' || field.label.trim().toLowerCase() === 'leverantör';
}

function getFieldLabel(field: ControlFieldDefinition): string {
  return field.field_type === 'textarea' && field.label.trim().toLowerCase() === 'kommentar / åtgärd'
    ? 'Kommentar'
    : field.label;
}

function fieldBelongsToObject(field: ControlFieldDefinition, object: ControlObject | null, hasObjectScopedFields: boolean): boolean {
  const fieldObjectId = field.control_object_id ?? null;

  if (hasObjectScopedFields) {
    return object ? fieldObjectId === null || fieldObjectId === object.id : fieldObjectId === null;
  }

  return fieldObjectId === null;
}

function getDeviationReason(field: ControlFieldDefinition, object: ControlObject | null, value: string): string | null {
  const label = getFieldLabel(field);

  if (field.field_type === 'ok_not_ok' && value === 'not_ok') return `${label} är ej OK.`;
  if (field.field_type === 'boolean' && value === 'false') return `${label} är inte uppfyllt.`;

  if (field.field_type === 'temperature') {
    return getTemperatureDeviationReason(field, object, value, label);
  }

  return null;
}

function getFieldInputType(field: ControlFieldDefinition): string {
  if (field.field_type === 'temperature' || field.field_type === 'number') return 'number';
  if (field.field_type === 'date') return 'date';
  if (field.field_type === 'datetime') return 'datetime-local';
  return 'text';
}

function readSelectOptions(field: ControlFieldDefinition): SelectOption[] {
  return field.options
    .map((option) => {
      if (typeof option === 'string') return { label: option, value: option };
      if (option && typeof option === 'object' && 'label' in option && 'value' in option) {
        const item = option as { label?: unknown; value?: unknown };
        if (typeof item.label === 'string' && typeof item.value === 'string') {
          return { label: item.label, value: item.value };
        }
      }
      return null;
    })
    .filter((option): option is SelectOption => Boolean(option));
}

function PhotoCaptureField({
  id,
  label,
  file,
  required,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  required: boolean;
  disabled: boolean;
  onChange?: (file: File | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return (
    <div className="photo-capture-field">
      <label htmlFor={id}>{label}</label>
      <div className="photo-capture-row">
        <div className="photo-thumbnail-strip" aria-live="polite">
          {previewUrl ? (
            <img className="photo-thumbnail" src={previewUrl} alt="Vald bild" />
          ) : (
            <span className="photo-empty-slot">{disabled ? 'Foto' : 'Ingen bild vald'}</span>
          )}
        </div>
        <label className="photo-camera-button" htmlFor={id} aria-label="Ta eller välj bild">
          <span aria-hidden="true">□</span>
        </label>
      </div>

      {!disabled ? (
        <input
          accept="image/*"
          capture="environment"
          className="photo-file-input"
          id={id}
          onChange={(event) => onChange?.(event.target.files?.[0] ?? null)}
          type="file"
          required={required}
        />
      ) : null}

      {file ? <p className="photo-file-name">{file.name}</p> : null}
    </div>
  );
}

function TemperatureField({
  id,
  label,
  field,
  object,
  value,
  required,
  disabled,
  reason,
  onChange,
}: {
  id: string;
  label: string;
  field: ControlFieldDefinition;
  object: ControlObject | null;
  value: string;
  required: boolean;
  disabled: boolean;
  reason: string | null;
  onChange?: (value: string) => void;
}) {
  const limitText = getTemperatureLimitText(field, object);
  const hasValue = value.trim().length > 0;
  const statusClass = reason ? 'temperature-status bad' : 'temperature-status good';
  const statusText = reason ? 'Utanför gränsvärde' : 'Inom gränsvärde';

  return (
    <div className={reason ? 'temperature-field deviation' : 'temperature-field'}>
      <label htmlFor={id}>{label}</label>
      <div className="temperature-input-row">
        <input
          className="text-input temperature-input"
          disabled={disabled}
          id={id}
          placeholder={disabled ? '0,0' : undefined}
          type="number"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          required={required}
        />
        <span className="temperature-unit">{getTemperatureUnit(field, object)}</span>
      </div>
      <div className="temperature-meta-row">
        {limitText ? <span>{limitText}</span> : <span>Gränsvärde saknas</span>}
        {hasValue ? <span className={statusClass}>{statusText}</span> : null}
      </div>
    </div>
  );
}

function ChecklistMatrix({
  field,
  objects,
  responses,
  actions,
  mode,
  selectedFieldId,
  selectedObjectId,
  onChange,
  onActionChange,
  onEditObject,
  renderFieldEditor,
  renderObjectEditor,
}: {
  field: ControlFieldDefinition;
  objects: ControlObject[];
  responses: ResponseState;
  actions: DeviationState;
  mode: ControlDefinitionCanvasMode;
  selectedFieldId?: string | null;
  selectedObjectId?: string | null;
  onChange?: (key: string, value: string) => void;
  onActionChange?: (key: string, value: string) => void;
  onEditObject?: (object: ControlObject) => void;
  renderFieldEditor?: (field: ControlFieldDefinition) => ReactNode;
  renderObjectEditor?: (object: ControlObject) => ReactNode;
}) {
  const disabled = mode !== 'use';
  const isEditMode = mode === 'edit';
  const selected = selectedFieldId === field.id;

  return (
    <section
      className={selected ? 'check-matrix canvas-edit-selected' : 'check-matrix'}
      aria-labelledby={`matrix-${field.id}`}
    >
      <div className="check-matrix-header">
        <strong id={`matrix-${field.id}`}>{getFieldLabel(field)}</strong>
        <span>OK</span>
        <span>Ej OK</span>
      </div>
      {isEditMode ? (
        <p className="canvas-edit-hint">Tryck på en kontrollpunkt för att redigera den.</p>
      ) : null}
      {selected && renderFieldEditor ? (
        <div className="canvas-inline-editor">{renderFieldEditor(field)}</div>
      ) : null}

      {objects.map((object) => {
        const key = responseKey(object.id, field.id);
        const actionId = `${key}:action`;
        const value = responses[key] ?? getDefaultValue(field);
        const showAction = value === 'not_ok';

        const objectSelected = selectedObjectId === object.id;

        return (
          <div
            className={[
              showAction ? 'check-matrix-item has-action' : 'check-matrix-item',
              objectSelected ? 'canvas-edit-selected' : '',
              isEditMode ? 'canvas-object-editable' : '',
            ].filter(Boolean).join(' ')}
            key={object.id}
          >
            <div className="check-matrix-row">
              <div className="check-matrix-copy">
                {isEditMode ? (
                  <button className="check-matrix-name canvas-row-edit-button" type="button" onClick={() => onEditObject?.(object)}>
                    {object.name}
                  </button>
                ) : (
                  <span className="check-matrix-name">{object.name}</span>
                )}
                {object.location ? <span className="check-matrix-meta">{object.location}</span> : null}
                {object.instructions ? <span className="check-matrix-meta">{object.instructions}</span> : null}
              </div>
              <button
                type="button"
                className={value === 'ok' ? 'matrix-choice ok selected' : 'matrix-choice ok'}
                aria-pressed={value === 'ok'}
                disabled={disabled}
                onClick={() => {
                  onChange?.(key, 'ok');
                  onActionChange?.(key, '');
                }}
              >
                ✓
              </button>
              <button
                type="button"
                className={value === 'not_ok' ? 'matrix-choice not-ok selected' : 'matrix-choice not-ok'}
                aria-pressed={value === 'not_ok'}
                disabled={disabled}
                onClick={() => onChange?.(key, 'not_ok')}
              >
                ×
              </button>
            </div>

            {objectSelected && renderObjectEditor ? (
              <div className="canvas-inline-editor">{renderObjectEditor(object)}</div>
            ) : null}

            {showAction ? (
              <div className="matrix-action-box">
                <strong>Avvikelse: {getFieldLabel(field)} är ej OK.</strong>
                <label className="action-label" htmlFor={actionId}>Åtgärd</label>
                <textarea
                  className="text-input"
                  disabled={disabled}
                  id={actionId}
                  value={actions[key] ?? ''}
                  onChange={(event) => onActionChange?.(key, event.target.value)}
                  required={!disabled}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}

function SupplierSelectField({
  id,
  label,
  value,
  required,
  disabled,
  suppliers,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  required: boolean;
  disabled: boolean;
  suppliers: Supplier[];
  onChange?: (value: string) => void;
}) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select
        className="text-input supplier-select"
        disabled={disabled || suppliers.length === 0}
        id={id}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
      >
        <option value="">{suppliers.length ? 'Välj leverantör' : 'Inga aktiva leverantörer'}</option>
        {suppliers.map((supplier) => (
          <option value={supplier.name} key={supplier.id}>
            {supplier.name}
          </option>
        ))}
      </select>
      {suppliers.length === 0 ? (
        <p className="field-hint">Lägg till leverantörer under Meny innan fältet används.</p>
      ) : null}
    </>
  );
}

function DateField({
  id,
  label,
  value,
  required,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  required: boolean;
  disabled: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="date-input-shell">
        <span className="date-input-calendar" aria-hidden="true">
          <span />
        </span>
        <input
          className="text-input date-input"
          disabled={disabled}
          id={id}
          type="date"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          required={required}
        />
      </div>
    </>
  );
}

export function ControlDefinitionCanvas({
  controlType,
  objects,
  fields,
  mode = 'use',
  responses = {},
  actions = {},
  files = {},
  suppliers = [],
  selectedFieldId = null,
  selectedObjectId = null,
  onResponseChange,
  onActionChange,
  onFileChange,
  onEditField,
  onEditObject,
  hideFieldEditControls = false,
  lockedFieldIds = [],
  renderFieldEditor,
  renderObjectEditor,
  renderObjectFieldTools,
}: ControlDefinitionCanvasProps) {
  const disabled = mode !== 'use';
  const isEditMode = mode === 'edit';
  const hasObjectScopedFields = fields.some((field) => field.control_object_id);
  const usesObjects = controlType.category !== 'traceability';
  const renderObjects = objects.length ? objects : usesObjects ? [] : [null];
  const matrixObjects = objects;
  const matrixField = !isEditMode && !hasObjectScopedFields && matrixObjects.length > 1
    ? fields.find((field) => field.field_type === 'ok_not_ok' && !field.control_object_id)
    : undefined;

  return (
    <div className={`control-definition-canvas control-definition-canvas-${mode}`}>
      {usesObjects && objects.length === 0 ? (
        <p className="canvas-empty-fields">Det finns inga aktiva kontrollpunkter att fylla i.</p>
      ) : null}

      {matrixField ? (
        <ChecklistMatrix
          field={matrixField}
          objects={matrixObjects}
          responses={responses}
          actions={actions}
          mode={mode}
          selectedFieldId={selectedFieldId}
          selectedObjectId={selectedObjectId}
          onChange={onResponseChange}
          onActionChange={onActionChange}
          onEditObject={onEditObject}
          renderFieldEditor={renderFieldEditor}
          renderObjectEditor={renderObjectEditor}
        />
      ) : null}

      {renderObjects.map((object) => {
        const visibleFields = matrixField
          ? fields.filter((field) => !field.control_object_id && field.field_type !== 'ok_not_ok')
          : fields.filter((field) => fieldBelongsToObject(field, object, hasObjectScopedFields));
        const canRenderEmptyObject = isEditMode && object;
        if (visibleFields.length === 0 && !canRenderEmptyObject) return null;

        return (
          <section
            className={[
              'control-group',
              isEditMode && object ? 'canvas-object-editable' : '',
              object?.id === selectedObjectId ? 'canvas-edit-selected' : '',
            ].filter(Boolean).join(' ')}
            key={object?.id ?? 'global'}
            role={isEditMode && object ? 'button' : undefined}
            tabIndex={isEditMode && object ? 0 : undefined}
            onClick={isEditMode && object ? (event) => {
              if ((event.target as HTMLElement).closest('button, input, textarea, select, label, .canvas-inline-editor, .control-field, .object-field-tools')) return;
              onEditObject?.(object);
            } : undefined}
            onKeyDown={isEditMode && object ? (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onEditObject?.(object);
            } : undefined}
          >
            <div className="canvas-object-heading">
              <div>
                <h4>{object?.name ?? controlType.name}</h4>
                {object?.location ? <p className="muted-copy">{object.location}</p> : null}
                {object?.instructions ? <p className="muted-copy">{object.instructions}</p> : null}
              </div>
              {isEditMode && object ? (
                <button className="canvas-edit-action" type="button" onClick={() => onEditObject?.(object)}>
                  Redigera punkt
                </button>
              ) : null}
            </div>

            {object?.id === selectedObjectId && renderObjectEditor ? (
              <div className="canvas-inline-editor">{renderObjectEditor(object)}</div>
            ) : null}

            {isEditMode && object && renderObjectFieldTools ? renderObjectFieldTools(object) : null}

            {visibleFields.length === 0 ? (
              <p className="canvas-empty-fields">Inga svarsfält ännu.</p>
            ) : null}

            {visibleFields.map((field) => {
              const key = responseKey(object?.id ?? null, field.id);
              const value = responses[key] ?? (disabled ? getDefaultValue(field) : '');
              const reason = getDeviationReason(field, object, value);
              const selected = field.id === selectedFieldId;
              const fieldLocked = hideFieldEditControls || lockedFieldIds.includes(field.id);

              return (
                <div
                  className={selected ? 'control-field canvas-field-editable selected' : isEditMode ? 'control-field canvas-field-editable' : 'control-field'}
                  key={key}
                  role={isEditMode && !fieldLocked ? 'button' : undefined}
                  tabIndex={isEditMode && !fieldLocked ? 0 : undefined}
                  onClick={isEditMode && !fieldLocked ? (event) => {
                    if ((event.target as HTMLElement).closest('button, input, textarea, select, label, .canvas-inline-editor')) return;
                    onEditField?.(field);
                  } : undefined}
                  onKeyDown={isEditMode && !fieldLocked ? (event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    onEditField?.(field);
                  } : undefined}
                >
                  {isEditMode ? (
                    <div className="canvas-field-toolbar">
                      <span>
                        {fieldLocked ? 'Standardfält' : fieldTypeLabels[field.field_type]} · {field.required ? 'Obligatoriskt' : 'Frivilligt'}
                      </span>
                      {!fieldLocked ? (
                        <button className="canvas-edit-action" type="button" onClick={() => onEditField?.(field)}>
                          Redigera svarsfält
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {field.field_type === 'photo' ? (
                    <PhotoCaptureField
                      id={key}
                      label={getFieldLabel(field)}
                      file={files[key] ?? null}
                      required={field.required && !disabled}
                      disabled={disabled}
                      onChange={(nextFile) => onFileChange?.(key, nextFile)}
                    />
                  ) : field.field_type === 'temperature' ? (
                    <TemperatureField
                      id={key}
                      label={getFieldLabel(field)}
                      field={field}
                      object={object}
                      value={value}
                      required={field.required && !disabled}
                      disabled={disabled}
                      reason={reason}
                      onChange={(nextValue) => onResponseChange?.(key, nextValue)}
                    />
                  ) : field.field_type === 'ok_not_ok' ? (
                    <SegmentedChoice
                      id={key}
                      label={getFieldLabel(field)}
                      value={value}
                      disabled={disabled}
                      onChange={(nextValue) => onResponseChange?.(key, nextValue)}
                      options={[
                        { label: 'OK', tone: 'good', value: 'ok' },
                        { label: 'Ej OK', tone: 'bad', value: 'not_ok' },
                      ]}
                    />
                  ) : field.field_type === 'boolean' ? (
                    <SegmentedChoice
                      id={key}
                      label={getFieldLabel(field)}
                      value={value}
                      disabled={disabled}
                      onChange={(nextValue) => onResponseChange?.(key, nextValue)}
                      options={[
                        { label: 'Ja', tone: 'good', value: 'true' },
                        { label: 'Nej', tone: 'bad', value: 'false' },
                      ]}
                    />
                  ) : isSupplierField(field) ? (
                    <SupplierSelectField
                      id={key}
                      label={getFieldLabel(field)}
                      value={value}
                      required={field.required && !disabled}
                      disabled={disabled}
                      suppliers={suppliers}
                      onChange={(nextValue) => onResponseChange?.(key, nextValue)}
                    />
                  ) : field.field_type === 'select' && readSelectOptions(field).length > 0 ? (
                    <>
                      <label htmlFor={key}>{getFieldLabel(field)}</label>
                      <select
                        className="text-input"
                        disabled={disabled}
                        id={key}
                        value={value}
                        onChange={(event) => onResponseChange?.(key, event.target.value)}
                        required={field.required && !disabled}
                      >
                        <option value="">Välj</option>
                        {readSelectOptions(field).map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : field.field_type === 'date' ? (
                    <DateField
                      id={key}
                      label={getFieldLabel(field)}
                      value={value}
                      required={field.required && !disabled}
                      disabled={disabled}
                      onChange={(nextValue) => onResponseChange?.(key, nextValue)}
                    />
                  ) : field.field_type === 'textarea' ? (
                    <>
                      <label htmlFor={key}>{getFieldLabel(field)}</label>
                      <textarea
                        className="text-input"
                        disabled={disabled}
                        id={key}
                        value={value}
                        onChange={(event) => onResponseChange?.(key, event.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <label htmlFor={key}>{getFieldLabel(field)}</label>
                      <input
                        className="text-input"
                        disabled={disabled}
                        id={key}
                        type={getFieldInputType(field)}
                        value={value}
                        onChange={(event) => onResponseChange?.(key, event.target.value)}
                        required={field.required && !disabled}
                      />
                    </>
                  )}

                  {reason ? (
                    <div className="deviation-box">
                      <strong>Avvikelse: {reason}</strong>
                      <label className="action-label" htmlFor={`${key}:action`}>Åtgärd</label>
                      <textarea
                        className="text-input"
                        disabled={disabled}
                        id={`${key}:action`}
                        value={actions[key] ?? ''}
                        onChange={(event) => onActionChange?.(key, event.target.value)}
                        required={!disabled}
                      />
                    </div>
                  ) : null}

                  {selected && renderFieldEditor ? (
                    <div className="canvas-inline-editor">{renderFieldEditor(field)}</div>
                  ) : null}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
