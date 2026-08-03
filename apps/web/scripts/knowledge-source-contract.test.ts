import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildKnowledgeSourceImpactIndex,
  defaultKnowledgeSourceContractRegistries,
  getKnowledgeSourceIdsForBlock,
  getKnowledgeSourceImpact,
  knowledgeDisclaimers,
  knowledgeLanguagePolicies,
  knowledgeSources,
  validateKnowledgeArticleContracts,
  type KnowledgeArticleContractInput,
  type KnowledgeSourceContractRegistries,
  type KnowledgeSourceRecord,
} from '../src/config/knowledgeSourceContract';
import {
  migratedKnowledgeArticleDefinitions,
  migratedKnowledgeArticles,
  migratedKnowledgeArticleSourceImpactIndex,
} from '../src/config/migratedKnowledgeArticles';
import { webMigratedKnowledgeArticleRoutes, webRouteRegistry } from '../src/config/routes';

const r10 = migratedKnowledgeArticleDefinitions[0];
const migratedArticleRegistries: KnowledgeSourceContractRegistries = {
  ...defaultKnowledgeSourceContractRegistries,
  routeRegistry: webRouteRegistry,
};

test('migrerade artiklar uppfyller källspårbarhetskontraktet med injicerat route-register', () => {
  assert.deepEqual(validateKnowledgeArticleContracts(migratedKnowledgeArticleDefinitions, migratedArticleRegistries), []);
  assert.equal(r10.id, 'seo-personlig-hygien-livsmedel');
  assert.equal(r10.canonicalPath, '/seo/personlig-hygien-livsmedel.html');
  assert.deepEqual(r10.sourceIds, ['kontrollwiki:345']);
  assert.deepEqual(r10.blocks.map((block) => block.id), [
    'skillnaden-mellan-krav-och-exempel',
    'krav-pa-personlig-hygien',
    'verksamhetens-rutiner',
    'exempel-pa-kontrollfragor',
  ]);
});

test('R10:s källprojection bevarar befintlig metadata och URL', () => {
  const article = migratedKnowledgeArticles[0];
  assert.equal(article.title, 'Personlig hygien i livsmedelsverksamhet | Min Egenkontroll');
  assert.equal(article.description.startsWith('Vad personlig hygien'), true);
  assert.equal(article.source.url, 'https://kontrollwiki.livsmedelsverket.se/artikel/345/personlig-hygien');
  assert.equal(article.source.type, 'myndighetsvägledning');
  assert.equal(article.source.factCheckedAt, '2026-07-18');
  assert.deepEqual(article.source.relevantSections, ['Artikelhuvud', 'Tips på kontroll']);
  assert.equal(article.source.legalReference, 'Förordning (EG) nr 852/2004, bilaga II kapitel VIII');
  assert.equal(article.source.limitation, knowledgeDisclaimers['disclaimer:kontrollwiki-guidance:v1'].text);
});

test('source-impact-index listar artikel och materiella block per källa', () => {
  const impact = getKnowledgeSourceImpact(migratedKnowledgeArticleSourceImpactIndex, 'kontrollwiki:345');
  assert.deepEqual(impact, [{
    articleId: 'seo-hygien-och-daglig-drift',
    canonicalPath: '/seo/hygien-och-daglig-drift.html',
    blockIds: ['personlig-hygien-i-driften'],
    claimIds: [],
  }, {
    articleId: 'seo-personlig-hygien-livsmedel',
    canonicalPath: '/seo/personlig-hygien-livsmedel.html',
    blockIds: ['exempel-pa-kontrollfragor', 'krav-pa-personlig-hygien', 'verksamhetens-rutiner'],
    claimIds: [],
  }]);
  assert.deepEqual(getKnowledgeSourceIdsForBlock(r10, 'exempel-pa-kontrollfragor'), ['kontrollwiki:345']);
  assert.deepEqual(getKnowledgeSourceIdsForBlock(r10, 'skillnaden-mellan-krav-och-exempel'), []);
});

test('R02, R03, R04 och R08 har rätt källmängd och moderna breadcrumbs', () => {
  const articles = migratedKnowledgeArticles.filter((article) => article.id !== r10.id);
  assert.deepEqual(articles.map((article) => article.canonicalPath), [
    '/seo/grundforutsattningar-livsmedel.html',
    '/seo/hantering-och-forvaring-livsmedel.html',
    '/seo/hygien-och-daglig-drift.html',
    '/seo/lokaler-och-utrustning-livsmedel.html',
  ]);
  assert.deepEqual(articles.map((article) => article.sourceIds), [
    ['kontrollwiki:246', 'kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'],
    ['kontrollwiki:342'],
    ['kontrollwiki:345', 'kontrollwiki:346', 'kontrollwiki:348', 'kontrollwiki:349'],
    ['kontrollwiki:343', 'kontrollwiki:1045', 'kontrollwiki:1046'],
  ]);
  for (const article of articles) assert.equal(article.breadcrumb[0]?.href, '/kunskapsbank');
  assert.equal(migratedKnowledgeArticles.find((article) => article.id === 'seo-grundforutsattningar-livsmedel')?.sources.length, 6);
  assert.equal(migratedKnowledgeArticles.find((article) => article.id === 'seo-hygien-och-daglig-drift')?.sources.length, 4);
});

