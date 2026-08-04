import {
  buildKnowledgeSourceImpactIndex,
  defaultKnowledgeSourceContractRegistries,
  projectKnowledgeSource,
  validateKnowledgeArticleContracts,
  type KnowledgeArticleContractInput,
  type KnowledgeArticleClaim,
  type KnowledgeArticleClassification,
  type KnowledgeSourcePresentation,
  type KnowledgeSourceId,
} from './knowledgeSourceContract';

export type { KnowledgeArticleClassification } from './knowledgeSourceContract';

export type KnowledgeArticleBlock = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  material: boolean;
  sourceIds: readonly KnowledgeSourceId[];
  claims?: readonly KnowledgeArticleClaim[];
  links?: readonly { href: string; title: string; copy: string }[];
} & (
  | { type: 'prose' | 'fact-box' }
  | {
      type: 'classified';
      classification: KnowledgeArticleClassification;
      classificationLabel: string;
      items?: readonly string[];
    }
);

export type MigratedKnowledgeArticleDefinition = Omit<KnowledgeArticleContractInput, 'blocks'> & {
  breadcrumb: readonly { label: string; href?: string }[];
  eyebrow: string;
  heading: string;
  shortAnswer: string;
  tableOfContentsTitle: string;
  blocks: readonly KnowledgeArticleBlock[];
  sourceSectionTitle: string;
  relatedLinks: {
    title: string;
    links: readonly { href: string; title: string; copy: string }[];
  };
  appBridge: { eyebrow: string; title: string; copy: string; href: string; linkLabel: string };
};

export type MigratedKnowledgeArticleContent = MigratedKnowledgeArticleDefinition & {
  source: KnowledgeSourcePresentation;
  sources: readonly KnowledgeSourcePresentation[];
};

function toMigratedKnowledgeArticleContent(
  article: MigratedKnowledgeArticleDefinition,
): MigratedKnowledgeArticleContent {
  const [primarySourceId] = article.sourceIds;
  if (!primarySourceId) throw new Error(`Migrerad artikel saknar primär källa: ${article.id}`);
  const sources = article.sourceIds.map(projectKnowledgeSource);
  return { ...article, source: sources[0], sources };
}

const personalHygieneArticle: MigratedKnowledgeArticleDefinition = {
  id: 'seo-personlig-hygien-livsmedel',
  title: 'Personlig hygien i livsmedelsverksamhet | Min Egenkontroll',
  description: 'Vad personlig hygien innebär i en livsmedelsverksamhet: renlighet, skyddskläder, rutiner vid sjukdom och praktiska kontrollfrågor.',
  canonicalPath: '/seo/personlig-hygien-livsmedel.html',
  breadcrumb: [
    { label: 'Kunskapsbank', href: '/kunskapsbank' },
    { label: 'Hygien och daglig drift', href: '/seo/hygien-och-daglig-drift.html' },
    { label: 'Personlig hygien' },
  ],
  eyebrow: 'Personlig hygien',
  heading: 'Vad krävs av den personliga hygienen i en livsmedelsverksamhet?',
  shortAnswer: 'Personal som arbetar där livsmedel hanteras ska hålla hög personlig renlighet och bära lämpliga skyddskläder. Verksamheten behöver också kunna hindra att sjukdom eller symtom hos personal medför att livsmedel förorenas.',
  tableOfContentsTitle: 'På den här sidan',
  blocks: [
    {
      type: 'fact-box',
      material: false,
      sourceIds: [],
      id: 'skillnaden-mellan-krav-och-exempel',
      title: 'Så ska innehållet läsas',
      paragraphs: [
        'Krav beskriver vad reglerna anger. Myndighetsvägledning beskriver hur verksamheten kan bedöma och omsätta kraven. Praktiska exempel är Min Egenkontrolls förslag och måste anpassas till den egna verksamheten.',
      ],
    },
    {
      type: 'classified',
      classification: 'requirement',
      material: true,
      sourceIds: ['kontrollwiki:345'],
      classificationLabel: 'Krav enligt reglerna',
      id: 'krav-pa-personlig-hygien',
      title: 'Vilka grundkrav gäller?',
      paragraphs: [
        'Den som arbetar på en plats där livsmedel hanteras ska hålla hög personlig renlighet och bära lämpliga, rena och vid behov skyddande kläder.',
        'Personal med sjukdom eller symtom som kan medföra risk att livsmedel förorenas ska inte hantera livsmedel på ett sätt som skapar en sådan risk.',
      ],
    },
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:345'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'verksamhetens-rutiner',
      title: 'Hur kan verksamheten omsätta kraven?',
      paragraphs: [
        'Livsmedelsverkets vägledning lyfter att verksamheten behöver bedöma om den personliga hygienen fungerar och ge instruktioner som passar arbetsuppgifterna och riskerna i den egna hanteringen.',
        'Rutinen behöver vara begriplig för personalen och göra det tydligt hur sjukdom eller symtom rapporteras och bedöms innan arbetet fortsätter.',
      ],
    },
    {
      type: 'classified',
      classification: 'example',
      material: true,
      sourceIds: ['kontrollwiki:345'],
      classificationLabel: 'Praktiskt exempel',
      id: 'exempel-pa-kontrollfragor',
      title: 'Exempel på frågor i en enkel rutin',
      paragraphs: [
        'Följande frågor är ett praktiskt exempel från Min Egenkontroll, inte en fullständig obligatorisk checklista.',
      ],
      items: [
        'Vet personalen när och hur händerna ska tvättas?',
        'Finns ett tydligt arbetssätt för rena arbets- och skyddskläder?',
        'Vet personalen vem som ska informeras vid sjukdom eller symtom?',
        'Kan ansvarig bedöma om arbetsuppgifter behöver stoppas eller anpassas?',
      ],
    },
  ],
  sourceSectionTitle: 'Källa och faktakontroll',
  sourceIds: ['kontrollwiki:345'],
  languagePolicyIds: ['language-policy:source-classification:v1'],
  disclaimerIds: ['disclaimer:kontrollwiki-guidance:v1'],
  aiInterpretation: 'none',
  relatedLinks: {
    title: 'Relaterade frågor',
    links: [
      { href: '/seo/hygien-och-daglig-drift.html', title: 'Hygien och daglig drift', copy: 'Få en överblick över närliggande hygienrutiner.' },
      { href: '/seo/rengoring-livsmedelsverksamhet.html', title: 'Rengöring', copy: 'Läs hur rengöring och uppföljning hänger ihop.' },
      { href: '/seo/utbildning-livsmedelshygien-personal.html', title: 'Utbildning i livsmedelshygien', copy: 'Se hur instruktioner och kunskap kan anpassas efter arbetsuppgiften.' },
    ],
  },
  appBridge: {
    eyebrow: 'När rutinen ska följas varje dag',
    title: 'Samla återkommande kontroller och avvikelser',
    copy: 'Min Egenkontroll kan hjälpa verksamheten att dokumentera rutiner, utförda kontroller och åtgärder när arbetet behöver följas upp över tid.',
    href: '/digital-egenkontroll-livsmedel',
    linkLabel: 'Se hur appen fungerar',
  },
};

