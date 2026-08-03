import type { GrandfatheredGovernanceEntry } from './grandfatheredGovernanceBaseline';
import { validateKnowledgeRouteGovernance, type KnowledgeRouteGovernanceEntry } from './knowledgeRouteGovernance';
import {
  defaultKnowledgeSourceContractRegistries,
  validateKnowledgeArticleContracts,
  type KnowledgeArticleContractInput,
} from './knowledgeSourceContract';
import type { WebRoute } from './routes';

export type GovernanceFinding = {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  routePath?: string;
  articleId?: string;
  surfaceId?: string;
  claimId?: string;
};

export type PublicationGateIncomingLinkRequirement = {
  targetPath: string;
  sourcePaths: readonly string[];
  articleId: string;
};

export type PublicationGateInput = {
  routes: readonly WebRoute[];
  governance: readonly KnowledgeRouteGovernanceEntry[];
  articles: readonly KnowledgeArticleContractInput[];
  grandfatheredBaseline: readonly GrandfatheredGovernanceEntry[];
  findings: readonly GovernanceFinding[];
};

function sameStrings(left: readonly string[] | undefined, right: readonly string[] | undefined): boolean {
  return JSON.stringify([...(left ?? [])].sort()) === JSON.stringify([...(right ?? [])].sort());
}

function isV2Article(article: KnowledgeArticleContractInput): boolean {
  return article.governanceVersion === 2;
}

function isV2Claim(claim: NonNullable<KnowledgeArticleContractInput['blocks'][number]['claims']>[number]) {
  return 'surfaceId' in claim;
}

function findingLocation(finding: GovernanceFinding): string {
  return [finding.routePath, finding.articleId, finding.surfaceId, finding.claimId].filter(Boolean).join(' -> ') || finding.id;
}

export function publicationIncomingLinkRequirements(
  input: PublicationGateInput,
): readonly PublicationGateIncomingLinkRequirement[] {
  return input.governance
    .filter((entry) => entry.status === 'full' && entry.pageRole !== undefined && (entry.plannedIncomingLinks?.length ?? 0) > 0)
    .flatMap((entry) => {
      const article = input.articles.find((candidate) => candidate.canonicalPath === entry.path && isV2Article(candidate));
      return article ? [{ targetPath: entry.path, sourcePaths: entry.plannedIncomingLinks ?? [], articleId: article.id }] : [];
    });
}

export function validatePublicationGate(input: PublicationGateInput): string[] {
  const errors = [
    ...validateKnowledgeRouteGovernance(input.routes, input.governance, input.grandfatheredBaseline),
    ...validateKnowledgeArticleContracts(input.articles, {
      ...defaultKnowledgeSourceContractRegistries,
      routeRegistry: input.routes,
    }),
  ];
  const routesByPath = new Map(input.routes.map((route) => [route.path, route]));
  const articlesByCanonicalPath = new Map<string, KnowledgeArticleContractInput[]>();
  const baselineByPath = new Map(input.grandfatheredBaseline.map((entry) => [entry.path, entry]));

  for (const article of input.articles) {
    const articles = articlesByCanonicalPath.get(article.canonicalPath) ?? [];
    articles.push(article);
    articlesByCanonicalPath.set(article.canonicalPath, articles);
  }

  for (const entry of input.governance) {
    const route = routesByPath.get(entry.path);
    if (!route || route.robots !== 'index, follow') continue;
    const baseline = baselineByPath.get(entry.path);

    if (entry.status !== 'full') {
      if (!baseline || JSON.stringify(baseline) !== JSON.stringify(entry)) {
        errors.push(`Publication gate: grandfathered route avviker från baslinjen: ${entry.path}`);
      }
      continue;
    }

    if (baseline) errors.push(`Publication gate: full route får inte finnas kvar i grandfathered-baslinjen: ${entry.path}`);
    const articles = articlesByCanonicalPath.get(entry.path) ?? [];
    if (articles.length !== 1 || !isV2Article(articles[0])) {
      errors.push(`Publication gate: full route saknar exakt ett governance v2-kontrakt: ${entry.path}`);
      continue;
    }

    const article = articles[0];
    const seo = article.seo;
    if (route.canonicalPath !== entry.path || article.canonicalPath !== entry.path) {
      errors.push(`Publication gate: route/canonical avviker för full route: ${entry.path} -> ${article.id}`);
    }
    if ((seo?.indexingDecision === 'index') !== (route.robots === 'index, follow')) {
      errors.push(`Publication gate: indexeringsbeslut avviker från route-registret: ${entry.path} -> ${article.id}`);
    }
    if ((seo?.sitemapDecision === 'include') !== route.inSitemap) {
      errors.push(`Publication gate: sitemapbeslut avviker från route-registret: ${entry.path} -> ${article.id}`);
    }
    if (!entry.structuralParentPath || !routesByPath.has(entry.structuralParentPath) || !seo?.plannedIncomingLinks.includes(entry.structuralParentPath)) {
      errors.push(`Publication gate: full route saknar faktisk strukturell förälder: ${entry.path} -> ${article.id}`);
    }
    if (!sameStrings(entry.plannedIncomingLinks, seo?.plannedIncomingLinks) || (seo?.plannedIncomingLinks.length ?? 0) === 0) {
      errors.push(`Publication gate: full route saknar matchande internlänkningsplan: ${entry.path} -> ${article.id}`);
    }

    const claims = article.blocks.flatMap((block) => block.claims ?? []).filter(isV2Claim);
    for (const surface of article.surfaces?.filter((surface) => surface.material) ?? []) {
      if (!claims.some((claim) => claim.surfaceId === surface.id)) {
        errors.push(`Publication gate: materiell yta saknar claim: ${entry.path} -> ${article.id} -> ${surface.id}`);
      }
    }
    for (const claim of claims) {
      if ((claim.risk === 'yellow' || claim.risk === 'red') && claim.reviewStatus !== 'approved') {
        errors.push(`Publication gate: riskclaim saknar godkänd review: ${entry.path} -> ${article.id} -> ${claim.surfaceId} -> ${claim.id}`);
      }
    }
  }

  for (const route of input.routes.filter((candidate) => candidate.robots === 'index, follow')) {
    if (baselineByPath.has(route.path)) continue;
    const entry = input.governance.find((candidate) => candidate.path === route.path);
    if (!entry || entry.status !== 'full') {
      errors.push(`Publication gate: indexerbar route utanför grandfathered-baslinjen måste vara full: ${route.path}`);
    }
  }

  for (const finding of input.findings) {
    if (finding.status === 'open' && (finding.severity === 'high' || finding.severity === 'critical')) {
      errors.push(`Publication gate: öppet ${finding.severity}-fynd blockerar: ${finding.id} -> ${findingLocation(finding)}`);
    }
  }

  return errors;
}