test('R02 och R03 skiljer myndighetsvägledning från MEK-rekommendationer', () => {
  const r02 = migratedKnowledgeArticleDefinitions.find((article) => article.id === 'seo-grundforutsattningar-livsmedel');
  const r03 = migratedKnowledgeArticleDefinitions.find((article) => article.id === 'seo-hantering-och-forvaring-livsmedel');
  assert.ok(r02);
  assert.ok(r03);

  const r02Guidance = r02.blocks.find((block) => block.id === 'varfor-grundforutsattningar');
  const r02Recommendation = r02.blocks.find((block) => block.id === 'rekommenderade-grundforutsattningar-rutiner');
  const r03Guidance = r03.blocks.find((block) => block.id === 'varfor-flera-rutiner-behovs');
  const r03Recommendation = r03.blocks.find((block) => block.id === 'rekommenderad-struktur-for-kontroller');
  const classificationOf = (block: typeof r02Guidance) => block?.type === 'classified' ? block.classification : undefined;
  assert.equal(classificationOf(r02Guidance), 'guidance');
  assert.equal(classificationOf(r03Guidance), 'guidance');
  assert.equal(classificationOf(r02Recommendation), 'recommendation');
  assert.equal(classificationOf(r03Recommendation), 'recommendation');
  assert.deepEqual(r02Recommendation?.sourceIds, ['kontrollwiki:246']);
  assert.deepEqual(r03Recommendation?.sourceIds, []);
  assert.equal(r02Recommendation?.material, true);
  assert.equal(r03Recommendation?.material, false);
  assert.match(r02Recommendation?.paragraphs.join(' ') ?? '', /Min Egenkontroll rekommenderar/);
  assert.match(r03Recommendation?.paragraphs.join(' ') ?? '', /Min Egenkontroll rekommenderar/);
});

test('R02 förklarar grundförutsättningar med källspårad myndighetsvägledning', () => {
  const r02 = migratedKnowledgeArticleDefinitions.find((article) => article.id === 'seo-grundforutsattningar-livsmedel');
  if (!r02) throw new Error('R02 saknas.');
  const context = r02.blocks.find((block) => block.id === 'varfor-grundforutsattningar');
  const expectedSourceIds = ['kontrollwiki:246', 'kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'];
  assert.equal(context?.type === 'classified' ? context.classification : undefined, 'guidance');
  assert.equal(context?.material, true);
  assert.deepEqual(context?.sourceIds, expectedSourceIds);
  assert.equal(context?.title, 'Grundförutsättningar inom livsmedelshygien');
  assert.deepEqual(context?.paragraphs, [
    'Kontrollwiki beskriver grundförutsättningar som de åtgärder och villkor som behövs för att uppfylla kraven på livsmedelssäkerhet. De ger underlag för ett effektivt genomförande av HACCP.',
    'I Kontrollwikis indelning omfattar grundförutsättningarna områden som verksamhetens struktur, drift, hygien, lagring och transport. På den här sidan behandlas bland annat avfall, lokaler och utrustning, transport, utbildning och vattenförsörjning.',
  ]);
  assert.doesNotMatch(context?.paragraphs.join(' ') ?? '', /rutiner och kontroller används|minskar riskerna|kontrollpunkt/i);
  for (const sourceId of expectedSourceIds) {
    assert.ok(getKnowledgeSourceImpact(migratedKnowledgeArticleSourceImpactIndex, sourceId).some((entry) =>
      entry.articleId === r02.id && entry.blockIds.includes('varfor-grundforutsattningar')),
    );
  }
});