const sourceLanguagePolicyIds = ['language-policy:source-classification:v1'] as const;
const sourceDisclaimerIds = ['disclaimer:kontrollwiki-guidance:v1'] as const;
const standardAppBridge = {
  eyebrow: 'När rutinen ska följas varje dag',
  title: 'Samla återkommande kontroller och avvikelser',
  copy: 'Min Egenkontroll kan hjälpa verksamheten att dokumentera rutiner, utförda kontroller och åtgärder när arbetet behöver följas upp över tid.',
  href: '/digital-egenkontroll-livsmedel',
  linkLabel: 'Se hur appen fungerar',
} as const;

const r02Scope = {
  audience: 'Små livsmedelsverksamheter.',
  applicability: 'Grundförutsättningar som är relevanta för den egna livsmedelshanteringen.',
  conditions: ['Bedöm utifrån verksamhetens hantering, arbetsflöden och risker.'],
  exceptions: ['Ersätter inte verksamhetens egen riskbedömning eller kontrollmyndighetens bedömning i det enskilda fallet.'],
} as const;

const r08Scope = {
  audience: 'Små livsmedelsverksamheter.',
  applicability: 'Lokaler och utrustning i relation till den egna livsmedelshanteringen.',
  conditions: ['Bedöm utifrån faktisk hantering, arbetsflöden och hygienrisker.'],
  exceptions: ['Ersätter inte individuell myndighetsbedömning, projektering, bygglov eller en fullständig kravtolkning.'],
} as const;

const approvedYellowReview = {
  status: 'approved',
  humanReviewer: 'Robin Strömberg',
  approvedBy: 'Robin Strömberg',
  approvedAt: '2026-08-01',
} as const;

const approvedClaim = {
  risk: 'yellow',
  factCheckedAt: '2026-08-01',
  reviewStatus: 'approved',
} as const;

