import assert from 'node:assert/strict';
import test from 'node:test';
import { grandfatheredGovernanceBaseline, validateGrandfatheredGovernanceBaseline } from '../src/config/grandfatheredGovernanceBaseline';
import { governanceFindings } from '../src/config/governanceFindings';
import { knowledgeRouteGovernance } from '../src/config/knowledgeRouteGovernance';
import { migratedKnowledgeArticleDefinitions } from '../src/config/migratedKnowledgeArticles';
import { publicationIncomingLinkRequirements, validatePublicationGate, type PublicationGateInput } from '../src/config/publicationGate';
import { webRouteRegistry } from '../src/config/routes';

function input(): PublicationGateInput {
  return {
    routes: webRouteRegistry,
    governance: knowledgeRouteGovernance,
    articles: migratedKnowledgeArticleDefinitions,
    grandfatheredBaseline: grandfatheredGovernanceBaseline,
    findings: governanceFindings,
  };
}

test('R02 och R08 passerar som fulla referenser medan #392 förblir exakt grandfathered transitional', () => {
  assert.deepEqual(validatePublicationGate(input()), []);
  assert.deepEqual(publicationIncomingLinkRequirements(input()), [
    { targetPath: '/seo/grundforutsattningar-livsmedel.html', sourcePaths: ['/kunskapsbank'], articleId: 'seo-grundforutsattningar-livsmedel' },
    { targetPath: '/seo/lokaler-och-utrustning-livsmedel.html', sourcePaths: ['/seo/grundforutsattningar-livsmedel.html'], articleId: 'seo-lokaler-och-utrustning-livsmedel' },
  ]);
  assert.deepEqual(grandfatheredGovernanceBaseline.find((entry) => entry.path === '/faroanalys-livsmedel'), {
    path: '/faroanalys-livsmedel', status: 'transitional', pageRole: 'fact-page', topicClusterId: 'haccp-riskstyrning', structuralParentPath: '/haccp-sma-livsmedelsforetag', plannedIncomingLinks: ['/haccp-sma-livsmedelsforetag'], plannedOutgoingLinks: [],
  });
});

test('blockerar förlorad materiell claimtäckning och ej godkänd yellow-review', () => {
  const articles = structuredClone(migratedKnowledgeArticleDefinitions);
  const r02 = articles.find((article) => article.id === 'seo-grundforutsattningar-livsmedel')!;
  r02.surfaces = [...r02.surfaces!, { id: 'r02-ny-materiell-yta', kind: 'block', material: true, blockId: 'varfor-grundforutsattningar' }];
  const r08 = articles.find((article) => article.id === 'seo-lokaler-och-utrustning-livsmedel')!;
  const claim = r08.blocks.flatMap((block) => block.claims ?? []).find((candidate) => 'surfaceId' in candidate)! as { reviewStatus: string };
  claim.reviewStatus = 'pending';
  const errors = validatePublicationGate({ ...input(), articles });
  assert.ok(errors.some((error) => error.includes('materiell yta saknar claim: /seo/grundforutsattningar-livsmedel.html -> seo-grundforutsattningar-livsmedel -> r02-ny-materiell-yta')));
  assert.ok(errors.some((error) => error.includes('riskclaim saknar godkänd review: /seo/lokaler-och-utrustning-livsmedel.html')));
});

test('blockerar red utan obligatorisk sakkunnig samt öppna high/critical-fynd', () => {
  const articles = structuredClone(migratedKnowledgeArticleDefinitions);
  const r02 = articles.find((article) => article.id === 'seo-grundforutsattningar-livsmedel')!;
  r02.risk = 'red';
  r02.review = { ...r02.review!, requiresExpertReview: false };
  const firstClaim = r02.blocks.flatMap((block) => block.claims ?? []).find((claim) => 'risk' in claim)! as { risk: string };
  firstClaim.risk = 'red';
  const errors = validatePublicationGate({
    ...input(),
    articles,
    findings: [{ id: 'high-open', severity: 'high', status: 'open', articleId: r02.id }, { id: 'critical-open', severity: 'critical', status: 'open', routePath: r02.canonicalPath }],
  });
  assert.ok(errors.some((error) => error.includes('Röd artikel saknar obligatorisk sakkunnig granskare: seo-grundforutsattningar-livsmedel')));
  assert.ok(errors.some((error) => error.includes('öppet high-fynd blockerar: high-open')));
  assert.ok(errors.some((error) => error.includes('öppet critical-fynd blockerar: critical-open')));
});

test('blockerar baselineökning och en indexerbar route utanför grandfathered-baslinjen som inte är full', () => {
  const added = { path: '/ny-grandfathered', status: 'transitional' as const, pageRole: 'fact-page' as const };
  assert.ok(validateGrandfatheredGovernanceBaseline(grandfatheredGovernanceBaseline, [...grandfatheredGovernanceBaseline, added]).some((error) => error.includes('får inte växa: /ny-grandfathered')));
  const governance = knowledgeRouteGovernance.map((entry) => entry.path === '/seo/grundforutsattningar-livsmedel.html' ? { ...entry, status: 'transitional' as const } : entry);
  const errors = validatePublicationGate({ ...input(), governance });
  assert.ok(errors.some((error) => error.includes('indexerbar route utanför grandfathered-baslinjen måste vara full: /seo/grundforutsattningar-livsmedel.html')));
});

test('blockerar full route utan exakt ett v2-kontrakt', () => {
  const articles = migratedKnowledgeArticleDefinitions.filter((article) => article.id !== 'seo-grundforutsattningar-livsmedel');
  const errors = validatePublicationGate({ ...input(), articles });
  assert.ok(errors.some((error) => error.includes('full route saknar exakt ett governance v2-kontrakt: /seo/grundforutsattningar-livsmedel.html')));
});
