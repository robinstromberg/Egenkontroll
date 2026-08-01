export type KnowledgeClassification = 'requirement' | 'guidance' | 'recommendation' | 'example' | 'uncertainty';
export type KnowledgeArticleClassification = KnowledgeClassification;

export type KnowledgeSourceType = 'myndighetsvägledning' | 'rättsakt' | 'annan';

export type KnowledgeSourceSection = {
  id: string;
  label: string;
};

export type KnowledgeSourceRecord = {
  id: string;
  label: string;
  url: string;
  type: KnowledgeSourceType;
  factCheckedAt: string;
  accessedAt: string;
  relevantSections: readonly string[];
  latestVersion?: string;
  sections?: readonly KnowledgeSourceSection[];
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

export type KnowledgeArticleRisk = 'green' | 'yellow' | 'red';
export type KnowledgeArticleContractKind = 'compact' | 'full';
export type KnowledgeReformulationType = 'near-paraphrase' | 'summary' | 'multi-source-synthesis' | 'inference' | 'recommendation' | 'practical-example';
export type KnowledgeReviewStatus = 'not-required' | 'pending' | 'approved';
export type KnowledgeSeoPageRole = 'knowledge-base' | 'topic-hub' | 'fact-page' | 'business-page' | 'workflow-template-tool' | 'product-page';
export type KnowledgeIndexingDecision = 'index' | 'noindex';
export type KnowledgeSitemapDecision = 'include' | 'exclude';
export type KnowledgeSurfaceKind = 'title' | 'h1' | 'meta-description' | 'short-answer' | 'ingress' | 'block' | 'faq';

export type KnowledgeScope = {
  audience: string;
  applicability: string;
  conditions: readonly string[];
  exceptions: readonly string[];
};

export type KnowledgeReviewMetadata = {
  status: KnowledgeReviewStatus;
  humanReviewer?: string;
  expertReviewer?: string;
  requiresExpertReview?: boolean;
  explicitlyApproved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
};

export type KnowledgeSeoContract = {
  primaryUserNeed: string;
  pageRole: KnowledgeSeoPageRole;
  searchIntent: string;
  primaryTopic: string;
  relatedPhrases: readonly string[];
  topicClusterId: string;
  structuralParentId: string;
  closestRelatedPagePaths: readonly string[];
  uniqueValue: string;
  ownPageRationale: string;
  titleSource: 'article.title';
  h1SurfaceId: string;
  metaDescriptionSource: 'article.description';
  canonicalSource: 'article.canonicalPath';
  indexingDecision: KnowledgeIndexingDecision;
  sitemapDecision: KnowledgeSitemapDecision;
  structuredDataTypes: readonly string[];
  plannedIncomingLinks: readonly string[];
  plannedOutgoingLinks: readonly string[];
  followUpGoals: readonly string[];
};

export type KnowledgeArticleSurface = {
  id: string;
  kind: KnowledgeSurfaceKind;
  material: boolean;
  blockId?: string;
};

export type KnowledgeClaimSourceReference = {
  sourceId: KnowledgeSourceId;
  sectionId: string;
  approvedSourceVersion: string;
};

export type KnowledgeArticleClaimV1 = {
  id: string;
  text: string;
  classification: KnowledgeClassification;
  sourceIds: readonly KnowledgeSourceId[];
};

export type KnowledgeArticleClaimV2 = {
  id: string;
  surfaceId: string;
  classification: KnowledgeClassification;
  reformulationType: KnowledgeReformulationType;
  scope: KnowledgeScope;
  risk: KnowledgeArticleRisk;
  central: boolean;
  factCheckedAt: string;
  reviewStatus: KnowledgeReviewStatus;
  sourceIds: readonly KnowledgeSourceId[];
  sourceReferences: readonly KnowledgeClaimSourceReference[];
  text?: never;
};

export type KnowledgeArticleClaim = KnowledgeArticleClaimV1 | KnowledgeArticleClaimV2;

export type KnowledgeArticleBlockContract = {
  id: string;
  material: boolean;
  sourceIds: readonly KnowledgeSourceId[];
  claims?: readonly KnowledgeArticleClaim[];
};

export type KnowledgeArticleContractInput = {
  governanceVersion?: 1 | 2;
  id: string;
  canonicalPath: string;
  title: string;
  description: string;
  sourceIds: readonly KnowledgeSourceId[];
  languagePolicyIds: readonly KnowledgeLanguagePolicyId[];
  disclaimerIds: readonly KnowledgeDisclaimerId[];
  aiInterpretation: 'none' | 'human-reviewed';
  blocks: readonly KnowledgeArticleBlockContract[];
  contractKind?: KnowledgeArticleContractKind;
  scope?: KnowledgeScope;
  risk?: KnowledgeArticleRisk;
  review?: KnowledgeReviewMetadata;
  seo?: KnowledgeSeoContract;
  surfaces?: readonly KnowledgeArticleSurface[];
};

export type KnowledgeSourceImpact = {
  articleId: string;
  canonicalPath: string;
  blockIds: readonly string[];
  claimIds: readonly string[];
  surfaceIds?: readonly string[];
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
const internalPathPattern = /^\/[^\s]*$/;
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
const risks = new Set<KnowledgeArticleRisk>(['green', 'yellow', 'red']);
const contractKinds = new Set<KnowledgeArticleContractKind>(['compact', 'full']);
const reformulationTypes = new Set<KnowledgeReformulationType>(['near-paraphrase', 'summary', 'multi-source-synthesis', 'inference', 'recommendation', 'practical-example']);
const reviewStatuses = new Set<KnowledgeReviewStatus>(['not-required', 'pending', 'approved']);
const seoPageRoles = new Set<KnowledgeSeoPageRole>(['knowledge-base', 'topic-hub', 'fact-page', 'business-page', 'workflow-template-tool', 'product-page']);
const indexingDecisions = new Set<KnowledgeIndexingDecision>(['index', 'noindex']);
const sitemapDecisions = new Set<KnowledgeSitemapDecision>(['include', 'exclude']);
const surfaceKinds = new Set<KnowledgeSurfaceKind>(['title', 'h1', 'meta-description', 'short-answer', 'ingress', 'block', 'faq']);
const allowedReformulations: Readonly<Record<KnowledgeClassification, ReadonlySet<KnowledgeReformulationType>>> = {
  requirement: new Set(['near-paraphrase', 'summary', 'multi-source-synthesis']),
  guidance: new Set(['near-paraphrase', 'summary', 'multi-source-synthesis', 'inference']),
  recommendation: new Set(['recommendation']),
  example: new Set(['practical-example']),
  uncertainty: new Set(['near-paraphrase', 'summary', 'multi-source-synthesis', 'inference']),
};

const riskOrder: Readonly<Record<KnowledgeArticleRisk, number>> = { green: 0, yellow: 1, red: 2 };

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

function isV2Article(article: KnowledgeArticleContractInput): boolean {
  return article.governanceVersion === 2;
}

function isV2Claim(claim: KnowledgeArticleClaim): claim is KnowledgeArticleClaimV2 {
  return 'surfaceId' in claim;
}

function validateScope(scope: KnowledgeScope | undefined, label: string, errors: string[]) {
  if (!scope?.audience?.trim()) errors.push(`${label} saknar målgrupp.`);
  if (!scope?.applicability?.trim()) errors.push(`${label} saknar tillämpningsområde.`);
  if (!Array.isArray(scope?.conditions)) errors.push(`${label} saknar villkorslista.`);
  if (!Array.isArray(scope?.exceptions)) errors.push(`${label} saknar undantagslista.`);
}

function validateStringList(values: readonly string[] | undefined, label: string, errors: string[], validateValue?: (value: string) => boolean) {
  if (!Array.isArray(values)) {
    errors.push(`${label} saknar lista.`);
    return;
  }
  if (values.some((value) => !value?.trim() || (validateValue && !validateValue(value)))) errors.push(`${label} innehåller ogiltigt värde.`);
  if (duplicateValues(values).length > 0) errors.push(`${label} innehåller duplicerade värden.`);
}

function validateV2Article(
  article: KnowledgeArticleContractInput,
  blocks: readonly KnowledgeArticleBlockContract[],
  sourceMap: ReadonlyMap<string, KnowledgeSourceRecord>,
  errors: string[],
) {
  if (!contractKinds.has(article.contractKind as KnowledgeArticleContractKind)) errors.push(`V2-artikel saknar giltigt artikelkontrakt: ${article.id}`);
  validateScope(article.scope, `V2-artikel saknar scope: ${article.id}`, errors);
  if (!risks.has(article.risk as KnowledgeArticleRisk)) errors.push(`V2-artikel saknar giltig risk: ${article.id}`);
  if (!reviewStatuses.has(article.review?.status as KnowledgeReviewStatus)) errors.push(`V2-artikel saknar giltig review-status: ${article.id}`);

  const seo = article.seo;
  if (!seoPageRoles.has(seo?.pageRole as KnowledgeSeoPageRole)) errors.push(`V2-artikel saknar giltig SEO-sidroll: ${article.id}`);
  for (const [field, value] of Object.entries({
    primaryUserNeed: seo?.primaryUserNeed,
    searchIntent: seo?.searchIntent,
    primaryTopic: seo?.primaryTopic,
    topicClusterId: seo?.topicClusterId,
    structuralParentId: seo?.structuralParentId,
    uniqueValue: seo?.uniqueValue,
    ownPageRationale: seo?.ownPageRationale,
  })) {
    if (!value?.trim()) errors.push(`V2-artikel saknar SEO-fält ${field}: ${article.id}`);
  }
  if (!Array.isArray(seo?.plannedIncomingLinks) || !Array.isArray(seo?.plannedOutgoingLinks)) errors.push(`V2-artikel saknar internlänkningsplan: ${article.id}`);

  validateStringList(seo?.relatedPhrases, `V2-artikel saknar SEO-fält relatedPhrases: ${article.id}`, errors);
  validateStringList(seo?.closestRelatedPagePaths, `V2-artikel saknar SEO-fält closestRelatedPagePaths: ${article.id}`, errors, (value) => internalPathPattern.test(value));
  validateStringList(seo?.structuredDataTypes, `V2-artikel saknar SEO-fält structuredDataTypes: ${article.id}`, errors);
  validateStringList(seo?.followUpGoals, `V2-artikel saknar SEO-fält followUpGoals: ${article.id}`, errors);
  validateStringList(seo?.plannedIncomingLinks, `V2-artikel saknar internlänkningsplan: ${article.id}`, errors, (value) => internalPathPattern.test(value));
  validateStringList(seo?.plannedOutgoingLinks, `V2-artikel saknar internlänkningsplan: ${article.id}`, errors, (value) => internalPathPattern.test(value));
  if (seo?.titleSource !== 'article.title') errors.push(`V2-artikel saknar title-mappning: ${article.id}`);
  if (seo?.metaDescriptionSource !== 'article.description') errors.push(`V2-artikel saknar metabeskrivningsmappning: ${article.id}`);
  if (seo?.canonicalSource !== 'article.canonicalPath') errors.push(`V2-artikel saknar canonical-mappning: ${article.id}`);
  if (!indexingDecisions.has(seo?.indexingDecision as KnowledgeIndexingDecision)) errors.push(`V2-artikel saknar giltigt indexeringsbeslut: ${article.id}`);
  if (!sitemapDecisions.has(seo?.sitemapDecision as KnowledgeSitemapDecision)) errors.push(`V2-artikel saknar giltigt sitemapbeslut: ${article.id}`);

  const surfaces = Array.isArray(article.surfaces) ? article.surfaces : [];
  if (surfaces.length === 0) errors.push(`V2-artikel saknar publicerade ytor: ${article.id}`);
  const surfaceIds = new Set<string>();
  const blockIds = new Set(blocks.map((block) => block.id));
  for (const surface of surfaces) {
    if (!surface.id?.trim() || !stableIdPattern.test(surface.id)) errors.push(`Yta saknar stabilt surfaceId: ${article.id}`);
    if (surfaceIds.has(surface.id)) errors.push(`Duplicerat surfaceId: ${article.id} -> ${surface.id}`);
    surfaceIds.add(surface.id);
    if (!surfaceKinds.has(surface.kind)) errors.push(`Yta har okänd typ: ${article.id} -> ${surface.id}`);
    if (surface.kind === 'block' && (!surface.blockId || !blockIds.has(surface.blockId))) errors.push(`Blockyta saknar giltigt block: ${article.id} -> ${surface.id}`);
  }

  const h1Surface = surfaces.find((surface) => surface.id === seo?.h1SurfaceId);
  if (!h1Surface || h1Surface.kind !== 'h1') errors.push(`V2-artikel saknar H1-mappning: ${article.id}`);

  const claims = blocks.flatMap((block) => Array.isArray(block.claims) ? block.claims : []);
  const v2Claims = claims.filter(isV2Claim);
  if (claims.some((claim) => !isV2Claim(claim))) errors.push(`V2-artikel innehåller v1-claim: ${article.id}`);
  const centralRisks = v2Claims.filter((claim) => claim.central).map((claim) => claim.risk);
  if (centralRisks.length === 0) errors.push(`V2-artikel saknar central claimrisk: ${article.id}`);
  if (centralRisks.length > 0 && risks.has(article.risk as KnowledgeArticleRisk)) {
    const highestRisk = centralRisks.reduce((highest, risk) => riskOrder[risk] > riskOrder[highest] ? risk : highest);
    if (article.risk !== highestRisk) errors.push(`Sidans risk måste vara högsta centrala claimrisk: ${article.id}`);
  }

  if (article.risk === 'yellow') {
    if (article.review?.status !== 'approved' || !article.review.humanReviewer?.trim()) errors.push(`Gul artikel saknar namngiven mänsklig granskare: ${article.id}`);
  }
  if (article.risk === 'red') {
    if (article.review?.status !== 'approved' || !article.review.humanReviewer?.trim() || article.review.explicitlyApproved !== true || !article.review.approvedBy?.trim() || !isoDatePattern.test(article.review.approvedAt ?? '')) {
      errors.push(`Röd artikel saknar uttryckligt mänskligt godkännande: ${article.id}`);
    }
    if (article.review?.requiresExpertReview === true && !article.review.expertReviewer?.trim()) errors.push(`Röd artikel saknar sakkunnig granskare: ${article.id}`);
  }

  for (const claim of v2Claims) {
    if ('text' in claim) errors.push(`V2-claim får inte duplicera publicerad text: ${article.id} -> ${claim.id}`);
    if (!surfaceIds.has(claim.surfaceId)) errors.push(`Claim refererar till okänd surfaceId: ${article.id} -> ${claim.id} -> ${claim.surfaceId}`);
    const surface = surfaces.find((candidate) => candidate.id === claim.surfaceId);
    if (surface && !surface.material) errors.push(`Claim refererar till icke-materiell yta: ${article.id} -> ${claim.id} -> ${claim.surfaceId}`);
    if (!reformulationTypes.has(claim.reformulationType)) errors.push(`Claim saknar giltig omformuleringstyp: ${article.id} -> ${claim.id}`);
    if (!allowedReformulations[claim.classification]?.has(claim.reformulationType)) errors.push(`Claim har motsägelsefull klassificering och omformuleringstyp: ${article.id} -> ${claim.id}`);
    validateScope(claim.scope, `Claim saknar scope: ${article.id} -> ${claim.id}`, errors);
    if (!risks.has(claim.risk)) errors.push(`Claim saknar giltig risk: ${article.id} -> ${claim.id}`);
    if (!isoDatePattern.test(claim.factCheckedAt ?? '')) errors.push(`Claim saknar giltigt faktakontrolldatum: ${article.id} -> ${claim.id}`);
    if (!reviewStatuses.has(claim.reviewStatus)) errors.push(`Claim saknar giltig review-status: ${article.id} -> ${claim.id}`);
    const references = Array.isArray(claim.sourceReferences) ? claim.sourceReferences : [];
    if (references.length === 0) errors.push(`Claim saknar strukturerad källreferens: ${article.id} -> ${claim.id}`);
    const referencedSourceIds = references.map((reference) => reference.sourceId);
    if (JSON.stringify([...unique(referencedSourceIds)].sort()) !== JSON.stringify([...unique(claim.sourceIds)].sort())) errors.push(`Claimens sourceIds och källreferenser avviker: ${article.id} -> ${claim.id}`);
    for (const reference of references) {
      const source = sourceMap.get(reference.sourceId);
      if (!source?.sections?.some((section) => section.id === reference.sectionId)) errors.push(`Claim refererar till okänt källavsnitt: ${article.id} -> ${claim.id} -> ${reference.sourceId}/${reference.sectionId}`);
      if (!source?.latestVersion?.trim() || source.latestVersion !== reference.approvedSourceVersion) errors.push(`Claim saknar senast godkänd källversion: ${article.id} -> ${claim.id} -> ${reference.sourceId}`);
    }
    if (claim.classification === 'requirement' && !references.some((reference) => sourceMap.get(reference.sourceId)?.type === 'rättsakt')) errors.push(`Bindande claim saknar relevant rättskälla: ${article.id} -> ${claim.id}`);
  }
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
  const sourceMap = new Map<string, KnowledgeSourceRecord>();

  for (const [key, source] of sourceEntries) {
    if (sourceIds.has(source.id)) errors.push(`Duplicerat käll-ID: ${source.id}`);
    sourceIds.add(source.id);
    sourceMap.set(source.id, source);
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
    if (source.latestVersion !== undefined && !source.latestVersion.trim()) errors.push(`Källa har ogiltig senaste version: ${source.id}`);
    if (source.sections !== undefined) {
      const sectionIds = new Set<string>();
      if (!Array.isArray(source.sections) || source.sections.length === 0) errors.push(`Källa saknar strukturerade avsnitt: ${source.id}`);
      for (const section of source.sections ?? []) {
        if (!section.id?.trim() || !stableIdPattern.test(section.id)) errors.push(`Källavsnitt saknar stabilt ID: ${source.id}`);
        if (sectionIds.has(section.id)) errors.push(`Duplicerat källavsnitt-ID: ${source.id} -> ${section.id}`);
        sectionIds.add(section.id);
        if (!section.label?.trim()) errors.push(`Källavsnitt saknar label: ${source.id} -> ${section.id}`);
      }
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
        if (!isV2Claim(claim) && !claim.text?.trim()) errors.push(`Claim saknar text: ${article.id} -> ${claim.id}`);
        if (!classifications.has(claim.classification)) errors.push(`Claim har okänd klassificering: ${article.id} -> ${claim.id}`);
        const claimSourceIds = Array.isArray(claim.sourceIds) ? claim.sourceIds : [];
        if (claimSourceIds.length === 0) errors.push(`Claim saknar källkoppling: ${article.id} -> ${claim.id}`);
        for (const duplicate of duplicateValues(claimSourceIds)) errors.push(`Duplicerad claim-källreferens: ${article.id} -> ${claim.id} -> ${duplicate}`);
        for (const sourceId of unique(claimSourceIds)) {
          if (!sourceIds.has(sourceId)) errors.push(`Claim refererar till okänd källa: ${article.id} -> ${claim.id} -> ${sourceId}`);
        }
      }
    }
    if (isV2Article(article)) validateV2Article(article, blocks, sourceMap, errors);
  }

  return errors;
}

export function buildKnowledgeSourceImpactIndex(
  articles: readonly KnowledgeArticleContractInput[],
): KnowledgeSourceImpactIndex {
  const index = new Map<string, Map<string, { articleId: string; canonicalPath: string; blockIds: Set<string>; claimIds: Set<string>; surfaceIds: Set<string> }>>();
  const add = (sourceId: string, article: KnowledgeArticleContractInput, blockId?: string, claimId?: string, surfaceId?: string) => {
    const articleKey = `${article.id}|${article.canonicalPath}`;
    const sourceEntries = index.get(sourceId) ?? new Map();
    const entry = sourceEntries.get(articleKey) ?? { articleId: article.id, canonicalPath: article.canonicalPath, blockIds: new Set<string>(), claimIds: new Set<string>(), surfaceIds: new Set<string>() };
    if (blockId) entry.blockIds.add(blockId);
    if (claimId) entry.claimIds.add(claimId);
    if (surfaceId) entry.surfaceIds.add(surfaceId);
    sourceEntries.set(articleKey, entry);
    index.set(sourceId, sourceEntries);
  };

  for (const article of articles) {
    for (const sourceId of article.sourceIds) add(sourceId, article);
    for (const block of article.blocks) {
      for (const sourceId of block.sourceIds) add(sourceId, article, block.id);
      for (const claim of block.claims ?? []) {
        if (isV2Claim(claim)) {
          const surface = article.surfaces?.find((candidate) => candidate.id === claim.surfaceId);
          const surfaceBlockId = surface?.kind === 'block' ? surface.blockId : undefined;
          for (const sourceId of claim.sourceIds) add(sourceId, article, surfaceBlockId, claim.id, claim.surfaceId);
        } else {
          for (const sourceId of claim.sourceIds) add(sourceId, article, block.id, claim.id);
        }
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
        ...(entry.surfaceIds.size > 0 ? { surfaceIds: [...entry.surfaceIds].sort() } : {}),
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
