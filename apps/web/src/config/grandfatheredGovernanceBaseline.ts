import grandfatheredBaseline from './grandfatheredGovernanceBaseline.json';
import type { KnowledgeSeoPageRole } from './knowledgeSourceContract';

export type GrandfatheredGovernanceStatus = 'transitional' | 'legacy-inventory' | 'seo-only';

export type GrandfatheredGovernanceEntry = {
  path: string;
  status: GrandfatheredGovernanceStatus;
  pageRole?: KnowledgeSeoPageRole;
  topicClusterId?: string;
  structuralParentPath?: string;
  plannedIncomingLinks?: readonly string[];
  plannedOutgoingLinks?: readonly string[];
};

export const grandfatheredGovernanceBaseline = grandfatheredBaseline as readonly GrandfatheredGovernanceEntry[];

export function validateGrandfatheredGovernanceBaseline(
  previous: readonly GrandfatheredGovernanceEntry[],
  current: readonly GrandfatheredGovernanceEntry[],
): string[] {
  const errors: string[] = [];
  const previousByPath = new Map(previous.map((entry) => [entry.path, entry]));
  const currentPaths = new Set<string>();

  for (const entry of current) {
    if (currentPaths.has(entry.path)) errors.push(`Grandfathered-baslinjen innehåller duplicerad route: ${entry.path}`);
    currentPaths.add(entry.path);
    const prior = previousByPath.get(entry.path);
    if (!prior) {
      errors.push(`Grandfathered-baslinjen får inte växa: ${entry.path}`);
      continue;
    }
    if (JSON.stringify(prior) !== JSON.stringify(entry)) errors.push(`Grandfathered-route får inte ändra status eller governance: ${entry.path}`);
  }

  return errors;
}