const grunnforutsattningarArticle: MigratedKnowledgeArticleDefinition = {
  governanceVersion: 2,
  id: 'seo-grundforutsattningar-livsmedel',
  title: 'Grundförutsättningar i livsmedelsverksamhet | Min Egenkontroll',
  description: 'Guide till grundförutsättningar i livsmedelsverksamhet: lokaler, utrustning, avfall, transport, personalens kunskap, vatten och is.',
  canonicalPath: '/seo/grundforutsattningar-livsmedel.html',
  breadcrumb: [
    { label: 'Kunskapsbank', href: '/kunskapsbank' },
    { label: 'Grundförutsättningar' },
  ],
  eyebrow: 'Grundförutsättningar',
  heading: 'Det praktiska grundarbetet som får egenkontrollen att fungera',
  shortAnswer: 'Säker mat bygger inte bara på temperaturmätningar och journaler. Lokaler, utrustning, avfall, transporter, kunskap och vatten behöver också fungera i vardagen.',
  tableOfContentsTitle: 'På den här sidan',
  blocks: [
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:246', 'kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'varfor-grundforutsattningar',
      title: 'Grundförutsättningar inom livsmedelshygien',
      paragraphs: [
        'Kontrollwiki beskriver grundförutsättningar som de åtgärder och villkor som behövs för att uppfylla kraven på livsmedelssäkerhet. De ger underlag för ett effektivt genomförande av HACCP.',
        'I Kontrollwikis indelning omfattar grundförutsättningarna områden som verksamhetens struktur, drift, hygien, lagring och transport. På den här sidan behandlas bland annat avfall, lokaler och utrustning, transport, utbildning och vattenförsörjning.',
      ],
      claims: [
        { id: 'r02-claim-title', surfaceId: 'r02-title', classification: 'guidance', reformulationType: 'summary', scope: r02Scope, central: false, sourceIds: ['kontrollwiki:246'], sourceReferences: [{ sourceId: 'kontrollwiki:246', sectionId: 'grundforutsattning-eller-haccp', approvedSourceVersion: '2025-11-18' }], ...approvedClaim },
        { id: 'r02-claim-meta-description', surfaceId: 'r02-meta-description', classification: 'guidance', reformulationType: 'multi-source-synthesis', scope: r02Scope, central: false, sourceIds: ['kontrollwiki:246', 'kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'], sourceReferences: [
          { sourceId: 'kontrollwiki:246', sectionId: 'grundforutsattning-eller-haccp', approvedSourceVersion: '2025-11-18' },
          { sourceId: 'kontrollwiki:341', sectionId: 'hygienisk-hantering', approvedSourceVersion: '2024-01-26' },
          { sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' },
          { sourceId: 'kontrollwiki:350', sectionId: 'allmant-om-livsmedel-under-transport', approvedSourceVersion: '2026-03-06' },
          { sourceId: 'kontrollwiki:351', sectionId: 'utbildning-och-kunskap', approvedSourceVersion: '2026-02-24' },
          { sourceId: 'kontrollwiki:352', sectionId: 'krav-pa-livsmedelsforetag-och-vatten', approvedSourceVersion: '2025-09-30' },
        ], ...approvedClaim },
        { id: 'r02-claim-h1-grundarbete', surfaceId: 'r02-h1', classification: 'guidance', reformulationType: 'summary', scope: r02Scope, central: true, sourceIds: ['kontrollwiki:246'], sourceReferences: [{ sourceId: 'kontrollwiki:246', sectionId: 'grundforutsattning-eller-haccp', approvedSourceVersion: '2025-11-18' }], ...approvedClaim },
        { id: 'r02-claim-kortsvar-grundforutsattningar', surfaceId: 'r02-short-answer', classification: 'guidance', reformulationType: 'multi-source-synthesis', scope: r02Scope, central: true, sourceIds: ['kontrollwiki:246', 'kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'], sourceReferences: [
          { sourceId: 'kontrollwiki:246', sectionId: 'hygien', approvedSourceVersion: '2025-11-18' },
          { sourceId: 'kontrollwiki:246', sectionId: 'grundforutsattning-eller-haccp', approvedSourceVersion: '2025-11-18' },
          { sourceId: 'kontrollwiki:341', sectionId: 'hygienisk-hantering', approvedSourceVersion: '2024-01-26' },
          { sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' },
          { sourceId: 'kontrollwiki:350', sectionId: 'allmant-om-livsmedel-under-transport', approvedSourceVersion: '2026-03-06' },
          { sourceId: 'kontrollwiki:351', sectionId: 'utbildning-och-kunskap', approvedSourceVersion: '2026-02-24' },
          { sourceId: 'kontrollwiki:352', sectionId: 'krav-pa-livsmedelsforetag-och-vatten', approvedSourceVersion: '2025-09-30' },
        ], ...approvedClaim },
        { id: 'r02-claim-varfor-definition', surfaceId: 'r02-block-varfor-grundforutsattningar', classification: 'guidance', reformulationType: 'near-paraphrase', scope: r02Scope, central: true, sourceIds: ['kontrollwiki:246'], sourceReferences: [{ sourceId: 'kontrollwiki:246', sectionId: 'grundforutsattning-eller-haccp', approvedSourceVersion: '2025-11-18' }], ...approvedClaim },
        { id: 'r02-claim-varfor-haccp', surfaceId: 'r02-block-varfor-grundforutsattningar', classification: 'guidance', reformulationType: 'summary', scope: r02Scope, central: true, sourceIds: ['kontrollwiki:246'], sourceReferences: [{ sourceId: 'kontrollwiki:246', sectionId: 'grundforutsattning-eller-haccp', approvedSourceVersion: '2025-11-18' }], ...approvedClaim },
        { id: 'r02-claim-varfor-omradessyntes', surfaceId: 'r02-block-varfor-grundforutsattningar', classification: 'guidance', reformulationType: 'multi-source-synthesis', scope: r02Scope, central: true, sourceIds: ['kontrollwiki:246', 'kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'], sourceReferences: [
          { sourceId: 'kontrollwiki:246', sectionId: 'hygien', approvedSourceVersion: '2025-11-18' },
          { sourceId: 'kontrollwiki:246', sectionId: 'grundforutsattning-eller-haccp', approvedSourceVersion: '2025-11-18' },
          { sourceId: 'kontrollwiki:341', sectionId: 'hygienisk-hantering', approvedSourceVersion: '2024-01-26' },
          { sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' },
          { sourceId: 'kontrollwiki:350', sectionId: 'allmant-om-livsmedel-under-transport', approvedSourceVersion: '2026-03-06' },
          { sourceId: 'kontrollwiki:351', sectionId: 'utbildning-och-kunskap', approvedSourceVersion: '2026-02-24' },
          { sourceId: 'kontrollwiki:352', sectionId: 'krav-pa-livsmedelsforetag-och-vatten', approvedSourceVersion: '2025-09-30' },
        ], ...approvedClaim },
      ],
    },
    {
      type: 'fact-box',
      material: true,
      sourceIds: ['kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'],
      id: 'omraden-i-grundforutsattningarna',
      title: 'Områden i grundförutsättningarna',
      paragraphs: ['Välj det område som bäst motsvarar verksamhetens nästa kontrollfråga.'],
      links: [
        { href: '/seo/lokaler-och-utrustning-livsmedel.html', title: 'Lokaler och utrustning', copy: 'Utformning, material, underhåll och hygieniska arbetsflöden.' },
        { href: '/seo/avfall-livsmedelsverksamhet.html', title: 'Avfall', copy: 'Hygienisk hantering, sopkärl och avfallsutrymmen.' },
        { href: '/seo/transport-av-livsmedel.html', title: 'Transport', copy: 'Skydd mot kontaminering och rätt temperatur under transport.' },
        { href: '/seo/utbildning-livsmedelshygien-personal.html', title: 'Kunskap och utbildning', copy: 'Kunskap och instruktioner anpassade till arbetsuppgifterna.' },
        { href: '/seo/vatten-i-livsmedelsverksamhet.html', title: 'Vatten och is', copy: 'När dricksvatten krävs och hur is behöver hanteras.' },
      ],
      claims: [
        { id: 'r02-claim-kort-lokaler-utrustning', surfaceId: 'r02-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r02Scope, central: false, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r02-claim-kort-avfall', surfaceId: 'r02-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r02Scope, central: false, sourceIds: ['kontrollwiki:341'], sourceReferences: [{ sourceId: 'kontrollwiki:341', sectionId: 'hygienisk-hantering', approvedSourceVersion: '2024-01-26' }, { sourceId: 'kontrollwiki:341', sectionId: 'krav-pa-avfallsutrymmen', approvedSourceVersion: '2024-01-26' }], ...approvedClaim },
        { id: 'r02-claim-kort-transport', surfaceId: 'r02-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r02Scope, central: false, sourceIds: ['kontrollwiki:350'], sourceReferences: [{ sourceId: 'kontrollwiki:350', sectionId: 'allmant-om-livsmedel-under-transport', approvedSourceVersion: '2026-03-06' }], ...approvedClaim },
        { id: 'r02-claim-kort-utbildning', surfaceId: 'r02-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r02Scope, central: false, sourceIds: ['kontrollwiki:351'], sourceReferences: [{ sourceId: 'kontrollwiki:351', sectionId: 'utbildning-och-kunskap', approvedSourceVersion: '2026-02-24' }], ...approvedClaim },
        { id: 'r02-claim-kort-vatten', surfaceId: 'r02-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r02Scope, central: false, sourceIds: ['kontrollwiki:352'], sourceReferences: [{ sourceId: 'kontrollwiki:352', sectionId: 'krav-pa-livsmedelsforetag-och-vatten', approvedSourceVersion: '2025-09-30' }, { sourceId: 'kontrollwiki:352', sectionId: 'vad-galler-for-is', approvedSourceVersion: '2025-09-30' }], ...approvedClaim },
      ],
    },
    {
      type: 'classified',
      classification: 'recommendation',
      material: true,
      sourceIds: ['kontrollwiki:246'],
      classificationLabel: 'Min Egenkontrolls rekommendation',
      id: 'rekommenderade-grundforutsattningar-rutiner',
      title: 'Så kan ni beskriva grundförutsättningarna',
      paragraphs: [
        'Min Egenkontroll rekommenderar att rutiner och kontroller används för att följa upp att grundförutsättningarna fungerar i praktiken och att de beskrivs som fungerande rutiner i verksamheten, inte bara som enstaka kryssrutor.',
      ],
      claims: [{ id: 'r02-claim-rekommenderade-rutiner', surfaceId: 'r02-block-rekommenderade-rutiner', classification: 'recommendation', reformulationType: 'recommendation', scope: r02Scope, central: true, sourceIds: ['kontrollwiki:246'], sourceReferences: [{ sourceId: 'kontrollwiki:246', sectionId: 'grundforutsattning-eller-haccp', approvedSourceVersion: '2025-11-18' }], ...approvedClaim }],
    },
  ],
  sourceSectionTitle: 'Källor och faktakontroll',
  sourceIds: ['kontrollwiki:246', 'kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'],
  languagePolicyIds: sourceLanguagePolicyIds,
  disclaimerIds: sourceDisclaimerIds,
  aiInterpretation: 'none',
  contractKind: 'full',
  scope: r02Scope,
  risk: 'yellow',
  review: approvedYellowReview,
  seo: {
    primaryUserNeed: 'Förstå vilka grundförutsättningar som behöver fungera i den egna livsmedelsverksamheten.',
    pageRole: 'fact-page', searchIntent: 'Förstå grundförutsättningar i livsmedelsverksamhet', primaryTopic: 'Grundförutsättningar',
    relatedPhrases: ['grundförutsättningar livsmedel', 'egenkontroll livsmedel'], topicClusterId: 'prerequisites', structuralParentId: 'kunskapsbank',
    closestRelatedPagePaths: ['/seo/lokaler-och-utrustning-livsmedel.html', '/seo/hygien-och-daglig-drift.html'],
    uniqueValue: 'Samlar de praktiska grundområdena och vägleder vidare till fördjupning.', ownPageRationale: 'Den breda frågan behöver en egen avgränsad introduktion.',
    titleSource: 'article.title', h1SurfaceId: 'r02-h1', metaDescriptionSource: 'article.description', canonicalSource: 'article.canonicalPath', indexingDecision: 'index', sitemapDecision: 'include',
    structuredDataTypes: ['Article', 'BreadcrumbList'], plannedIncomingLinks: ['/kunskapsbank'],
    plannedOutgoingLinks: ['/seo/lokaler-och-utrustning-livsmedel.html', '/seo/avfall-livsmedelsverksamhet.html', '/seo/transport-av-livsmedel.html', '/seo/utbildning-livsmedelshygien-personal.html', '/seo/vatten-i-livsmedelsverksamhet.html', '/seo/hygien-och-daglig-drift.html', '/seo/hantering-och-forvaring-livsmedel.html', '/seo/temperaturprocesser-livsmedel.html', '/kunskapsbank', '/digital-egenkontroll-livsmedel'],
    followUpGoals: ['Granska källstöd och scope vid nästa materiella ändring.'],
  },
  surfaces: [
    { id: 'r02-title', kind: 'title', material: true }, { id: 'r02-meta-description', kind: 'meta-description', material: true }, { id: 'r02-h1', kind: 'h1', material: true }, { id: 'r02-short-answer', kind: 'short-answer', material: true },
    { id: 'r02-block-varfor-grundforutsattningar', kind: 'block', material: true, blockId: 'varfor-grundforutsattningar' }, { id: 'r02-block-omraden', kind: 'block', material: true, blockId: 'omraden-i-grundforutsattningarna' }, { id: 'r02-block-rekommenderade-rutiner', kind: 'block', material: true, blockId: 'rekommenderade-grundforutsattningar-rutiner' },
  ],
  relatedLinks: {
    title: 'Relaterade guider',
    links: [
      { href: '/seo/hygien-och-daglig-drift.html', title: 'Hygien', copy: 'Se dagliga rutiner för personal, rengöring, skadedjur och temperatur.' },
      { href: '/seo/hantering-och-forvaring-livsmedel.html', title: 'Hantering och förvaring', copy: 'Läs om mottagning, separering och skydd mot kontaminering.' },
      { href: '/seo/temperaturprocesser-livsmedel.html', title: 'Temperatur', copy: 'Fördjupa dig i temperaturprocesser och kontroll.' },
      { href: '/kunskapsbank', title: 'Alla guider', copy: 'Utforska fler ämnen i Kunskapsbanken.' },
    ],
  },
  appBridge: standardAppBridge,
};

const hanteringForvaringArticle: MigratedKnowledgeArticleDefinition = {
  id: 'seo-hantering-och-forvaring-livsmedel',
  title: 'Hantering och förvaring av livsmedel | Min Egenkontroll',
  description: 'Guider om varumottagning, korskontamination, separering av råa och ätfärdiga livsmedel, kemikalier och allergenöverföring.',
  canonicalPath: '/seo/hantering-och-forvaring-livsmedel.html',
  breadcrumb: [
    { label: 'Kunskapsbank', href: '/kunskapsbank' },
    { label: 'Hantering och förvaring' },
  ],
  eyebrow: 'Hantering och förvaring',
  heading: 'Skydda livsmedel från mottagning till servering',
  shortAnswer: 'Råvaror och ingredienser behöver skyddas mot kontaminering genom hela hanteringen. Här samlar vi guider om mottagning, förvaring och hur olika risker hålls åtskilda.',
  tableOfContentsTitle: 'På den här sidan',
  blocks: [
    {
      type: 'fact-box',
      material: false,
      sourceIds: [],
      id: 'omraden-i-hantering-och-forvaring',
      title: 'Områden i hantering och förvaring',
      paragraphs: ['Välj den del av flödet som du vill kontrollera eller fördjupa.'],
      links: [
        { href: '/seo/varumottagning-livsmedel.html', title: 'Varumottagning', copy: 'Rätt vara, rätt temperatur, helt emballage och inga spår av skadedjur.' },
        { href: '/seo/korskontamination-livsmedel.html', title: 'Korskontamination', copy: 'Hur råvaror, kemikalier, allergener och färdig mat kan hållas isär.' },
        { href: '/seo/separera-raa-och-atfardiga-livsmedel.html', title: 'Rått och ätfärdigt', copy: 'Praktisk separering även i små kylskåp och mindre kök.' },
        { href: '/seo/kemikalier-i-livsmedelsverksamhet.html', title: 'Kemikalier', copy: 'Hur rengöringsmedel och andra kemikalier förvaras åtskilda från mat.' },
        { href: '/seo/allergenkontamination-livsmedel.html', title: 'Allergenöverföring', copy: 'Förvaring, rengöring och intern märkning för att minska risken.' },
      ],
    },
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:342'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'varfor-flera-rutiner-behovs',
      title: 'Varför behövs flera rutiner?',
      paragraphs: [
        'Kontamination kan ske på olika sätt: genom mikroorganismer, allergener, kemikalier, smuts eller felaktig förvaring.',
      ],
    },
    {
      type: 'classified',
      classification: 'recommendation',
      material: false,
      sourceIds: [],
      classificationLabel: 'Min Egenkontrolls rekommendation',
      id: 'rekommenderad-struktur-for-kontroller',
      title: 'Så kan ni göra egenkontrollen tydligare',
      paragraphs: [
        'Min Egenkontroll rekommenderar att varje risk får en konkret kontrollpunkt och en tydlig åtgärd.',
      ],
    },
  ],
  sourceSectionTitle: 'Källor och faktakontroll',
  sourceIds: ['kontrollwiki:342'],
  languagePolicyIds: sourceLanguagePolicyIds,
  disclaimerIds: sourceDisclaimerIds,
  aiInterpretation: 'none',
  relatedLinks: {
    title: 'Relaterade guider',
    links: [
      { href: '/seo/temperaturkontroll-livsmedel.html', title: 'Temperatur', copy: 'Fördjupa dig i temperatur vid mottagning och förvaring.' },
      { href: '/seo/allergeninformation-restaurang.html', title: 'Allergeninformation', copy: 'Läs om information och rutiner kring allergener.' },
      { href: '/seo/rengoring-livsmedelsverksamhet.html', title: 'Rengöring', copy: 'Se hur rengöring och uppföljning hänger ihop.' },
      { href: '/kunskapsbank', title: 'Alla guider', copy: 'Utforska fler ämnen i Kunskapsbanken.' },
    ],
  },
  appBridge: standardAppBridge,
};

const hygienDagligDriftArticle: MigratedKnowledgeArticleDefinition = {
  id: 'seo-hygien-och-daglig-drift',
  title: 'Hygien och dagliga rutiner i livsmedelsverksamhet | Min Egenkontroll',
  description: 'Guider om personlig hygien, rengöring, skadedjur, temperaturkontroll och allergeninformation för restaurang, café och livsmedelsverksamhet.',
  canonicalPath: '/seo/hygien-och-daglig-drift.html',
  breadcrumb: [
    { label: 'Kunskapsbank', href: '/kunskapsbank' },
    { label: 'Hygien och daglig drift' },
  ],
  eyebrow: 'Hygien och daglig drift',
  heading: 'Rutiner som behöver fungera varje dag',
  shortAnswer: 'Välj en kort, källspårad guide för den rutin som verksamheten behöver förstå eller följa upp.',
  tableOfContentsTitle: 'På den här sidan',
  blocks: [
    {
      type: 'fact-box',
      material: false,
      sourceIds: [],
      id: 'valj-en-daglig-rutin',
      title: 'Välj en daglig rutin',
      paragraphs: ['Varje guide nedan avgränsar ett område och länkar vidare till ett mer detaljerat svar.'],
    },
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:345'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'personlig-hygien-i-driften',
      title: 'Personlig hygien',
      paragraphs: ['Handtvätt, arbetskläder, handskar och rutiner vid symtom eller smitta.'],
      links: [{ href: '/seo/personlig-hygien-livsmedel.html', title: 'Läs om personlig hygien', copy: 'Se grundkrav, vägledning och praktiska kontrollfrågor.' }],
    },
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:346'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'rengoring-i-driften',
      title: 'Rengöring',
      paragraphs: ['Vad som behöver rengöras, hur ofta och hur resultatet kan följas upp.'],
      links: [{ href: '/seo/rengoring-livsmedelsverksamhet.html', title: 'Läs om rengöring', copy: 'Fördjupa dig i rengöring och uppföljning.' }],
    },
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:348'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'skadedjur-i-driften',
      title: 'Skadedjur',
      paragraphs: ['Förebygg problem, upptäck spår och agera när något hittas.'],
      links: [{ href: '/seo/skadedjur-livsmedelsverksamhet.html', title: 'Läs om skadedjur', copy: 'Se hur förebyggande och uppföljning kan avgränsas.' }],
    },
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:349'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'temperatur-i-driften',
      title: 'Temperaturkontroll',
      paragraphs: ['Kylförvaring, mottagning, mätning och fungerande termometrar.'],
      links: [{ href: '/seo/temperaturkontroll-livsmedel.html', title: 'Läs om temperaturkontroll', copy: 'Se hur temperaturer kan tas emot, mätas och följas upp.' }],
    },
    {
      type: 'fact-box',
      material: false,
      sourceIds: [],
      id: 'allergeninformation-i-driften',
      title: 'Allergeninformation',
      paragraphs: ['Läs den separata guiden om information och rutiner kring allergener.'],
      links: [{ href: '/seo/allergeninformation-restaurang.html', title: 'Läs om allergeninformation', copy: 'Gå vidare till den avgränsade guiden.' }],
    },
  ],
  sourceSectionTitle: 'Källor och faktakontroll',
  sourceIds: ['kontrollwiki:345', 'kontrollwiki:346', 'kontrollwiki:348', 'kontrollwiki:349'],
  languagePolicyIds: sourceLanguagePolicyIds,
  disclaimerIds: sourceDisclaimerIds,
  aiInterpretation: 'none',
  relatedLinks: {
    title: 'Fortsätt läsa',
    links: [
      { href: '/digital-egenkontroll-livsmedel', title: 'Digital egenkontroll', copy: 'Dokumentera rutiner och utförda kontroller.' },
      { href: '/avvikelser-korrigerande-atgarder-livsmedel', title: 'Avvikelser', copy: 'Följ upp när en rutin inte fungerar.' },
      { href: '/dokumentation-egenkontroll-livsmedel', title: 'Dokumentation', copy: 'Se hur arbetet kan dokumenteras över tid.' },
      { href: '/kunskapsbank', title: 'Alla guider', copy: 'Utforska fler ämnen i Kunskapsbanken.' },
    ],
  },
  appBridge: standardAppBridge,
};

const lokalerUtrustningArticle: MigratedKnowledgeArticleDefinition = {
  governanceVersion: 2,
  id: 'seo-lokaler-och-utrustning-livsmedel',
  title: 'Lokaler och utrustning för livsmedelsverksamhet | Min Egenkontroll',
  description: 'Guide om lokaler och utrustning i livsmedelsverksamhet: hygienisk utformning, material, underhåll, handfat och ventilation.',
  canonicalPath: '/seo/lokaler-och-utrustning-livsmedel.html',
  breadcrumb: [
    { label: 'Kunskapsbank', href: '/kunskapsbank' },
    { label: 'Grundförutsättningar', href: '/seo/grundforutsattningar-livsmedel.html' },
    { label: 'Lokaler och utrustning' },
  ],
  eyebrow: 'Lokaler och utrustning',
  heading: 'Hur ska en livsmedelslokal och dess utrustning fungera?',
  shortAnswer: 'Lokaler och utrustning behöver göra det möjligt att arbeta hygieniskt, hålla rent, undvika kontaminering och underhålla verksamheten över tid.',
  tableOfContentsTitle: 'På den här sidan',
  blocks: [
    {
      type: 'fact-box',
      material: true,
      sourceIds: ['kontrollwiki:343', 'kontrollwiki:1045', 'kontrollwiki:1046'],
      id: 'omraden-i-lokaler-och-utrustning',
      title: 'Områden att kontrollera',
      paragraphs: ['Välj den underfråga som bäst motsvarar lokalens eller utrustningens aktuella behov.'],
      links: [
        { href: '/seo/materialval-livsmedelslokal.html', title: 'Material och inredning', copy: 'Ytor och material behöver tåla användning och kunna hållas rena där det krävs.' },
        { href: '/seo/underhall-livsmedelslokal.html', title: 'Underhåll', copy: 'Följ upp slitage och skador som kan försvåra rengöring eller medföra risk för kontamination.' },
        { href: '/seo/toalett-och-handfat-livsmedelsverksamhet.html', title: 'Toaletter och handfat', copy: 'Placering och funktion ska stödja god personlig hygien.' },
        { href: '/seo/ventilation-livsmedelsverksamhet.html', title: 'Ventilation', copy: 'Luftflöden, kondens och föroreningar behöver hållas under kontroll.' },
      ],
      claims: [
        { id: 'r08-claim-title', surfaceId: 'r08-title', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: false, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r08-claim-meta-description', surfaceId: 'r08-meta-description', classification: 'guidance', reformulationType: 'multi-source-synthesis', scope: r08Scope, central: false, sourceIds: ['kontrollwiki:343', 'kontrollwiki:1045', 'kontrollwiki:1046'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' }, { sourceId: 'kontrollwiki:1045', sectionId: 'handfat', approvedSourceVersion: '2026-04-13' }, { sourceId: 'kontrollwiki:1046', sectionId: 'ventilation', approvedSourceVersion: '2026-04-13' }], ...approvedClaim },
        { id: 'r08-claim-h1', surfaceId: 'r08-h1', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: true, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r08-short-answer-hygieniskt-arbete', surfaceId: 'r08-short-answer', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: true, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r08-short-answer-rengoring', surfaceId: 'r08-short-answer', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: true, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'inredning-och-materialval', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r08-short-answer-kontamination', surfaceId: 'r08-short-answer', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: true, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r08-short-answer-underhall', surfaceId: 'r08-short-answer', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: true, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'underhall', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r08-omraden-material', surfaceId: 'r08-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: false, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'inredning-och-materialval', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r08-omraden-underhall', surfaceId: 'r08-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: false, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'underhall', approvedSourceVersion: '2026-06-02' }], ...approvedClaim },
        { id: 'r08-omraden-handfat', surfaceId: 'r08-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: false, sourceIds: ['kontrollwiki:1045'], sourceReferences: [{ sourceId: 'kontrollwiki:1045', sectionId: 'handfat', approvedSourceVersion: '2026-04-13' }], ...approvedClaim },
        { id: 'r08-omraden-ventilation', surfaceId: 'r08-block-omraden', classification: 'guidance', reformulationType: 'summary', scope: r08Scope, central: false, sourceIds: ['kontrollwiki:1046'], sourceReferences: [{ sourceId: 'kontrollwiki:1046', sectionId: 'ventilation', approvedSourceVersion: '2026-04-13' }], ...approvedClaim },
      ],
    },
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:343'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'ingen-ritning-passar-alla',
      title: 'Finns en enda ritning som passar alla verksamheter?',
      paragraphs: [
        'Nej. Kontrollwiki beskriver att lokalens lämplighet behöver bedömas utifrån den faktiska verksamheten, arbetsflödena och riskerna.',
      ],
      claims: [{ id: 'r08-ingen-ritning-lamplighet', surfaceId: 'r08-block-ingen-ritning', classification: 'guidance', reformulationType: 'near-paraphrase', scope: r08Scope, central: true, sourceIds: ['kontrollwiki:343'], sourceReferences: [{ sourceId: 'kontrollwiki:343', sectionId: 'lokaler-for-livsmedelsforetagare', approvedSourceVersion: '2026-06-02' }], ...approvedClaim }],
    },
    {
      type: 'classified',
      classification: 'example',
      material: false,
      sourceIds: [],
      classificationLabel: 'Praktiskt exempel',
      id: 'praktiska-kontrollomraden',
      title: 'Praktiska kontrollområden',
      paragraphs: ['Exempel på områden att följa upp i den egna verksamheten:'],
      items: ['Rengörbarhet', 'Arbetsflöden', 'Material', 'Underhåll', 'Handtvätt', 'Ventilation'],
    },
  ],
  sourceSectionTitle: 'Källor och faktakontroll',
  sourceIds: ['kontrollwiki:343', 'kontrollwiki:1045', 'kontrollwiki:1046'],
  languagePolicyIds: sourceLanguagePolicyIds,
  disclaimerIds: sourceDisclaimerIds,
  aiInterpretation: 'none',
  contractKind: 'full',
  scope: r08Scope,
  risk: 'yellow',
  review: approvedYellowReview,
  seo: {
    primaryUserNeed: 'Förstå hur lokaler och utrustning kan stödja hygienisk livsmedelshantering.',
    pageRole: 'fact-page', searchIntent: 'Förstå lokaler och utrustning i livsmedelsverksamhet', primaryTopic: 'Lokaler och utrustning',
    relatedPhrases: ['livsmedelslokal', 'utrustning livsmedel', 'hygienisk utformning'], topicClusterId: 'premises-equipment', structuralParentId: 'seo-grundforutsattningar-livsmedel',
    closestRelatedPagePaths: ['/seo/grundforutsattningar-livsmedel.html', '/seo/rengoring-livsmedelsverksamhet.html'],
    uniqueValue: 'Samlar lokalens och utrustningens hygieniska funktioner och leder till relevanta fördjupningar.', ownPageRationale: 'Frågan behöver ett eget avgränsat svar för verksamhetens lokaler och utrustning.',
    titleSource: 'article.title', h1SurfaceId: 'r08-h1', metaDescriptionSource: 'article.description', canonicalSource: 'article.canonicalPath', indexingDecision: 'index', sitemapDecision: 'include',
    structuredDataTypes: ['Article', 'BreadcrumbList'], plannedIncomingLinks: ['/seo/grundforutsattningar-livsmedel.html'],
    plannedOutgoingLinks: ['/seo/materialval-livsmedelslokal.html', '/seo/underhall-livsmedelslokal.html', '/seo/toalett-och-handfat-livsmedelsverksamhet.html', '/seo/ventilation-livsmedelsverksamhet.html', '/seo/grundforutsattningar-livsmedel.html', '/seo/rengoring-livsmedelsverksamhet.html', '/kunskapsbank', '/digital-egenkontroll-livsmedel'],
    followUpGoals: ['Granska källstöd och scope vid nästa materiella ändring.'],
  },
  surfaces: [
    { id: 'r08-title', kind: 'title', material: true }, { id: 'r08-meta-description', kind: 'meta-description', material: true }, { id: 'r08-h1', kind: 'h1', material: true }, { id: 'r08-short-answer', kind: 'short-answer', material: true },
    { id: 'r08-block-omraden', kind: 'block', material: true, blockId: 'omraden-i-lokaler-och-utrustning' }, { id: 'r08-block-ingen-ritning', kind: 'block', material: true, blockId: 'ingen-ritning-passar-alla' }, { id: 'r08-block-praktiska-kontrollomraden', kind: 'block', material: false, blockId: 'praktiska-kontrollomraden' },
  ],
  relatedLinks: {
    title: 'Relaterade guider',
    links: [
      { href: '/seo/grundforutsattningar-livsmedel.html', title: 'Grundförutsättningar', copy: 'Se hur lokaler och utrustning ingår i det bredare grundarbetet.' },
      { href: '/seo/rengoring-livsmedelsverksamhet.html', title: 'Rengöring', copy: 'Läs om rengöring och uppföljning av hygieniskt resultat.' },
      { href: '/kunskapsbank', title: 'Alla guider', copy: 'Utforska fler ämnen i Kunskapsbanken.' },
    ],
  },
  appBridge: standardAppBridge,
};

