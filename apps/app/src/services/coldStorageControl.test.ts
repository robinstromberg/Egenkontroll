import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COLD_STORAGE_CONTROL_KEY,
  buildColdStorageDefinitionFingerprint,
  buildColdStorageDraftKey,
  buildColdStorageResponse,
  buildColdStorageResultSummary,
  createEmptyColdStorageEntry,
  getColdStorageBindings,
  getColdStorageEntryError,
  isColdStorageDefinition,
  parseColdStorageDraft,
  parseTemperatureInput,
  readColdStorageHistoryPresentation,
} from './coldStorageControl';
import type { ColdStorageEntry } from './coldStorageControl';
import type { ControlFieldDefinition, ControlObject, ControlRunItem, ControlType } from '../types/database';

function controlType(overrides: Partial<ControlType> = {}): ControlType {
  return {
    id: 'type-id',
    organization_id: 'org-id',
    template_id: 'template-id',
    control_key: COLD_STORAGE_CONTROL_KEY,
    name: 'Kyltemperaturer',
    description: null,
    category: 'temperature',
    frequency: 'daily',
    frequency_config: {},
    instructions: null,
    active: true,
    sort_order: 0,
    created_by: 'user-id',
    created_at: '2026-08-08T07:00:00.000Z',
    updated_at: '2026-08-08T07:00:00.000Z',
    ...overrides,
  };
}

function object(overrides: Partial<ControlObject> = {}): ControlObject {
  return {
    id: 'object-id',
    organization_id: 'org-id',
    control_type_id: 'type-id',
    name: 'Kyl 1',
    location: 'Köket',
    object_type: 'kyl',
    instructions: 'Mät i mitten.',
    limit_min: null,
    limit_max: 8,
    unit: '°C',
    metadata: {},
    active: true,
    sort_order: 0,
    created_at: '2026-08-08T07:00:00.000Z',
    updated_at: '2026-08-08T07:00:00.000Z',
    ...overrides,
  };
}

function field(overrides: Partial<ControlFieldDefinition> = {}): ControlFieldDefinition {
  return {
    id: 'field-id',
    organization_id: 'org-id',
    control_type_id: 'type-id',
    control_object_id: null,
    field_key: 'temperature',
    label: 'Temperatur',
    field_type: 'temperature',
    required: true,
    deviation_rule: {},
    options: [],
    sort_order: 0,
    active: true,
    created_at: '2026-08-08T07:00:00.000Z',
    updated_at: '2026-08-08T07:00:00.000Z',
    ...overrides,
  };
}

function completeDeviation(overrides: Partial<ColdStorageEntry> = {}): ColdStorageEntry {
  return {
    ...createEmptyColdStorageEntry(),
    temperature: '9,4',
    foodAction: 'moved',
    unitAction: 'adjusted',
    checkMeasurement: '6.2',
    followUpStatus: 'resolved',
    ...overrides,
  };
}

test('temperature parser keeps blank neutral and accepts comma, dot and negatives', () => {
  assert.equal(parseTemperatureInput(''), null);
  assert.equal(parseTemperatureInput('   '), null);
  assert.deepEqual(parseTemperatureInput('4,2'), { normalized: '4.2', value: 4.2 });
  assert.deepEqual(parseTemperatureInput('4.2'), { normalized: '4.2', value: 4.2 });
  assert.deepEqual(parseTemperatureInput('-20,3'), { normalized: '-20.3', value: -20.3 });
  assert.deepEqual(parseTemperatureInput('-20.3'), { normalized: '-20.3', value: -20.3 });
  assert.deepEqual(parseTemperatureInput('0'), { normalized: '0', value: 0 });
  assert.equal(parseTemperatureInput('4,2,1'), null);
  assert.equal(parseTemperatureInput('Infinity'), null);
});

test('only exact keyed and structurally safe definitions activate the cold-storage flow', () => {
  const definition = { controlType: controlType(), objects: [object()], fields: [field()] };
  assert.equal(isColdStorageDefinition(definition), true);
  assert.equal(getColdStorageBindings(definition).length, 1);

  assert.equal(isColdStorageDefinition({
    ...definition,
    controlType: controlType({ control_key: null, name: 'Kyltemperaturer', category: 'temperature' }),
  }), false);
  assert.equal(isColdStorageDefinition({
    ...definition,
    controlType: controlType({ control_key: null, name: 'Annan temperatur', category: 'temperature' }),
  }), false);
  assert.equal(isColdStorageDefinition({ ...definition, fields: [field({ field_type: 'number' })] }), false);
  assert.equal(isColdStorageDefinition({
    ...definition,
    fields: [...definition.fields, field({ id: 'field-extra', field_key: 'backup_temperature' })],
  }), false);
});

test('completion requires temperature or complete not-applicable and structured deviation choices', () => {
  const binding = getColdStorageBindings({ controlType: controlType(), objects: [object()], fields: [field()] })[0];
  assert.match(getColdStorageEntryError(binding, createEmptyColdStorageEntry()) ?? '', /Ange temperatur/);
  assert.equal(getColdStorageEntryError(binding, { ...createEmptyColdStorageEntry(), temperature: '4,2' }), null);
  assert.match(getColdStorageEntryError(binding, { ...createEmptyColdStorageEntry(), temperature: '9' }) ?? '', /varorna/);
  assert.equal(getColdStorageEntryError(binding, completeDeviation()), null);
  assert.match(getColdStorageEntryError(binding, completeDeviation({ unitAction: 'other', actionNote: '' })) ?? '', /andra åtgärden/);
  assert.equal(getColdStorageEntryError(binding, completeDeviation({ unitAction: 'other', actionNote: 'Reservkyl användes.' })), null);
  assert.match(getColdStorageEntryError(binding, {
    ...createEmptyColdStorageEntry(),
    notApplicable: true,
  }) ?? '', /Välj varför/);
  assert.equal(getColdStorageEntryError(binding, {
    ...createEmptyColdStorageEntry(),
    notApplicable: true,
    notApplicableReason: 'empty_and_off',
  }), null);
  assert.match(getColdStorageEntryError(binding, {
    ...createEmptyColdStorageEntry(),
    notApplicable: true,
    notApplicableReason: 'other',
  }) ?? '', /Beskriv/);
});

