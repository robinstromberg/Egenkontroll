import assert from 'node:assert/strict';
import test from 'node:test';
import type { ControlRunItem } from '../types/database';
import {
  readControlRunItemValue,
  readStoredTemperatureLimitText,
} from './controlRunItemPresentation';

function item(overrides: Partial<ControlRunItem> = {}): ControlRunItem {
  return {
    id: 'item',
    organization_id: 'organization',
    control_run_id: 'run',
    control_object_id: 'object',
    field_definition_id: 'field',
    object_snapshot: { limit_max: 8, unit: 'C' },
    field_snapshot: { field_type: 'temperature', deviation_rule: {} },
    value_text: null,
    value_number: null,
    value_boolean: null,
    value_date: null,
    value_json: {},
    status: 'ok',
    deviation_detected: false,
    deviation_reason: null,
    action_text: null,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('presents not-applicable outcomes with their stored reason and note', () => {
  const value = readControlRunItemValue(item({
    status: 'not_applicable',
    value_json: {
      schema: 'cold_storage_v1',
      notApplicable: {
        reasonLabel: 'Annan orsak',
        note: 'Avfrostas',
      },
    },
  }));

  assert.equal(value, 'Ej i drift · Annan orsak · Avfrostas');
});

test('presents the action limit from the immutable field or object snapshot', () => {
  assert.equal(readControlRunItemValue(item({ value_number: 4.2 })), '4,2 °C');
  assert.equal(readStoredTemperatureLimitText(item()), 'Högst 8 °C');
  assert.equal(readStoredTemperatureLimitText(item({
    field_snapshot: {
      field_type: 'temperature',
      deviation_rule: { temperature: { min: -22, max: -18, unit: '°C' } },
    },
  })), '-22–-18 °C');
  assert.equal(readStoredTemperatureLimitText(item({
    field_snapshot: {
      field_type: 'temperature',
      deviation_rule: { temperature: { min: -22, unit: '°C' } },
    },
  })), 'Lägst -22 °C');
});
