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

const grunnforutsattningarArticle: MigratedKnowledgeArticleDefinition = {
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
      type: 'fact-box',
      material: false,
      sourceIds: [],
      id: 'omraden-i-grundforutsattningarna',
      title: 'Områden i grundförutsättningarna',
      paragraphs: ['Välj det område som bäst motsvarar verksamhetens nästa kontrollfråga.'],
      links: [
        { href: '/seo/lokaler-och-utrustning-livsmedel.html', title: 'Lokaler och utrustning', copy: 'Utformning, material, underhåll och hygieniska arbetsflöden.' },
        { href: '/seo/avfall-livsmedelsverksamhet.html', title: 'Avfall', copy: 'Hygienisk hantering, sopkärl och avfallsutrymmen.' },
        { href: '/seo/transport-av-livsmedel.html', title: 'Transport', copy: 'Skydd mot kontaminering och rätt temperatur under transport.' },
        { href: '/seo/utbildning-livsmedelshygien-personal.html', title: 'Kunskap och utbildning', copy: 'Rätt kunskap för rätt uppgift utan onödiga formkrav.' },
        { href: '/seo/vatten-i-livsmedelsverksamhet.html', title: 'Vatten och is', copy: 'När dricksvatten krävs och hur is behöver hanteras.' },
      ],
    },
    {
      type: 'classified',
      classification: 'guidance',
      material: true,
      sourceIds: ['kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'],
      classificationLabel: 'Myndighetsvägledning',
      id: 'varfor-grundforutsattningar',
      title: 'Varför är det här ett eget område?',
      paragraphs: [
        'Grundförutsättningar minskar riskerna innan en enskild kontrollpunkt ens uppstår. Därför behöver de beskrivas som fungerande rutiner i verksamheten, inte bara som enstaka kryssrutor.',
      ],
    },
  ],
  sourceSectionTitle: 'Källor och faktakontroll',
  sourceIds: ['kontrollwiki:341', 'kontrollwiki:343', 'kontrollwiki:350', 'kontrollwiki:351', 'kontrollwiki:352'],
  languagePolicyIds: sourceLanguagePolicyIds,
  disclaimerIds: sourceDisclaimerIds,
  aiInterpretation: 'none',
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
        'Kontamination kan ske på olika sätt: genom mikroorganismer, allergener, kemikalier, smuts eller felaktig förvaring. Därför blir egenkontrollen tydligare när varje risk har en konkret kontrollpunkt och en tydlig åtgärd.',
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
      material: false,
      sourceIds: [],
      id: 'omraden-i-lokaler-och-utrustning',
      title: 'Områden att kontrollera',
      paragraphs: ['Välj den underfråga som bäst motsvarar lokalens eller utrustningens aktuella behov.'],
      links: [
        { href: '/seo/materialval-livsmedelslokal.html', title: 'Material och inredning', copy: 'Ytor och material behöver tåla användning och kunna hållas rena där det krävs.' },
        { href: '/seo/underhall-livsmedelslokal.html', title: 'Underhåll', copy: 'Slitage och skador får inte utvecklas till hygienrisker.' },
        { href: '/seo/toalett-och-handfat-livsmedelsverksamhet.html', title: 'Toaletter och handfat', copy: 'Placering och funktion ska stödja god personlig hygien.' },
        { href: '/seo/ventilation-livsmedelsverksamhet.html', title: 'Ventilation', copy: 'Luftflöden, kondens och föroreningar behöver hållas under kontroll.' },
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
        'Nej. Lokalen ska vara lämplig för den faktiska verksamheten. Kraven behöver bedömas utifrån vad som hanteras, hur arbetsflödena ser ut och vilka risker som finns.',
      ],
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
  sourceIds: ['kontrollwiki:343'],
  languagePolicyIds: sourceLanguagePolicyIds,
  disclaimerIds: sourceDisclaimerIds,
  aiInterpretation: 'none',
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
