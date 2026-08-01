import type { KnowledgeSeoPageRole } from './knowledgeSourceContract';
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

const legacyInventoryPaths = [
  '/seo/allergeninformation-restaurang.html',
  '/seo/allergenkontamination-livsmedel.html',
  '/seo/ansvar-livsmedelsinformation.html',
  '/seo/aterkalla-livsmedel-sparbarhet.html',
  '/seo/ateruppvarmning-mat.html',
  '/seo/avfall-livsmedelsverksamhet.html',
  '/seo/bast-fore-eller-sista-forbrukningsdag.html',
  '/seo/bestamma-hallbarhetsdatum-livsmedel.html',
  '/seo/datummarkning-livsmedel.html',
  '/seo/distansforsaljning-oforpackad-mat.html',
  '/seo/fardigforpackade-livsmedel-markning.html',
  '/seo/forvaringsanvisning-livsmedel.html',
  '/seo/frysa-in-kylvaror-fore-utgangsdatum.html',
  '/seo/information-och-markning-livsmedel.html',
  '/seo/ingrediensforteckning-livsmedel.html',
  '/seo/intern-sparbarhet-livsmedel.html',
  '/seo/is-i-livsmedelsverksamhet.html',
  '/seo/kallor-och-faktagranskning.html',
  '/seo/kemikalier-i-livsmedelsverksamhet.html',
  '/seo/kontrollplan.html',
  '/seo/korskontamination-livsmedel.html',
  '/seo/kritiska-gransvarden.html',
  '/seo/kylforvaring-livsmedel.html',
  '/seo/livsmedlets-beteckning.html',
  '/seo/mangdbalans-sparbarhet-livsmedel.html',
  '/seo/marka-om-fardigforpackade-livsmedel.html',
  '/seo/mat-efter-sista-forbrukningsdag.html',
  '/seo/materialval-livsmedelslokal.html',
  '/seo/nedkylning-mat-livsmedel.html',
  '/seo/obligatorisk-information-oforpackad-mat.html',
  '/seo/obligatorisk-markning-livsmedel.html',
  '/seo/oforpackade-livsmedel-information.html',
  '/seo/partimarkning-livsmedel.html',
  '/seo/rengoring-livsmedelsverksamhet.html',
  '/seo/salja-mat-efter-bast-fore.html',
  '/seo/separera-raa-och-atfardiga-livsmedel.html',
  '/seo/skadedjur-livsmedelsverksamhet.html',
  '/seo/soprum-och-avfallsutrymme-livsmedel.html',
  '/seo/temperaturkontroll-livsmedel.html',
  '/seo/temperaturprocesser-livsmedel.html',
  '/seo/toalett-och-handfat-livsmedelsverksamhet.html',
  '/seo/transport-av-livsmedel.html',
  '/seo/underhall-livsmedelslokal.html',
  '/seo/upptining-livsmedel.html',
  '/seo/utbildning-livsmedelshygien-personal.html',
  '/seo/varmhallning-mat-temperatur.html',
  '/seo/varumottagning-livsmedel.html',
  '/seo/vatten-i-livsmedelsverksamhet.html',
  '/seo/ventilation-livsmedelsverksamhet.html',
  '/seo/vilseledande-livsmedelsinformation.html',
] as const;

const transitionalPaths = new Set([
  '/kunskapsbank',
  '/haccp-sma-livsmedelsforetag',
  '/faroanalys-livsmedel',
  '/kontrollplan-livsmedel',
  '/kritiska-gransvarden-livsmedel',
  '/avvikelser-korrigerande-atgarder-livsmedel',
  '/verifiering-haccp-livsmedel',
  '/dokumentation-egenkontroll-livsmedel',
  '/seo/personlig-hygien-livsmedel.html',
  '/seo/grundforutsattningar-livsmedel.html',
  '/seo/hantering-och-forvaring-livsmedel.html',
  '/seo/hygien-och-daglig-drift.html',
  '/seo/lokaler-och-utrustning-livsmedel.html',
  '/mall-kontrollplan-livsmedel',
  '/verktyg-faroanalys-livsmedel',
  '/egenkontroll-restaurang',
  '/egenkontroll-cafe',
  '/egenkontroll-kiosk-foodtruck',
  '/egenkontroll-catering',
  '/digital-egenkontroll-livsmedel',
  '/sparbarhet-livsmedel',
  '/verifiering-egenkontroll-livsmedel',
  '/spara-sparbarhetsuppgifter-livsmedel',
]);

function transitional(
  path: string,
  pageRole: KnowledgeSeoPageRole,
  topicClusterId: string,
  structuralParentPath: string | undefined,
): KnowledgeRouteGovernanceEntry {
  return {
    path,
    status: 'transitional',
    pageRole,
    topicClusterId,
    ...(structuralParentPath ? {
      structuralParentPath,
      plannedIncomingLinks: [structuralParentPath],
      plannedOutgoingLinks: [],
    } : {}),
  };
}

