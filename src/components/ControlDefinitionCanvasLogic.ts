import type { ControlFieldDefinition, ControlObject } from '../types/database';
import { getTemperatureDeviationReason } from '../services/controlFieldRules';

export type ResponseState = Record<string, string>;
export type DeviationState = Record<string, string>;
export type FileState = Record<string, File | null>;

export function responseKey(objectId: string | null, fieldId: string): string {
  return `${objectId ?? 'global'}:${fieldId}`;
}

export function getDefaultValue(field: ControlFieldDefinition): string {
  if (field.field_type === 'ok_not_ok') return 'ok';
  if (field.field_type === 'boolean') return 'true';
  return '';
}

export function isSupplierField(field: ControlFieldDefinition): boolean {
  return field.field_key === 'supplier' || field.label.trim().toLowerCase() === 'leverantör';
}

export function getDeviationReason(field: ControlFieldDefinition, object: ControlObject | null, value: string): string | null {
  if (field.field_type === 'ok_not_ok' && value === 'not_ok') return `${field.label} är ej OK.`;
  if (field.field_type === 'boolean' && value === 'false') return `${field.label} är inte uppfyllt.`;

  if (field.field_type === 'temperature') {
    return getTemperatureDeviationReason(field, object, value);
  }

  return null;
}
