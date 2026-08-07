import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildColdStorageResponse,
  clearColdStorageDraft,
  createEmptyColdStorageUnitState,
  filterColdStorageDraftResponses,
  getColdStorageDraftKey,
  readColdStorageDraft,
  summarizeColdStorageOutcomes,
  validateColdStorageUnit,
  writeColdStorageDraft,
} from './coldStorageControl';
import { getTemperatureDeviationReason, parseTemperatureInput } from './controlFieldRules';
import type { ControlFieldDefinition, ControlObject } from '../types/database';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const temperatureField: ControlFieldDefinition = {
  id: 'field',
  organization_id: 'organization',
  control_type_id: 'control',
  control_object_id: null,
  field_key: 'temperature',
  label: 'Temperatur',
  field_type: 'temperature',
  required: true,
  deviation_rule: {},
  options: [],
  sort_order: 0,
  active: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const fridge: ControlObject = {
  id: 'fridge',
  organization_id: 'organization',
  control_type_id: 'control',
  name: 'Kyl 1',
  location: 'Kök',
  object_type: 'kyl',
  instructions: null,
  limit_min: null,
  limit_max: 8,
  unit: '°C',
  metadata: {},
  active: true,
  sort_order: 0,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

test('temperature input treats empty as empty and accepts Swedish decimals and negatives', () => {
  assert.deepEqual(parseTemperatureInput(''), { status: 'empty' });
  assert.deepEqual(parseTemperatureInput('  '), { status: 'empty' });
  assert.deepEqual(parseTemperatureInput('4,2'), { status: 'valid', normalized: '4.2', value: 4.2 });
  assert.deepEqual(parseTemperatureInput('4.2'), { status: 'valid', normalized: '4.2', value: 4.2 });
  assert.deepEqual(parseTemperatureInput('-20,3'), { status: 'valid', normalized: '-20.3', value: -20.3 });
  assert.deepEqual(parseTemperatureInput('fyra'), { status: 'invalid' });
  assert.equal(getTemperatureDeviationReason(temperatureField, fridge, ''), null);
  assert.equal(getTemperatureDeviationReason(temperatureField, fridge, '8'), null);
  assert.match(getTemperatureDeviationReason(temperatureField, fridge, '8,1') ?? '', /över maxgräns/);
});

test('not applicable and deviations build structured, readable outcomes', () => {
  const notApplicable = {
    ...createEmptyColdStorageUnitState(),
    notApplicable: true,
    notApplicableReason: 'empty_powered_off' as const,
  };
  assert.equal(validateColdStorageUnit('', notApplicable, false), null);
  const skipped = buildColdStorageResponse('', notApplicable, false);
  assert.equal(skipped.status, 'not_applicable');
  assert.equal(skipped.value, '');
  assert.equal((skipped.valueJson.notApplicable as { reasonCode: string }).reasonCode, 'empty_powered_off');

  const deviationState = {
    ...createEmptyColdStorageUnitState(),
    goodsAction: 'moved' as const,
    equipmentAction: 'service_contacted' as const,
    recheckTemperature: '6,5',
    resolution: 'follow_up' as const,
  };
  assert.equal(validateColdStorageUnit('10', deviationState, true), null);
  const deviation = buildColdStorageResponse('10', deviationState, true);
  assert.equal(deviation.status, 'deviation');
  assert.equal(deviation.deviationStatus, 'open');
  assert.match(deviation.actionText ?? '', /Varorna flyttades/);
  assert.match(deviation.actionText ?? '', /6.5 °C/);
});

test('validation requires a full reason and action only when relevant', () => {
  const empty = createEmptyColdStorageUnitState();
  assert.match(validateColdStorageUnit('', empty, false) ?? '', /Ange temperatur/);
  assert.match(validateColdStorageUnit('4,2,1', empty, false) ?? '', /giltig temperatur/);

  const otherNotApplicable = {
    ...empty,
    notApplicable: true,
    notApplicableReason: 'other' as const,
  };
  assert.match(validateColdStorageUnit('', otherNotApplicable, false) ?? '', /Beskriv varför/);
  assert.match(validateColdStorageUnit('10', empty, true) ?? '', /varorna/);
});

test('result summary distinguishes approved, skipped, resolved and open deviations', () => {
  assert.equal(summarizeColdStorageOutcomes([
    { status: 'ok', deviationDetected: false, deviationStatus: null },
    { status: 'ok', deviationDetected: false, deviationStatus: null },
    { status: 'ok', deviationDetected: false, deviationStatus: null },
  ]), 'Alla 3 kontrollpunkter godkända');

  assert.equal(summarizeColdStorageOutcomes([
    { status: 'ok', deviationDetected: false, deviationStatus: null },
    { status: 'not_applicable', deviationDetected: false, deviationStatus: null },
    { status: 'deviation', deviationDetected: true, deviationStatus: 'open' },
  ]), '1 godkänd · 1 ej i drift · 1 avvikelse behöver följas upp');
});

test('drafts are scoped, definition-bound and retained until explicitly cleared', () => {
  const storage = new MemoryStorage();
  const key = getColdStorageDraftKey('org', 'control', 'user');
  assert.match(key, /org:control:user$/);

  assert.equal(writeColdStorageDraft(storage, key, {
    definitionFingerprint: 'definition-v1',
    responses: { 'fridge:field': '4,2' },
    actions: {},
    units: {},
  }), true);
  assert.equal(readColdStorageDraft(storage, key, 'definition-v1')?.responses['fridge:field'], '4,2');
  assert.equal(readColdStorageDraft(storage, key, 'definition-v2'), null);

  clearColdStorageDraft(storage, key);
  assert.equal(readColdStorageDraft(storage, key, 'definition-v1'), null);
});

test('draft response data excludes file fields that cannot be restored from local storage', () => {
  assert.deepEqual(filterColdStorageDraftResponses({
    'fridge:temperature': '4,2',
    'fridge:photo': 'label.jpg',
  }, [temperatureField, { ...temperatureField, id: 'photo', field_type: 'photo' }]), {
    'fridge:temperature': '4,2',
  });
});