export const migratedKnowledgeArticleDefinitions = [
  personalHygieneArticle,
  grunnforutsattningarArticle,
  hanteringForvaringArticle,
  hygienDagligDriftArticle,
  lokalerUtrustningArticle,
] as const satisfies readonly KnowledgeArticleContractInput[];

const contractErrors = validateKnowledgeArticleContracts(
  migratedKnowledgeArticleDefinitions.filter((article) => article.governanceVersion !== 2),
  defaultKnowledgeSourceContractRegistries,
);
if (contractErrors.length > 0) {
  throw new Error(`Kunskapsartikelkontraktet är inte giltigt:\n- ${contractErrors.join('\n- ')}`);
}

export const migratedKnowledgeArticles = migratedKnowledgeArticleDefinitions.map(toMigratedKnowledgeArticleContent) as readonly MigratedKnowledgeArticleContent[];

export const migratedKnowledgeArticleSourceImpactIndex = buildKnowledgeSourceImpactIndex(migratedKnowledgeArticleDefinitions);

export const migratedKnowledgeArticleByPath = new Map<string, MigratedKnowledgeArticleContent>(
  migratedKnowledgeArticles.map((article) => [article.canonicalPath, article]),
);

if (migratedKnowledgeArticleByPath.size !== migratedKnowledgeArticles.length) {
  throw new Error('Migrerade kunskapsartiklar innehåller duplicerade canonical-paths.');
}

for (const article of migratedKnowledgeArticles) {
  if (!/^\/seo\/[^/]+\.html$/.test(article.canonicalPath)) {
    throw new Error(`Migrerad kunskapsartikel måste använda /seo/<fil>.html: ${article.canonicalPath}`);
  }
}
