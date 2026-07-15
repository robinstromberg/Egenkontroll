export type TemplateFieldDefinition = {
  id: string;
  label: string;
  hint?: string;
  placeholder: string;
  multiline?: boolean;
  fullWidth?: boolean;
};

export type TemplatePageContent = {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumb: readonly { label: string; href?: string }[];
  eyebrow: string;
  heading: string;
  introduction: string;
  adaptationNote: string;
  instructionsTitle: string;
  instructions: readonly string[];
  documentTitle: string;
  documentDescription: string;
  documentFields: readonly TemplateFieldDefinition[];
  entryTitle: string;
  entryFields: readonly TemplateFieldDefinition[];
  addEntryLabel: string;
  example: {
    eyebrow: string;
    title: string;
    introduction: string;
    values: Readonly<Record<string, string>>;
    note: string;
  };
  sources: {
    title: string;
    type: string;
    factCheckedAt: string;
    links: readonly { label: string; url: string }[];
    limitation: string;
  };
  factLink: { href: string; label: string };
  appBridge: { eyebrow: string; title: string; copy: string; href: string; linkLabel: string };
};

export const controlPlanTemplatePage: TemplatePageContent = {
  title: 'Mall för kontrollplan i livsmedelsföretag | Min Egenkontroll',
  description: 'Fyll i och skriv ut en kontrollplansmall för livsmedelsföretag med kontrollområde, metod, ansvar, avvikelse, dokumentation och verifiering.',
  canonicalPath: '/mall-kontrollplan-livsmedel',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'HACCP och riskstyrning', href: '/haccp-sma-livsmedelsforetag' },
    { label: 'Mall för kontrollplan' },
  ],
  eyebrow: 'Ifyllbar mall',
  heading: 'Mall för kontrollplan i livsmedelsföretag',
  introduction: 'Använd mallen för att samla vad verksamheten behöver kontrollera, hur kontrollen görs, vem som ansvarar och hur avvikelser och uppföljning hanteras. Du kan fylla i den direkt i webbläsaren och sedan skriva ut eller spara den som PDF.',
  adaptationNote: 'Kontrollplanen behöver bygga på den egna verksamhetens faror, processer och arbetssätt. Tomma fält för gränser och frekvens ska fyllas med verksamhetens egna bedömningar där de är relevanta. Mallen innehåller inga universella gränsvärden eller frekvenser.',
  instructionsTitle: 'Så använder du mallen',
  instructions: [
    'Fyll först i verksamhetens uppgifter och vem som ansvarar för planen.',
    'Skapa en kontrollpunkt för varje relevant kontrollområde eller processteg.',
    'Anpassa kriterier, tidpunkt, avvikelsehantering och uppföljning till den egna verksamheten.',
    'Välj Skriv ut eller spara PDF när underlaget är klart. Endast själva kontrollplanen följer med i utskriften.',
  ],
  documentTitle: 'Kontrollplan',
  documentDescription: 'Tom mall – fyll i verksamhetens egna uppgifter och kontrollpunkter.',
  documentFields: [
    { id: 'businessName', label: 'Verksamhet', placeholder: 'Fyll i verksamhetens namn' },
    { id: 'planOwner', label: 'Ansvarig för kontrollplanen', placeholder: 'Fyll i roll eller person' },
    { id: 'versionDate', label: 'Version eller datum', placeholder: 'Fyll i version eller datum' },
  ],
  entryTitle: 'Kontrollpunkt',
  entryFields: [
    { id: 'area', label: 'Kontrollområde eller processteg', placeholder: 'Fyll i område eller processteg' },
    { id: 'what', label: 'Vad ska kontrolleras?', placeholder: 'Beskriv vad kontrollen ska visa', multiline: true, fullWidth: true },
    { id: 'method', label: 'Hur utförs kontrollen?', placeholder: 'Beskriv metod eller arbetssätt', multiline: true, fullWidth: true },
    { id: 'criterion', label: 'Eget gränsvärde eller godkännandekriterium', hint: 'Fyll i där det är relevant för verksamheten.', placeholder: 'Fyll i verksamhetens eget kriterium', multiline: true },
    { id: 'responsible', label: 'Ansvarig roll eller person', placeholder: 'Fyll i ansvarig' },
    { id: 'timing', label: 'Verksamhetsanpassad frekvens eller tidpunkt', hint: 'Ingen generell frekvens är förifylld.', placeholder: 'Fyll i när kontrollen ska göras', multiline: true },
    { id: 'deviation', label: 'Vad görs vid avvikelse?', placeholder: 'Beskriv verksamhetens planerade hantering och åtgärd', multiline: true, fullWidth: true },
    { id: 'documentation', label: 'Hur dokumenteras kontroll och åtgärd?', placeholder: 'Beskriv vilket underlag som sparas och hur', multiline: true, fullWidth: true },
    { id: 'verification', label: 'Hur följs arbetssättet upp eller verifieras?', placeholder: 'Beskriv hur verksamheten bedömer att arbetssättet fungerar', multiline: true, fullWidth: true },
  ],
  addEntryLabel: 'Lägg till kontrollpunkt',
  example: {
    eyebrow: 'Illustrativt exempel – inte en färdig kontrollpunkt',
    title: 'Så kan fälten hänga ihop',
    introduction: 'Exemplet visar strukturen i ett resonemang. Formuleringarna är inte myndighetskrav och måste ersättas med verksamhetens egna bedömningar.',
    values: {
      area: 'Varumottagning.',
      what: 'Att den mottagna leveransen uppfyller de krav som verksamheten har fastställt för den aktuella varan.',
      method: 'Utsedd person kontrollerar leveransen enligt verksamhetens egen rutin och noterar relevanta iakttagelser.',
      criterion: 'Verksamhetens eget godkännandekriterium fylls i här när ett sådant behövs.',
      responsible: 'Den roll eller person som verksamheten har utsett.',
      timing: 'Den tidpunkt eller frekvens som verksamheten har bedömt är relevant fylls i här.',
      deviation: 'Ansvarig bedömer den berörda leveransen och följer verksamhetens fastställda rutin för avvikelse och åtgärd.',
      documentation: 'Resultat, avvikelse och vald åtgärd dokumenteras i det underlag som verksamheten använder.',
      verification: 'Verksamheten går igenom relevanta registreringar och avvikelser för att bedöma om arbetssättet fungerar.',
    },
    note: 'Exemplet innehåller medvetet inga generella gränsvärden, frekvenser eller färdiga beslut om åtgärder.',
  },
  sources: {
    title: 'Källor och faktakontroll',
    type: 'Myndighetsvägledning',
    factCheckedAt: '2026-07-15',
    links: [
      { label: 'Livsmedelsverkets Kontrollwiki: HACCP', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp' },
      { label: 'Livsmedelsverkets Kontrollwiki: Grundförutsättningar – allmänna hygienkrav', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/340/allmanna-hygienkrav' },
    ],
    limitation: 'Källorna stödjer att HACCP-baserade förfaranden, dokumentation och journaler ska anpassas till verksamhetens storlek och art. Själva fältindelningen är Min Egenkontrolls praktiska mallstruktur, inte en myndighetsmall eller garanti för efterlevnad.',
  },
  factLink: { href: '/kontrollplan-livsmedel', label: 'Läs faktasidan om kontrollplaner' },
  appBridge: {
    eyebrow: 'När arbetet ska göras löpande',
    title: 'Gör kontroller och avvikelser enklare att följa',
    copy: 'Min Egenkontroll kan samla återkommande kontroller, avvikelser och historik när verksamheten vill arbeta vidare digitalt.',
    href: '/digital-egenkontroll-livsmedel',
    linkLabel: 'Se hur appen fungerar',
  },
};
