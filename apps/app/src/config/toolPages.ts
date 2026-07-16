export type HazardAnalysisToolContent = {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumb: readonly { label: string; href?: string }[];
  eyebrow: string;
  heading: string;
  introduction: string;
  responsibilityNotice: string;
  instructionsTitle: string;
  instructions: readonly string[];
  processStepTitle: string;
  processStepHelp: string;
  hazardTitle: string;
  hazardHelp: string;
  hazardTypes: readonly { value: 'biologisk' | 'kemisk' | 'fysisk'; label: string; help: string }[];
  assessmentOptions: readonly { value: 'ja' | 'nej' | 'osaker'; label: string }[];
  sources: {
    title: string;
    type: string;
    factCheckedAt: string;
    links: readonly { label: string; url: string }[];
    limitation: string;
  };
  relatedLinks: readonly { href: string; title: string; copy: string }[];
  appBridge: { eyebrow: string; title: string; copy: string; href: string; linkLabel: string };
};

export const hazardAnalysisToolContent: HazardAnalysisToolContent = {
  title: 'Faroanalysverktyg för livsmedelsföretag | Min Egenkontroll',
  description: 'Skapa ett eget arbetsutkast till faroanalys med processteg, möjliga faror, kontrollåtgärder, motivering och uppföljning.',
  canonicalPath: '/verktyg-faroanalys-livsmedel',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'HACCP och riskstyrning', href: '/haccp-sma-livsmedelsforetag' },
    { label: 'Faroanalysverktyg' },
  ],
  eyebrow: 'Publikt verktyg',
  heading: 'Bygg ett eget utkast till faroanalys',
  introduction: 'Beskriv verksamhetens processteg och resonera om möjliga biologiska, kemiska och fysiska faror. Verktyget hjälper dig att strukturera dina egna uppgifter och kan skrivas ut som arbetsunderlag – utan konto.',
  responsibilityNotice: 'Du ansvarar själv för bedömningarna. Verktyget avgör inte om en fara är relevant eller betydande, klassar inga kritiska styrpunkter och visar inte att verksamheten uppfyller reglerna. Anpassa alltid underlaget till den egna verksamheten och ta vid behov hjälp av relevant sakkunskap eller kontrollmyndighet.',
  instructionsTitle: 'Arbeta steg för steg',
  instructions: [
    'Beskriv ett processteg så som det faktiskt utförs i verksamheten.',
    'Lägg till möjliga faror och ange vilken typ av fara du överväger.',
    'Resonera med egna ord om sannolikhet, allvarlighet och möjliga kontrollåtgärder.',
    'Gör och motivera din egen bedömning av relevans och betydelse. Verktyget räknar inte fram något svar.',
    'Beskriv uppföljning och avvikelsehantering och skriv sedan ut sammanställningen som A4 eller PDF.',
  ],
  processStepTitle: 'Processteg',
  processStepHelp: 'Ett processteg är en del av verksamhetens faktiska flöde, till exempel mottagning, förvaring, beredning eller servering. Exemplen är hjälptext, inte en färdig processbeskrivning.',
  hazardTitle: 'Möjlig fara',
  hazardHelp: 'Identifiera det som kan ge en negativ hälsoeffekt i just detta processteg. Du avgör själv om faran är relevant och om den är betydande.',
  hazardTypes: [
    { value: 'biologisk', label: 'Biologisk fara', help: 'Exempel på kategori: mikroorganismer eller andra biologiska agens.' },
    { value: 'kemisk', label: 'Kemisk fara', help: 'Exempel på kategori: kemiska ämnen eller allergena faror.' },
    { value: 'fysisk', label: 'Fysisk fara', help: 'Exempel på kategori: främmande föremål som kan skada konsumenten.' },
  ],
  assessmentOptions: [
    { value: 'ja', label: 'Ja – min bedömning' },
    { value: 'nej', label: 'Nej – min bedömning' },
    { value: 'osaker', label: 'Osäker – behöver utredas' },
  ],
  sources: {
    title: 'Källor och faktakontroll',
    type: 'Myndighetsvägledning',
    factCheckedAt: '2026-07-15',
    links: [
      { label: 'Livsmedelsverkets Kontrollwiki: HACCP', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp' },
      { label: 'Livsmedelsverkets Kontrollwiki: HACCP-baserade förfaranden', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/247/k-haccp-baserade-forfaranden' },
    ],
    limitation: 'Livsmedelsverkets vägledning stödjer att faroanalysen ska utgå från verksamhetens processteg, relevanta faror, sannolikhet, allvarlighet och kontrollåtgärder. Fältindelningen och arbetsflödet är Min Egenkontrolls praktiska struktur, inte en myndighetsbedömning eller färdig faroanalys.',
  },
  relatedLinks: [
    { href: '/faroanalys-livsmedel', title: 'Förstå faroanalysen', copy: 'Läs om faror, riskbedömning och kontrollåtgärder innan du börjar.' },
    { href: '/kontrollplan-livsmedel', title: 'Planera kontroller', copy: 'Se hur kontrollpunkter, ansvar och uppföljning kan samlas.' },
    { href: '/mall-kontrollplan-livsmedel', title: 'Använd kontrollplansmallen', copy: 'För över relevanta kontroller till ett ifyllbart arbetsunderlag.' },
  ],
  appBridge: {
    eyebrow: 'När arbetet ska följas löpande',
    title: 'Samla kontroller och avvikelser i appen',
    copy: 'När verksamhetens egna bedömningar är gjorda kan Min Egenkontroll hjälpa till att genomföra och dokumentera återkommande kontroller.',
    href: '/digital-egenkontroll-livsmedel',
    linkLabel: 'Se hur appen fungerar',
  },
};
