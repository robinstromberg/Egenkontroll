export type GitHubRoadmapLabel = string | { name?: string | null };

export type GitHubRoadmapItem = {
  number: number;
  state: string;
  title?: string;
  body?: string | null;
  labels?: readonly GitHubRoadmapLabel[];
  pull_request?: unknown;
};

export type RoadmapFallback = {
  activeIssueNumber: number;
  activeIssueTitle: string;
  blockerIssueNumber?: number;
  blockerIssueTitle?: string;
};

export type CurrentRoadmapDisplay = {
  source: 'github' | 'fallback';
  activeIssueNumber: number | null;
  activeIssueTitle: string;
  activePullRequestNumber: number | null;
  blockerIssueNumber: number | null;
  blockerIssueTitle: string | null;
  phaseComplete: boolean;
};

type ResolveCurrentRoadmapDisplayInput = {
  issueNumbers: readonly number[];
  blockerIssueNumbers: readonly number[];
  githubItems: readonly GitHubRoadmapItem[] | null;
  fallback: RoadmapFallback;
};

function labelName(label: GitHubRoadmapLabel): string {
  return typeof label === 'string' ? label : label.name ?? '';
}

function hasLabel(item: GitHubRoadmapItem, expected: string): boolean {
  return (item.labels ?? []).some((label) => labelName(label).trim().toLowerCase() === expected.toLowerCase());
}

function selectActiveIssue(issueNumbers: readonly number[], itemsByNumber: ReadonlyMap<number, GitHubRoadmapItem>) {
  const openIssues = issueNumbers
    .map((number) => itemsByNumber.get(number))
    .filter((item): item is GitHubRoadmapItem => item?.state === 'open');

  return openIssues.find((item) => hasLabel(item, 'in-progress')) ?? openIssues[0] ?? null;
}

function selectOpenBlocker(blockerIssueNumbers: readonly number[], itemsByNumber: ReadonlyMap<number, GitHubRoadmapItem>) {
  return blockerIssueNumbers
    .map((number) => itemsByNumber.get(number))
    .find((item): item is GitHubRoadmapItem => item?.state === 'open') ?? null;
}

function selectLinkedOpenPullRequest(activeIssueNumber: number, items: readonly GitHubRoadmapItem[]) {
  const closingReference = new RegExp(`\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#${activeIssueNumber}\\b`, 'i');
  const matches = items.filter((item) => item.state === 'open' && item.pull_request && closingReference.test(item.body ?? ''));
  return matches.length === 1 ? matches[0] : null;
}

export function resolveCurrentRoadmapDisplay({
  issueNumbers,
  blockerIssueNumbers,
  githubItems,
  fallback,
}: ResolveCurrentRoadmapDisplayInput): CurrentRoadmapDisplay {
  if (githubItems === null) {
    return {
      source: 'fallback',
      activeIssueNumber: fallback.activeIssueNumber,
      activeIssueTitle: fallback.activeIssueTitle,
      activePullRequestNumber: null,
      blockerIssueNumber: fallback.blockerIssueNumber ?? null,
      blockerIssueTitle: fallback.blockerIssueTitle ?? null,
      phaseComplete: false,
    };
  }

  const itemsByNumber = new Map(githubItems.map((item) => [item.number, item]));
  const activeIssue = selectActiveIssue(issueNumbers, itemsByNumber);
  const openBlocker = selectOpenBlocker(blockerIssueNumbers, itemsByNumber);
  const configuredIssues = issueNumbers.map((number) => itemsByNumber.get(number));
  const phaseComplete = issueNumbers.length > 0
    && configuredIssues.every((item) => item?.state === 'closed');
  const linkedPullRequest = activeIssue
    ? selectLinkedOpenPullRequest(activeIssue.number, githubItems)
    : null;

  return {
    source: 'github',
    activeIssueNumber: activeIssue?.number ?? null,
    activeIssueTitle: activeIssue?.title ?? (phaseComplete ? 'Fasen är klar' : 'Ingen aktiv issue kunde identifieras'),
    activePullRequestNumber: linkedPullRequest?.number ?? null,
    blockerIssueNumber: openBlocker?.number ?? null,
    blockerIssueTitle: openBlocker?.title ?? null,
    phaseComplete,
  };
}
