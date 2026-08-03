import type { GovernanceFinding } from './publicationGate';

// Findings är avsiktligt ett litet, versionshanterat register tills en separat
// beslutad driftlösning finns. Inga fynd eller godkännanden fabriceras här.
export const governanceFindings = [] as const satisfies readonly GovernanceFinding[];
