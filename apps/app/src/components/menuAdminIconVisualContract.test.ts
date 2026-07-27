import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  appUiIcons,
  controlCategoryIcons,
  controlTypeIcons,
  readControlTypeIcon,
} from '../config/assets';

const appRoot = fileURLToPath(new URL('../../', import.meta.url));
const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const migratedCssFiles = [
  'MenuView.css',
  'MenuDestinationView.css',
  'OrganizationBrandingView.css',
  'SuppliersView.css',
  'OrganizationSetup.css',
  'ControlTypesView.css',
  'ControlTypeDetailView.css',
  'AdminControls.css',
] as const;
const rawColorPattern = /(?:#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i;

async function readComponentFile(fileName: string): Promise<string> {
  return readFile(new URL(fileName, import.meta.url), 'utf8');
}

async function readSourceFile(path: string): Promise<string> {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

async function listSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return listSourceFiles(path);
    return /\.(?:css|js|ts|tsx)$/.test(entry.name) ? [path] : [];
  }));
  return files.flat();
}

function assertSourceOrder(source: string, markers: string[], label: string): void {
  let previous = -1;
  for (const marker of markers) {
    const index = source.indexOf(marker);
    assert.ok(index > previous, `${label}: saknar eller har fel ordning för ${marker}`);
    previous = index;
  }
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
}

function sourceFrom(source: string, marker: string): string {
  const index = source.indexOf(marker);
  assert.notEqual(index, -1, `Saknar ${marker}`);
  return source.slice(index);
}