test('R02 låser korrigerade Kontrollwiki-versioner och publicerade avsnitt', () => {
  const expectedSources = {
    'kontrollwiki:341': { version: '2024-01-26', sections: [{ id: 'hygienisk-hantering', label: 'Hygienisk hantering' }, { id: 'krav-pa-avfallsutrymmen', label: 'Krav på avfallsutrymmen' }] },
    'kontrollwiki:350': { version: '2026-03-06', sections: [{ id: 'allmant-om-livsmedel-under-transport', label: 'Allmänt om livsmedel under transport' }] },
    'kontrollwiki:351': { version: '2026-02-24', sections: [{ id: 'utbildning-och-kunskap', label: 'Utbildning och kunskap' }] },
    'kontrollwiki:352': { version: '2025-09-30', sections: [{ id: 'krav-pa-livsmedelsforetag-och-vatten', label: 'Krav på livsmedelsföretag och vatten' }, { id: 'vad-galler-for-is', label: 'Vad gäller för is?' }] },
  } as const;
  for (const [sourceId, expected] of Object.entries(expectedSources)) {
    const source = knowledgeSources[sourceId as keyof typeof knowledgeSources] as KnowledgeSourceRecord;
    assert.equal(source.latestVersion, expected.version);
    assert.deepEqual(source.relevantSections, expected.sections.map((section) => section.label));
    assert.deepEqual(source.sections, expected.sections);
  }

  const r02 = migratedKnowledgeArticleDefinitions.find((article) => article.id === 'seo-grundforutsattningar-livsmedel');
  if (!r02) throw new Error('R02 saknas.');
  const claims = r02.blocks.flatMap((block) => block.claims ?? []);
  for (const claim of claims) {
    if (!('sourceReferences' in claim)) continue;
    for (const reference of claim.sourceReferences) {
      const expected = expectedSources[reference.sourceId as keyof typeof expectedSources];
      if (!expected) continue;
      assert.equal(reference.approvedSourceVersion, expected.version);
      assert.ok(expected.sections.some((section) => section.id === reference.sectionId));
    }
  }
});

test('recommendation-block använder egna semantiska tokens i light och dark', () => {
  const css = readFileSync(new URL('../src/components/FactPage.css', import.meta.url), 'utf8');
  assert.match(css, /\.fact-page__content-block--recommendation[^}]*var\(--ds-highlight-border\)[^}]*var\(--ds-highlight-surface\)/);
});

test('flerkällesdetaljer använder native details med tokenbaserat fokus och indikator', () => {
  const component = readFileSync(new URL('../src/components/FactPage.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/components/FactPage.css', import.meta.url), 'utf8');
  assert.match(component, /<details className="fact-page__source-details">/);
  assert.match(component, /<summary><span>Visa källdetaljer<\/span><span aria-hidden="true" className="fact-page__source-details-indicator" \/><\/summary>/);
  assert.doesNotMatch(component, /<details className="fact-page__source-details" open/);
  assert.match(css, /\.fact-page__source-details summary:focus-visible[^}]*var\(--ds-focus\)/);
  assert.match(css, /\.fact-page__source-details\[open\] \.fact-page__source-details-indicator::before/);
});

test('Article JSON-LD citation följer alla registrerade artikelkällor', () => {
  const r02 = webMigratedKnowledgeArticleRoutes.find((route) => route.path === '/seo/grundforutsattningar-livsmedel.html');
  const r04 = webMigratedKnowledgeArticleRoutes.find((route) => route.path === '/seo/hygien-och-daglig-drift.html');
  const r10 = webMigratedKnowledgeArticleRoutes.find((route) => route.path === '/seo/personlig-hygien-livsmedel.html');
  assert.deepEqual(r02?.structuredData?.citation, [
    'https://kontrollwiki.livsmedelsverket.se/artikel/246/j-grundforutsattningar-hygien',
    'https://kontrollwiki.livsmedelsverket.se/artikel/341/avfall',
    'https://kontrollwiki.livsmedelsverket.se/artikel/343/lokaler-och-utrustning',
    'https://kontrollwiki.livsmedelsverket.se/artikel/350/transport',
    'https://kontrollwiki.livsmedelsverket.se/artikel/351/utbildning',
    'https://kontrollwiki.livsmedelsverket.se/artikel/352/vattenforsorjning',
  ]);
  assert.deepEqual(r04?.structuredData?.citation, [
    'https://kontrollwiki.livsmedelsverket.se/artikel/345/personlig-hygien',
    'https://kontrollwiki.livsmedelsverket.se/artikel/346/rengoring',
    'https://kontrollwiki.livsmedelsverket.se/artikel/348/skadedjursbekampning',
    'https://kontrollwiki.livsmedelsverket.se/artikel/349/temperatur',
  ]);
  assert.equal(r10?.structuredData?.citation, 'https://kontrollwiki.livsmedelsverket.se/artikel/345/personlig-hygien');
});

test('källmetadata, språkpolicy och AI-tolkning är separata kontrakt', () => {
  assert.equal('rules' in knowledgeSources['kontrollwiki:345'], false);
  assert.equal(knowledgeLanguagePolicies['language-policy:source-classification:v1'].version, 1);
  assert.equal(r10.aiInterpretation, 'none');
});

