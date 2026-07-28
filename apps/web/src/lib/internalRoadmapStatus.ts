export type GitHubRoadmapLabel = string | { name?: string | null };

export type GitHubRoadmapItem = {
  number: number;
  state: string;
  title?: string;
  body?: string | null;
  labels?: readonly GitHubRoadmapLabel[];
  pull_request?: unknown;
  kind?: 'issue' | 'pull_request';
  merged?: boolean;
  closed_at?: string | null;
  repository_full_name?: string;
};

export type RoadmapPhaseInput = {
  id: string;
  title: string;
  summary: string;
  issueNumbers?: readonly number[];
  coordinatingIssueNumbers?: readonly number[];
  implementationStages?: readonly (readonly number[])[];
  blockedByIssueNumbers?: readonly number[];
  fixedCompletion?: 'complete';
  planned?: boolean;
};

export type RoadmapTrackInput = {
  id: string;
  title: string;
  description: string;
  issueNumber: number;
  blockedByIssueNumbers?: readonly number[];
  kind: 'roadmap-follow-up' | 'separate';
};

export type RoadmapPhaseStatus = 'complete' | 'blocked' | 'active' | 'ready' | 'future' | 'unknown';
export type RoadmapTrackStatus = 'closed' | 'blocked' | 'active' | 'ready' | 'unknown';

export type ResolvedRoadmapIssue = {
  number: number;
  title: string;
  activePullRequestNumber: number | null;
  activityEvidence: 'in-progress' | 'pull-request' | null;
};

export type ResolvedRoadmapPhase = {
  id: string;
  title: string;
  summary: string;
  status: RoadmapPhaseStatus;
  statusLabel: string;
  activeIssues: readonly ResolvedRoadmapIssue[];
  openImplementationIssueNumbers: readonly number[];
  readyIssueNumbers: readonly number[];
  openCoordinatingIssueNumbers: readonly number[];
  openBlockers: readonly ResolvedRoadmapIssue[];
  completedAt: string | null;
};

export type ResolvedRoadmapTrack = {
  id: string;
  title: string;
  description: string;
  kind: RoadmapTrackInput['kind'];
  status: RoadmapTrackStatus;
  issue: ResolvedRoadmapIssue | null;
  openBlockers: readonly ResolvedRoadmapIssue[];
};

export type ResolvedMainTrack =
  | { kind: 'single'; phaseIds: readonly [string]; label: string }
  | { kind: 'multiple'; phaseIds: readonly string[]; label: string }
  | { kind: 'complete'; phaseIds: readonly []; label: string }
  | { kind: 'unknown'; phaseIds: readonly []; label: string };

export type ResolvedRoadmapDisplay = {
  source: 'github' | 'unverified';
  dataComplete: boolean;
  phases: readonly ResolvedRoadmapPhase[];
  mainTrack: ResolvedMainTrack;
  activeIssues: readonly ResolvedRoadmapIssue[];
  nextReady: ResolvedRoadmapIssue | null;
  openBlockers: readonly ResolvedRoadmapIssue[];
  relatedTracks: readonly ResolvedRoadmapTrack[];
  nextSteps: readonly ResolvedRoadmapIssue[];
  warnings: readonly string[];
};

type ResolveRoadmapDisplayInput = {
  repository: string;
  phases: readonly RoadmapPhaseInput[];
  tracks?: readonly RoadmapTrackInput[];
  githubItems: readonly GitHubRoadmapItem[] | null;
  dataComplete: boolean;
};

export type RoadmapFetchResponse = {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
};

export type RoadmapFetch = (
  input: string,
  init?: {
    method?: string;
    cache?: string;
    headers?: Record<string, string>;
  },
) => Promise<RoadmapFetchResponse>;

export type RoadmapGitHubFetchResult = {
  items: readonly GitHubRoadmapItem[];
  complete: boolean;
  warnings: readonly string[];
  pagesFetched: number;
};

export class RoadmapGitHubFetchError extends Error {
  readonly kind: 'rate-limit' | 'http' | 'invalid-response';