test('payload preserves original temperature, separates check measurement and records open or resolved', () => {
  const binding = getColdStorageBindings({ controlType: controlType(), objects: [object()], fields: [field()] })[0];
  const resolved = buildColdStorageResponse(binding, completeDeviation());
  assert.equal(resolved.value, '9.4');
  assert.equal(resolved.valueJson.checkMeasurement, 6.2);
  assert.equal(resolved.valueJson.followUpStatus, 'resolved');
  assert.equal(resolved.status, 'deviation');
  assert.match(resolved.actionText ?? '', /Kontrollmätning: 6.2 °C/);

  const open = buildColdStorageResponse(binding, completeDeviation({ followUpStatus: 'open' }));
  assert.equal(open.valueJson.followUpStatus, 'open');
  assert.match(open.actionText ?? '', /Behöver följas upp/);

  const notApplicable = buildColdStorageResponse(binding, {
    ...createEmptyColdStorageEntry(),
    notApplicable: true,
    notApplicableReason: 'temporarily_out_of_service',
  });
  assert.equal(notApplicable.status, 'not_applicable');
  assert.equal(notApplicable.value, '');
  assert.equal(notApplicable.valueJson.reason, 'temporarily_out_of_service');
});

test('result summary covers approved, not-applicable, resolved and open outcomes', () => {
  const objects = [object(), object({ id: 'object-2', name: 'Frys 1', limit_max: -18 })];
  const bindings = getColdStorageBindings({ controlType: controlType(), objects, fields: [field()] });
  assert.deepEqual(buildColdStorageResultSummary(bindings, {
    [bindings[0].key]: { ...createEmptyColdStorageEntry(), temperature: '4' },
    [bindings[1].key]: { ...createEmptyColdStorageEntry(), temperature: '-20' },
  }), { hasOpenDeviation: false, text: 'Alla 2 kontrollpunkter godkända' });

  assert.deepEqual(buildColdStorageResultSummary(bindings, {
    [bindings[0].key]: { ...createEmptyColdStorageEntry(), temperature: '4' },
    [bindings[1].key]: { ...createEmptyColdStorageEntry(), notApplicable: true, notApplicableReason: 'empty_and_off' },
  }), { hasOpenDeviation: false, text: '1 godkänd · 1 ej i drift' });

  assert.deepEqual(buildColdStorageResultSummary(bindings, {
    [bindings[0].key]: completeDeviation(),
    [bindings[1].key]: completeDeviation({ temperature: '-15', followUpStatus: 'open' }),
  }), {
    hasOpenDeviation: true,
    text: '1 avvikelse dokumenterad och löst · 1 avvikelse behöver följas upp',
  });
});

test('drafts are scoped and restored only for the current definition fingerprint', () => {
  const bindings = getColdStorageBindings({ controlType: controlType(), objects: [object()], fields: [field()] });
  const fingerprint = buildColdStorageDefinitionFingerprint(controlType(), bindings);
  const value = JSON.stringify({
    schema: 'cold_storage_v1',
    definitionFingerprint: fingerprint,
    entries: { [bindings[0].key]: { ...createEmptyColdStorageEntry(), temperature: '4,2' } },
    updatedAt: '2026-08-08T07:30:00.000Z',
  });

  assert.equal(buildColdStorageDraftKey('user-a', 'org-a', 'type-a'), 'egenkontroll:cold-storage-draft:user-a:org-a:type-a');
  assert.equal(parseColdStorageDraft(value, fingerprint)?.entries[bindings[0].key].temperature, '4,2');
  assert.equal(parseColdStorageDraft(value, `${fingerprint}-changed`), null);
  assert.equal(parseColdStorageDraft('{invalid', fingerprint), null);
  assert.equal(parseColdStorageDraft(JSON.stringify({
    schema: 'cold_storage_v1',
    definitionFingerprint: fingerprint,
    entries: { [bindings[0].key]: { ...createEmptyColdStorageEntry(), foodAction: 'not-a-valid-action' } },
  }), fingerprint), null);
});

test('history presents structured entries and leaves unknown legacy JSON to fallback', () => {
  const base = {
    status: 'not_applicable',
    value_json: {
      schema: 'cold_storage_v1',
      kind: 'not_applicable',
      reason: 'other',
      note: 'Avfrostning',
    },
  } as Pick<ControlRunItem, 'status' | 'value_json'>;
  assert.deepEqual(readColdStorageHistoryPresentation(base), {
    value: 'Ej i drift · Annan orsak',
    details: ['Orsak: Avfrostning'],
  });

  assert.deepEqual(readColdStorageHistoryPresentation({
    status: 'deviation',
    value_json: {
      schema: 'cold_storage_v1',
      kind: 'temperature_deviation',
      foodAction: 'moved',
      unitAction: 'service_contacted',
      checkMeasurement: 7.5,
      followUpStatus: 'open',
      actionNote: null,
    },
  }), {
    value: 'Temperaturavvikelse',
    details: [
      'Varor: Varorna flyttades',
      'Enhet: Service kontaktades',
      'Kontrollmätning: 7,5 °C',
      'Uppföljning: Behöver följas upp',
    ],
  });
  assert.equal(readColdStorageHistoryPresentation({ status: 'ok', value_json: {} }), null);
});