test('stöder flera källor och claim-nivåns source-impact', () => {
  const secondSource: KnowledgeSourceRecord = {
    id: 'test:second-source',
    label: 'Testkälla',
    url: 'https://example.com/source',
    type: 'annan',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Test'],
  };
  const registries: KnowledgeSourceContractRegistries = {
    ...defaultKnowledgeSourceContractRegistries,
    sources: { ...knowledgeSources, [secondSource.id]: secondSource },
  };
  const article: KnowledgeArticleContractInput = {
    ...r10,
    id: 'test-article',
    canonicalPath: '/seo/test-article.html',
    sourceIds: ['kontrollwiki:345', secondSource.id] as KnowledgeArticleContractInput['sourceIds'],
    blocks: [{
      id: 'mixed-block',
      material: true,
      sourceIds: ['kontrollwiki:345'] as KnowledgeArticleContractInput['sourceIds'],
      claims: [{ id: 'mixed-claim', text: 'Testpåstående', classification: 'uncertainty', sourceIds: [secondSource.id] as KnowledgeArticleContractInput['sourceIds'] }],
    }],
  };
  assert.deepEqual(validateKnowledgeArticleContracts([article], registries), []);
  const index = buildKnowledgeSourceImpactIndex([article]);
  assert.deepEqual(index['test:second-source'], [{
    articleId: 'test-article',
    canonicalPath: '/seo/test-article.html',
    blockIds: ['mixed-block'],
    claimIds: ['mixed-claim'],
  }]);
});

test('stoppar duplicerade artikel- och block-ID:n', () => {
  const duplicateArticle = { ...r10, id: r10.id };
  const duplicateBlockArticle = { ...r10, blocks: [r10.blocks[0], r10.blocks[0]] };
  assert.ok(validateKnowledgeArticleContracts([r10, duplicateArticle]).some((error) => error.includes('Duplicerat artikel-ID')));
  assert.ok(validateKnowledgeArticleContracts([duplicateBlockArticle]).some((error) => error.includes('Duplicerat block-ID')));
});

test('stoppar okända källor, policies och friskrivningar', () => {
  const invalid = {
    ...r10,
    sourceIds: ['unknown:source'],
    languagePolicyIds: ['unknown:policy'],
    disclaimerIds: ['unknown:disclaimer'],
  } as unknown as KnowledgeArticleContractInput;
  const errors = validateKnowledgeArticleContracts([invalid]);
  assert.ok(errors.some((error) => error.includes('okänd källa')));
  assert.ok(errors.some((error) => error.includes('okänd språkpolicy')));
  assert.ok(errors.some((error) => error.includes('okänd friskrivning')));
});

test('stoppar materiella block och claims utan källkoppling', () => {
  const invalid = {
    ...r10,
    blocks: [{
      ...r10.blocks[1],
      sourceIds: [],
      claims: [{ id: 'unlinked-claim', text: 'Påstående', classification: 'requirement', sourceIds: [] }],
    }],
  } as unknown as KnowledgeArticleContractInput;
  const errors = validateKnowledgeArticleContracts([invalid]);
  assert.ok(errors.some((error) => error.includes('Materiellt block saknar källkoppling')));
  assert.ok(errors.some((error) => error.includes('Claim saknar källkoppling')));
});

test('stoppar källor utan stabilt ID, exakt URL eller verifieringsmetadata', () => {
  const invalidSource = {
    ...knowledgeSources,
    invalid: { ...knowledgeSources['kontrollwiki:345'], id: 'different', url: 'not-a-url', factCheckedAt: '', accessedAt: '' },
  };
  const errors = validateKnowledgeArticleContracts(
    migratedKnowledgeArticleDefinitions,
    { ...defaultKnowledgeSourceContractRegistries, sources: invalidSource },
  );
  assert.ok(errors.some((error) => error.includes('Källregistrets nyckel avviker')));
  assert.ok(errors.some((error) => error.includes('exakt URL')));
  assert.ok(errors.some((error) => error.includes('faktakontrolldatum')));
  assert.ok(errors.some((error) => error.includes('åtkomstdatum')));
});

const v2Scope = {
  audience: 'Små livsmedelsföretag',
  applicability: 'Verksamheter efter primärproduktionen',
  conditions: ['Bedömning görs utifrån verksamhetens risker.'],
  exceptions: ['Lokala myndighetsbeslut kan påverka tillämpningen.'],
} as const;

const v2LegalSource: KnowledgeSourceRecord = {
  id: 'test:law',
  label: 'Testad rättsakt',
  url: 'https://example.com/law',
  type: 'rättsakt',
  factCheckedAt: '2026-08-01',
  accessedAt: '2026-08-01',
  relevantSections: ['Artikel 1'],
  latestVersion: '2026-08-01',
  sections: [{ id: 'article-1', label: 'Artikel 1' }],
};

const v2GuidanceSource: KnowledgeSourceRecord = {
  id: 'test:guidance',
  label: 'Testad myndighetsvägledning',
  url: 'https://example.com/guidance',
  type: 'myndighetsvägledning',
  factCheckedAt: '2026-08-01',
  accessedAt: '2026-08-01',
  relevantSections: ['Avsnitt A'],
  latestVersion: '2026-08-01',
  sections: [{ id: 'section-a', label: 'Avsnitt A' }],
};

