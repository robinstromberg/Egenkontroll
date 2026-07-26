import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  getDefaultValue,
  getDeviationReason,
  isSupplierField,
  responseKey,
} from './ControlDefinitionCanvasLogic';
import type { ControlFieldDefinition } from '../types/database';

const componentUrl = new URL('./', import.meta.url);

async function readComponentFile(name: string) {
  return readFile(new URL(name, componentUrl), 'utf8');
}

function field(overrides: Partial<ControlFieldDefinition>): ControlFieldDefinition {
  return {
    id: 'field-id',
    organization_id: 'organization-id',
    control_type_id: 'control-type-id',
    control_object_id: null,
    field_key: 'field',
    label: 'Fält',
    field_type: 'text',
    required: false,
    deviation_rule: {},
    options: [],
    sort_order: 0,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function count(source: string, value: string) {
  return source.split(value).length - 1;
}

function assertOrdered(source: string, values: string[]) {
  let cursor = -1;
  for (const value of values) {
    const next = source.indexOf(value, cursor + 1);
    assert.notEqual(next, -1, `Saknar kontraktsdelen: ${value}`);
    assert.ok(next > cursor, `Fel ordning för kontraktsdelen: ${value}`);
    cursor = next;
  }
}

test('response keys, defaults, supplier detection and deviations stay stable', () => {
  assert.equal(responseKey(null, 'temperature'), 'global:temperature');
  assert.equal(responseKey('fridge', 'temperature'), 'fridge:temperature');
  assert.equal(getDefaultValue(field({ field_type: 'ok_not_ok' })), 'ok');
  assert.equal(getDefaultValue(field({ field_type: 'boolean' })), 'true');
  assert.equal(getDefaultValue(field({ field_type: 'date' })), '');

  assert.equal(isSupplierField(field({ field_key: 'supplier' })), true);
  assert.equal(isSupplierField(field({ field_key: 'other', label: ' Leverantör ' })), true);
  assert.equal(isSupplierField(field({ field_key: 'other', label: 'Leverantörsnummer' })), false);

  assert.equal(getDeviationReason(field({ field_type: 'ok_not_ok', label: 'Ren yta' }), null, 'not_ok'), 'Ren yta är ej OK.');
  assert.equal(getDeviationReason(field({ field_type: 'boolean', label: 'Förpackning hel' }), null, 'false'), 'Förpackning hel är inte uppfyllt.');

  const temperature = field({
    field_type: 'temperature',
    label: 'Kyltemperatur',
    deviation_rule: { temperature: { min: 2, max: 8, unit: '°C' } },
  });
  assert.equal(getDeviationReason(temperature, null, '5'), null);
  assert.equal(getDeviationReason(temperature, null, '9'), 'Kyltemperatur är över maxgräns 8°C.');
  assert.equal(getDeviationReason(temperature, null, '1'), 'Kyltemperatur är under mingräns 2°C.');
  assert.equal(getDeviationReason(temperature, null, ''), 'Kyltemperatur är under mingräns 2°C.');
});

test('migrated view CSS uses only semantic theme tokens', async () => {
  const cssFiles = ['TodayDashboard.css', 'ControlRunForm.css', 'SavedControlView.css'];

  for (const cssFile of cssFiles) {
    const source = await readComponentFile(cssFile);
    assert.match(source, /var\(--ds-/);
    assert.doesNotMatch(source, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i, `${cssFile} innehåller en rå färg`);
    assert.doesNotMatch(source, /@media\s*\(prefers-color-scheme:/, `${cssFile} innehåller en lokal temapalett`);
  }

  const todayCss = await readComponentFile('TodayDashboard.css');
  assert.doesNotMatch(todayCss, /pwa-phone-|pwa-share-|pwa-add-|pwa-home-|pwa-pointer|pwa-highlight-pulse|home-screen-step-card/);

  const savedCss = await readComponentFile('SavedControlView.css');
  assert.match(savedCss, /animation:\s*saved-pop 560ms ease-out both/);
  assert.match(savedCss, /animation:\s*saved-dot 760ms ease-out both/);
  assert.match(savedCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation:\s*none/);
});

test('Today and PWA onboarding retain their steps, assets and telemetry', async () => {
  const [today, prompt] = await Promise.all([
    readComponentFile('TodayDashboard.tsx'),
    readFile(new URL('../services/pwaInstallPrompt.ts', componentUrl), 'utf8'),
  ]);

  assert.match(today, /HOME_SCREEN_SNOOZE_MS = 24 \* 60 \* 60 \* 1000/);
  assert.match(today, /HOME_SCREEN_SNOOZE_KEY}:\$\{organizationId}:\$\{userId}/);
  for (let step = 1; step <= 4; step += 1) {
    assert.equal(count(today, `/pwa-onboarding/step-${step}.png`), 1);
  }

  const iosSteps = today.slice(today.indexOf('const iosHomeScreenGuideSteps'), today.indexOf('const fallbackHomeScreenGuideSteps'));
  const fallbackSteps = today.slice(today.indexOf('const fallbackHomeScreenGuideSteps'), today.indexOf('function HomeScreenGuideVisual'));
  assert.equal(count(iosSteps, 'visual:'), 4);
  assert.equal(count(fallbackSteps, 'visual:'), 4);

  for (const value of [
    "eventName: 'today_viewed'",
    "eventName: 'control_started'",
    "eventName: 'pwa_guide_shown'",
    "eventName: 'pwa_guide_snoozed'",
    "eventName: 'pwa_guide_completed'",
    "source: 'browser_install_prompt'",
    "source: 'manual_home_screen_guide'",
    'Påminn mig senare',
    'Stäng guiden',
    "installGuideStep === 0",
    "installGuideStep === homeScreenGuideSteps.length - 1 ? 'Klart' : 'Nästa'",
  ]) {
    assert.match(today, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assertOrdered(today, ["eventName: 'control_started'", 'onStartControl(control.controlType.id)']);
  assertOrdered(prompt, ['event.preventDefault()', 'prompt.prompt()', 'prompt.userChoice', 'deferredPrompt = null', 'notifyListeners()']);
  assert.match(prompt, /window\.addEventListener\('appinstalled'/);
});

test('control forms retain required, disabled, offline and save ordering', async () => {
  const [legacyForm, photoForm] = await Promise.all([
    readComponentFile('ControlRunForm.tsx'),
    readComponentFile('ControlRunFormWithPhotos.tsx'),
  ]);

  for (const source of [legacyForm, photoForm]) {
    assert.match(source, /response\.deviationDetected && !response\.actionText\?\.trim\(\)/);
    assert.match(source, /if \(!definition \|\| missingAction\) return;/);
    assert.match(source, /if \(!isOnline\)/);
    assert.match(source, /disabled=\{saving \|\| definition\.fields\.length === 0 \|\| missingAction \|\| !isOnline\}/);
    assertOrdered(source, ['if (!isOnline)', "eventName: 'control_save_failed'", 'return;', 'await saveControlRun', "eventName: 'control_saved'", 'await onSaved']);
  }

  assert.match(legacyForm, /has_photo:\s*false/);
  assertOrdered(photoForm, ['const savedAt = new Date().toISOString()', 'await saveControlRun', "eventName: 'control_saved'", 'await onSaved({', 'controlName:', 'savedAt,', 'performedBy: performedByName']);
  assertOrdered(photoForm, ['setFiles((current)', "setResponses((current) => ({ ...current, [key]: file?.name ?? '' }))"]);
  assert.match(photoForm, /nextDefinition\.fields\.some\(isSupplierField\)/);
});

test('all field branches and action requirements remain unchanged', async () => {
  const canvas = await readComponentFile('ControlDefinitionCanvas.tsx');

  assert.match(canvas, /accept="image\/\*"/);
  assert.match(canvas, /capture="environment"/);
  assert.match(canvas, /disabled=\{disabled \|\| suppliers\.length === 0\}/);
  assert.equal(count(canvas, 'required={field.required && !disabled}'), 6);
  assert.equal(count(canvas, 'required={!disabled}'), 2);
  assertOrdered(canvas, [
    "field.field_type === 'photo'",
    "field.field_type === 'temperature'",
    "field.field_type === 'ok_not_ok'",
    "field.field_type === 'boolean'",
    'isSupplierField(field)',
    "field.field_type === 'select'",
    "field.field_type === 'date'",
    "field.field_type === 'textarea'",
  ]);
  assertOrdered(canvas, ["onChange?.(key, 'ok')", "onActionChange?.(key, '')"]);

  const textareaBranch = canvas.slice(canvas.lastIndexOf("field.field_type === 'textarea'"), canvas.lastIndexOf(') : ('));
  assert.doesNotMatch(textareaBranch, /required=/);
});

test('attachment save and post-save navigation contracts stay ordered', async () => {
  const [attachmentService, dashboard, savedView] = await Promise.all([
    readFile(new URL('../services/controlRunWithAttachmentsService.ts', componentUrl), 'utf8'),
    readComponentFile('AppDashboard.tsx'),
    readComponentFile('SavedControlView.tsx'),
  ]);

  assertOrdered(attachmentService, [
    'const controlRunItemId = createUuid()',
    'controlRunItemId,',
    'await uploadControlAttachment',
    'controlRunItemId,',
    "supabase.rpc('save_control_run_transactional'",
    'p_responses: transactionalResponses',
    'p_attachments: uploadedAttachments',
  ]);

  const savedHandler = dashboard.slice(dashboard.indexOf('async function handleControlSaved'), dashboard.indexOf('function handleStartControl'));
  assertOrdered(savedHandler, [
    'setActiveControlTypeId(null)',
    'setSavedSummary(summary)',
    'setDashboardKey',
    'FIRST_RUN_ORGANIZATION_KEY',
    'STAFF_ONBOARDING_ORGANIZATION_KEY',
    'setFirstRunMode(null)',
    "onChangeView('today')",
  ]);
  assertOrdered(dashboard, ['onShowHistory={() => {', 'setSavedSummary(null)', "onChangeView('history')"]);
  assertOrdered(savedView, ['onClick={onShowHistory}', 'Visa i historik', 'onClick={onDone}', 'Klar']);
});
