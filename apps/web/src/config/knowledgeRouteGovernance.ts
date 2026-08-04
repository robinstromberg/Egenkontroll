import type { KnowledgeSeoPageRole } from './knowledgeSourceContract';
import {
  grandfatheredGovernanceBaseline,
  type GrandfatheredGovernanceEntry,
} from './grandfatheredGovernanceBaseline';
import type { WebRoute } from './routes';

export type KnowledgeRouteGovernanceStatus = 'full' | 'transitional' | 'legacy-inventory' | 'seo-only';

export type KnowledgeRouteGovernanceEntry = {
  path: string;
  status: KnowledgeRouteGovernanceStatus;
  pageRole?: KnowledgeSeoPageRole;
  topicClusterId?: string;
  structuralParentPath?: string;
  plannedIncomingLinks?: readonly string[];
  plannedOutgoingLinks?: readonly string[];
};

const pageRoles = new Set<KnowledgeSeoPageRole>([
  'knowledge-base',
  'topic-hub',
  'fact-page',
  'business-page',
  'workflow-template-tool',
  'product-page',
]);

const statuses = new Set<KnowledgeRouteGovernanceStatus>(['full', 'transitional', 'legacy-inventory', 'seo-only']);

function deriveGrandfatheredGovernance(entry: GrandfatheredGovernanceEntry): KnowledgeRouteGovernanceEntry {
  if (entry.status !== 'transitional' || !entry.structuralParentPath) return entry;
  return {
    ...entry,
    plannedIncomingLinks: [entry.structuralParentPath],
    plannedOutgoingLinks: [],
  };
}

const fullGovernanceEntries = [
  { path: '/seo/grundforutsattningar-livsmedel.html', status: 'full', pageRole: 'fact-page', topicClusterId: 'prerequisites', structuralParentPath: '/kunskapsbank', plannedIncomingLinks: ['/kunskapsbank'], plannedOutgoingLinks: ['/seo/lokaler-och-utrustning-livsmedel.html', '/seo/avfall-livsmedelsverksamhet.html', '/seo/transport-av-livsmedel.html', '/seo/utbildning-livsmedelshygien-personal.html', '/seo/vatten-i-livsmedelsverksamhet.html', '/seo/hygien-och-daglig-drift.html', '/seo/hantering-och-forvaring-livsmedel.html', '/seo/temperaturprocesser-livsmedel.html', '/kunskapsbank', '/digital-egenkontroll-livsmedel'] },
  { path: '/seo/lokaler-och-utrustning-livsmedel.html', status: 'full', pageRole: 'fact-page', topicClusterId: 'premises-equipment', structuralParentPath: '/seo/grundforutsattningar-livsmedel.html', plannedIncomingLinks: ['/seo/grundforutsattningar-livsmedel.html'], plannedOutgoingLinks: ['/seo/materialval-livsmedelslokal.html', '/seo/underhall-livsmedelslokal.html', '/seo/toalett-och-handfat-livsmedelsverksamhet.html', '/seo/ventilation-livsmedelsverksamhet.html', '/seo/grundforutsattningar-livsmedel.html', '/seo/rengoring-livsmedelsverksamhet.html', '/kunskapsbank', '/digital-egenkontroll-livsmedel'] },
] as const satisfies readonly KnowledgeRouteGovernanceEntry[];

export const knowledgeRouteGovernance = [
  ...grandfatheredGovernanceBaseline.map(deriveGrandfatheredGovernance),
  ...fullGovernanceEntries,
] as const satisfies readonly KnowledgeRouteGovernanceEntry[];

export const knowledgeRouteGovernanceMigrationGuide = [
  'Behåll route, canonical, sitemap och resource-href oförändrade i deras befintliga register.',
  'Lägg först ett komplett artikel- och claimkontrakt för den befintliga routen.',
  'Byt därefter endast routens status från grandfathered transitional eller legacy-inventory till full.',
  'Nya indexerbara innehållsroutes får endast registreras som full; baslinjen är explicit grandfathered och får endast minska.',
] as const;

function duplicatePaths(entries: readonly KnowledgeRouteGovernanceEntry[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.path)) duplicates.add(entry.path);
    seen.add(entry.path);
  }
  return [...duplicates];
}

export function countKnowledgeRouteGovernanceStatuses(entries: readonly KnowledgeRouteGovernanceEntry[] = knowledgeRouteGovernance) {
  return entries.reduce<Record<KnowledgeRouteGovernanceStatus, number>>((counts, entry) => {
    counts[entry.status] += 1;
    return counts;
  }, { full: 0, transitional: 0, 'legacy-inventory': 0, 'seo-only': 0 });
}

export function validateKnowledgeRouteGovernance(
  routes: readonly WebRoute[],
  entries: readonly KnowledgeRouteGovernanceEntry[] = knowledgeRouteGovernance,
  grandfatheredEntries: readonly GrandfatheredGovernanceEntry[] = grandfatheredGovernanceBaseline,
): string[] {
  const errors: string[] = [];
  const routesByPath = new Map(routes.map((route) => [route.path, route]));
  const indexablePaths = new Set(routes.filter((route) => route.robots === 'index, follow').map((route) => route.path));
  const grandfatheredByPath = new Map(grandfatheredEntries.map((entry) => [entry.path, entry]));

  for (const path of duplicatePaths(entries)) errors.push(`Duplicerad governance-route: ${path}`);
  for (const entry of entries) {
    const route = routesByPath.get(entry.path);
    if (!route) {
      errors.push(`Governance registrerar okänd route: ${entry.path}`);
      continue;
    }
    if (!indexablePaths.has(entry.path)) errors.push(`Governance får inte registrera noindex-route: ${entry.path}`);
    if (!statuses.has(entry.status)) errors.push(`Governance-route har okänd status: ${entry.path}`);
    if (entry.status !== 'full') {
      const grandfathered = grandfatheredByPath.get(entry.path);
      if (!grandfathered || JSON.stringify(deriveGrandfatheredGovernance(grandfathered)) !== JSON.stringify(entry)) {
        errors.push(`Icke-full governance-route saknar exakt grandfathered-baslinje: ${entry.path}`);
      }
    }

    if (entry.status === 'seo-only') {
      if (entry.pageRole || entry.topicClusterId || entry.structuralParentPath || entry.plannedIncomingLinks || entry.plannedOutgoingLinks) {
        errors.push(`SEO-only-route får inte duplicera artikelgovernance: ${entry.path}`);
      }
      continue;
    }

    if (!pageRoles.has(entry.pageRole as KnowledgeSeoPageRole)) errors.push(`Innehållsroute saknar giltig sidroll: ${entry.path}`);
    if (entry.topicClusterId !== undefined && !entry.topicClusterId.trim()) errors.push(`Innehållsroute har tomt ämneskluster: ${entry.path}`);
    if (entry.structuralParentPath && !indexablePaths.has(entry.structuralParentPath)) errors.push(`Innehållsroute har okänd strukturell förälder: ${entry.path} -> ${entry.structuralParentPath}`);
    for (const link of [...(entry.plannedIncomingLinks ?? []), ...(entry.plannedOutgoingLinks ?? [])]) {
      if (!indexablePaths.has(link)) errors.push(`Innehållsroute har länkplan till okänd indexerbar route: ${entry.path} -> ${link}`);
    }
  }

  for (const path of indexablePaths) {
    if (entries.filter((entry) => entry.path === path).length === 0) errors.push(`Indexerbar route saknar governance-status: ${path}`);
  }

  return errors;
}