export const knowledgeRouteGovernance = [
  { path: '/', status: 'seo-only' },
  { path: '/integritetspolicy', status: 'seo-only' },
  { path: '/anvandarvillkor', status: 'seo-only' },
  transitional('/kunskapsbank', 'knowledge-base', 'knowledge-base', undefined),
  transitional('/haccp-sma-livsmedelsforetag', 'topic-hub', 'haccp-riskstyrning', '/kunskapsbank'),
  transitional('/faroanalys-livsmedel', 'fact-page', 'haccp-riskstyrning', '/haccp-sma-livsmedelsforetag'),
  transitional('/kontrollplan-livsmedel', 'fact-page', 'haccp-riskstyrning', '/haccp-sma-livsmedelsforetag'),
  transitional('/kritiska-gransvarden-livsmedel', 'fact-page', 'haccp-riskstyrning', '/haccp-sma-livsmedelsforetag'),
  transitional('/avvikelser-korrigerande-atgarder-livsmedel', 'fact-page', 'haccp-riskstyrning', '/haccp-sma-livsmedelsforetag'),
  transitional('/verifiering-haccp-livsmedel', 'fact-page', 'haccp-riskstyrning', '/haccp-sma-livsmedelsforetag'),
  transitional('/dokumentation-egenkontroll-livsmedel', 'fact-page', 'documentation', '/kunskapsbank'),
  transitional('/seo/personlig-hygien-livsmedel.html', 'fact-page', 'hygiene', '/kunskapsbank'),
  { path: '/seo/grundforutsattningar-livsmedel.html', status: 'full', pageRole: 'fact-page', topicClusterId: 'prerequisites', structuralParentPath: '/kunskapsbank', plannedIncomingLinks: ['/kunskapsbank'], plannedOutgoingLinks: [] },
  transitional('/seo/hantering-och-forvaring-livsmedel.html', 'fact-page', 'handling-storage', '/kunskapsbank'),
  transitional('/seo/hygien-och-daglig-drift.html', 'fact-page', 'hygiene', '/kunskapsbank'),
  { path: '/seo/lokaler-och-utrustning-livsmedel.html', status: 'full', pageRole: 'fact-page', topicClusterId: 'premises-equipment', structuralParentPath: '/seo/grundforutsattningar-livsmedel.html', plannedIncomingLinks: ['/seo/grundforutsattningar-livsmedel.html'], plannedOutgoingLinks: [] },
  transitional('/mall-kontrollplan-livsmedel', 'workflow-template-tool', 'haccp-riskstyrning', '/haccp-sma-livsmedelsforetag'),
  transitional('/verktyg-faroanalys-livsmedel', 'workflow-template-tool', 'haccp-riskstyrning', '/haccp-sma-livsmedelsforetag'),
  transitional('/egenkontroll-restaurang', 'business-page', 'business-guides', '/kunskapsbank'),
  transitional('/egenkontroll-cafe', 'business-page', 'business-guides', '/kunskapsbank'),
  transitional('/egenkontroll-kiosk-foodtruck', 'business-page', 'business-guides', '/kunskapsbank'),
  transitional('/egenkontroll-catering', 'business-page', 'business-guides', '/kunskapsbank'),
  transitional('/digital-egenkontroll-livsmedel', 'product-page', 'product', '/kunskapsbank'),
  transitional('/sparbarhet-livsmedel', 'fact-page', 'traceability', '/kunskapsbank'),
  transitional('/verifiering-egenkontroll-livsmedel', 'fact-page', 'haccp-riskstyrning', '/kunskapsbank'),
  transitional('/spara-sparbarhetsuppgifter-livsmedel', 'fact-page', 'traceability', '/kunskapsbank'),
  ...legacyInventoryPaths.map((path) => ({ path, status: 'legacy-inventory' as const, pageRole: 'fact-page' as const })),
] as const satisfies readonly KnowledgeRouteGovernanceEntry[];

export const knowledgeRouteGovernanceMigrationGuide = [
  'Behåll route, canonical, sitemap och resource-href oförändrade i deras befintliga register.',
  'Lägg först ett komplett artikel- och claimkontrakt för den befintliga routen.',
  'Byt därefter endast routens status från legacy-inventory eller transitional till full i denna baslinje.',
  'Nya indexerbara innehållsroutes får endast registreras som full; transitional och legacy-inventory är låsta historiska undantag.',
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
): string[] {
  const errors: string[] = [];
  const routesByPath = new Map(routes.map((route) => [route.path, route]));
  const indexablePaths = new Set(routes.filter((route) => route.robots === 'index, follow').map((route) => route.path));

  for (const path of duplicatePaths(entries)) errors.push(`Duplicerad governance-route: ${path}`);
  for (const entry of entries) {
    const route = routesByPath.get(entry.path);
    if (!route) {
      errors.push(`Governance registrerar okänd route: ${entry.path}`);
      continue;
    }
    if (!indexablePaths.has(entry.path)) errors.push(`Governance får inte registrera noindex-route: ${entry.path}`);
    if (!statuses.has(entry.status)) errors.push(`Governance-route har okänd status: ${entry.path}`);
    if (entry.status === 'transitional' && !transitionalPaths.has(entry.path)) errors.push(`Ny transitional-route är inte tillåten: ${entry.path}`);
    if (entry.status === 'legacy-inventory' && !legacyInventoryPaths.includes(entry.path as typeof legacyInventoryPaths[number])) errors.push(`Ny legacy-inventory-route är inte tillåten: ${entry.path}`);

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
