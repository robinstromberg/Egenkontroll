import type { ControlFieldDefinition, ControlObject } from '../types/database';

export type TemperatureRuleInput = {
  limitMin: string;
  limitMax: string;
  unit: string;
};

type TemperatureLimits = {
  limitMin: number | null;
  limitMax: number | null;
  unit: string;
  source: 'field' | 'object' | null;
};

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function readFieldTemperatureRule(field: ControlFieldDefinition): TemperatureRuleInput {
  const rule = readRecord(field.deviation_rule);
  const temperature = readRecord(rule.temperature);
  const limitMin = readNumber(temperature.min ?? temperature.limit_min ?? rule.min ?? rule.limit_min);
  const limitMax = readNumber(temperature.max ?? temperature.limit_max ?? rule.max ?? rule.limit_max);
  const unit = readString(temperature.unit ?? rule.unit) ?? '°C';

  return {
    limitMin: limitMin === null ? '' : String(limitMin),
    limitMax: limitMax === null ? '' : String(limitMax),
    unit,
  };
}

export function buildTemperatureDeviationRule(input: TemperatureRuleInput): Record<string, unknown> {
  const limitMin = input.limitMin.trim() ? Number(input.limitMin) : null;
  const limitMax = input.limitMax.trim() ? Number(input.limitMax) : null;
  const unit = input.unit.trim() || '°C';
  const temperature: Record<string, unknown> = { unit };

  if (limitMin !== null && Number.isFinite(limitMin)) {
    temperature.min = limitMin;
  }

  if (limitMax !== null && Number.isFinite(limitMax)) {
    temperature.max = limitMax;
  }

  return { temperature };
}

export function getTemperatureLimits(field: ControlFieldDefinition, object: ControlObject | null): TemperatureLimits {
  const rule = readRecord(field.deviation_rule);
  const temperature = readRecord(rule.temperature);
  const fieldLimitMin = readNumber(temperature.min ?? temperature.limit_min ?? rule.min ?? rule.limit_min);
  const fieldLimitMax = readNumber(temperature.max ?? temperature.limit_max ?? rule.max ?? rule.limit_max);
  const fieldUnit = readString(temperature.unit ?? rule.unit);

  if (fieldLimitMin !== null || fieldLimitMax !== null) {
    return {
      limitMin: fieldLimitMin,
      limitMax: fieldLimitMax,
      unit: fieldUnit ?? object?.unit ?? '°C',
      source: 'field',
    };
  }

  if (object?.limit_min !== null && object?.limit_min !== undefined) {
    return {
      limitMin: object.limit_min,
      limitMax: object.limit_max ?? null,
      unit: object.unit ?? fieldUnit ?? '°C',
      source: 'object',
    };
  }

  if (object?.limit_max !== null && object?.limit_max !== undefined) {
    return {
      limitMin: null,
      limitMax: object.limit_max,
      unit: object.unit ?? fieldUnit ?? '°C',
      source: 'object',
    };
  }

  return {
    limitMin: null,
    limitMax: null,
    unit: fieldUnit ?? object?.unit ?? '°C',
    source: null,
  };
}

export function getTemperatureUnit(field: ControlFieldDefinition, object: ControlObject | null): string {
  return getTemperatureLimits(field, object).unit;
}

export function getTemperatureLimitText(field: ControlFieldDefinition, object: ControlObject | null): string | null {
  const limits = getTemperatureLimits(field, object);
  const { limitMin, limitMax, unit } = limits;

  if (limitMin !== null && limitMax !== null) return `${limitMin}${unit}-${limitMax}${unit}`;
  if (limitMax !== null) return `Max ${limitMax}${unit}`;
  if (limitMin !== null) return `Min ${limitMin}${unit}`;
  return null;
}

export function getTemperatureDeviationReason(
  field: ControlFieldDefinition,
  object: ControlObject | null,
  value: string,
  label = field.label,
): string | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;

  const limits = getTemperatureLimits(field, object);

  if (limits.limitMax !== null && parsed > limits.limitMax) {
    return `${label} är över maxgräns ${limits.limitMax}${limits.unit}.`;
  }

  if (limits.limitMin !== null && parsed < limits.limitMin) {
    return `${label} är under mingräns ${limits.limitMin}${limits.unit}.`;
  }

  return null;
}
