import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';
import { validatePublicContracts } from './public-platform-contracts.mjs';

const baseline = JSON.parse(
  await readFile(new URL('./public-platform-baseline.json', import.meta.url), 'utf8'),
);

function changed(change) {
  const snapshot = clone(baseline);
  change(snapshot);
  return validatePublicContracts(snapshot, baseline);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('baseline är internt konsekvent', () => {
  assert.deepEqual(validatePublicContracts(clone(baseline), baseline), []);
});

test('upptäcker duplicerad publik route', () => {
  const errors = changed((snapshot) => snapshot.publicRoutes.push(snapshot.publicRoutes[0]));
  assert.ok(errors.some((error) => error.startsWith('Duplicerad publik route:')));
});

test('upptäcker duplicerad canonical path', () => {
  const errors = changed((snapshot) => snapshot.canonicalPaths.push(snapshot.canonicalPaths[0]));
  assert.ok(errors.some((error) => error.startsWith('Duplicerad canonical path:')));
});

test('upptäcker borttagen obligatorisk publik route', () => {
  const errors = changed((snapshot) => {
    snapshot.publicRoutes = snapshot.publicRoutes.filter((route) => route !== '/');
  });
  assert.ok(errors.includes('Saknad publik route: /'));
});

test('upptäcker borttagen obligatorisk API-path', () => {
  const requiredApiPath = baseline.apiPaths[0];
  const errors = changed((snapshot) => {
    snapshot.apiPaths = snapshot.apiPaths.filter((apiPath) => apiPath !== requiredApiPath);
  });
  assert.ok(errors.includes(`Saknad API-path: ${requiredApiPath}`));
});
