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
import { webMigratedKnowledgeArticleRoutes } from '../src/config/routes';

const r10 = migratedKnowledgeArticleDefinitions[0];

test('R10 uppfyller källspårbarhetskontraktet', () => {
  assert.deepEqual(validateKnowledgeArticleContracts(migratedKnowledgeArticleDefinitions), []);
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
    ['kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'],
    ['kontrollwiki:342'],
    ['kontrollwiki:345', 'kontrollwiki:346', 'kontrollwiki:348', 'kontrollwiki:349'],
    ['kontrollwiki:343'],
  ]);
  for (const article of articles) assert.equal(article.breadcrumb[0]?.href, '/kunskapsbank');
  assert.equal(migratedKnowledgeArticles.find((article) => article.id === 'seo-grundforutsattningar-livsmedel')?.sources.length, 5);
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
  assert.deepEqual(r02Recommendation?.sourceIds, []);
  assert.deepEqual(r03Recommendation?.sourceIds, []);
  assert.equal(r02Recommendation?.material, false);
  assert.equal(r03Recommendation?.material, false);
  assert.match(r02Recommendation?.paragraphs.join(' ') ?? '', /Min Egenkontroll rekommenderar/);
  assert.match(r03Recommendation?.paragraphs.join(' ') ?? '', /Min Egenkontroll rekommenderar/);
});

test('recommendation-block använder egna semantiska tokens i light och dark', () => {
  const css = readFileSync(new URL('../src/components/FactPage.css', import.meta.url), 'utf8');
  assert.match(css, /\.fact-page__content-block--recommendation[^}]*var\(--ds-highlight-border\)[^}]*var\(--ds-highlight-surface\)/);
});

test('Article JSON-LD citation följer alla registrerade artikelkällor', () => {
  const r02 = webMigratedKnowledgeArticleRoutes.find((route) => route.path === '/seo/grundforutsattningar-livsmedel.html');
  const r04 = webMigratedKnowledgeArticleRoutes.find((route) => route.path === '/seo/hygien-och-daglig-drift.html');
  const r10 = webMigratedKnowledgeArticleRoutes.find((route) => route.path === '/seo/personlig-hygien-livsmedel.html');
  assert.deepEqual(r02?.structuredData?.citation, [
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