const v2Registries: KnowledgeSourceContractRegistries = {
  ...defaultKnowledgeSourceContractRegistries,
  routeRegistry: webRouteRegistry,
  sources: {
    ...knowledgeSources,
    [v2LegalSource.id]: v2LegalSource,
    [v2GuidanceSource.id]: v2GuidanceSource,
  },
};

function v2Article(overrides: Record<string, unknown> = {}): KnowledgeArticleContractInput {
  return {
    governanceVersion: 2,
    id: 'test-governance-v2',
    canonicalPath: '/faroanalys-livsmedel',
    title: 'Testad governance v2 | Min Egenkontroll',
    description: 'Ett testat kontrakt för governance v2.',
    sourceIds: ['test:law', 'test:guidance'],
    languagePolicyIds: ['language-policy:source-classification:v1'],
    disclaimerIds: [],
    aiInterpretation: 'none',
    contractKind: 'full',
    scope: v2Scope,
    risk: 'red',
    review: {
      status: 'approved',
      humanReviewer: 'Robin Granskare',
      expertReviewer: 'Sakkunnig Granskare',
      requiresExpertReview: true,
      explicitlyApproved: true,
      approvedBy: 'Robin Godkännare',
      approvedAt: '2026-08-01',
    },
    seo: {
      primaryUserNeed: 'Få ett tydligt och granskningsbart innehållskontrakt.',
      pageRole: 'fact-page',
      searchIntent: 'Förstå hur governance v2 fungerar',
      primaryTopic: 'Governance-kontrakt',
      relatedPhrases: ['innehållskontrakt', 'faktagranskning'],
      topicClusterId: 'content-governance',
      structuralParentId: 'knowledge-base',
      closestRelatedPagePaths: ['/kunskapsbank'],
      uniqueValue: 'Ett avgränsat och testbart kontrakt.',
      ownPageRationale: 'Ämnet behöver ett eget verifierbart kontrakt innan publicering.',
      titleSource: 'article.title',
      h1SurfaceId: 'h1',
      metaDescriptionSource: 'article.description',
      canonicalSource: 'article.canonicalPath',
      indexingDecision: 'index',
      sitemapDecision: 'include',
      structuredDataTypes: ['Article', 'BreadcrumbList'],
      plannedIncomingLinks: ['/kunskapsbank'],
      plannedOutgoingLinks: ['/seo/test-governance-v2.html'],
      followUpGoals: ['Kontrollera sökintentionen vid nästa innehållsrevision.'],
    },
    surfaces: [
      { id: 'title', kind: 'title', material: true },
      { id: 'h1', kind: 'h1', material: true },
      { id: 'meta-description', kind: 'meta-description', material: true },
      { id: 'short-answer', kind: 'short-answer', material: true },
      { id: 'ingress', kind: 'ingress', material: true },
      { id: 'block:main', kind: 'block', material: true, blockId: 'main' },
      { id: 'faq:one', kind: 'faq', material: true },
    ],
    blocks: [{
      id: 'main',
      material: true,
      sourceIds: ['test:law'],
      claims: [
        {
          id: 'requirement-claim',
          surfaceId: 'block:main',
          classification: 'requirement',
          reformulationType: 'near-paraphrase',
          scope: v2Scope,
          risk: 'red',
          central: true,
          factCheckedAt: '2026-08-01',
          reviewStatus: 'approved',
          sourceIds: ['test:law'],
          sourceReferences: [{ sourceId: 'test:law', sectionId: 'article-1', approvedSourceVersion: '2026-08-01' }],
        },
        {
          id: 'title-claim',
          surfaceId: 'title',
          classification: 'guidance',
          reformulationType: 'summary',
          scope: v2Scope,
          risk: 'yellow',
          central: false,
          factCheckedAt: '2026-08-01',
          reviewStatus: 'approved',
          sourceIds: ['test:guidance'],
          sourceReferences: [{ sourceId: 'test:guidance', sectionId: 'section-a', approvedSourceVersion: '2026-08-01' }],
        },
        {
          id: 'h1-claim',
          surfaceId: 'h1',
          classification: 'guidance',
          reformulationType: 'summary',
          scope: v2Scope,
          risk: 'yellow',
          central: false,
          factCheckedAt: '2026-08-01',
          reviewStatus: 'approved',
          sourceIds: ['test:guidance'],
          sourceReferences: [{ sourceId: 'test:guidance', sectionId: 'section-a', approvedSourceVersion: '2026-08-01' }],
        },
        {
          id: 'guidance-claim',
          surfaceId: 'short-answer',
          classification: 'guidance',
          reformulationType: 'summary',
          scope: v2Scope,
          risk: 'yellow',
          central: false,
          factCheckedAt: '2026-08-01',
          reviewStatus: 'approved',
          sourceIds: ['test:guidance'],
          sourceReferences: [{ sourceId: 'test:guidance', sectionId: 'section-a', approvedSourceVersion: '2026-08-01' }],
        },
        {
          id: 'recommendation-claim',
          surfaceId: 'ingress',
          classification: 'recommendation',
          reformulationType: 'recommendation',
          scope: v2Scope,
          risk: 'green',
          central: false,
          factCheckedAt: '2026-08-01',
          reviewStatus: 'approved',
          sourceIds: ['test:guidance'],
          sourceReferences: [{ sourceId: 'test:guidance', sectionId: 'section-a', approvedSourceVersion: '2026-08-01' }],
        },
        {
          id: 'example-claim',
          surfaceId: 'faq:one',
          classification: 'example',
          reformulationType: 'practical-example',
          scope: v2Scope,
          risk: 'green',
          central: false,
          factCheckedAt: '2026-08-01',
          reviewStatus: 'approved',
          sourceIds: ['test:guidance'],
          sourceReferences: [{ sourceId: 'test:guidance', sectionId: 'section-a', approvedSourceVersion: '2026-08-01' }],
        },
        {
          id: 'uncertainty-claim',
          surfaceId: 'meta-description',
          classification: 'uncertainty',
          reformulationType: 'inference',
          scope: v2Scope,
          risk: 'yellow',
          central: false,
          factCheckedAt: '2026-08-01',
          reviewStatus: 'approved',
          sourceIds: ['test:guidance'],
          sourceReferences: [{ sourceId: 'test:guidance', sectionId: 'section-a', approvedSourceVersion: '2026-08-01' }],
        },
      ],
    }],
    ...overrides,
  } as unknown as KnowledgeArticleContractInput;
}

