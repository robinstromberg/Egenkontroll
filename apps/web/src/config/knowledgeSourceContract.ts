export type KnowledgeClassification = 'requirement' | 'guidance' | 'recommendation' | 'example' | 'uncertainty';
export type KnowledgeArticleClassification = KnowledgeClassification;

export type KnowledgeSourceType = 'myndighetsvägledning' | 'rättsakt' | 'annan';

export type KnowledgeSourceRecord = {
  id: string;
  label: string;
  url: string;
  type: KnowledgeSourceType;
  factCheckedAt: string;
  accessedAt: string;
  relevantSections: readonly string[];
  legalReference?: string;
  limitationId?: KnowledgeDisclaimerId;
};

export type KnowledgeLanguagePolicy = {
  id: string;
  version: number;
  title: string;
  rules: Readonly<Record<KnowledgeClassification, string>>;
};

export type KnowledgeDisclaimer = {
  id: string;
  version: number;
  text: string;
};

export const knowledgeSources = {
  'kontrollwiki:246': {
    id: 'kontrollwiki:246',
    label: 'Livsmedelsverkets Kontrollwiki: Grundförutsättningar, hygien',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/246/j-grundforutsattningar-hygien',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-29',
    accessedAt: '2026-07-29',
    relevantSections: ['Hygien', 'Grundförutsättning eller HACCP', 'J02 - Utformning och underhåll av lokaler och utrustning', 'J03 - Hygien före, under och efter processen', 'J08 - Upprätthållande av kylkedjan och uppfyllande av temperaturkriterier'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II; förordning (EG) nr 853/2004',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:341': {
    id: 'kontrollwiki:341',
    label: 'Livsmedelsverkets Kontrollwiki: Avfall',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/341/avfall',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud', 'Lagstiftningsavsnitt'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel VI',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:342': {
    id: 'kontrollwiki:342',
    label: 'Livsmedelsverkets Kontrollwiki: Hantering och förvaring',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/342/hantering-och-forvaring',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Hantering, lagring och transport', 'Tips på kontroll'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel IX',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:343': {
    id: 'kontrollwiki:343',
    label: 'Livsmedelsverkets Kontrollwiki: Lokaler och utrustning',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/343/lokaler-och-utrustning',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud', 'Lokaler', 'Utrustning'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel I, II och V',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:345': {
    id: 'kontrollwiki:345',
    label: 'Livsmedelsverkets Kontrollwiki: Personlig hygien',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/345/personlig-hygien',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud', 'Tips på kontroll'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel VIII',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:346': {
    id: 'kontrollwiki:346',
    label: 'Livsmedelsverkets Kontrollwiki: Rengöring',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/346/rengoring',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel I, II och V',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:348': {
    id: 'kontrollwiki:348',
    label: 'Livsmedelsverkets Kontrollwiki: Skadedjursbekämpning',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/348/skadedjursbekampning',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel IX',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:349': {
    id: 'kontrollwiki:349',
    label: 'Livsmedelsverkets Kontrollwiki: Temperatur',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/349/temperatur',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel IX',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:350': {
    id: 'kontrollwiki:350',
    label: 'Livsmedelsverkets Kontrollwiki: Transport',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/350/transport',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud', 'Lagstiftningsavsnitt'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel IV',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:351': {
    id: 'kontrollwiki:351',
    label: 'Livsmedelsverkets Kontrollwiki: Utbildning',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/351/utbildning',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud', 'Lagstiftningsavsnitt'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel XII',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
  'kontrollwiki:352': {
    id: 'kontrollwiki:352',
    label: 'Livsmedelsverkets Kontrollwiki: Vattenförsörjning',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/352/vattenforsorjning',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    accessedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud', 'Lagstiftningsavsnitt'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel VII',
    limitationId: 'disclaimer:kontrollwiki-guidance:v1',
  },
} as const satisfies Record<string, KnowledgeSourceRecord>;

export const knowledgeLanguagePolicies = {
  'language-policy:source-classification:v1': {
    id: 'language-policy:source-classification:v1',
    version: 1,
    title: 'Källklassificering för kunskapsartiklar',
    rules: {
      requirement: 'Bindande krav ska endast beskrivas när källunderlaget stöder rättslig grund.',
      guidance: 'Myndighetsvägledning ska skiljas från bindande rätt.',
      recommendation: 'Min Egenkontrolls rekommendationer ska märkas som praktiska förslag.',
      example: 'Praktiska exempel ska beskrivas som exempel och anpassningsbara arbetssätt.',
      uncertainty: 'Osäkerhet och verksamhetsberoende villkor ska uttryckas öppet.',
    },
  },
} as const satisfies Record<string, KnowledgeLanguagePolicy>;

export const knowledgeDisclaimers = {
  'disclaimer:kontrollwiki-guidance:v1': {
    id: 'disclaimer:kontrollwiki-guidance:v1',
    version: 1,
    text: 'Kontrollwiki är Livsmedelsverkets vägledning och är inte bindande i sig. Artikeln ersätter inte den egna verksamhetens riskbedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
} as const satisfies Record<string, KnowledgeDisclaimer>;

export type KnowledgeSourceId = keyof typeof knowledgeSources;
export type KnowledgeLanguagePolicyId = keyof typeof knowledgeLanguagePolicies;
export type KnowledgeDisclaimerId = keyof typeof knowledgeDisclaimers;

export type KnowledgeArticleClaim = {
  id: string;
  text: string;
  classification: KnowledgeClassification;
  sourceIds: readonly KnowledgeSourceId[];
};

export type KnowledgeArticleBlockContract = {
  id: string;
  material: boolean;
  sourceIds: readonly KnowledgeSourceId[];
  claims?: readonly KnowledgeArticleClaim[];
};

export type KnowledgeArticleContractInput = {
  id: string;
  canonicalPath: string;
  title: string;
  description: string;
  sourceIds: readonly KnowledgeSourceId[];
  languagePolicyIds: readonly KnowledgeLanguagePolicyId[];
  disclaimerIds: readonly KnowledgeDisclaimerId[];
  aiInterpretation: 'none' | 'human-reviewed';
  blocks: readonly KnowledgeArticleBlockContract[];
};

export type KnowledgeSourceImpact = {
  articleId: string;
  canonicalPath: string;
  blockIds: readonly string[];
  claimIds: readonly string[];
};

export type KnowledgeSourceImpactIndex = Readonly<Record<string, readonly KnowledgeSourceImpact[]>>;

export type KnowledgeSourceContractRegistries = {
  sources: Readonly<Record<string, KnowledgeSourceRecord>>;
  languagePolicies: Readonly<Record<string, KnowledgeLanguagePolicy>>;
  disclaimers: Readonly<Record<string, KnowledgeDisclaimer>>;
};

export const defaultKnowledgeSourceContractRegistries: KnowledgeSourceContractRegistries = {
  sources: knowledgeSources,
  languagePolicies: knowledgeLanguagePolicies,
  disclaimers: knowledgeDisclaimers,
};

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const canonicalPathPattern = /^\/seo\/[^/]+\.html$/;
const urlPattern = /^https?:\/\/[^\s]+$/;
const stableIdPattern = /^[^\s]+$/;
const classifications = new Set<KnowledgeClassification>([
  'requirement',
  'guidance',
  'recommendation',
  'example',
  'uncertainty',
]);
const sourceTypes = new Set<KnowledgeSourceType>(['myndighetsvägledning', 'rättsakt', 'annan']);

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function sourceIdsFromBlock(block: KnowledgeArticleBlockContract): readonly string[] {
  const directSourceIds = Array.isArray(block.sourceIds) ? block.sourceIds : [];
  const claims = Array.isArray(block.claims) ? block.claims : [];
  return [...directSourceIds, ...claims.flatMap((claim) => Array.isArray(claim.sourceIds) ? claim.sourceIds : [])];
}

export function validateKnowledgeArticleContracts(
  articles: readonly KnowledgeArticleContractInput[],
  registries: KnowledgeSourceContractRegistries = defaultKnowledgeSourceContractRegistries,
): string[] {
  const errors: string[] = [];
  const sourceEntries = Object.entries(registries.sources);
  const policyEntries = Object.entries(registries.languagePolicies);
  const disclaimerEntries = Object.entries(registries.disclaimers);
  const sourceIds = new Set<string>();
  const policyIds = new Set<string>();
  const disclaimerIds = new Set<string>();
  const articleIds = new Set<string>();

  for (const [key, source] of sourceEntries) {
    if (sourceIds.has(source.id)) errors.push(`Duplicerat käll-ID: ${source.id}`);
    sourceIds.add(source.id);
    if (key !== source.id) errors.push(`Källregistrets nyckel avviker från ID: ${key} -> ${source.id}`);
    if (!source.id?.trim() || !stableIdPattern.test(source.id)) errors.push('Källa saknar stabilt ID.');
    if (!source.label?.trim()) errors.push(`Källa saknar label: ${source.id}`);
    if (!sourceTypes.has(source.type)) errors.push(`Källa har okänd typ: ${source.id}`);
    if (!urlPattern.test(source.url ?? '')) errors.push(`Källa saknar exakt URL: ${source.id}`);
    if (!isoDatePattern.test(source.factCheckedAt ?? '')) errors.push(`Källa saknar giltigt faktakontrolldatum: ${source.id}`);
    if (!isoDatePattern.test(source.accessedAt ?? '')) errors.push(`Källa saknar giltigt åtkomstdatum: ${source.id}`);
    if (!Array.isArray(source.relevantSections) || source.relevantSections.length === 0 || source.relevantSections.some((section) => !section?.trim())) {
      errors.push(`Källa saknar relevanta avsnitt: ${source.id}`);
    }
    if (source.limitationId && !disclaimerEntries.some(([id]) => id === source.limitationId)) {
      errors.push(`Källa refererar till okänd friskrivning: ${source.id} -> ${source.limitationId}`);
    }
  }

  for (const [key, policy] of policyEntries) {
    if (policyIds.has(policy.id)) errors.push(`Duplicerat språkpolicy-ID: ${policy.id}`);
    policyIds.add(policy.id);
    if (key !== policy.id) errors.push(`Språkpolicyens nyckel avviker från ID: ${key} -> ${policy.id}`);
    if (!Number.isInteger(policy.version) || policy.version < 1) errors.push(`Språkpolicy saknar giltig version: ${policy.id}`);
    for (const classification of classifications) {
      if (!policy.rules?.[classification]?.trim()) errors.push(`Språkpolicy saknar regel: ${policy.id} -> ${classification}`);
    }
  }

  for (const [key, disclaimer] of disclaimerEntries) {
    if (disclaimerIds.has(disclaimer.id)) errors.push(`Duplicerat friskrivnings-ID: ${disclaimer.id}`);
    disclaimerIds.add(disclaimer.id);
    if (key !== disclaimer.id) errors.push(`Friskrivningens nyckel avviker från ID: ${key} -> ${disclaimer.id}`);
    if (!Number.isInteger(disclaimer.version) || disclaimer.version < 1) errors.push(`Friskrivning saknar giltig version: ${disclaimer.id}`);
    if (!disclaimer.text?.trim()) errors.push(`Friskrivning saknar text: ${disclaimer.id}`);
  }

  for (const article of articles) {
    if (articleIds.has(article.id)) errors.push(`Duplicerat artikel-ID: ${article.id}`);
    articleIds.add(article.id);
    if (!article.id?.trim() || !stableIdPattern.test(article.id)) errors.push('Artikel saknar stabilt ID.');
    if (!canonicalPathPattern.test(article.canonicalPath ?? '')) errors.push(`Artikel har ogiltig canonical path: ${article.id}`);
    if (!article.title?.trim()) errors.push(`Artikel saknar title: ${article.id}`);
    if (!article.description?.trim()) errors.push(`Artikel saknar description: ${article.id}`);
    const articleSourceIds = Array.isArray(article.sourceIds) ? article.sourceIds : [];
    const articlePolicyIds = Array.isArray(article.languagePolicyIds) ? article.languagePolicyIds : [];
    const articleDisclaimerIds = Array.isArray(article.disclaimerIds) ? article.disclaimerIds : [];
    if (articleSourceIds.length === 0) errors.push(`Artikel saknar källor: ${article.id}`);
    for (const duplicate of duplicateValues(articleSourceIds)) errors.push(`Duplicerad artikelkällreferens: ${article.id} -> ${duplicate}`);
    for (const duplicate of duplicateValues(articlePolicyIds)) errors.push(`Duplicerad språkpolicyreferens: ${article.id} -> ${duplicate}`);
    for (const duplicate of duplicateValues(articleDisclaimerIds)) errors.push(`Duplicerad friskrivningsreferens: ${article.id} -> ${duplicate}`);
    for (const sourceId of unique(articleSourceIds)) {
      if (!sourceIds.has(sourceId)) errors.push(`Artikel refererar till okänd källa: ${article.id} -> ${sourceId}`);
    }
    for (const policyId of unique(articlePolicyIds)) {
      if (!policyIds.has(policyId)) errors.push(`Artikel refererar till okänd språkpolicy: ${article.id} -> ${policyId}`);
    }
    for (const disclaimerId of unique(articleDisclaimerIds)) {
      if (!disclaimerIds.has(disclaimerId)) errors.push(`Artikel refererar till okänd friskrivning: ${article.id} -> ${disclaimerId}`);
    }
    if (article.aiInterpretation !== 'none' && article.aiInterpretation !== 'human-reviewed') {
      errors.push(`Artikel har okänd AI-tolkning: ${article.id}`);
    }
    const blockIds = new Set<string>();
    const claimIds = new Set<string>();
    const blocks = Array.isArray(article.blocks) ? article.blocks : [];
    if (blocks.length === 0) errors.push(`Artikel saknar block: ${article.id}`);
    for (const block of blocks) {
      if (!block.id?.trim() || !stableIdPattern.test(block.id)) errors.push(`Block saknar stabilt ID: ${article.id}`);
      if (blockIds.has(block.id)) errors.push(`Duplicerat block-ID: ${article.id} -> ${block.id}`);
      blockIds.add(block.id);
      const blockSourceIds = sourceIdsFromBlock(block);
      if (block.material && blockSourceIds.length === 0) errors.push(`Materiellt block saknar källkoppling: ${article.id} -> ${block.id}`);
      for (const duplicate of duplicateValues(block.sourceIds ?? [])) errors.push(`Duplicerad blockkällreferens: ${article.id} -> ${block.id} -> ${duplicate}`);
      for (const sourceId of unique(blockSourceIds)) {
        if (!sourceIds.has(sourceId)) errors.push(`Block refererar till okänd källa: ${article.id} -> ${block.id} -> ${sourceId}`);
      }
      for (const claim of Array.isArray(block.claims) ? block.claims : []) {
        if (!claim.id?.trim() || !stableIdPattern.test(claim.id)) errors.push(`Claim saknar stabilt ID: ${article.id}`);
        if (claimIds.has(claim.id)) errors.push(`Duplicerat claim-ID: ${article.id} -> ${claim.id}`);
        claimIds.add(claim.id);
        if (!claim.text?.trim()) errors.push(`Claim saknar text: ${article.id} -> ${claim.id}`);
        if (!classifications.has(claim.classification)) errors.push(`Claim har okänd klassificering: ${article.id} -> ${claim.id}`);
        const claimSourceIds = Array.isArray(claim.sourceIds) ? claim.sourceIds : [];
        if (claimSourceIds.length === 0) errors.push(`Claim saknar källkoppling: ${article.id} -> ${claim.id}`);
        for (const duplicate of duplicateValues(claimSourceIds)) errors.push(`Duplicerad claim-källreferens: ${article.id} -> ${claim.id} -> ${duplicate}`);
        for (const sourceId of unique(claimSourceIds)) {
          if (!sourceIds.has(sourceId)) errors.push(`Claim refererar till okänd källa: ${article.id} -> ${claim.id} -> ${sourceId}`);
        }
      }
    }
  }

  return errors;
}

export function buildKnowledgeSourceImpactIndex(
  articles: readonly KnowledgeArticleContractInput[],
): KnowledgeSourceImpactIndex {
  const index = new Map<string, Map<string, { articleId: string; canonicalPath: string; blockIds: Set<string>; claimIds: Set<string> }>>();
  const add = (sourceId: string, article: KnowledgeArticleContractInput, blockId?: string, claimId?: string) => {
    const articleKey = `${article.id}|${article.canonicalPath}`;
    const sourceEntries = index.get(sourceId) ?? new Map();
    const entry = sourceEntries.get(articleKey) ?? { articleId: article.id, canonicalPath: article.canonicalPath, blockIds: new Set<string>(), claimIds: new Set<string>() };
    if (blockId) entry.blockIds.add(blockId);
    if (claimId) entry.claimIds.add(claimId);
    sourceEntries.set(articleKey, entry);
    index.set(sourceId, sourceEntries);
  };

  for (const article of articles) {
    for (const sourceId of article.sourceIds) add(sourceId, article);
    for (const block of article.blocks) {
      for (const sourceId of block.sourceIds) add(sourceId, article, block.id);
      for (const claim of block.claims ?? []) {
        for (const sourceId of claim.sourceIds) add(sourceId, article, block.id, claim.id);
      }
    }
  }

  return Object.fromEntries([...index.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([sourceId, entries]) => [
    sourceId,
    [...entries.values()]
      .sort((left, right) => left.articleId.localeCompare(right.articleId))
      .map((entry) => ({
        articleId: entry.articleId,
        canonicalPath: entry.canonicalPath,
        blockIds: [...entry.blockIds].sort(),
        claimIds: [...entry.claimIds].sort(),
      })),
  ]));
}

export function getKnowledgeSourceImpact(
  index: KnowledgeSourceImpactIndex,
  sourceId: string,
): readonly KnowledgeSourceImpact[] {
  return index[sourceId] ?? [];
}

export function getKnowledgeSourceIdsForBlock(
  article: KnowledgeArticleContractInput,
  blockId: string,
): readonly KnowledgeSourceId[] {
  const block = article.blocks.find((candidate) => candidate.id === blockId);
  return block ? unique(sourceIdsFromBlock(block)) as KnowledgeSourceId[] : [];
}

export type KnowledgeSourcePresentation = {
  id: KnowledgeSourceId;
  label: string;
  url: string;
  type: KnowledgeSourceType;
  factCheckedAt: string;
  accessedAt: string;
  relevantSections: readonly string[];
  legalReference: string;
  limitation: string;
};

export function projectKnowledgeSource(sourceId: KnowledgeSourceId): KnowledgeSourcePresentation {
  const source = knowledgeSources[sourceId];
  const limitation = source.limitationId ? knowledgeDisclaimers[source.limitationId].text : '';
  return {
    id: source.id,
    label: source.label,
    url: source.url,
    type: source.type,
    factCheckedAt: source.factCheckedAt,
    accessedAt: source.accessedAt,
    relevantSections: source.relevantSections,
    legalReference: source.legalReference ?? '',
    limitation,
  };
}
