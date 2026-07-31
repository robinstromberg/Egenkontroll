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
  { id: 'governance', title: 'Fas 6B', summary: 'Permanent innehållssystem', issueNumbers: [384] },
  {
    id: 'content',
    title: 'Innehåll',
    summary: 'Innehållsfas',
    issueNumbers: [315, 320, 370, 371, 372, 373, 374, 321, 322, 323, 324],
    coordinatingIssueNumbers: [315, 320],
    implementationStages: [[370], [371], [372, 373], [374]],
    blockedByIssueNumbers: [353, 384],
  },
  { id: 'launch', title: 'Lansering', summary: 'Framtid', planned: true },
];

const tracks: readonly RoadmapTrackInput[] = [
  { id: 'seo-ownership', title: 'SEO-ägarskap', description: 'Före avslut', issueNumber: 375, kind: 'roadmap-follow-up' },
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

function replaceIssue(
  items: readonly GitHubRoadmapItem[],
  number: number,
  state: string,
  extra: Partial<GitHubRoadmapItem> = {},
): readonly GitHubRoadmapItem[] {
  return items.map((item) => item.number === number && item.kind !== 'pull_request'
    ? issue(number, state, extra)
    : item);
}

function closeIssues(items: readonly GitHubRoadmapItem[], numbers: readonly number[]) {
  return numbers.reduce((result, number) => replaceIssue(result, number, 'closed'), items);
}

const currentScenario = [
  issue(347, 'closed'), issue(348, 'closed'), issue(349, 'closed'),
  issue(350, 'closed'), issue(351, 'closed'), issue(352, 'closed', { closed_at: '2026-07-28T10:35:18Z' }),
  issue(359, 'closed'), issue(353, 'closed'),
  issue(384, 'open'),
  issue(315, 'open'),
  issue(320, 'open', { labels: ['in-progress'] }),
  issue(370, 'open'), issue(371, 'open'), issue(372, 'open'), issue(373, 'open'), issue(374, 'open'),
  issue(321, 'open'), issue(322, 'open'), issue(323, 'open'), issue(324, 'open'),
  issue(375, 'open'), issue(354, 'open'), issue(364, 'open'),
] as const;

const migrationScenario = closeIssues(currentScenario, [384]);

test('alla issues i en färdig fas ger complete', () => {
  const result = resolve(currentScenario);
  assert.equal(result.phases.find((phase) => phase.id === 'app')?.status, 'complete');
});

test('#384 är nästa avgränsade huvudfas och håller #315 som framtida tills Fas 6B är klar', () => {
  const result = resolve(currentScenario);
  assert.equal(result.phases.find((phase) => phase.id === 'governance')?.status, 'ready');
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'future');
  assert.equal(result.mainTrack.label, 'Fas 6B');
  assert.equal(result.nextReady?.number, 384);
  assert.deepEqual(result.nextSteps.map((item) => item.number), [384]);
});

test('samordnande parent med in-progress blir inte verifierat aktivt arbete', () => {
  const result = resolve(migrationScenario);
  const content = result.phases.find((phase) => phase.id === 'content');
  assert.equal(content?.status, 'ready');
  assert.equal(result.activeIssues.some((item) => item.number === 320), false);
  assert.equal(result.nextReady?.number, 370);
  assert.deepEqual(result.nextSteps.map((item) => item.number), [370]);
});

test('explicit PR mot samordnande parent blir inte aktivt implementationsarbete', () => {
  const result = resolve([...migrationScenario, pull(400, 'open', 'Closes #320')]);
  assert.equal(result.activeIssues.some((item) => item.number === 320), false);
  assert.equal(result.nextReady?.number, 370);
});

test('in-progress på implementerbar child ger verifierad aktivitet', () => {
  const items = replaceIssue(migrationScenario, 370, 'open', { labels: ['in-progress'] });
  const result = resolve(items);
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'active');
  assert.equal(result.activeIssues[0]?.number, 370);
  assert.equal(result.activeIssues[0]?.activityEvidence, 'in-progress');
  assert.equal(result.nextReady, null);
});

test('explicit kopplad öppen PR på implementerbar child ger verifierad aktivitet', () => {
  const result = resolve([...migrationScenario, pull(400, 'open', 'Closes #370')]);
  assert.equal(result.activeIssues[0]?.number, 370);
  assert.equal(result.activeIssues[0]?.activePullRequestNumber, 400);
});

test('stängd, mergad eller tvetydig PR ger inte verifierad aktivitet', () => {
  const closed = resolve([...migrationScenario, pull(400, 'closed', 'Closes #370')]);
  const merged = resolve([...migrationScenario, pull(401, 'open', 'Closes #370', { merged: true })]);
  const ambiguous = resolve([...migrationScenario, pull(402, 'open', 'Closes #370 och fixes #371')]);
  assert.equal(closed.activeIssues.length, 0);
  assert.equal(merged.activeIssues.length, 0);
  assert.equal(ambiguous.activeIssues.length, 0);
});

test('vanlig omnämning av child räcker inte som aktivitet', () => {
  const result = resolve([...migrationScenario, pull(400, 'open', 'Arbetar med #370')]);
  assert.equal(result.activeIssues.length, 0);
  assert.equal(result.nextReady?.number, 370);
});

test('när första steget stängs blir #371 nästa redo', () => {
  const result = resolve(closeIssues(migrationScenario, [370]));
  assert.equal(result.nextReady?.number, 371);
  assert.deepEqual(result.nextSteps.map((item) => item.number), [371]);
});

test('efter #371 blir #372 och #373 parallellt redo', () => {
  const result = resolve(closeIssues(migrationScenario, [370, 371]));
  assert.equal(result.nextReady?.number, 372);
  assert.deepEqual(result.nextSteps.map((item) => item.number), [372, 373]);
});

