import {
  buildKnowledgeSourceImpactIndex,
  defaultKnowledgeSourceContractRegistries,
  projectKnowledgeSource,
  validateKnowledgeArticleContracts,
  type KnowledgeArticleContractInput,
  type KnowledgeArticleClaim,
  type KnowledgeArticleClassification,
  type KnowledgeDisclaimerId,
  type KnowledgeLanguagePolicyId,
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
} & (
  | { type: 'prose' | 'fact-box' }
  | {
      type: 'classified';
      classification: KnowledgeArticleClassification;
      classificationLabel: string;
      items?: readonly string[];
    }
);

export type MigratedKnowledgeArticleDefinition = {
  id: string;
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumb: readonly { label: string; href?: string }[];
  eyebrow: string;
  heading: string;
  shortAnswer: string;
  tableOfContentsTitle: string;
  blocks: readonly KnowledgeArticleBlock[];
  sourceSectionTitle: string;
  sourceIds: readonly KnowledgeSourceId[];
  languagePolicyIds: readonly KnowledgeLanguagePolicyId[];
  disclaimerIds: readonly KnowledgeDisclaimerId[];
  aiInterpretation: 'none' | 'human-reviewed';
  relatedLinks: {
    title: string;
    links: readonly { href: string; title: string; copy: string }[];
  };
  appBridge: { eyebrow: string; title: string; copy: string; href: string; linkLabel: string };
};

export type MigratedKnowledgeArticleContent = MigratedKnowledgeArticleDefinition & {
  source: ReturnType<typeof projectKnowledgeSource>;
};

function toMigratedKnowledgeArticleContent(
  article: MigratedKnowledgeArticleDefinition,
): MigratedKnowledgeArticleContent {
  const [primarySourceId] = article.sourceIds;
  if (!primarySourceId) throw new Error(`Migrerad artikel saknar primär källa: ${article.id}`);
  return { ...article, source: projectKnowledgeSource(primarySourceId) };
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

export const migratedKnowledgeArticleDefinitions = [
  personalHygieneArticle,
] as const satisfies readonly KnowledgeArticleContractInput[];

const contractErrors = validateKnowledgeArticleContracts(
  migratedKnowledgeArticleDefinitions,
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