test('v1-definitioner behåller läsbar migreringsväg och oförändrad source-impact', () => {
  const v1Definitions = migratedKnowledgeArticleDefinitions.filter((article) => article.governanceVersion !== 2);
  assert.deepEqual(validateKnowledgeArticleContracts(v1Definitions), []);
  assert.deepEqual(buildKnowledgeSourceImpactIndex([r10]), {
    'kontrollwiki:345': [{
      articleId: 'seo-personlig-hygien-livsmedel',
      canonicalPath: '/seo/personlig-hygien-livsmedel.html',
      blockIds: ['exempel-pa-kontrollfragor', 'krav-pa-personlig-hygien', 'verksamhetens-rutiner'],
      claimIds: [],
    }],
  });
});

test('v2 godkänner komplett SEO-kontrakt på faroanalys befintliga route och utan duplicerad canonicaltext', () => {
  const full = v2Article();
  const compact = v2Article({ id: 'test-governance-v2-compact', canonicalPath: '/kontrollplan-livsmedel', contractKind: 'compact' });
  assert.deepEqual(validateKnowledgeArticleContracts([full, compact], v2Registries), []);
  const impact = buildKnowledgeSourceImpactIndex([full]);
  assert.deepEqual(impact['test:law'], [{
    articleId: 'test-governance-v2',
    canonicalPath: '/faroanalys-livsmedel',
    blockIds: ['main'],
    claimIds: ['requirement-claim'],
    surfaceIds: ['block:main'],
  }]);
  assert.deepEqual(impact['test:guidance'], [{
    articleId: 'test-governance-v2',
    canonicalPath: '/faroanalys-livsmedel',
    blockIds: [],
    claimIds: ['example-claim', 'guidance-claim', 'h1-claim', 'recommendation-claim', 'title-claim', 'uncertainty-claim'],
    surfaceIds: ['faq:one', 'h1', 'ingress', 'meta-description', 'short-answer', 'title'],
  }]);
  assert.equal(JSON.stringify(full).includes('Testpåstående'), false);
  assert.equal('canonicalPath' in (full.seo ?? {}), false);
});

test('v2 blockerar canonical som saknas i det injicerade route-registret', () => {
  const invalid = v2Article({ canonicalPath: '/saknas-i-route-registret' });
  const errors = validateKnowledgeArticleContracts([invalid], v2Registries);
  assert.ok(errors.some((error) => error.includes('V2-artikel canonical saknas i route-registret')));
});

test('v2 kräver ett injicerat route-register medan v1 fortsatt validerar utan det', () => {
  const withoutRoutes: KnowledgeSourceContractRegistries = { ...v2Registries, routeRegistry: undefined };
  assert.ok(validateKnowledgeArticleContracts([v2Article()], withoutRoutes).some((error) => error.includes('V2-artikel saknar injicerat route-register')));
  const v1Definitions = migratedKnowledgeArticleDefinitions.filter((article) => article.governanceVersion !== 2);
  assert.deepEqual(validateKnowledgeArticleContracts(v1Definitions), []);
});