  constructor(kind: RoadmapGitHubFetchError['kind'], message: string) {
    super(message);
    this.name = 'RoadmapGitHubFetchError';
    this.kind = kind;
  }
}

function labelName(label: GitHubRoadmapLabel): string {
  return typeof label === 'string' ? label : label.name ?? '';
}

function hasLabel(item: GitHubRoadmapItem, expected: string): boolean {
  return (item.labels ?? []).some((label) => labelName(label).trim().toLowerCase() === expected.toLowerCase());
}

function isPullRequest(item: GitHubRoadmapItem): boolean {
  return item.kind === 'pull_request' || Boolean(item.pull_request);
}

function issueTitle(item: GitHubRoadmapItem | undefined, number: number): string {
  return item?.title?.trim() || `Issue #${number}`;
}

function parseClosingIssueNumbers(body: string | null | undefined): readonly number[] {
  if (!body) return [];
  const matches = body.matchAll(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/gi);
  return [...new Set(Array.from(matches, (match) => Number(match[1])).filter(Number.isInteger))];
}

function linkedOpenPullRequest(
  repository: string,
  issueNumber: number,
  pullRequests: readonly GitHubRoadmapItem[],
): GitHubRoadmapItem | null {
  const matches = pullRequests.filter((item) => {
    if (item.state !== 'open' || item.merged === true) return false;
    if (item.repository_full_name && item.repository_full_name.toLowerCase() !== repository.toLowerCase()) return false;
    const references = parseClosingIssueNumbers(item.body);
    return references.length === 1 && references[0] === issueNumber;
  });
  return matches.length === 1 ? matches[0] : null;
}

function resolveIssue(
  repository: string,
  issueNumber: number,
  issueMap: ReadonlyMap<number, GitHubRoadmapItem>,
  pullRequests: readonly GitHubRoadmapItem[],
): ResolvedRoadmapIssue | null {
  const issue = issueMap.get(issueNumber);
  if (!issue || issue.state !== 'open') return null;
  const pullRequest = linkedOpenPullRequest(repository, issueNumber, pullRequests);
  const evidence = hasLabel(issue, 'in-progress')
    ? 'in-progress'
    : pullRequest
      ? 'pull-request'
      : null;
  return {
    number: issueNumber,
    title: issueTitle(issue, issueNumber),
    activePullRequestNumber: pullRequest?.number ?? null,
    activityEvidence: evidence,
  };
}

function uniqueNumbers(numbers: readonly number[]): readonly number[] {
  return [...new Set(numbers)];
}

function uniqueIssues(issues: readonly ResolvedRoadmapIssue[]): readonly ResolvedRoadmapIssue[] {
  const seen = new Set<number>();
  return issues.filter((issue) => {
    if (seen.has(issue.number)) return false;
    seen.add(issue.number);
    return true;
  });
}

function phaseTrackedIssueNumbers(phase: RoadmapPhaseInput): readonly number[] {
  return uniqueNumbers([
    ...(phase.issueNumbers ?? []),
    ...(phase.coordinatingIssueNumbers ?? []),
    ...(phase.implementationStages ?? []).flat(),
  ]);
}

function phaseImplementationIssueNumbers(phase: RoadmapPhaseInput): readonly number[] {
  const coordinators = new Set(phase.coordinatingIssueNumbers ?? []);
  const staged = uniqueNumbers((phase.implementationStages ?? []).flat());
  const stagedSet = new Set(staged);
  const ungrouped = (phase.issueNumbers ?? []).filter(
    (number) => !coordinators.has(number) && !stagedSet.has(number),
  );
  return [...staged, ...ungrouped];
}

function readyImplementationIssueNumbers(
  phase: RoadmapPhaseInput,
  issueMap: ReadonlyMap<number, GitHubRoadmapItem>,
): readonly number[] {
  const stages = phase.implementationStages ?? [];
  for (let index = 0; index < stages.length; index += 1) {
    const previousNumbers = stages.slice(0, index).flat();
    if (!previousNumbers.every((number) => issueMap.get(number)?.state === 'closed')) return [];

    const stage = stages[index];
    const openStageIssues = stage.filter((number) => issueMap.get(number)?.state === 'open');
    if (openStageIssues.length > 0) return openStageIssues;

    if (!stage.every((number) => issueMap.get(number)?.state === 'closed')) return [];
  }

  const staged = new Set(stages.flat());
  const coordinators = new Set(phase.coordinatingIssueNumbers ?? []);
  return (phase.issueNumbers ?? []).filter(
    (number) => !coordinators.has(number)
      && !staged.has(number)
      && issueMap.get(number)?.state === 'open',
  );
}

