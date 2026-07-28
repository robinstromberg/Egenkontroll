import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectRequiredIssueNumbers,
  fetchRoadmapGitHubData,
  resolveRoadmapDisplay,
  RoadmapGitHubFetchError,
  type GitHubRoadmapItem,
  type RoadmapFetch,
  type RoadmapPhaseInput,
  type RoadmapTrackInput,
} from '../src/lib/internalRoadmapStatus';

const repository = 'robinstromberg/Egenkontroll';

const phases: readonly RoadmapPhaseInput[] = [
  { id: 'done', title: 'Klar fas', summary: 'Historik', fixedCompletion: 'complete' },
  { id: 'app', title: 'App', summary: 'Appfas', issueNumbers: [347, 348, 349, 350, 351, 352], blockedByIssueNumbers: [359] },
  { id: 'content', title: 'Innehåll', summary: 'Innehållsfas', issueNumbers: [315, 320], blockedByIssueNumbers: [353] },
  { id: 'launch', title: 'Lansering', summary: 'Framtid', planned: true },
];

const tracks: readonly RoadmapTrackInput[] = [
  { id: 'web-final', title: 'Webbslutgranskning', description: 'Efter migration', issueNumber: 354, blockedByIssueNumbers: [315], kind: 'roadmap-follow-up' },
  { id: 'templates', title: 'Kontrollmallar', description: 'Separat dataarbete', issueNumber: 364, kind: 'separate' },
];

function issue(number: number, state: string, extra: Partial<GitHubRoadmapItem> = {}): GitHubRoadmapItem {
  return { kind: 'issue', number, state, title: `Issue ${number}`, ...extra };
}

function pull(number: number, state: string, body: string, extra: Partial<GitHubRoadmapItem> = {}): GitHubRoadmapItem {
  return { kind: 'pull_request', pull_request: {}, repository_full_name: repository, number, state, body, title: `PR ${number}`, ...extra };
}

function resolve(items: readonly GitHubRoadmapItem[] | null, dataComplete = true) {
  return resolveRoadmapDisplay({ repository, phases, tracks, githubItems: items, dataComplete });
}

const currentScenario = [
  issue(347, 'closed'), issue(348, 'closed'), issue(349, 'closed'),
  issue(350, 'closed'), issue(351, 'closed'), issue(352, 'closed', { closed_at: '2026-07-28T10:35:18Z' }),
  issue(359, 'closed'), issue(353, 'closed'),
  issue(315, 'open'), issue(320, 'open'),
  issue(354, 'open'), issue(364, 'open'),
] as const;

test('alla issues i en fas stängda ger complete', () => {
  const result = resolve(currentScenario);
  assert.equal(result.phases.find((phase) => phase.id === 'app')?.status, 'complete');
});

test('stängd blockerare blockerar inte fasen', () => {
  const result = resolve(currentScenario);
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'ready');
});

test('öppen blockerare ger blocked', () => {
  const result = resolve(currentScenario.map((item) => item.number === 353 ? issue(353, 'open') : item));
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'blocked');
});

test('in-progress ger verifierad aktivitet', () => {
  const result = resolve(currentScenario.map((item) => item.number === 315 ? issue(315, 'open', { labels: ['in-progress'] }) : item));
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'active');
  assert.equal(result.activeIssues[0]?.number, 315);
  assert.equal(result.activeIssues[0]?.activityEvidence, 'in-progress');
});

test('explicit kopplad öppen PR ger verifierad aktivitet', () => {
  const result = resolve([...currentScenario, pull(400, 'open', 'Closes #315')]);
  assert.equal(result.activeIssues[0]?.number, 315);
  assert.equal(result.activeIssues[0]?.activePullRequestNumber, 400);
});

test('stängd eller mergad PR ger inte verifierad aktivitet', () => {
  const closed = resolve([...currentScenario, pull(400, 'closed', 'Closes #315')]);
  const merged = resolve([...currentScenario, pull(401, 'open', 'Closes #315', { merged: true })]);
  assert.equal(closed.activeIssues.length, 0);
  assert.equal(merged.activeIssues.length, 0);
});

test('vanlig omnämning räcker inte', () => {
  const result = resolve([...currentScenario, pull(400, 'open', 'Arbetar med #315')]);
  assert.equal(result.activeIssues.length, 0);
});

test('PR med flera olika closing references är tvetydig', () => {
  const result = resolve([...currentScenario, pull(400, 'open', 'Closes #315 och fixes #320')]);
  assert.equal(result.activeIssues.length, 0);
});

test('flera aktiva issues och faser visas parallellt', () => {
  const items = currentScenario.map((item) => {
    if (item.number === 315 || item.number === 364) return issue(item.number, 'open', { labels: ['in-progress'] });
    return item;
  });
  const result = resolve(items);
  assert.equal(result.activeIssues.some((item) => item.number === 315), true);
  assert.equal(result.relatedTracks.find((track) => track.id === 'templates')?.status, 'active');
});

