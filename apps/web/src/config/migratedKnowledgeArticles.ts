export type KnowledgeArticleClassification = 'requirement' | 'guidance' | 'example';

export type KnowledgeArticleBlock = {
  id: string;
  title: string;
  paragraphs: readonly string[];
} & (
  | { type: 'prose' | 'fact-box' }
  | {
      type: 'classified';
      classification: KnowledgeArticleClassification;
      classificationLabel: string;
      items?: readonly string[];
    }
);

export type MigratedKnowledgeArticleContent = {
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
  source: {
    label: string;
    url: string;
    type: 'myndighetsvägledning';
    factCheckedAt: string;
    relevantSections: readonly string[];
    legalReference: string;
    limitation: string;
  };
  relatedLinks: {
    title: string;
    links: readonly { href: string; title: string; copy: string }[];
  };
  appBridge: { eyebrow: string; title: string; copy: string; href: string; linkLabel: string };
};

const personalHygieneArticle: MigratedKnowledgeArticleContent = {
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
      id: 'skillnaden-mellan-krav-och-exempel',
      title: 'Så ska innehållet läsas',
      paragraphs: [
        'Krav beskriver vad reglerna anger. Myndighetsvägledning beskriver hur verksamheten kan bedöma och omsätta kraven. Praktiska exempel är Min Egenkontrolls förslag och måste anpassas till den egna verksamheten.',
      ],
    },
    {
      type: 'classified',
      classification: 'requirement',
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
  source: {
    label: 'Livsmedelsverkets Kontrollwiki: Personlig hygien',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/345/personlig-hygien',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-18',
    relevantSections: ['Artikelhuvud', 'Tips på kontroll'],
    legalReference: 'Förordning (EG) nr 852/2004, bilaga II kapitel VIII',
    limitation: 'Kontrollwiki är Livsmedelsverkets vägledning och är inte bindande i sig. Artikeln ersätter inte den egna verksamhetens riskbedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
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

export const migratedKnowledgeArticles = [
  personalHygieneArticle,
] as const satisfies readonly MigratedKnowledgeArticleContent[];

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