function phaseStatusLabel(status: RoadmapPhaseStatus): string {
  switch (status) {
    case 'complete': return 'Klar';
    case 'blocked': return 'Blockerad';
    case 'active': return 'Verifierat aktiv';
    case 'ready': return 'Redo';
    case 'future': return 'Framtida';
    case 'unknown': return 'Status ej verifierad';
  }
}

export function collectRequiredIssueNumbers(
  phases: readonly RoadmapPhaseInput[],
  tracks: readonly RoadmapTrackInput[] = [],
): readonly number[] {
  const numbers = new Set<number>();
  for (const phase of phases) {
    for (const number of phaseTrackedIssueNumbers(phase)) numbers.add(number);
    for (const number of phase.blockedByIssueNumbers ?? []) numbers.add(number);
  }
  for (const track of tracks) {
    numbers.add(track.issueNumber);
    for (const number of track.blockedByIssueNumbers ?? []) numbers.add(number);
  }
  return [...numbers];
}

export function resolveRoadmapDisplay({
  repository,
  phases,
  tracks = [],
  githubItems,
  dataComplete,
}: ResolveRoadmapDisplayInput): ResolvedRoadmapDisplay {
  const source = githubItems === null ? 'unverified' : 'github';
  const items = githubItems ?? [];
  const issueItems = items.filter((item) => !isPullRequest(item));
  const pullRequests = items.filter(isPullRequest);
  const issueMap = new Map(issueItems.map((item) => [item.number, item]));
  const requiredNumbers = collectRequiredIssueNumbers(phases, tracks);
  const missingNumbers = source === 'github'
    ? requiredNumbers.filter((number) => !issueMap.has(number))
    : requiredNumbers;
  const effectiveDataComplete = source === 'github' && dataComplete && missingNumbers.length === 0;
  const warnings: string[] = [];
  if (source === 'unverified') warnings.push('Live-status kunde inte verifieras.');
  if (source === 'github' && !dataComplete) warnings.push('GitHub-hämtningen blev ofullständig.');
  if (source === 'github' && missingNumbers.length > 0) {
    warnings.push(`Status saknas för: ${missingNumbers.map((number) => `#${number}`).join(', ')}.`);
  }

  const provisional = phases.map((phase): ResolvedRoadmapPhase => {
    if (phase.fixedCompletion === 'complete') {
      return {
        id: phase.id,
        title: phase.title,
        summary: phase.summary,
        status: 'complete',
        statusLabel: phaseStatusLabel('complete'),
        activeIssues: [],
        openImplementationIssueNumbers: [],
        readyIssueNumbers: [],
        openCoordinatingIssueNumbers: [],
        openBlockers: [],
        completedAt: null,
      };
    }
    if (phase.planned && !(phase.issueNumbers?.length)) {
      return {
        id: phase.id,
        title: phase.title,
        summary: phase.summary,
        status: 'future',
        statusLabel: phaseStatusLabel('future'),
        activeIssues: [],
        openImplementationIssueNumbers: [],
        readyIssueNumbers: [],
        openCoordinatingIssueNumbers: [],
        openBlockers: [],
        completedAt: null,
      };
    }

    const trackedIssueNumbers = phaseTrackedIssueNumbers(phase);
    const implementationIssueNumbers = phaseImplementationIssueNumbers(phase);
    const coordinatorNumbers = phase.coordinatingIssueNumbers ?? [];
    const blockerNumbers = phase.blockedByIssueNumbers ?? [];
    const phaseMissing = [...trackedIssueNumbers, ...blockerNumbers].some((number) => !issueMap.has(number));
    const openTrackedIssues = trackedIssueNumbers
      .map((number) => issueMap.get(number))
      .filter((item): item is GitHubRoadmapItem => item?.state === 'open');
    const openImplementationIssueNumbers = implementationIssueNumbers.filter(
      (number) => issueMap.get(number)?.state === 'open',
    );
    const openCoordinatingIssueNumbers = coordinatorNumbers.filter(
      (number) => issueMap.get(number)?.state === 'open',
    );
    const activeIssues = openImplementationIssueNumbers
      .map((number) => resolveIssue(repository, number, issueMap, pullRequests))
      .filter((item): item is ResolvedRoadmapIssue => item?.activityEvidence !== null);
    const openBlockers = blockerNumbers
      .map((number) => resolveIssue(repository, number, issueMap, pullRequests))
      .filter((item): item is ResolvedRoadmapIssue => item !== null);
    const readyIssueNumbers = openBlockers.length > 0
      ? []
      : readyImplementationIssueNumbers(phase, issueMap);
    const allClosed = trackedIssueNumbers.length > 0
      && trackedIssueNumbers.every((number) => issueMap.get(number)?.state === 'closed');
    const completedAt = allClosed
      ? trackedIssueNumbers
          .map((number) => issueMap.get(number)?.closed_at ?? null)
          .filter((value): value is string => Boolean(value))
          .sort()
          .at(-1) ?? null
      : null;

    let status: RoadmapPhaseStatus;
    if (source === 'unverified' || phaseMissing || !dataComplete) status = 'unknown';
    else if (allClosed) status = 'complete';
    else if (activeIssues.length > 0) status = 'active';
    else if (openBlockers.length > 0) status = 'blocked';
    else if (readyIssueNumbers.length > 0 || openTrackedIssues.length > 0) status = 'ready';
    else status = 'unknown';

    const onlyCoordinationRemains = readyIssueNumbers.length === 0
      && openImplementationIssueNumbers.length === 0
      && openCoordinatingIssueNumbers.length > 0;

    return {
      id: phase.id,
      title: phase.title,
      summary: phase.summary,
      status,
      statusLabel: onlyCoordinationRemains ? 'Samordning återstår' : phaseStatusLabel(status),
      activeIssues,
      openImplementationIssueNumbers,
      readyIssueNumbers,
      openCoordinatingIssueNumbers,
      openBlockers,
      completedAt,
    };
  });

  const firstUnfinishedIndex = provisional.findIndex((phase) => phase.status !== 'complete');
  const resolvedPhases = provisional.map((phase, index): ResolvedRoadmapPhase => {
    if (
      firstUnfinishedIndex >= 0
      && index > firstUnfinishedIndex
      && phase.status !== 'complete'
      && phase.status !== 'active'
      && phase.status !== 'unknown'
    ) {
      return { ...phase, status: 'future', statusLabel: phaseStatusLabel('future') };
    }
    return phase;
  });

  const activePhases = resolvedPhases.filter((phase) => phase.status === 'active');
  let mainTrack: ResolvedMainTrack;
  if (activePhases.length > 1) {
    mainTrack = {
      kind: 'multiple',
      phaseIds: activePhases.map((phase) => phase.id),
      label: 'Flera aktiva spår',
    };
  } else if (activePhases.length === 1) {
    mainTrack = {
      kind: 'single',
      phaseIds: [activePhases[0].id],
      label: activePhases[0].title,
    };
  } else {
    const readyPhase = resolvedPhases.find((phase) => phase.status === 'ready');
    const blockedPhase = resolvedPhases.find((phase) => phase.status === 'blocked');
    if (readyPhase) {
      mainTrack = { kind: 'single', phaseIds: [readyPhase.id], label: readyPhase.title };
    } else if (blockedPhase) {
      mainTrack = { kind: 'single', phaseIds: [blockedPhase.id], label: blockedPhase.title };
    } else if (resolvedPhases.every((phase) => phase.status === 'complete')) {
      mainTrack = { kind: 'complete', phaseIds: [], label: 'Transformationsroadmapen är klar' };
    } else {
      mainTrack = { kind: 'unknown', phaseIds: [], label: 'Huvudspår kunde inte verifieras' };
    }
  }

  const activeIssues = uniqueIssues(resolvedPhases.flatMap((phase) => phase.activeIssues));
  const mainPhaseOrder = mainTrack.kind === 'single'
    ? resolvedPhases.filter((phase) => mainTrack.phaseIds.includes(phase.id))
    : mainTrack.kind === 'multiple'
      ? resolvedPhases.filter((phase) => mainTrack.phaseIds.includes(phase.id))
      : [];

  let nextReady: ResolvedRoadmapIssue | null = null;
  for (const phase of mainPhaseOrder) {
    if (phase.status === 'blocked' || phase.status === 'unknown' || phase.status === 'future') continue;
    const candidateNumber = phase.readyIssueNumbers.find(
      (number) => !phase.activeIssues.some((active) => active.number === number),
    );
    if (candidateNumber !== undefined) {
      nextReady = resolveIssue(repository, candidateNumber, issueMap, pullRequests);
      break;
    }
  }

  const relatedTracks = tracks.map((track): ResolvedRoadmapTrack => {
    const issue = issueMap.get(track.issueNumber);
    const resolvedIssue = resolveIssue(repository, track.issueNumber, issueMap, pullRequests);
    const missing = !issue || (track.blockedByIssueNumbers ?? []).some((number) => !issueMap.has(number));
    const openBlockers = (track.blockedByIssueNumbers ?? [])
      .map((number) => resolveIssue(repository, number, issueMap, pullRequests))
      .filter((item): item is ResolvedRoadmapIssue => item !== null);
    let status: RoadmapTrackStatus;
    if (source === 'unverified' || !dataComplete || missing) status = 'unknown';
    else if (issue.state === 'closed') status = 'closed';
    else if (resolvedIssue?.activityEvidence) status = 'active';
    else if (openBlockers.length > 0) status = 'blocked';
    else status = 'ready';
    return {
      id: track.id,
      title: track.title,
      description: track.description,
      kind: track.kind,
      status,
      issue: resolvedIssue ?? (issue ? {
        number: issue.number,
        title: issueTitle(issue, issue.number),
        activePullRequestNumber: null,
        activityEvidence: null,
      } : null),
      openBlockers,
    };
  });

  const openBlockers = uniqueIssues([
    ...resolvedPhases.flatMap((phase) => phase.openBlockers),
    ...relatedTracks.flatMap((track) => track.openBlockers),
  ]);

  const nextSteps: ResolvedRoadmapIssue[] = [...activeIssues];
  const pushIssue = (issue: ResolvedRoadmapIssue | null) => {
    if (issue && !nextSteps.some((existing) => existing.number === issue.number) && nextSteps.length < 3) {
      nextSteps.push(issue);
    }
  };
  for (const phase of mainPhaseOrder) {
    if (phase.status === 'blocked' || phase.status === 'unknown' || phase.status === 'future') continue;
    for (const number of phase.readyIssueNumbers) {
      pushIssue(resolveIssue(repository, number, issueMap, pullRequests));
    }
  }
  if (nextSteps.length < 3 && mainTrack.kind === 'single') {
    const mainIndex = resolvedPhases.findIndex((phase) => phase.id === mainTrack.phaseIds[0]);
    const nextPhase = resolvedPhases.slice(mainIndex + 1).find((phase) => phase.status === 'ready');
    if (nextPhase) {
      for (const number of nextPhase.readyIssueNumbers) {
        pushIssue(resolveIssue(repository, number, issueMap, pullRequests));
      }
    }
  }

  return {
    source,
    dataComplete: effectiveDataComplete,
    phases: resolvedPhases,
    mainTrack,
    activeIssues,
    nextReady,
    openBlockers,
    relatedTracks,
    nextSteps,
    warnings,
  };
}

function nextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match?.[2].split(/\s+/).includes('next')) return match[1];
  }
  return null;
}

