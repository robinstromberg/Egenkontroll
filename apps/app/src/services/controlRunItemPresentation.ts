import type { ControlRunItem } from '../types/database';

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

function formatUnit(value: unknown): string {
  const unit = readString(value) ?? '°C';
  return unit === 'C' ? '°C' : unit;
}

export function readControlRunItemValue(item: ControlRunItem, emptyLabel = 'Ej angivet'): string {
  if (item.status === 'not_applicable') {
    const notApplicable = readRecord(item.value_json?.notApplicable);
    const reason = readString(notApplicable.reasonLabel);
    const note = readString(notApplicable.note);

    return ['Ej i drift', reason, note].filter(Boolean).join(' · ');
  }

  if (item.value_text) return item.value_text;
  if (item.value_number !== null) {
    const formattedNumber = String(item.value_number).replace('.', ',');
    if (readString(item.field_snapshot.field_type) === 'temperature') {
      const deviationRule = readRecord(item.field_snapshot.deviation_rule);
      const temperatureRule = readRecord(deviationRule.temperature);
      const unit = formatUnit(
        item.object_snapshot.unit
        ?? temperatureRule.unit
        ?? deviationRule.unit,
      );
      return `${formattedNumber} ${unit}`;
    }
    return String(item.value_number);
  }
  if (item.value_boolean !== null) return item.value_boolean ? 'Ja' : 'Nej';
  if (item.value_date) return item.value_date;
  return emptyLabel;
}

export function readStoredTemperatureLimitText(item: ControlRunItem): string | null {
  if (readString(item.field_snapshot.field_type) !== 'temperature') return null;

  const deviationRule = readRecord(item.field_snapshot.deviation_rule);
  const temperatureRule = readRecord(deviationRule.temperature);
  const fieldMinimum = readNumber(
    temperatureRule.min
    ?? temperatureRule.limit_min
    ?? deviationRule.min
    ?? deviationRule.limit_min,
  );
  const fieldMaximum = readNumber(
    temperatureRule.max
    ?? temperatureRule.limit_max
    ?? deviationRule.max
    ?? deviationRule.limit_max,
  );
  const hasFieldLimit = fieldMinimum !== null || fieldMaximum !== null;
  const minimum = hasFieldLimit ? fieldMinimum : readNumber(item.object_snapshot.limit_min);
  const maximum = hasFieldLimit ? fieldMaximum : readNumber(item.object_snapshot.limit_max);
  const fieldUnit = temperatureRule.unit ?? deviationRule.unit;
  const unit = formatUnit(
    hasFieldLimit
      ? fieldUnit ?? item.object_snapshot.unit
      : item.object_snapshot.unit ?? fieldUnit,
  );

  if (minimum !== null && maximum !== null) return `${minimum}–${maximum} ${unit}`;
  if (maximum !== null) return `Högst ${maximum} ${unit}`;
  if (minimum !== null) return `Lägst ${minimum} ${unit}`;
  return null;
}
