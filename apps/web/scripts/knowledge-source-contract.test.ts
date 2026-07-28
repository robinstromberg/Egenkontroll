import assert from 'node:assert/strict';
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
    articleId: 'seo-personlig-hygien-livsmedel',
    canonicalPath: '/seo/personlig-hygien-livsmedel.html',
    blockIds: ['exempel-pa-kontrollfragor', 'krav-pa-personlig-hygien', 'verksamhetens-rutiner'],
    claimIds: [],
  }]);
  assert.deepEqual(getKnowledgeSourceIdsForBlock(r10, 'exempel-pa-kontrollfragor'), ['kontrollwiki:345']);
  assert.deepEqual(getKnowledgeSourceIdsForBlock(r10, 'skillnaden-mellan-krav-och-exempel'), []);
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