test('aktiv #372 lämnar #373 som nästa redo i samma steg', () => {
  const staged = closeIssues(migrationScenario, [370, 371]);
  const items = replaceIssue(staged, 372, 'open', { labels: ['in-progress'] });
  const result = resolve(items);
  assert.deepEqual(result.activeIssues.map((item) => item.number), [372]);
  assert.equal(result.nextReady?.number, 373);
  assert.deepEqual(result.nextSteps.map((item) => item.number), [372, 373]);
});

test('när båda parallella batcherna är klara blir #374 nästa redo', () => {
  const result = resolve(closeIssues(migrationScenario, [370, 371, 372, 373]));
  assert.equal(result.nextReady?.number, 374);
  assert.deepEqual(result.nextSteps.map((item) => item.number), [374]);
});

test('efter det explicita klustret fortsätter övriga implementerbara fasissues i ordning', () => {
  const result = resolve(closeIssues(migrationScenario, [370, 371, 372, 373, 374]));
  assert.equal(result.nextReady?.number, 321);
  assert.deepEqual(result.nextSteps.map((item) => item.number), [321, 322, 323]);
});

test('öppna parents håller fasen ofärdig men presenteras inte som implementation', () => {
  const implementationNumbers = [370, 371, 372, 373, 374, 321, 322, 323, 324];
  const result = resolve(closeIssues(migrationScenario, implementationNumbers));
  const content = result.phases.find((phase) => phase.id === 'content');
  assert.equal(content?.status, 'ready');
  assert.equal(content?.statusLabel, 'Samordning återstår');
  assert.deepEqual(content?.openCoordinatingIssueNumbers, [315, 320]);
  assert.equal(result.nextReady, null);
  assert.deepEqual(result.nextSteps, []);
});

test('fasen blir complete först när även samordnande parents är stängda', () => {
  const allContentNumbers = [315, 320, 370, 371, 372, 373, 374, 321, 322, 323, 324];
  const result = resolve(closeIssues(migrationScenario, allContentNumbers));
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'complete');
});

test('öppen fasblockerare ger blocked och inget nästa redo', () => {
  const result = resolve(replaceIssue(migrationScenario, 353, 'open'));
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'blocked');
  assert.equal(result.nextReady, null);
});

test('#375 visas som roadmaprelaterad uppföljning men blandas inte in i nästa steg', () => {
  const result = resolve(migrationScenario);
  const track = result.relatedTracks.find((item) => item.issue?.number === 375);
  assert.equal(track?.kind, 'roadmap-follow-up');
  assert.equal(track?.status, 'ready');
  assert.equal(result.nextSteps.some((item) => item.number === 375), false);
});

test('#354 är roadmaprelaterad uppföljning blockerad av öppet huvudissue', () => {
  const result = resolve(migrationScenario);
  const track = result.relatedTracks.find((item) => item.issue?.number === 354);
  assert.equal(track?.kind, 'roadmap-follow-up');
  assert.equal(track?.status, 'blocked');
  assert.deepEqual(track?.openBlockers.map((item) => item.number), [315]);
});

test('#364 hålls separat från huvudspåret', () => {
  const result = resolve(migrationScenario);
  assert.equal(result.nextSteps.some((item) => item.number === 364), false);
  assert.equal(result.relatedTracks.find((track) => track.issue?.number === 364)?.kind, 'separate');
});

test('flera implementerbara aktiva faser ger Flera aktiva spår', () => {
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

test('misslyckad hämtning ger neutral status utan fallback', () => {
  const result = resolve(null, false);
  assert.equal(result.source, 'unverified');
  assert.equal(result.activeIssues.length, 0);
  assert.equal(result.nextReady, null);
  assert.equal(result.mainTrack.kind, 'unknown');
});

test('ofullständig data ger varning och fas blir inte klar', () => {
  const incomplete = currentScenario.filter((item) => item.number !== 370);
  const result = resolve(incomplete, false);
  assert.equal(result.dataComplete, false);
  assert.equal(result.warnings.length > 0, true);
  assert.equal(result.phases.find((phase) => phase.id === 'content')?.status, 'unknown');
});

test('resolvern muterar inte input och är deterministisk', () => {
  const items = currentScenario.map((item) => ({ ...item }));
  const before = JSON.stringify(items);
  const first = resolve(items);
  const second = resolve(items);
  assert.equal(JSON.stringify(items), before);
  assert.deepEqual(first, second);
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
    if (url.includes('/issues') && new URL(url).searchParams.get('page') === '1') return response([{ number: 370, state: 'open', title: '370', labels: [] }], '<https://api.github.com/repos/robinstromberg/Egenkontroll/issues?state=all&per_page=100&page=2>; rel="next"');
    if (url.includes('/issues')) return response([{ number: 353, state: 'closed', title: '353', labels: [] }]);
    return response([]);
  };
  const result = await fetchRoadmapGitHubData({ repository, requiredIssueNumbers: [370, 353], fetchImpl, maxPages: 5 });
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
    fetchRoadmapGitHubData({ repository, requiredIssueNumbers: [370], fetchImpl }),
    (error: unknown) => error instanceof RoadmapGitHubFetchError && error.kind === 'rate-limit',
  );
});

test('collectRequiredIssueNumbers inkluderar parents, steg, blockerare och spår utan dubbletter', () => {
  assert.deepEqual(
    [...collectRequiredIssueNumbers(phases, tracks)].sort((a, b) => a - b),
    [315, 320, 321, 322, 323, 324, 347, 348, 349, 350, 351, 352, 353, 354, 359, 364, 370, 371, 372, 373, 374, 375, 384],
  );
});
