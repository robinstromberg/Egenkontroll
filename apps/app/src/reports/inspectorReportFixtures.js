import { Buffer } from 'node:buffer';

export const fixturePng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAD0lEQVR42mNkYGD4z8DAAAAHAAH/qm8NAAAAAElFTkSuQmCC',
  'base64',
);

function item(id, label, value, overrides = {}) {
  return {
    id,
    object_snapshot: { name: label, instructions: `Kontrollera ${label.toLowerCase()} enligt rutinen.` },
    field_snapshot: { label: 'Status' },
    value_text: value,
    value_number: null,
    value_boolean: null,
    value_date: null,
    value_json: null,
    status: 'completed',
    deviation_detected: false,
    deviation_reason: null,
    action_text: null,
    created_at: '2026-07-19T08:05:00.000Z',
    ...overrides,
  };
}

export function createInspectorReportFixtureRuns({ repeat = 1, attachments = true } = {}) {
  const normal = {
    run_id: 'run-normal',
    organization_name: 'Café Ångbåten',
    organization_logo_url: null,
    organization_brand_color: '#5b46e1',
    control_type_id: 'temperature',
    control_type_name: 'Temperaturkontroll',
    control_type_category: 'temperature',
    control_type_instructions: 'Mät och dokumentera temperaturen varje morgon.',
    performed_by: 'user-1',
    performer_name: 'Åsa Öberg',
    performed_at: '2026-07-19T08:00:00.000Z',
    status: 'completed',
    notes: null,
    items: [item('item-normal', 'Kyl 1', '4 °C')],
    deviations: [],
    attachments: [],
  };
  const deviation = {
    ...normal,
    run_id: 'run-deviation',
    control_type_id: 'receiving',
    control_type_name: 'Varumottagning',
    control_type_category: 'receiving',
    control_type_instructions: 'Kontrollera temperatur och emballage vid leverans.',
    performer_name: 'Björn Ärlig',
    performed_at: '2026-07-19T10:30:00.000Z',
    status: 'completed_with_deviation',
    items: [item('item-deviation', 'Kylvara', '10 °C', {
      deviation_detected: true,
      deviation_reason: 'För hög temperatur',
      action_text: 'Leveransen avvisades och leverantören kontaktades.',
    })],
    deviations: [{
      id: 'deviation-1',
      control_run_item_id: 'item-deviation',
      status: 'open',
      severity: 'high',
      description: 'För hög temperatur vid mottagning.',
      action_text: 'Leveransen avvisades.',
      follow_up_comment: null,
      opened_at: '2026-07-19T10:31:00.000Z',
      resolved_at: null,
    }],
    attachments: attachments ? [{
      id: 'attachment-1',
      control_run_item_id: 'item-deviation',
      deviation_id: 'deviation-1',
      file_name: 'temperaturmätning.png',
      content_type: 'image/png',
      size_bytes: fixturePng.length,
      created_at: '2026-07-19T10:32:00.000Z',
      signed_url: 'https://example.invalid/attachment-1',
    }, {
      id: 'attachment-2',
      control_run_item_id: 'item-deviation',
      deviation_id: 'deviation-1',
      file_name: 'kvitto.pdf',
      content_type: 'application/pdf',
      size_bytes: 1234,
      created_at: '2026-07-19T10:33:00.000Z',
    }] : [],
  };

  const runs = [normal, deviation];
  for (let index = 1; index < repeat; index += 1) {
    runs.push({
      ...normal,
      run_id: `run-normal-${index}`,
      performed_at: new Date(Date.parse(normal.performed_at) - index * 60 * 60 * 1000).toISOString(),
      items: normal.items.map((current) => ({ ...current, id: `${current.id}-${index}` })),
    });
  }
  return runs;
}

export function createInspectorReportFixtureInput() {
  return {
    companyName: 'Café Ångbåten',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-19',
    controlTypeNames: ['Temperaturkontroll', 'Varumottagning'],
    deviationFilterLabel: 'Alla kontroller',
    searchQuery: '',
    sortLabel: 'Senaste först',
    generatedAt: '19 juli 2026 14:30',
  };
}
