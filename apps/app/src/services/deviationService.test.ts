import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildResolveDeviationRpcArgs } from './deviationTransition';

test('resolve deviation RPC arguments contain only server-safe identifiers and comment', () => {
  assert.deepEqual(
    buildResolveDeviationRpcArgs('organization-1', 'deviation-1', '  Uppföljd och godkänd.  '),
    {
      p_organization_id: 'organization-1',
      p_deviation_id: 'deviation-1',
      p_follow_up_comment: 'Uppföljd och godkänd.',
    },
  );

  assert.equal(
    buildResolveDeviationRpcArgs('organization-1', 'deviation-1', '   ').p_follow_up_comment,
    null,
  );
});

test('deviation service uses the transition RPC and does not update history directly', async () => {
  const source = await readFile(new URL('./deviationService.ts', import.meta.url), 'utf8');

  assert.match(source, /supabase\.rpc\(\s*'resolve_deviation'/);
  assert.doesNotMatch(source, /\.from\(['"]deviations['"]\)/);
  assert.doesNotMatch(source, /resolved_by|resolved_at|new Date/);
});
