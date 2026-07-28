export type InternalRoadmapPhaseStatus = 'complete' | 'active' | 'waiting' | 'future';

export type InternalRoadmapPhase = {
  id: string;
  title: string;
  summary: string;
  status: InternalRoadmapPhaseStatus;
  statusLabel: string;
  issueNumbers?: readonly number[];
  blockedByIssueNumbers?: readonly number[];
  duration?: {
    start: string;
    end?: string;
  };
  points: readonly string[];
};

export const internalRoadmap = {
  repository: 'robinstromberg/Egenkontroll',
  goal: {
    eyebrow: 'Målet',
    title: 'Sveriges bästa hjälp med egenkontroll',
    description:
      'En tjänst där små livsmedelsföretag kan förstå vad de behöver göra, genomföra egenkontrollen enkelt och känna sig trygga när kontrollanten kommer.',
  },
  completedStory: [
    {
      title: 'Fungerande appkärna',
      description: 'Dagliga kontroller, avvikelser, historik, KPI, foton och dokumentation.',
    },
    {
      title: 'Tillsyn och rapporter',
      description: 'Inspektörslänk, QR, PDF, CSV, e-post och skrivskyddad dokumentation.',
    },
    {
      title: 'Publik hjälpplattform',
      description: 'Startsida, kunskapsbank, HACCP-sidor, mallar, verktyg och verksamhetssidor.',
    },
    {
      title: 'Hållbar teknisk grund',
      description: 'Separat webb och app, egna domäner, delade paket och automatiska skyddskontroller.',
    },
  ],
  phases: [
    {
      id: 'phase-1',
      title: 'Fas 1 – Styrning',
      summary: 'Strategi, arbetsprinciper och projektets övergripande riktning.',
      status: 'complete',
      statusLabel: 'Klar',
      duration: {
        start: '2026-07-10T15:06:25Z',
        end: '2026-07-10T15:06:49Z',
      },
      points: [
        'Strategiomläggningen dokumenterades.',
        'Projektets övergripande Epic och arbetsprinciper etablerades.',
      ],
    },
    {
      id: 'phase-2',
      title: 'Fas 2 – Inventering',
      summary: 'Kartläggning av innehåll, teknik, routes, varumärkesytor och migrationsbehov.',
      status: 'complete',
      statusLabel: 'Klar',
      duration: {
        start: '2026-07-10T16:43:38Z',
        end: '2026-07-10T17:56:59Z',
      },
      points: [
        'Publika sidor, URL:er och metadata kartlades.',
        'Webb/app-gränser och innehållets framtida placering dokumenterades.',
      ],
    },
    {
      id: 'phase-3',
      title: 'Fas 3 – Produktbeslut',
      summary: 'Positionering, informationsstruktur, visuell riktning och teknisk målbild låstes.',
      status: 'complete',
      statusLabel: 'Klar',
      duration: {
        start: '2026-07-10T18:30:04Z',
        end: '2026-07-10T18:30:12Z',
      },
      points: [
        'Plattformslöfte och publik informationsstruktur beslutades.',
        'HACCP-pilot, sidtyper och teknisk genomförandeordning låstes.',
      ],
    },
    {
      id: 'phase-4',
      title: 'Fas 4 – Struktur och wireframes',
      summary: 'Sidmodeller, användarresor och den visuella riktningen gjordes beslutsmogna.',
      status: 'complete',
      statusLabel: 'Klar',
      duration: {
        start: '2026-07-10T19:23:29Z',
        end: '2026-07-13T11:34:39Z',
      },
      points: [
        'Wireframes för det publika minisystemet togs fram.',
        'Visuella alternativ testades, avvisades eller förfinades tills en riktning kunde väljas.',
      ],
    },
    {
      id: 'phase-5',
      title: 'Fas 5 – Teknisk grund',
      summary: 'Webb och app separerades och gemensamma system, domäner och deployflöden etablerades.',
      status: 'complete',
      statusLabel: 'Klar',
      duration: {
        start: '2026-07-13T12:57:10Z',
        end: '2026-07-23T12:20:58Z',
      },
      points: [
        'Astro-webb och React-app separerades i ett gemensamt monorepo.',
        'Brand-, designsystem-, routing-, domän- och authgränser verifierades.',
      ],
    },
    {
      id: 'phase-5b',
      title: 'Fas 5B – Framtidssäkert visuellt system',
      summary: 'Appens befintliga vyer flyttas till ett centralt tema-, varumärkes- och ikonsystem utan funktionsförändringar.',
      status: 'active',
      statusLabel: 'Pågår',
      issueNumbers: [347, 348, 349, 350, 351, 352],
      blockedByIssueNumbers: [359],
      duration: {
        start: '2026-07-25T14:43:58Z',
      },
      points: [
        'Tema- och brandkontrakt, temaruntime och dagens kontroller är genomförda.',
        'Historik, KPI, delning, inspektörsvy och rapporter är nästa sammanhållna del.',
        'Meny, administration, ikoner och slutlig visuell QA återstår.',
      ],
    },
    {
      id: 'phase-6',
      title: 'Fas 6 – Första kompletta minisystemet',
      summary: 'En sammanhängande publik användarresa från hjälp och resurser till appen finns på plats.',
      status: 'complete',
      statusLabel: 'Funktionellt klar',
      duration: {
        start: '2026-07-13T14:04:20Z',
        end: '2026-07-16T10:01:16Z',
      },
      points: [
        'Startsida, sök, ämnesnav, faktasidor, mall, verktyg och resursbibliotek finns.',
        'Övergången till login och signup är etablerad.',
      ],
    },
    {
      id: 'phase-7',
      title: 'Fas 7 – Innehållsmigration',
      summary: 'Befintligt innehåll flyttas successivt till rätt nya sidmallar och struktur.',
      status: 'waiting',
      statusLabel: 'Påbörjad / väntar',
      issueNumbers: [315, 320, 321, 322, 323, 324],
      blockedByIssueNumbers: [353],
      duration: {
        start: '2026-07-19T09:25:30Z',
      },
      points: [
        'En återanvändbar artikelmodell och den första migrerade artikeln finns.',
        'Nästa större migrationsbatch väntar på webbguardrails i #353.',
      ],
    },
    {
      id: 'phase-8',
      title: 'Fas 8 – Lanseringsberedskap',
      summary: 'Allt som krävs för att riktiga småföretag tryggt ska kunna börja använda och betala för tjänsten.',
      status: 'future',
      statusLabel: 'Inte påbörjad',
      points: [
        'Produktions-QA av kärnflöden och säkerhet.',
        'Onboarding och första användarresan.',
        'Pris, betalning, juridik, support och operativ beredskap.',
        'Grundläggande mätning och verifiering med pilotverksamheter.',
      ],
    },
  ] as readonly InternalRoadmapPhase[],
  destination: {
    eyebrow: 'Roadmapens destination',
    title: 'Min Egenkontroll är förhandslanserad, stabil och redo för riktiga kunder',
    description:
      'Små livsmedelsföretag kan hitta hjälp, skapa konto, komma igång, genomföra egenkontrollen, betala för tjänsten och visa sin dokumentation vid tillsyn.',
    checks: [
      'Användarnyttan är verifierad',
      'Kärnprodukten är stabil',
      'Kundresan fungerar',
      'Tjänsten kan börja växa',
    ],
  },
  afterRoadmap: [
    { title: 'Driva', description: 'Support, stabilitet och löpande kundnytta.' },
    { title: 'Förbättra', description: 'Data, feedback och produktutveckling.' },
    { title: 'Växa', description: 'SEO, fler resurser och fler kunder.' },
  ],
  current: {
    phaseId: 'phase-5b',
    fallbackActiveIssueNumber: 352,
    fallbackActiveIssueTitle: 'Slutför appens visuella guardrails, dokumentation och kvalitetssäkring',
  },
  nextSteps: [
    { issueNumber: 359, text: 'Lösa eller avgränsa Safe Browsing-problemet för säker produktägar-QA.' },
    { issueNumber: 350, text: 'Slutgranska och verifiera historik, KPI, delning och rapporter.' },
    { issueNumber: 351, text: 'Färdigställa meny, administration och ikonlager.' },
  ],
  durationNote:
    'Tidsangivelserna visar ungefärlig kalendertid från första dokumenterade arbete till sista avslutade steg. De är inte tidrapportering och kan innehålla pauser eller överlapp med andra faser.',
} as const;
