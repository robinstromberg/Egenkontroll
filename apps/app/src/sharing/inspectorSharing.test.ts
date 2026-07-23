import assert from 'node:assert/strict';
import test from 'node:test';
import { readInspectorSharingCapabilities, temporaryInspectorShareCopy } from './inspectorSharing';

test('uses the exact approved temporary inspector sharing copy', () => {
  assert.deepEqual(temporaryInspectorShareCopy, {
    eyebrow: 'VISA FÖR INSPEKTÖR',
    title: 'Dela dokumentationen',
    description: 'Skapa en tillfällig, skrivskyddad länk. Inspektören väljer själv vilken period som ska granskas. Länken gäller i 7 dagar.',
    action: 'Skapa inspektörslänk',
  });
  assert.equal(Object.values(temporaryInspectorShareCopy).some((value) => value.includes('senaste 30 dagarna')), false);
});

test('staff can create a temporary inspector link without link management', () => {
  assert.deepEqual(readInspectorSharingCapabilities(false), {
    canCreateTemporaryLink: true,
    canManageLinks: false,
  });
});

test('owner and admin retain temporary sharing and link management', () => {
  assert.deepEqual(readInspectorSharingCapabilities(true), {
    canCreateTemporaryLink: true,
    canManageLinks: true,
  });
});