test('R02 och R08 har full yellow-governance med täckta materiella ytor och godkända vägledningsclaims', () => {
  const articles = migratedKnowledgeArticleDefinitions.filter((article) =>
    article.id === 'seo-grundforutsattningar-livsmedel' || article.id === 'seo-lokaler-och-utrustning-livsmedel',
  );
  assert.deepEqual(validateKnowledgeArticleContracts(articles, migratedArticleRegistries), []);
  assert.equal(articles.length, 2);

  for (const article of articles) {
    assert.equal(article.governanceVersion, 2);
    assert.equal(article.contractKind, 'full');
    assert.equal(article.risk, 'yellow');
    assert.deepEqual(article.review, {
      status: 'approved', humanReviewer: 'Robin Strömberg', approvedBy: 'Robin Strömberg', approvedAt: '2026-08-01',
    });
    const claims = article.blocks.flatMap((block) => block.claims ?? []);
    const materialSurfaceIds = article.surfaces?.filter((surface) => surface.material).map((surface) => surface.id) ?? [];
    assert.deepEqual([...new Set(claims.map((claim) => 'surfaceId' in claim ? claim.surfaceId : ''))].sort(), materialSurfaceIds.sort());
    assert.equal(claims.some((claim) => claim.classification === 'requirement'), false);
    for (const claim of claims) {
      if (!('surfaceId' in claim)) throw new Error('R02/R08 får inte innehålla v1-claims.');
      assert.equal(claim.risk, 'yellow');
      assert.equal(claim.factCheckedAt, '2026-08-01');
      assert.equal(claim.reviewStatus, 'approved');
    }
  }

  const r02 = articles.find((article) => article.id === 'seo-grundforutsattningar-livsmedel');
  const r08 = articles.find((article) => article.id === 'seo-lokaler-och-utrustning-livsmedel');
  assert.deepEqual(r02?.surfaces?.map((surface) => surface.id), ['r02-title', 'r02-meta-description', 'r02-h1', 'r02-short-answer', 'r02-block-varfor-grundforutsattningar', 'r02-block-omraden', 'r02-block-rekommenderade-rutiner']);
  assert.deepEqual(r08?.surfaces?.map((surface) => surface.id), ['r08-title', 'r08-meta-description', 'r08-h1', 'r08-short-answer', 'r08-block-omraden', 'r08-block-ingen-ritning', 'r08-block-praktiska-kontrollomraden']);
  assert.equal(r08?.seo?.structuralParentId, 'seo-grundforutsattningar-livsmedel');
  assert.deepEqual(r08?.sourceIds, ['kontrollwiki:343', 'kontrollwiki:1045', 'kontrollwiki:1046']);
  assert.deepEqual(knowledgeSources['kontrollwiki:1045'].sections, [{ id: 'handfat', label: 'Handfat' }]);
  assert.deepEqual(knowledgeSources['kontrollwiki:1046'].sections, [{ id: 'ventilation', label: 'Ventilation' }]);
});

test('v2 blockerar saknade governancefält, SEO-kontrakt och internlänkningsplan', () => {
  const invalid = v2Article({ contractKind: undefined, scope: undefined, risk: undefined, review: undefined, seo: undefined });
  const errors = validateKnowledgeArticleContracts([invalid], v2Registries);
  assert.ok(errors.some((error) => error.includes('artikelkontrakt')));
  assert.ok(errors.some((error) => error.includes('scope')));
  assert.ok(errors.some((error) => error.includes('risk')));
  assert.ok(errors.some((error) => error.includes('review-status')));
  assert.ok(errors.some((error) => error.includes('SEO-sidroll')));
  assert.ok(errors.some((error) => error.includes('internlänkningsplan')));
});

test('v2 blockerar saknad claimnivåns faktagranskning och otillåten review-status', () => {
  const base = v2Article();
  const invalid = {
    ...base,
    blocks: base.blocks.map((block) => ({
      ...block,
      claims: block.claims?.map((claim) => claim.id === 'title-claim'
        ? { ...claim, factCheckedAt: '2026-8-01', reviewStatus: 'invalid' }
        : claim),
    })),
  } as KnowledgeArticleContractInput;
  const errors = validateKnowledgeArticleContracts([invalid], v2Registries);
  assert.ok(errors.some((error) => error.includes('Claim saknar giltigt faktakontrolldatum')));
  assert.ok(errors.some((error) => error.includes('Claim saknar giltig review-status')));
});

test('v2 blockerar ofullständiga maskinläsbara SEO-beslut utan canonical-duplicering', () => {
  const base = v2Article();
  const invalid = v2Article({
    seo: {
      ...base.seo,
      primaryUserNeed: '',
      relatedPhrases: undefined,
      closestRelatedPagePaths: undefined,
      ownPageRationale: '',
      titleSource: undefined,
      h1SurfaceId: 'missing-h1',
      metaDescriptionSource: undefined,
      canonicalSource: undefined,
      indexingDecision: 'invalid',
      sitemapDecision: 'invalid',
      structuredDataTypes: undefined,
      followUpGoals: undefined,
    },
  });
  const errors = validateKnowledgeArticleContracts([invalid], v2Registries);
  for (const field of [
    'primaryUserNeed', 'relatedPhrases', 'closestRelatedPagePaths', 'ownPageRationale',
    'title-mappning', 'H1-mappning', 'metabeskrivningsmappning', 'canonical-mappning',
    'indexeringsbeslut', 'sitemapbeslut', 'structuredDataTypes', 'followUpGoals',
  ]) assert.ok(errors.some((error) => error.includes(field)), `Saknar blockerregel för ${field}`);
  assert.equal('canonicalPath' in (invalid.seo ?? {}), false);
});