async function readArrayResponse(response: RoadmapFetchResponse): Promise<readonly Record<string, unknown>[]> {
  if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
    throw new RoadmapGitHubFetchError('rate-limit', 'GitHubs anropsgräns är nådd.');
  }
  if (!response.ok) {
    throw new RoadmapGitHubFetchError('http', `GitHub svarade med status ${response.status}.`);
  }
  const body = await response.json();
  if (!Array.isArray(body)) {
    throw new RoadmapGitHubFetchError('invalid-response', 'GitHub returnerade ett oväntat svar.');
  }
  return body as readonly Record<string, unknown>[];
}

function normalizeIssue(raw: Record<string, unknown>, repository: string): GitHubRoadmapItem | null {
  if (raw.pull_request) return null;
  if (typeof raw.number !== 'number' || typeof raw.state !== 'string') return null;
  return {
    number: raw.number,
    state: raw.state,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    body: typeof raw.body === 'string' || raw.body === null ? raw.body : undefined,
    labels: Array.isArray(raw.labels) ? raw.labels as GitHubRoadmapLabel[] : undefined,
    closed_at: typeof raw.closed_at === 'string' || raw.closed_at === null ? raw.closed_at : undefined,
    repository_full_name: repository,
    kind: 'issue',
  };
}

function normalizePullRequest(raw: Record<string, unknown>, repository: string): GitHubRoadmapItem | null {
  if (typeof raw.number !== 'number' || typeof raw.state !== 'string') return null;
  return {
    number: raw.number,
    state: raw.state,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    body: typeof raw.body === 'string' || raw.body === null ? raw.body : undefined,
    merged: raw.merged === true,
    repository_full_name: repository,
    kind: 'pull_request',
    pull_request: {},
  };
}

