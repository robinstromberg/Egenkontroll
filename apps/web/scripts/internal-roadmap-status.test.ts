import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCurrentRoadmapDisplay, type GitHubRoadmapItem } from '../src/lib/internalRoadmapStatus';

const fallback = {
  activeIssueNumber: 352,
  activeIssueTitle: 'Fallback issue',
} as const;

function resolve(githubItems: readonly GitHubRoadmapItem[] | null, blockerIssueNumbers: readonly number[] = [359]) {
  return resolveCurrentRoadmapDisplay({
    issueNumbers: [350, 351, 352],
    blockerIssueNumbers,
    githubItems,
    fallback,
  });
}

test('väljer #352 när #350 och #351 är stängda och #352 är in-progress', () => {
  const result = resolve([
    { number: 350, state: 'closed', title: 'Historik' },
    { number: 351, state: 'closed', title: 'Administration' },
    { number: 352, state: 'open', title: 'Guardrails', labels: [{ name: 'in-progress' }] },
    { number: 359, state: 'closed', title: 'Tidigare blockerare' },
  ]);

  assert.equal(result.activeIssueNumber, 352);
  assert.equal(result.activeIssueTitle, 'Guardrails');
  assert.equal(result.blockerIssueNumber, null);
  assert.equal(result.phaseComplete, false);
});

test('prioriterar enda öppna in-progress när flera issues är öppna', () => {
  const result = resolve([
    { number: 350, state: 'open', title: 'Första öppna' },
    { number: 351, state: 'open', title: 'Aktiv', labels: ['in-progress'] },
    { number: 352, state: 'open', title: 'Senare öppen' },
  ], []);

  assert.equal(result.activeIssueNumber, 351);
});

test('väljer första öppna issue i fasordningen när ingen är in-progress', () => {
  const result = resolve([
    { number: 350, state: 'closed', title: 'Klar' },
    { number: 351, state: 'open', title: 'Första öppna' },
    { number: 352, state: 'open', title: 'Andra öppna' },
  ], []);

  assert.equal(result.activeIssueNumber, 351);
});

test('markerar fasen klar när samtliga konfigurerade issues är stängda', () => {
  const result = resolve([
    { number: 350, state: 'closed' },
    { number: 351, state: 'closed' },
    { number: 352, state: 'closed' },
  ], []);

  assert.equal(result.activeIssueNumber, null);
  assert.equal(result.activeIssueTitle, 'Fasen är klar');
  assert.equal(result.phaseComplete, true);
});

test('använder endast versionerad fallback när GitHub-hämtningen misslyckas', () => {
  const result = resolve(null, []);

  assert.equal(result.source, 'fallback');
  assert.equal(result.activeIssueNumber, 352);
  assert.equal(result.activeIssueTitle, 'Fallback issue');
});

test('visar bara blockerare som fortfarande är öppen', () => {
  const closed = resolve([
    { number: 350, state: 'closed' },
    { number: 351, state: 'closed' },
    { number: 352, state: 'open' },
    { number: 359, state: 'closed', title: 'Stängd blockerare' },
  ]);
  const open = resolve([
    { number: 350, state: 'closed' },
    { number: 351, state: 'closed' },
    { number: 352, state: 'open' },
    { number: 359, state: 'open', title: 'Öppen blockerare' },
  ]);

  assert.equal(closed.blockerIssueNumber, null);
  assert.equal(open.blockerIssueNumber, 359);
  assert.equal(open.blockerIssueTitle, 'Öppen blockerare');
});

test('visar bara en öppet PR som uttryckligen stänger den aktiva issuen', () => {
  const result = resolve([
    { number: 350, state: 'closed' },
    { number: 351, state: 'closed' },
    { number: 352, state: 'open', labels: ['in-progress'] },
    { number: 360, state: 'open', pull_request: {}, body: 'Closes #350' },
    { number: 365, state: 'open', pull_request: {}, body: 'Closes #352' },
  ], []);

  assert.equal(result.activePullRequestNumber, 365);
});
