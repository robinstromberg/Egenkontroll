export type InternalRoadmapPhase = {
  id: string;
  title: string;
  summary: string;
  issueNumbers?: readonly number[];
  coordinatingIssueNumbers?: readonly number[];
  implementationStages?: readonly (readonly number[])[];
  blockedByIssueNumbers?: readonly number[];
  fixedCompletion?: 'complete';
  planned?: boolean;
  duration?: {
    start: string;
    end?: string;
  };
  points: readonly string[];
};

export type InternalRoadmapTrack = {
  id: string;
  title: string;
  description: string;
  issueNumber: number;
  blockedByIssueNumbers?: readonly number[];
  kind: 'roadmap-follow-up' | 'separate';
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
      fixedCompletion: 'complete',
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
      fixedCompletion: 'complete',
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
      summary: 'Positionering, informationsstruktur, visuell riktning och teknisk målbild.',
      fixedCompletion: 'complete',
      duration: {
        start: '2026-07-10T18:30:04Z',
        end: '2026-07-10T18:30:12Z',
      },
      points: [
        'Plattformslöfte och publik informationsstruktur beslutades.',
        'HACCP-pilot, sidtyper och teknisk genomförandeordning dokumenterades.',
      ],
    },
    {
      id: 'phase-4',
      title: 'Fas 4 – Struktur och wireframes',
      summary: 'Sidmodeller, användarresor och visuell riktning.',
      fixedCompletion: 'complete',
      duration: {
        start: '2026-07-10T19:23:29Z',
        end: '2026-07-13T11:34:39Z',
      },
      points: [
        'Wireframes för det publika minisystemet togs fram.',
        'Visuella alternativ testades och förfinades till en beslutad riktning.',
      ],
    },
    {
      id: 'phase-5',
      title: 'Fas 5 – Teknisk grund',
      summary: 'Separation av webb och app samt gemensamma system, domäner och deployflöden.',
      fixedCompletion: 'complete',
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
      summary: 'Appens befintliga vyer i ett centralt tema-, varumärkes- och ikonsystem utan funktionsförändringar.',
      issueNumbers: [347, 348, 349, 350, 351, 352],
      blockedByIssueNumbers: [359],
      duration: {
        start: '2026-07-25T14:43:58Z',
      },
      points: [
        'Omfattar tema- och brandkontrakt, temaruntime och appens visuella primitiver.',
        'Omfattar dagens kontroller, historik, KPI, delning, rapporter, meny och administration.',
        'Omfattar ikonlager, guardrails, dokumentation och visuell kvalitetssäkring.',
      ],
    },
    {
      id: 'phase-6',
      title: 'Fas 6 – Första kompletta minisystemet',
      summary: 'En sammanhängande publik användarresa från hjälp och resurser till appen.',
      fixedCompletion: 'complete',
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
      issueNumbers: [315, 320, 370, 371, 372, 373, 374, 321, 322, 323, 324],
      coordinatingIssueNumbers: [315, 320],
      implementationStages: [[370], [371], [372, 373], [374]],
      blockedByIssueNumbers: [353],
      duration: {
        start: '2026-07-19T09:25:30Z',
      },
      points: [
        'Huvud- och klusterissues samordnar migrationen men väljs inte som implementerbara arbetssteg.',
        'Det aktuella klustret genomförs i fyra steg: källkontrakt, ämnesnav, två parallellt möjliga innehållsbatcher och slutlig QA.',
        'Webbguardrailen i #353 är den stabila ramen för migrationsbatchernas visuella implementation.',
      ],
    },
    {
      id: 'phase-8',
      title: 'Fas 8 – Lanseringsberedskap',
      summary: 'Det som krävs för att riktiga småföretag tryggt ska kunna börja använda och betala för tjänsten.',
      planned: true,
      points: [
        'Produktions-QA av kärnflöden och säkerhet.',
        'Onboarding och första användarresan.',
        'Pris, betalning, juridik, support och operativ beredskap.',
        'Grundläggande mätning och verifiering med pilotverksamheter.',
      ],
    },
  ] as readonly InternalRoadmapPhase[],
  relatedTracks: [
    {
      id: 'seo-ownership',
      title: 'Entydigt ägarskap för publikt SEO-innehåll',
      description: 'Roadmaprelaterad uppföljning som ska vara genomförd före migrationshuvudspårets slutliga stängning.',
      issueNumber: 375,
      kind: 'roadmap-follow-up',
    },
    {
      id: 'web-visual-finalization',
      title: 'Slutgranskning av webbens visuella system',
      description: 'Roadmapberoende uppföljning som genomförs efter innehållsmigrationen.',
      issueNumber: 354,
      blockedByIssueNumbers: [315],
      kind: 'roadmap-follow-up',
    },
    {
      id: 'missing-control-templates',
      title: 'Saknade kontrollmallar i befintliga verksamheter',
      description: 'Separat produkt- och dataspår som inte styr innehållsmigrationens huvudspår.',
      issueNumber: 364,
      kind: 'separate',
    },
  ] as readonly InternalRoadmapTrack[],
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
  durationNote:
    'Tidsangivelserna visar ungefärlig kalendertid från första dokumenterade arbete till sista avslutade steg. De är inte tidrapportering och kan innehålla pauser eller överlapp med andra faser.',
} as const;