test('flera aktiva faser ger Flera aktiva spår', () => {
  const multiPhases: readonly RoadmapPhaseInput[] = [
    { id: 'one', title: 'Ett', summary: '', issueNumbers: [1] },
    { id: 'two', title: 'Två', summary: '', issueNumbers: [2] },
  ];
  const result = resolveRoadmapDisplay({
    repository,
    phases: multiPhases,
    githubItems: [issue(1, 'open', { labels: ['in-progress'] }), issue(2, 'open', { labels: ['in-progress'] })],
    dataComplete: true,
  });
  assert.equal(result.mainTrack.kind, 'multiple');
  assert.equal(result.mainTrack.label, 'Flera aktiva spår');
});

test('utan aktivitetsbevis blir #315 nästa redo, inte aktivt', () => {
  const result = resolve(currentScenario);
  assert.equal(result.activeIssues.length, 0);
  assert.equal(result.nextReady?.number, 315);
  assert.equal(result.mainTrack.kind, 'single');
  assert.deepEqual(result.mainTrack.phaseIds, ['content']);
});

test('stängda och blockerade issues visas inte som nästa steg', () => {
  const result = resolve(currentScenario);
  assert.equal(result.nextSteps.some((item) => [350, 351, 352, 354].includes(item.number)), false);
  assert.deepEqual(result.nextSteps.map((item) => item.number), [315, 320]);
});

test('#364 hålls separat från huvudspåret', () => {
  const result = resolve(currentScenario);
  assert.equal(result.nextSteps.some((item) => item.number === 364), false);
  assert.equal(result.relatedTracks.find((track) => track.issue?.number === 364)?.kind, 'separate');
});

test('misslyckad hämtning ger neutral status utan fallback', () => {
  const result = resolve(null, false);
  assert.equal(result.source, 'unverified');
  assert.equal(result.activeIssues.length, 0);
  assert.equal(result.nextReady, null);
  assert.equal(result.mainTrack.kind, 'unknown');
});

test('ofullständig data ger varning och fas blir inte klar', () => {
  const incomplete = currentScenario.filter((item) => item.number !== 352);
  const result = resolve(incomplete, false);
  assert.equal(result.dataComplete, false);
  assert.equal(result.warnings.length > 0, true);
  assert.equal(result.phases.find((phase) => phase.id === 'app')?.status, 'unknown');
});

test('resolven muterar inte input och är deterministisk', () => {
  const items = currentScenario.map((item) => ({ ...item }));
  const before = JSON.stringify(items);
  const first = resolve(items);
  const second = resolve(items);
  assert.equal(JSON.stringify(items), before);
  assert.deepEqual(first, second);
});

test('aktuellt fixture-scenario speglas korrekt', () => {
  const result = resolve(currentScenario);
  assert.equal(result.phases.find((phase) => phase.id === 'app')?.status, 'complete');
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'ready');
  assert.equal(result.nextReady?.number, 315);
  assert.equal(result.relatedTracks.find((track) => track.issue?.number === 354)?.status, 'blocked');
  assert.equal(result.relatedTracks.find((track) => track.issue?.number === 364)?.status, 'ready');
});

function response(body: unknown, link: string | null = null, status = 200, remaining = '60') {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get(name: string) { return name.toLowerCase() === 'link' ? link : name.toLowerCase() === 'x-ratelimit-remaining' ? remaining : null; } },
    async json() { return body; },
  };
}

test('paginering fortsätter tills alla konfigurerade issues hittats', async () => {
  const calls: string[] = [];
  const fetchImpl: RoadmapFetch = async (url) => {
    calls.push(url);
    if (url.includes('/issues') && new URL(url).searchParams.get('page') === '1') return response([{ number: 315, state: 'open', title: '315', labels: [] }], '<https://api.github.com/repos/robinstromberg/Egenkontroll/issues?state=all&per_page=100&page=2>; rel="next"');
    if (url.includes('/issues')) return response([{ number: 353, state: 'closed', title: '353', labels: [] }]);
    return response([]);
  };
  const result = await fetchRoadmapGitHubData({ repository, requiredIssueNumbers: [315, 353], fetchImpl, maxPages: 5 });
  assert.equal(result.complete, true);
  assert.equal(calls.filter((url) => url.includes('/issues')).length, 2);
});

test('paginering stoppas vid maxantal sidor och markeras ofullständig', async () => {
  const fetchImpl: RoadmapFetch = async (url) => {
    if (url.includes('/pulls')) return response([]);
    return response([], '<https://api.github.com/next>; rel="next"');
  };
  const result = await fetchRoadmapGitHubData({ repository, requiredIssueNumbers: [999], fetchImpl, maxPages: 2 });
  assert.equal(result.complete, false);
  assert.equal(result.warnings.some((warning) => warning.includes('stoppades')), true);
});

test('rate limiting ger ett explicit fel som sidan kan visa neutralt', async () => {
  const fetchImpl: RoadmapFetch = async () => response({ message: 'rate limited' }, null, 403, '0');
  await assert.rejects(
    fetchRoadmapGitHubData({ repository, requiredIssueNumbers: [315], fetchImpl }),
    (error: unknown) => error instanceof RoadmapGitHubFetchError && error.kind === 'rate-limit',
  );
});

test('collectRequiredIssueNumbers inkluderar faser, blockerare och spår utan dubbletter', () => {
  assert.deepEqual([...collectRequiredIssueNumbers(phases, tracks)].sort((a, b) => a - b), [315, 320, 347, 348, 349, 350, 351, 352, 353, 354, 359, 364]);
});