export async function fetchRoadmapGitHubData({
  repository,
  requiredIssueNumbers,
  fetchImpl,
  maxPages = 10,
}: {
  repository: string;
  requiredIssueNumbers: readonly number[];
  fetchImpl: RoadmapFetch;
  maxPages?: number;
}): Promise<RoadmapGitHubFetchResult> {
  const headers = { Accept: 'application/vnd.github+json' };
  const issues = new Map<number, GitHubRoadmapItem>();
  const pullRequests: GitHubRoadmapItem[] = [];
  const warnings: string[] = [];
  let pagesFetched = 0;
  let issuesComplete = requiredIssueNumbers.length === 0;
  let issueUrl: string | null = `https://api.github.com/repos/${repository}/issues?state=all&per_page=100&sort=created&direction=desc&page=1`;

  for (let page = 0; issueUrl && page < maxPages && !issuesComplete; page += 1) {
    const response = await fetchImpl(issueUrl, { method: 'GET', cache: 'no-cache', headers });
    pagesFetched += 1;
    const body = await readArrayResponse(response);
    for (const raw of body) {
      const issue = normalizeIssue(raw, repository);
      if (issue) issues.set(issue.number, issue);
    }
    issuesComplete = requiredIssueNumbers.every((number) => issues.has(number));
    issueUrl = issuesComplete ? null : nextLink(response.headers.get('link'));
  }
  if (!issuesComplete) warnings.push('Alla konfigurerade issues kunde inte hämtas.');
  if (issueUrl) warnings.push(`Issue-hämtningen stoppades efter ${maxPages} sidor.`);

  let pullsComplete = false;
  let pullUrl: string | null = `https://api.github.com/repos/${repository}/pulls?state=open&per_page=100&page=1`;
  for (let page = 0; pullUrl && page < maxPages; page += 1) {
    const response = await fetchImpl(pullUrl, { method: 'GET', cache: 'no-cache', headers });
    pagesFetched += 1;
    const body = await readArrayResponse(response);
    for (const raw of body) {
      const pullRequest = normalizePullRequest(raw, repository);
      if (pullRequest) pullRequests.push(pullRequest);
    }
    const next = nextLink(response.headers.get('link'));
    if (!next) pullsComplete = true;
    pullUrl = next;
  }
  if (!pullsComplete) warnings.push(`PR-hämtningen stoppades efter ${maxPages} sidor.`);

  return {
    items: [...issues.values(), ...pullRequests],
    complete: issuesComplete && pullsComplete,
    warnings,
    pagesFetched,
  };
}
