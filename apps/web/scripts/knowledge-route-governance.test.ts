import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  countKnowledgeRouteGovernanceStatuses,
  knowledgeRouteGovernance,
  knowledgeRouteGovernanceMigrationGuide,
  validateKnowledgeRouteGovernance,
} from '../src/config/knowledgeRouteGovernance';
import { webRedirects, webRouteRegistry } from '../src/config/routes';

test('governance-baslinjen täcker varje indexerbar route med låsta historiska statusar', () => {
  assert.deepEqual(validateKnowledgeRouteGovernance(webRouteRegistry), []);
  assert.deepEqual(countKnowledgeRouteGovernanceStatuses(), {
    full: 2,
    transitional: 21,
    'legacy-inventory': 50,
    'seo-only': 3,
  });
  assert.equal(knowledgeRouteGovernance.length, 76);
  assert.equal(knowledgeRouteGovernance.some((entry) => entry.path === '/sok'), false);
  assert.equal(webRedirects.some((redirect) => knowledgeRouteGovernance.some((entry) => entry.path === redirect.source)), false);
});

test('R02 och R08 är fullstyrda utan ändrade route-, canonical- eller sitemapdata', () => {
  const r02 = knowledgeRouteGovernance.find((entry) => entry.path === '/seo/grundforutsattningar-livsmedel.html');
  const r08 = knowledgeRouteGovernance.find((entry) => entry.path === '/seo/lokaler-och-utrustning-livsmedel.html');
  assert.deepEqual(r02, {
    path: '/seo/grundforutsattningar-livsmedel.html', status: 'full', pageRole: 'fact-page', topicClusterId: 'prerequisites', structuralParentPath: '/kunskapsbank', plannedIncomingLinks: ['/kunskapsbank'], plannedOutgoingLinks: [],
  });
  assert.deepEqual(r08, {
    path: '/seo/lokaler-och-utrustning-livsmedel.html', status: 'full', pageRole: 'fact-page', topicClusterId: 'premises-equipment', structuralParentPath: '/seo/grundforutsattningar-livsmedel.html', plannedIncomingLinks: ['/seo/grundforutsattningar-livsmedel.html'], plannedOutgoingLinks: [],
  });
  for (const path of [r02?.path, r08?.path]) {
    const route = webRouteRegistry.find((candidate) => candidate.path === path);
    assert.equal(route?.canonicalPath, path);
    assert.equal(route?.inSitemap, true);
  }
});

test('faroanalys är transitional utan ändrad route-, canonical- eller sitemapdata', () => {
  const route = webRouteRegistry.find((candidate) => candidate.path === '/faroanalys-livsmedel');
  const governance = knowledgeRouteGovernance.find((entry) => entry.path === '/faroanalys-livsmedel');
  assert.equal(route?.canonicalPath, '/faroanalys-livsmedel');
  assert.equal(route?.inSitemap, true);
  assert.deepEqual(governance, {
    path: '/faroanalys-livsmedel',
    status: 'transitional',
    pageRole: 'fact-page',
    topicClusterId: 'haccp-riskstyrning',
    structuralParentPath: '/haccp-sma-livsmedelsforetag',
    plannedIncomingLinks: ['/haccp-sma-livsmedelsforetag'],
    plannedOutgoingLinks: [],
  });
});

test('nya indexerbara routes saknar status tills de explicit är fullständigt styrda', () => {
  const newRoute = { ...webRouteRegistry[0], path: '/ny-indexerbar-route', canonicalPath: '/ny-indexerbar-route' };
  const errors = validateKnowledgeRouteGovernance([...webRouteRegistry, newRoute]);
  assert.ok(errors.some((error) => error.includes('Indexerbar route saknar governance-status: /ny-indexerbar-route')));
});

test('nya transitional- och legacy-undantag blockeras även om routen är registrerad', () => {
  const newRoute = { ...webRouteRegistry[0], path: '/ny-indexerbar-route', canonicalPath: '/ny-indexerbar-route' };
  const transitional = [...knowledgeRouteGovernance, { path: newRoute.path, status: 'transitional' as const, pageRole: 'fact-page' as const }];
  const legacy = [...knowledgeRouteGovernance, { path: newRoute.path, status: 'legacy-inventory' as const, pageRole: 'fact-page' as const }];
  assert.ok(validateKnowledgeRouteGovernance([...webRouteRegistry, newRoute], transitional).some((error) => error.includes('Ny transitional-route är inte tillåten')));
  assert.ok(validateKnowledgeRouteGovernance([...webRouteRegistry, newRoute], legacy).some((error) => error.includes('Ny legacy-inventory-route är inte tillåten')));
});

test('en ny indexerbar route kan endast anslutas med full governance-status', () => {
  const newRoute = { ...webRouteRegistry[0], path: '/ny-full-route', canonicalPath: '/ny-full-route' };
  const full = [...knowledgeRouteGovernance, { path: newRoute.path, status: 'full' as const, pageRole: 'fact-page' as const }];
  assert.deepEqual(validateKnowledgeRouteGovernance([...webRouteRegistry, newRoute], full), []);
});

test('dubbletter, okända routes och noindex-routes blockeras', () => {
  const invalid = [
    ...knowledgeRouteGovernance,
    knowledgeRouteGovernance[0],
    { path: '/okand', status: 'full' as const, pageRole: 'fact-page' as const },
    { path: '/sok', status: 'full' as const, pageRole: 'fact-page' as const },
  ];
  const errors = validateKnowledgeRouteGovernance(webRouteRegistry, invalid);
  assert.ok(errors.some((error) => error.includes('Duplicerad governance-route: /')));
  assert.ok(errors.some((error) => error.includes('Governance registrerar okänd route: /okand')));
  assert.ok(errors.some((error) => error.includes('Governance får inte registrera noindex-route: /sok')));
});

test('governance duplicerar inte canonical-, sitemap- eller resource-sanning', () => {
  const source = readFileSync(new URL('../src/config/knowledgeRouteGovernance.ts', import.meta.url), 'utf8');
  const baseline = JSON.parse(readFileSync(new URL('../../../scripts/contracts/public-platform-baseline.json', import.meta.url), 'utf8'));
  assert.equal(baseline.publicRoutes.length, 79);
  assert.equal(baseline.canonicalPaths.length, 75);
  assert.equal(baseline.sitemapPaths.length, 67);
  assert.equal(baseline.resourceHrefs.length, 69);
  assert.doesNotMatch(source, /publicResources/);
  assert.doesNotMatch(source, /canonicalPath|inSitemap|resourceHref/);
  assert.match(knowledgeRouteGovernanceMigrationGuide.join(' '), /route, canonical, sitemap och resource-href/);
});