test('v2 blockerar motsägelsefulla classification- och reformulationType-kombinationer', () => {
  const base = v2Article();
  const invalid = {
    ...base,
    blocks: base.blocks.map((block) => ({
      ...block,
      claims: block.claims?.map((claim) => claim.id === 'requirement-claim'
        ? { ...claim, reformulationType: 'recommendation' }
        : claim.id === 'example-claim'
          ? { ...claim, reformulationType: 'inference' }
          : claim),
    })),
  } as KnowledgeArticleContractInput;
  const errors = validateKnowledgeArticleContracts([invalid], v2Registries);
  assert.equal(errors.filter((error) => error.includes('motsägelsefull klassificering och omformuleringstyp')).length, 2);
});

test('v2 blockerar claimtext, ogiltig yta, omformulering, scope och källmetadata', () => {
  const invalid = v2Article({
    surfaces: [{ id: 'title', kind: 'title', material: false }],
    blocks: [{
      id: 'main', material: true, sourceIds: ['test:law'], claims: [{
        id: 'invalid-claim', text: 'Får inte dupliceras', surfaceId: 'missing-surface', classification: 'guidance', reformulationType: 'invalid', scope: undefined,
        risk: 'green', central: true, sourceIds: ['test:law'], sourceReferences: [{ sourceId: 'test:law', sectionId: 'missing-section', approvedSourceVersion: 'old-version' }],
      }],
    }],
  });
  const errors = validateKnowledgeArticleContracts([invalid], v2Registries);
  assert.ok(errors.some((error) => error.includes('får inte duplicera publicerad text')));
  assert.ok(errors.some((error) => error.includes('okänd surfaceId')));
  assert.ok(errors.some((error) => error.includes('omformuleringstyp')));
  assert.ok(errors.some((error) => error.includes('Claim saknar scope')));
  assert.ok(errors.some((error) => error.includes('okänt källavsnitt')));
  assert.ok(errors.some((error) => error.includes('senast godkänd källversion')));
});

test('v2 blockerar bindande claim utan rättsakt och riskbaserade godkännanden', () => {
  const missingLegalSupport = v2Article({
    blocks: [{
      id: 'main', material: true, sourceIds: ['test:guidance'], claims: [{
        id: 'requirement-with-guidance-only', surfaceId: 'block:main', classification: 'requirement', reformulationType: 'near-paraphrase', scope: v2Scope,
        risk: 'red', central: true, sourceIds: ['test:guidance'], sourceReferences: [{ sourceId: 'test:guidance', sectionId: 'section-a', approvedSourceVersion: '2026-08-01' }],
      }],
    }],
  });
  const yellowWithoutReviewer = v2Article({
    id: 'yellow-without-reviewer', canonicalPath: '/seo/yellow-without-reviewer.html', risk: 'yellow', review: { status: 'approved' },
    blocks: [{ id: 'main', material: true, sourceIds: ['test:guidance'], claims: [{
      id: 'yellow-claim', surfaceId: 'block:main', classification: 'guidance', reformulationType: 'summary', scope: v2Scope,
      risk: 'yellow', central: true, sourceIds: ['test:guidance'], sourceReferences: [{ sourceId: 'test:guidance', sectionId: 'section-a', approvedSourceVersion: '2026-08-01' }],
    }] }],
  });
  const redWithoutApproval = v2Article({ review: { status: 'approved', humanReviewer: 'Robin', requiresExpertReview: true } });
  const errors = validateKnowledgeArticleContracts([missingLegalSupport, yellowWithoutReviewer, redWithoutApproval], v2Registries);
  assert.ok(errors.some((error) => error.includes('Bindande claim saknar relevant rättskälla')));
  assert.ok(errors.some((error) => error.includes('Gul artikel saknar namngiven mänsklig granskare')));
  assert.ok(errors.some((error) => error.includes('Röd artikel saknar uttryckligt mänskligt godkännande')));
  assert.ok(errors.some((error) => error.includes('Röd artikel saknar obligatorisk sakkunnig granskare')));
});

test('v2 blockerar sidrisk som inte motsvarar högsta centrala claimrisk', () => {
  const invalid = v2Article({ risk: 'yellow' });
  assert.ok(validateKnowledgeArticleContracts([invalid], v2Registries).some((error) => error.includes('högsta centrala claimrisk')));
});