test('menu, administration and setup CSS use only semantic theme tokens', async () => {
  for (const cssFile of migratedCssFiles) {
    const source = await readComponentFile(cssFile);
    assert.match(source, /var\(--ds-/, `${cssFile} saknar semantiska tokens`);
    assert.doesNotMatch(source, rawColorPattern, `${cssFile} innehåller rå temafärg`);
    assert.doesNotMatch(source, /@media\s*\(prefers-color-scheme:/, `${cssFile} innehåller lokal temapalett`);
  }

  const controlTypesCss = await readComponentFile('ControlTypesView.css');
  assert.match(controlTypesCss, /\.control-types-view \.control-type-icon\s*\{/);
});

test('the typed icon registry owns paths, defaults and exact-case assets', async () => {
  const icons = [...Object.values(appUiIcons), ...Object.values(controlTypeIcons)];
  const assetNames = new Set(await readdir(`${appRoot}/public/ui-icons`));

  for (const icon of icons) {
    assert.match(icon.src, /^\/ui-icons\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|svg)$/);
    assert.ok(icon.fallback.trim(), `${icon.src} saknar fallback`);
    assert.ok(assetNames.has(icon.src.slice('/ui-icons/'.length)), `${icon.src} saknas med exakt skiftläge`);
  }

  assert.strictEqual(controlCategoryIcons.temperature, controlTypeIcons.kyltemperatur);
  assert.strictEqual(controlCategoryIcons.checklist, controlTypeIcons.stadning);
  assert.strictEqual(controlCategoryIcons.receiving, controlTypeIcons.varumottagning);
  assert.strictEqual(controlCategoryIcons.traceability, controlTypeIcons.sparbarhet);
  assert.strictEqual(controlCategoryIcons.round, controlTypeIcons.egenkontrollrunda);
  assert.strictEqual(controlCategoryIcons.custom, controlTypeIcons.custom);
  assert.strictEqual(readControlTypeIcon({ name: 'Kyltemperatur' }), controlTypeIcons.kyltemperatur);
  assert.strictEqual(readControlTypeIcon({ name: 'Spårbarhet' }), controlTypeIcons.sparbarhet);
  assert.strictEqual(readControlTypeIcon({ category: 'receiving' }), controlTypeIcons.varumottagning);
  assert.strictEqual(readControlTypeIcon({ category: 'unknown' }), controlTypeIcons.custom);
  assert.strictEqual(readControlTypeIcon({}), controlTypeIcons.custom);

  const allowedRegistry = normalizePath(`${sourceRoot}/config/assets.ts`);
  const allowedTest = normalizePath(fileURLToPath(import.meta.url));
  for (const file of await listSourceFiles(sourceRoot)) {
    const normalizedFile = normalizePath(file);
    if (normalizedFile === allowedRegistry || normalizedFile === allowedTest) continue;
    assert.doesNotMatch(await readFile(file, 'utf8'), /\/ui-icons\//, `${normalizedFile} kringgår ikonregistryn`);
  }
});

test('owner, admin and staff menu and invitation boundaries stay unchanged', async () => {
  const menuSource = await readComponentFile('MenuView.tsx');
  const organizationSource = await readSourceFile('../services/organizationService.ts');
  const usersSource = await readComponentFile('UsersView.tsx');
  const detailSource = await readComponentFile('ControlTypeDetailView.tsx');

  assert.equal((menuSource.match(/adminOnly:\s*true/g) ?? []).length, 4);
  assert.match(menuSource, /icon: appUiIcons\.add,\s*fallback: 'K'/);
  for (const action of ['organization', 'users', 'controlTypes', 'suppliers']) {
    assert.match(menuSource, new RegExp(`action: '${action}'[\\s\\S]*?adminOnly: true`));
  }
  assert.match(menuSource, /visibleItems = menuItems\.filter\(\(item\) => canManage \|\| !item\.adminOnly\)/);
  assert.match(menuSource, /\{canManage \? \(\s*<div className="subscription-card">/);
  assert.match(organizationSource, /return role === 'owner' \|\| role === 'admin';/);
  assert.match(usersSource, /canManage \? listOrganizationInvitations\(organizationId\) : Promise\.resolve\(\[\]\)/);
  assert.match(usersSource, /async function refreshInvitations\(\) \{\s*if \(!canManage\) return;/);
  assert.match(usersSource, /\{canManage \? \(\s*<>\s*<form className="menu-destination-panel invitation-form"/);
  assert.match(detailSource, /mode=\{canManage \? 'edit' : 'preview'\}/);
});

test('menu and control-type hash navigation contracts stay unchanged', async () => {
  const dashboardSource = await readComponentFile('AppDashboard.tsx');
  const controlTypesSource = await readComponentFile('ControlTypesView.tsx');

  assert.match(dashboardSource, /\['profile', 'organization', 'users', 'controlTypes', 'suppliers', 'help'\]/);
  assert.match(dashboardSource, /params\.set\('view', 'menu'\)/);
  assert.match(dashboardSource, /params\.set\('menu', subview\)/);
  assertSourceOrder(dashboardSource, ["params.delete('menu')", "params.delete('controlTypeId')", 'window.history.replaceState'], 'menyhash');
  assert.match(controlTypesSource, /params\.set\('menu', 'controlTypes'\)/);
  assertSourceOrder(controlTypesSource, ["params.set('controlTypeId', controlTypeId)", "params.delete('controlTypeId')", 'window.history.replaceState'], 'kontrolltypshash');
});

test('administration save and side-effect ordering stays unchanged', async () => {
  const usersSource = await readComponentFile('UsersView.tsx');
  const brandingSource = await readComponentFile('OrganizationBrandingView.tsx');
  const setupSource = await readComponentFile('OrganizationSetup.tsx');
  const suppliersSource = await readComponentFile('SuppliersView.tsx');
  const controlTypesSource = await readComponentFile('ControlTypesView.tsx');

  assertSourceOrder(sourceFrom(usersSource, 'async function handleCreateInvitation'), ['createOrganizationInvitation({', 'sendOrganizationInvitationEmail(invitation.id)', 'refreshInvitations()'], 'inbjudan');
  assertSourceOrder(sourceFrom(brandingSource, 'async function handleSubmit'), ['updateOrganizationBranding({', 'onSaved(savedOrganization)'], 'verksamhet');
  assertSourceOrder(sourceFrom(setupSource, 'async function handleSubmit'), ['updateProfile({', 'createFirstOrganization(', 'localStorage.setItem(FIRST_RUN_ORGANIZATION_KEY', 'onCreated()'], 'organisation setup');
  assertSourceOrder(sourceFrom(suppliersSource, 'async function handleCreate'), ['createSupplier(', 'setSuppliers((current) => [supplier, ...current]'], 'leverantör create');
  assertSourceOrder(sourceFrom(suppliersSource, 'async function handleSaveEdit'), ['updateSupplier(', 'setSuppliers((current) => current.map'], 'leverantör update');
  assertSourceOrder(sourceFrom(controlTypesSource, 'async function handleCreateType'), ['createControlType({', 'refreshControlTypes()', 'openControlType(created.id)'], 'kontrolltyp create');
  assertSourceOrder(sourceFrom(controlTypesSource, 'async function handleToggleActive'), ['setControlTypeActive(', 'setControlTypes((current) => current.map'], 'kontrolltyp status');
});
