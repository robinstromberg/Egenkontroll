export type FactPageContent = {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumb: readonly { label: string; href?: string }[];
  eyebrow: string;
  heading: string;
  shortAnswer: string;
  tableOfContentsTitle: string;
  definition: { title: string; paragraphs: readonly string[] };
  workflow: { eyebrow: string; title: string; steps: readonly { title: string; copy: string }[] };
  example: { eyebrow: string; title: string; introduction: string; steps: readonly string[]; noteLabel: string; note: string };
  mistakes: { title: string; items: readonly { title: string; copy: string }[] };
  faq: { title: string; items: readonly { question: string; answer: string }[] };
  sourceSectionTitle: string;
  source: { label: string; url: string; type: 'myndighetsvägledning'; factCheckedAt: string; limitation: string };
  sequentialNextStep: { eyebrow: string; href: string; title: string; copy: string; linkLabel: string };
  appBridge: { eyebrow: string; title: string; copy: string; href: string; linkLabel: string };
};

export const faroanalysFactPage: FactPageContent = {
  title: 'Faroanalys för livsmedelsföretag – enkelt förklarat | Min Egenkontroll',
  description: 'Förstå faroanalys i en liten livsmedelsverksamhet: vilka faror som bedöms, hur de värderas och hur kontrollåtgärder väljs.',
  canonicalPath: '/faroanalys-livsmedel',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'HACCP och riskstyrning', href: '/haccp-sma-livsmedelsforetag' },
    { label: 'Faroanalys' },
  ],
  eyebrow: 'Faroanalys',
  heading: 'Faroanalys för livsmedelsföretag',
  shortAnswer: 'En faroanalys hjälper dig att identifiera vilka faror som kan bli betydande i din egen hantering och att bestämma hur de ska styras. Den ska spegla verksamhetens faktiska processer – inte vara en generell lista som lämnas oanpassad.',
  tableOfContentsTitle: 'På den här sidan',
  definition: {
    title: 'Vad är en faroanalys – och vad är den inte?',
    paragraphs: [
      'Faroanalysen är en del av ett HACCP-baserat arbetssätt. Du går igenom råvaror, hantering och processteg för att bedöma vilka biologiska, kemiska och fysikaliska faror som är relevanta och vilka som behöver styras.',
      'Den är inte ett färdigt myndighetsgodkänt svar. En branschriktlinje eller en generell analys kan vara ett stöd, men behöver anpassas när den egna verksamheten, processen eller målgruppen kräver det.',
    ],
  },
  workflow: { eyebrow: 'Praktisk arbetsgång', title: 'Så kan du gå igenom faroanalysen', steps: [
    { title: 'Beskriv processteget', copy: 'Utgå från vad som faktiskt händer: råvaror, förvaring, beredning, servering och andra steg där hanteringen kan påverka livsmedlet.' },
    { title: 'Identifiera möjliga faror', copy: 'Bedöm relevanta biologiska, kemiska och fysikaliska faror för just steget. Det viktiga är kopplingen till den egna hanteringen.' },
    { title: 'Bedöm sannolikhet och allvarlighet', copy: 'Väg hur sannolikt det är att faran uppstår mot hur allvarlig följden kan bli om den inte styrs.' },
    { title: 'Avgör vilka faror som är betydande', copy: 'Fokusera på faror som behöver styras i verksamheten. Mer detalj är inte automatiskt bättre om den inte hjälper styrningen.' },
    { title: 'Bestäm hur faran styrs', copy: 'Beskriv kontrollåtgärden som håller faran under kontroll och koppla den till den rutin, kontrollpunkt eller det arbetssätt som passar verksamheten.' },
  ] },
  example: {
    eyebrow: 'Exempel, inte färdigt svar',
    title: 'Exempel för en liten verksamhet',
    introduction: 'En mindre lunchservering går igenom steget där mat hanteras före servering. Exemplet visar hur resonemanget kan börja – det är inte en färdig faroanalys eller ett generellt svar för alla verksamheter.',
    steps: [
      'Beskriv vad som hanteras i steget och hur länge maten står framme.',
      'Fundera på vilka biologiska, kemiska eller fysikaliska faror som kan vara relevanta i just den hanteringen.',
      'Bedöm om någon fara behöver särskild styrning och vilken rutin som i så fall kan minska risken.',
      'Skriv ner resonemanget på en nivå som gör att verksamheten kan förklara hur faran hålls under kontroll.',
    ],
    noteLabel: 'Att tänka på:',
    note: 'Förutsättningar, råvaror och arbetssätt avgör vad som är relevant. Anpassa alltid analysen till den egna verksamheten.',
  },
  mistakes: { title: 'Vanliga fel och gränsdragningar', items: [
    { title: 'En generell analys lämnas oanpassad', copy: 'Färdiga underlag kan vara ett stöd, men de behöver spegla den egna processen och de faror som faktiskt kan uppstå där.' },
    { title: 'Onödigt hög detaljnivå', copy: 'Att namnge varje möjlig fara hjälper inte om verksamheten inte kan visa hur relevanta faror styrs. Det ska vara begripligt och användbart.' },
    { title: 'Faror listas utan kontrollåtgärd', copy: 'En lista i sig styr inget. För betydande faror behöver det vara tydligt hur verksamheten håller dem under kontroll.' },
    { title: 'Flexibilitet tolkas som att bedömning inte behövs', copy: 'Mindre verksamheter kan anpassa omfattning och detaljnivå, men relevanta faror behöver fortfarande identifieras och styras.' },
  ] },
  faq: { title: 'Frågor och svar', items: [
    { question: 'Måste en liten verksamhet lista varje bakterie vid namn?', answer: 'Inte alltid. Livsmedelsverkets vägledning beskriver att mindre företag i vissa fall kan beskriva grupper av faror, om de tydligt kan visa hur farorna styrs.' },
    { question: 'Kan jag använda en generell faroanalys?', answer: 'Ja, som stöd. Men när den egna verksamhetens processer eller förutsättningar skiljer sig behöver analysen anpassas.' },
    { question: 'Måste faroanalysen alltid vara skriftlig?', answer: 'Vägledningen anger att företagaren ska kunna visa att relevanta faror har identifierats och kunna redogöra för dem. Om det inte går muntligt tyder det på att skriftligt underlag behövs.' },
  ] },
  sourceSectionTitle: 'Källa och faktakontroll',
  source: {
    label: 'Livsmedelsverkets Kontrollwiki: HACCP',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-14',
    limitation: 'Faktaunderlaget bygger på Livsmedelsverkets vägledning. Vägledningen är inte bindande och Min Egenkontroll ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/seo/kontrollplan.html', title: 'Nästa steg: planera kontroller', copy: 'När farorna är bedömda kan kontrollplanen hjälpa dig att samla kontrollpunkter, ansvar och uppföljning.', linkLabel: 'Till kontrollplanen' },
  appBridge: { eyebrow: 'När arbetet återkommer', title: 'Dokumentera löpande arbete i appen', copy: 'Min Egenkontroll kan stötta återkommande kontroller, avvikelser och historik när verksamheten vill dokumentera sitt löpande arbete.', href: '/digital-egenkontroll-livsmedel', linkLabel: 'Se hur appen fungerar' },
};
