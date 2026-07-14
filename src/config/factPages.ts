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
  example: { eyebrow: string; title: string; introduction: string; fields: readonly { label: string; value: string }[]; noteLabel: string; note: string };
  mistakes: { title: string; items: readonly { title: string; copy: string }[] };
  faq: { title: string; items: readonly { question: string; answer: string }[] };
  sourceSectionTitle: string;
  source: { label: string; url: string; type: 'myndighetsvägledning'; factCheckedAt: string; limitation: string };
  additionalSources?: readonly { label: string; url: string }[];
  relatedLinks?: { title: string; links: readonly { href: string; title: string; copy: string }[] };
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
    eyebrow: 'Illustrativt exempel – måste anpassas',
    title: 'Exempel: skivning av ätfärdiga livsmedel',
    introduction: 'En liten verksamhet använder en skärmaskin för ätfärdiga livsmedel. Nedan visas hur ett första faroanalysutkast kan se ut. Bedömningen är illustrativ och måste anpassas till den faktiska verksamheten.',
    fields: [
      { label: 'Processteg', value: 'Skivning av ätfärdiga livsmedel i skärmaskin.' },
      { label: 'Identifierad fara', value: 'Listeria monocytogenes – biologisk fara.' },
      { label: 'Varför faran är relevant', value: 'Skärmaskinen kommer i kontakt med ätfärdiga livsmedel. Kontrollwiki använder just detta processteg som exempel där rengöring behöver styra listeriafaran.' },
      { label: 'Exempelbedömning', value: 'Verksamheten bedömer att faran behöver styras om rengöringen inte fungerar. Detta är verksamhetens illustrativa bedömning, inte ett generellt myndighetsbeslut.' },
      { label: 'Kontrollåtgärd', value: 'Noggrann rengöring av skärmaskinen.' },
      { label: 'Kontroll/uppföljning', value: 'Särskild kontroll av att rengöringen har utförts.' },
      { label: 'Slutsats i exemplet', value: 'Faran behöver hanteras i verksamhetens faroanalys. Om åtgärden ska klassas som grundförutsättning, styrbar grundförutsättning eller på annat sätt måste avgöras utifrån den egna processen och riskbedömningen.' },
    ],
    noteLabel: 'Avslutande not:',
    note: 'Exemplet visar strukturen i ett resonemang. Det anger inget generellt gränsvärde och är inte en färdig eller myndighetsgodkänd faroanalys.',
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
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/kontrollplan-livsmedel', title: 'Nästa steg: planera kontroller', copy: 'När farorna är bedömda kan kontrollplanen hjälpa dig att samla kontrollpunkter, ansvar och uppföljning.', linkLabel: 'Till kontrollplanen' },
  appBridge: { eyebrow: 'När arbetet återkommer', title: 'Dokumentera löpande arbete i appen', copy: 'Min Egenkontroll kan stötta återkommande kontroller, avvikelser och historik när verksamheten vill dokumentera sitt löpande arbete.', href: '/digital-egenkontroll-livsmedel', linkLabel: 'Se hur appen fungerar' },
};

export const kontrollplanFactPage: FactPageContent = {
  title: 'Kontrollplan för livsmedelsföretag | Min Egenkontroll',
  description: 'Förstå hur en kontrollplan kan samla rutiner, ansvar, uppföljning och dokumentation i en liten livsmedelsverksamhet.',
  canonicalPath: '/kontrollplan-livsmedel',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'HACCP och riskstyrning', href: '/haccp-sma-livsmedelsforetag' },
    { label: 'Kontrollplan' },
  ],
  eyebrow: 'Kontrollplan',
  heading: 'Kontrollplan för livsmedelsföretag',
  shortAnswer: 'En kontrollplan gör det lättare att samla vad som behöver följas upp i den egna verksamheten, vem som ansvarar och hur resultat eller avvikelser tas om hand. Den behöver anpassas till verksamhetens faktiska risker och arbetssätt.',
  tableOfContentsTitle: 'På den här sidan',
  definition: {
    title: 'Vad är en kontrollplan?',
    paragraphs: [
      'I den egna verksamheten kan en kontrollplan vara ett praktiskt sätt att samla rutiner och kontroller som hjälper till att hålla livsmedel säkra. Den kan koppla ihop faroanalys, grundförutsättningar, övervakning, åtgärder och uppföljning.',
      'Planen är inte en färdig myndighetsmall som passar alla. Livsmedelsverkets vägledning beskriver att HACCP-baserade förfaranden och dokumentation ska anpassas till verksamhetens storlek och art, samtidigt som relevanta faror behöver kunna styras och följas upp.',
    ],
  },
  workflow: { eyebrow: 'Praktisk arbetsgång', title: 'Så kan du bygga upp en användbar kontrollplan', steps: [
    { title: 'Utgå från den egna hanteringen', copy: 'Beskriv de rutiner och processteg som faktiskt finns i verksamheten. Använd faroanalysen och de grundförutsättningar som redan gäller som utgångspunkt.' },
    { title: 'Välj vad som behöver följas upp', copy: 'Gör det tydligt vilka kontroller som hör till respektive rutin eller betydande fara. Om ett steg kräver övervakning behöver arbetssättet fungera i vardagen.' },
    { title: 'Sätt ansvar och tillfälle', copy: 'Ange vem som gör kontrollen och när eller i vilken situation den ska göras. Anpassa upplägget så att det går att följa även när tempot är högt.' },
    { title: 'Beskriv vad som händer vid avvikelse', copy: 'Koppla kontrollen till en relevant åtgärd när något inte fungerar som avsett. Bedömningen och åtgärden behöver passa den aktuella verksamheten och situationen.' },
    { title: 'Följ upp och uppdatera', copy: 'Gå igenom om rutinerna fungerar, och se över planen när verksamheten eller förutsättningarna ändras. Spara den dokumentation som behövs för att kunna följa arbetet.' },
  ] },
  example: {
    eyebrow: 'Illustrativt exempel – måste anpassas',
    title: 'Exempel: en punkt i en enkel kontrollplan',
    introduction: 'Exemplet visar hur en verksamhet skulle kunna strukturera en kontrollpunkt. Det är inte ett myndighetskrav, ett gränsvärde eller en färdig kontrollplan.',
    fields: [
      { label: 'Område', value: 'Rengöring av en arbetsyta som används vid hantering av ätfärdiga livsmedel.' },
      { label: 'Vad verksamheten följer upp', value: 'Att den egna rengöringsrutinen har följts och att arbetsytan är i det skick verksamheten har bestämt.' },
      { label: 'Ansvar', value: 'Den person som har utsetts i verksamhetens egen rutin.' },
      { label: 'När', value: 'Vid det tillfälle som verksamheten själv har bestämt utifrån sin hantering.' },
      { label: 'Om något inte fungerar', value: 'Verksamheten stoppar eller rättar till det som behövs, dokumenterar när det är relevant och ser över om rutinen behöver ändras.' },
      { label: 'Uppföljning', value: 'Ansvarig går regelbundet igenom om rutinen och åtgärderna fungerar i praktiken.' },
    ],
    noteLabel: 'Viktigt:',
    note: 'Valet av kontrollpunkt, ansvar, frekvens och åtgärd är illustrativa antaganden. De måste bedömas mot den egna verksamheten, dess faroanalys och tillämpliga krav.',
  },
  mistakes: { title: 'Vanliga fallgropar', items: [
    { title: 'Planen är kopierad men inte anpassad', copy: 'Ett färdigt underlag kan vara ett stöd, men behöver spegla den egna verksamhetens hantering, risker och rutiner.' },
    { title: 'Kontrollen går inte att utföra i vardagen', copy: 'En plan hjälper först när den är begriplig för dem som ska använda den och passar verksamhetens faktiska arbetssätt.' },
    { title: 'Avvikelser saknar nästa steg', copy: 'Det behöver vara tydligt hur verksamheten reagerar när en kontroll visar att något inte fungerar som avsett.' },
    { title: 'Planen uppdateras inte', copy: 'Förändringar i råvaror, processer, utrustning eller hantering kan innebära att riskbedömning och rutiner behöver ses över.' },
  ] },
  faq: { title: 'Frågor och svar', items: [
    { question: 'Är en kontrollplan samma sak som en faroanalys?', answer: 'Nej. Faroanalysen hjälper till att identifiera och bedöma faror. Kontrollplanen kan vara ett praktiskt sätt att samla hur relevanta rutiner och kontroller ska genomföras och följas upp.' },
    { question: 'Måste alla kontroller dokumenteras på samma sätt?', answer: 'Nej. Livsmedelsverkets vägledning beskriver att dokumentation och journaler ska anpassas till verksamhetens storlek och art, men vara tillräckliga för att visa att de HACCP-baserade förfarandena finns och upprätthålls.' },
    { question: 'När behöver kontrollplanen ses över?', answer: 'När den inte längre speglar hur verksamheten fungerar, eller när en förändring kan påverka risker, rutiner eller kontrollåtgärder. Vilken uppföljning som behövs beror på den egna verksamheten.' },
  ] },
  sourceSectionTitle: 'Källor och faktakontroll',
  source: {
    label: 'Livsmedelsverkets Kontrollwiki: HACCP',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-14',
    limitation: 'Vägledningen är inte bindande och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  additionalSources: [{ label: 'Livsmedelsverkets Kontrollwiki: HACCP-baserade förfaranden', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/247/k-haccp-baserade-forfaranden' }],
  relatedLinks: { title: 'Fördjupa nästa steg', links: [
    { href: '/haccp-sma-livsmedelsforetag', title: 'HACCP och riskstyrning', copy: 'Se hur arbetskedjan hänger ihop för små livsmedelsverksamheter.' },
    { href: '/faroanalys-livsmedel', title: 'Faroanalys', copy: 'Identifiera och bedöm faror i den egna hanteringen.' },
    { href: '/kritiska-gransvarden-livsmedel', title: 'Kritiska gränsvärden', copy: 'Läs om hur gränser och övervakning hör ihop i HACCP-arbetet.' },
  ] },
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/avvikelser-korrigerande-atgarder-livsmedel', title: 'Nästa steg: hantera avvikelser', copy: 'När kontrollerna är planerade behöver det vara tydligt vad som händer när en kritisk gräns eller rutin inte uppfylls.', linkLabel: 'Till avvikelser och åtgärder' },
  appBridge: { eyebrow: 'När arbetet återkommer', title: 'Dokumentera löpande arbete i appen', copy: 'Min Egenkontroll kan stötta återkommande kontroller, avvikelser och historik när rutinerna ska följas upp.', href: '/digital-egenkontroll-livsmedel', linkLabel: 'Se hur appen fungerar' },
};

export const kritiskaGransvardenFactPage: FactPageContent = {
  title: 'Kritiska gränsvärden för livsmedelsföretag | Min Egenkontroll',
  description: 'Förstå kritiska gränsvärden i HACCP: när de används, hur de följs upp och vad som behöver hända vid en avvikelse.',
  canonicalPath: '/kritiska-gransvarden-livsmedel',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'HACCP och riskstyrning', href: '/haccp-sma-livsmedelsforetag' },
    { label: 'Kritiska gränsvärden' },
  ],
  eyebrow: 'Kritiska gränsvärden',
  heading: 'Kritiska gränsvärden i livsmedelsverksamheten',
  shortAnswer: 'Ett kritiskt gränsvärde är en mätbar eller observerbar gräns vid en kritisk styrpunkt. Den visar om processen är under kontroll och skiljer en acceptabel nivå från en oacceptabel nivå. Gränsen behöver passa den fara och den process som verksamheten faktiskt styr.',
  tableOfContentsTitle: 'På den här sidan',
  definition: {
    title: 'Vad är ett kritiskt gränsvärde?',
    paragraphs: [
      'Kritiska gränsvärden används i HACCP-arbetet när en kritisk styrpunkt har identifierats. De hjälper verksamheten att avgöra om den kontrollåtgärd som styr en betydande fara fungerar som avsett.',
      'Ett kritiskt gränsvärde är inte automatiskt samma sak som ett gränsvärde i lagstiftning eller ett generellt riktvärde. Vilken parameter som följs och var gränsen sätts behöver bygga på den egna faroanalysen, processen och det underlag som är relevant för verksamheten.',
    ],
  },
  workflow: { eyebrow: 'Praktisk arbetsgång', title: 'Så hänger gräns, övervakning och åtgärd ihop', steps: [
    { title: 'Börja med faroanalysen', copy: 'Kritiska gränsvärden hör till kritiska styrpunkter. Utgå från den fara som behöver styras och den kontrollåtgärd som ska hålla faran under kontroll.' },
    { title: 'Välj en relevant styrparameter', copy: 'Parametern behöver kunna visa om processen fungerar. Den kan vara mätbar eller observerbar, beroende på vad som faktiskt styrs.' },
    { title: 'Fastställ gränsen för den egna processen', copy: 'Använd underlag som är relevant för produkten och processen. Ett värde eller villkor från ett annat sammanhang är inte automatiskt rätt för den egna verksamheten.' },
    { title: 'Bestäm hur den övervakas', copy: 'Beskriv vad som kontrolleras, hur kontrollen görs, vem som ansvarar och när den ska ske så att ett avsteg kan upptäckas i tid.' },
    { title: 'Koppla till korrigerande åtgärder', copy: 'Det ska vara klart vad verksamheten gör om gränsen inte uppfylls, både för berörd produkt och för att återställa processen.' },
  ] },
  example: {
    eyebrow: 'Illustrativt exempel – måste anpassas',
    title: 'Exempel: en kritisk gräns utan angivet tal',
    introduction: 'En verksamhet har, utifrån sin egen faroanalys, identifierat ett processteg som en kritisk styrpunkt. Exemplet visar strukturen i ett underlag och anger inget myndighetsvärde eller färdigt gränsvärde.',
    fields: [
      { label: 'Kritisk styrpunkt', value: 'Ett processteg där verksamheten behöver styra en identifierad fara.' },
      { label: 'Styrparameter', value: 'En parameter som verksamheten har bedömt visar att kontrollåtgärden fungerar.' },
      { label: 'Kritisk gräns', value: 'Den gräns som verksamheten har fastställt för just sin process med stöd av relevant underlag.' },
      { label: 'Övervakning', value: 'En planerad kontroll av parametern med tydligt ansvar och tillfälle.' },
      { label: 'Vid avsteg', value: 'Verksamheten säkrar berörd produkt, återställer processen och undersöker orsaken enligt sin egen rutin.' },
      { label: 'Uppföljning', value: 'Ansvarig kontrollerar att övervakningen och åtgärderna fungerar över tid.' },
    ],
    noteLabel: 'Viktigt:',
    note: 'Exemplet är en praktisk illustration. Det innehåller inte ett generellt gränsvärde och ersätter inte verksamhetens egen bedömning, relevant lagstiftning eller kontrollmyndighetens bedömning.',
  },
  mistakes: { title: 'Vanliga fallgropar', items: [
    { title: 'Ett lagstadgat gränsvärde används utan gränsdragning', copy: 'Gränsvärden i lagstiftning och kritiska gränser i HACCP kan ha olika funktioner. Kontrollera vilket underlag som är relevant för den aktuella faran och processen.' },
    { title: 'En gräns kopieras från en annan verksamhet', copy: 'En generell mall eller ett exempel kan vara ett stöd, men behöver bedömas mot den egna produktens, utrustningens och processens förutsättningar.' },
    { title: 'Övervakning saknar åtgärd vid avsteg', copy: 'En kontroll hjälper inte om det är oklart vad som händer när gränsen inte uppfylls. Åtgärden behöver omfatta både produkt och process när det är relevant.' },
    { title: 'En vanlig rutin kallas kritisk styrpunkt utan bedömning', copy: 'Kritiska gränsvärden används där faroanalysen har visat att en kritisk styrpunkt behövs. Alla rutiner är inte kritiska styrpunkter.' },
  ] },
  faq: { title: 'Frågor och svar', items: [
    { question: 'Måste ett kritiskt gränsvärde alltid vara ett tal?', answer: 'Nej. Livsmedelsverkets vägledning beskriver att kritiska gränser kan vara mätbara eller observerbara. Det avgörande är att de kan visa om den kritiska styrpunkten är under kontroll.' },
    { question: 'Är ett kritiskt gränsvärde samma sak som ett gränsvärde i lagstiftningen?', answer: 'Inte nödvändigtvis. Ett kritiskt gränsvärde är en del av verksamhetens HACCP-baserade styrning, medan gränsvärden i lagstiftning kan ha en annan funktion. Bedömningen behöver göras i rätt sammanhang.' },
    { question: 'Vad gör jag när en kritisk gräns inte uppfylls?', answer: 'Det bör framgå av verksamhetens planerade korrigerande åtgärder. Livsmedelsverkets vägledning lyfter både att processen ska återställas och att berörd produkt ska hanteras så att den inte går vidare när den inte uppfyller kraven.' },
  ] },
  sourceSectionTitle: 'Källor och faktakontroll',
  source: {
    label: 'Livsmedelsverkets Kontrollwiki: HACCP',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-14',
    limitation: 'Vägledningen är inte bindande och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  additionalSources: [{ label: 'Livsmedelsverkets Kontrollwiki: HACCP-baserade förfaranden', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/247/k-haccp-baserade-forfaranden' }],
  relatedLinks: { title: 'Fördjupa nästa steg', links: [
    { href: '/haccp-sma-livsmedelsforetag', title: 'HACCP och riskstyrning', copy: 'Se hur faroanalys, styrning och uppföljning hänger ihop.' },
    { href: '/faroanalys-livsmedel', title: 'Faroanalys', copy: 'Identifiera vilka faror som behöver styras i den egna hanteringen.' },
    { href: '/kontrollplan-livsmedel', title: 'Kontrollplan', copy: 'Samla kontrollpunkter, ansvar och uppföljning i ett praktiskt underlag.' },
    { href: '/avvikelser-korrigerande-atgarder-livsmedel', title: 'Avvikelser och korrigerande åtgärder', copy: 'Agera när en kritisk gräns eller rutin inte uppfylls.' },
  ] },
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/kontrollplan-livsmedel', title: 'Nästa steg: samla kontrollen', copy: 'När gränser och övervakning är tydliga kan kontrollplanen hjälpa till att samla ansvar, uppföljning och åtgärder.', linkLabel: 'Till kontrollplanen' },
  appBridge: { eyebrow: 'När arbetet återkommer', title: 'Dokumentera löpande arbete i appen', copy: 'Min Egenkontroll kan stötta återkommande kontroller, avvikelser och historik när rutinerna ska följas upp.', href: '/digital-egenkontroll-livsmedel', linkLabel: 'Se hur appen fungerar' },
};

export const avvikelserFactPage: FactPageContent = {
  title: 'Avvikelser och korrigerande åtgärder | Min Egenkontroll',
  description: 'Förstå hur avvikelser, korrigerande åtgärder och uppföljning hänger ihop i en liten livsmedelsverksamhet.',
  canonicalPath: '/avvikelser-korrigerande-atgarder-livsmedel',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'HACCP och riskstyrning', href: '/haccp-sma-livsmedelsforetag' },
    { label: 'Avvikelser och korrigerande åtgärder' },
  ],
  eyebrow: 'Avvikelser och åtgärder',
  heading: 'Avvikelser och korrigerande åtgärder i livsmedelsverksamheten',
  shortAnswer: 'En avvikelse är ett tecken på att en kritisk gräns eller en egen rutin inte har följts som avsett. En korrigerande åtgärd är det planerade agerandet för att hantera berörd produkt, återställa processen och minska risken att problemet återkommer. Uppföljningen visar om åtgärderna fungerade.',
  tableOfContentsTitle: 'På den här sidan',
  definition: {
    title: 'Avvikelse, korrigerande åtgärd och uppföljning',
    paragraphs: [
      'I HACCP-arbetet ska korrigerande åtgärder vara planerade för varje kritisk styrpunkt, så att de kan vidtas direkt när övervakningen visar ett avsteg från en kritisk gräns. Åtgärderna kan gälla både livsmedlet och processen.',
      'I den löpande verksamheten används ordet avvikelse ofta också när en egen rutin inte fungerar som avsett. Oavsett vad som har brustit behöver verksamheten bedöma situationen, agera på det som berörs och följa upp att arbetssättet fungerar igen.',
    ],
  },
  workflow: { eyebrow: 'Praktisk arbetsgång', title: 'Så kan du hantera en avvikelse', steps: [
    { title: 'Upptäck och avgränsa', copy: 'Notera vilket processteg eller vilken rutin som inte fungerar som avsett. Bedöm vad som berörs och om processen behöver stoppas eller säkras.' },
    { title: 'Hantera berörd produkt', copy: 'Säkerställ att livsmedel som kan vara berörda inte går vidare innan verksamheten har gjort den bedömning och hantering som situationen kräver.' },
    { title: 'Återställ processen', copy: 'Genomför den planerade korrigerande åtgärden så att den kritiska styrpunkten eller rutinen åter fungerar som avsett.' },
    { title: 'Bedöm orsaken', copy: 'Undersök vad som bidrog till avvikelsen. Syftet är att välja en rimlig åtgärd som minskar risken att samma problem upprepas.' },
    { title: 'Följ upp och dokumentera', copy: 'Kontrollera att åtgärderna fungerade och spara den information som behövs för att kunna följa händelsen och arbetssättet över tid.' },
  ] },
  example: {
    eyebrow: 'Illustrativt exempel – måste anpassas',
    title: 'Exempel: en avvikelse i ett kontrollsteg',
    introduction: 'Exemplet visar en möjlig struktur för hantering och uppföljning. Det är inte en myndighetsrutin och verksamheten behöver anpassa sitt agerande till den faktiska faran, produkten och processen.',
    fields: [
      { label: 'Processteg eller kontroll', value: 'En planerad kontroll visar att verksamhetens kritiska gräns eller egen rutin inte är uppfylld.' },
      { label: 'Avvikelse', value: 'Kontrollen dokumenteras som ett avsteg från det arbetssätt som verksamheten har fastställt.' },
      { label: 'Omedelbar åtgärd', value: 'Ansvarig säkrar situationen och vidtar den åtgärd som verksamheten har planerat för att få processen under kontroll.' },
      { label: 'Berörd produkt', value: 'Berörda livsmedel hålls åtskilda eller stoppas från nästa steg medan verksamheten bedömer fortsatt hantering.' },
      { label: 'Orsaksbedömning', value: 'Verksamheten går igenom vad som kan ha orsakat avsteget, till exempel hur rutin, utrustning eller genomförande fungerade.' },
      { label: 'Uppföljning', value: 'Ansvarig kontrollerar att processen fungerar igen och att den valda åtgärden minskar risken för upprepning.' },
    ],
    noteLabel: 'Viktigt:',
    note: 'Exemplet är en praktisk illustration. Det anger inte en generell åtgärd eller en färdig bedömning av berörd produkt.',
  },
  mistakes: { title: 'Vanliga fallgropar', items: [
    { title: 'Endast felet rättas till', copy: 'Att återställa processen kan vara nödvändigt direkt, men verksamheten behöver också bedöma vad som hänt med berörd produkt och varför avvikelsen uppstod.' },
    { title: 'Berörd produkt går vidare utan bedömning', copy: 'När ett kritiskt gränsvärde inte uppfylls behöver det vara tydligt hur verksamheten säkerställer att berört livsmedel inte går vidare innan situationen har hanterats.' },
    { title: 'Åtgärden är inte planerad i förväg', copy: 'För kritiska styrpunkter ska korrigerande åtgärder vara förberedda så att de kan genomföras när övervakningen visar ett avsteg.' },
    { title: 'Ingen uppföljning görs', copy: 'Utan uppföljning blir det svårt att veta om processen verkligen är återställd och om orsaken har hanterats.' },
  ] },
  faq: { title: 'Frågor och svar', items: [
    { question: 'Vad är skillnaden mellan en avvikelse och en korrigerande åtgärd?', answer: 'Avvikelsen beskriver att något inte har fungerat som avsett. Den korrigerande åtgärden beskriver vad verksamheten gör som svar på avvikelsen, bland annat för att hantera produkt och process.' },
    { question: 'Behöver korrigerande åtgärder planeras i förväg?', answer: 'För varje kritisk styrpunkt ska korrigerande åtgärder planeras så att de kan vidtas direkt när övervakningen visar ett avsteg från det kritiska gränsvärdet.' },
    { question: 'Vad innebär uppföljning efter en avvikelse?', answer: 'Uppföljningen kontrollerar att processen fungerar igen och ger underlag för att bedöma om åtgärden och orsaksbedömningen har varit tillräckliga.' },
  ] },
  sourceSectionTitle: 'Källor och faktakontroll',
  source: {
    label: 'Livsmedelsverkets Kontrollwiki: HACCP',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-14',
    limitation: 'Vägledningen är inte bindande och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  additionalSources: [{ label: 'Livsmedelsverkets Kontrollwiki: HACCP-baserade förfaranden', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/247/k-haccp-baserade-forfaranden' }],
  relatedLinks: { title: 'Fördjupa nästa steg', links: [
    { href: '/haccp-sma-livsmedelsforetag', title: 'HACCP och riskstyrning', copy: 'Se hur delarna hänger ihop i ett förebyggande arbetssätt.' },
    { href: '/faroanalys-livsmedel', title: 'Faroanalys', copy: 'Identifiera vilka faror och kontrollåtgärder som är relevanta.' },
    { href: '/kontrollplan-livsmedel', title: 'Kontrollplan', copy: 'Samla kontroller, ansvar och uppföljning i det löpande arbetet.' },
    { href: '/kritiska-gransvarden-livsmedel', title: 'Kritiska gränsvärden', copy: 'Förstå hur gränser, övervakning och avsteg hänger ihop.' },
  ] },
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/verifiering-haccp-livsmedel', title: 'Nästa steg: verifiera att arbetssättet fungerar', copy: 'Efter avvikelsehantering behöver verksamheten kunna bedöma att rutinerna och åtgärderna fungerar som avsett.', linkLabel: 'Till verifiering' },
  appBridge: { eyebrow: 'När arbetet återkommer', title: 'Dokumentera återkommande arbete i appen', copy: 'Min Egenkontroll kan stötta löpande kontroller, avvikelser och historik när arbetssättet ska följas upp.', href: '/digital-egenkontroll-livsmedel', linkLabel: 'Se hur appen fungerar' },
};

export const verifieringHaccpFactPage: FactPageContent = {
  title: 'Verifiering av HACCP-baserade förfaranden | Min Egenkontroll',
  description: 'Förstå verifiering i HACCP: hur den skiljer sig från övervakning och hur journaler, avvikelser och observationer kan användas för uppföljning.',
  canonicalPath: '/verifiering-haccp-livsmedel',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'HACCP och riskstyrning', href: '/haccp-sma-livsmedelsforetag' },
    { label: 'Verifiering' },
  ],
  eyebrow: 'Verifiering',
  heading: 'Verifiering av HACCP-baserade förfaranden',
  shortAnswer: 'Verifiering är återkommande kontroller utöver den löpande övervakningen. Syftet är att bedöma om verksamhetens HACCP-baserade förfaranden fungerar som avsett. Den kan bygga på exempelvis journaler, avvikelser, observationer och kontroll av mätutrustning.',
  tableOfContentsTitle: 'På den här sidan',
  definition: {
    title: 'Verifiering är inte samma sak som övervakning',
    paragraphs: [
      'Övervakning är den planerade observation eller mätning som används i det löpande arbetet för att se om en kritisk styrpunkt är under kontroll. Den ska kunna upptäcka avsteg så att verksamheten kan agera direkt.',
      'Verifiering använder metoder, kontroller eller utvärderingar utöver övervakningen för att bedöma om de HACCP-baserade förfarandena fungerar effektivt. Det kan till exempel vara att granska journaler och avvikelser, observera arbetssätt eller kontrollera instrument som används vid övervakning.',
      'Översyn är här ett praktiskt ord för att gå igenom om planen fortfarande passar verksamheten. När en process eller förutsättning förändras kan verksamheten behöva bedöma på nytt om kontrollåtgärderna är effektiva; Livsmedelsverkets vägledning beskriver detta som validering.',
    ],
  },
  workflow: { eyebrow: 'Praktisk arbetsgång', title: 'Så kan verifieringen läggas upp', steps: [
    { title: 'Bestäm vad som ska följas upp', copy: 'Utgå från verksamhetens egna faror, kritiska styrpunkter, rutiner och tidigare avvikelser. Välj en kontroll som kan visa om arbetssättet fungerar i praktiken.' },
    { title: 'Granska relevant underlag', copy: 'Journaler från övervakning, dokumenterade avvikelser och resultat från tidigare kontroller kan ge underlag för verifieringen.' },
    { title: 'Kontrollera utförandet', copy: 'Verifieringen kan också omfatta observation av arbetssätt, fysisk kontroll av processen eller kontroll av mätutrustning som används vid övervakning.' },
    { title: 'Bedöm resultatet', copy: 'Avgör om underlaget visar att förfarandet fungerar som avsett eller om verksamheten behöver åtgärda något, uppdatera instruktioner eller gå vidare med en mer ingående bedömning.' },
    { title: 'Se över efter förändring', copy: 'När råvaror, produkt, utrustning eller arbetssätt förändras behöver verksamheten bedöma om HACCP-planen fortfarande är relevant och om kontrollåtgärderna behöver valideras eller justeras.' },
  ] },
  example: {
    eyebrow: 'Illustrativt exempel – måste anpassas',
    title: 'Exempel: genomgång av en återkommande kontroll',
    introduction: 'Exemplet visar hur en liten verksamhet kan strukturera en verifiering. Det anger ingen generell frekvens och ersätter inte verksamhetens egen bedömning av vad som behöver följas upp.',
    fields: [
      { label: 'Vad som verifieras', value: 'Att en av verksamhetens planerade kontroller och åtgärder fungerar som avsett.' },
      { label: 'Underlag som granskas', value: 'Verksamhetens egna journaler, dokumenterade avvikelser och instruktioner för det aktuella arbetssättet.' },
      { label: 'Kontroll i praktiken', value: 'Ansvarig jämför underlaget med hur arbetet faktiskt genomförs och kontrollerar vid behov den utrustning som används.' },
      { label: 'Upptäckt', value: 'Genomgången visar att en instruktion inte följs konsekvent eller att underlaget behöver förtydligas.' },
      { label: 'Beslut', value: 'Verksamheten beslutar om en anpassad åtgärd, till exempel att förtydliga instruktionen eller se över rutinen.' },
      { label: 'Uppföljning', value: 'Ansvarig följer upp att åtgärden har fått avsedd effekt och dokumenterar resultatet på det sätt som passar verksamheten.' },
    ],
    noteLabel: 'Viktigt:',
    note: 'Exemplet är en praktisk illustration. Val av metod, omfattning och tidpunkt för verifiering måste anpassas till den egna verksamheten och dess risker.',
  },
  mistakes: { title: 'Vanliga fallgropar', items: [
    { title: 'Övervakning och verifiering blandas ihop', copy: 'Övervakningen visar löpande om ett steg är under kontroll. Verifieringen granskar i stället, utöver övervakningen, om hela arbetssättet fungerar som avsett.' },
    { title: 'Bara journaler kontrolleras', copy: 'Journaler kan vara ett viktigt underlag, men verksamheten kan också behöva jämföra dem med hur arbetet utförs, avvikelser som uppstått och den utrustning som används.' },
    { title: 'Avvikelser används inte som underlag', copy: 'Dokumenterade avvikelser och åtgärder kan ge viktig information om vilka rutiner som behöver granskas eller förtydligas.' },
    { title: 'Förändringar leder inte till översyn', copy: 'En ändrad råvara, produkt, utrustning eller process kan påverka risker och kontrollåtgärder. HACCP-planen behöver då bedömas på nytt.' },
  ] },
  faq: { title: 'Frågor och svar', items: [
    { question: 'Hur skiljer sig verifiering från övervakning?', answer: 'Övervakning är den löpande kontrollen av en kritisk styrpunkt. Verifiering är kontroller utöver övervakningen som används för att bedöma om de HACCP-baserade förfarandena fungerar effektivt.' },
    { question: 'Måste verifiering alltid innebära provtagning?', answer: 'Nej. Livsmedelsverkets vägledning nämner flera möjliga metoder, till exempel granskning av dokumentation, observationer, fysisk kontroll av processen och kalibrering av instrument. Vad som är relevant beror på verksamheten.' },
    { question: 'När behöver HACCP-planen ses över?', answer: 'Vid förändringar som kan påverka risker eller kontrollåtgärder, till exempel ändrade råvaror, produkt, förpackning, lagring eller konsumentanvändning. Vägledningen beskriver att sådana förändringar kan kräva förnyad validering.' },
  ] },
  sourceSectionTitle: 'Källor och faktakontroll',
  source: {
    label: 'Livsmedelsverkets Kontrollwiki: HACCP',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-14',
    limitation: 'Vägledningen är inte bindande och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  additionalSources: [{ label: 'Livsmedelsverkets Kontrollwiki: HACCP-baserade förfaranden', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/247/k-haccp-baserade-forfaranden' }],
  relatedLinks: { title: 'Fördjupa nästa steg', links: [
    { href: '/haccp-sma-livsmedelsforetag', title: 'HACCP och riskstyrning', copy: 'Se hur faroanalys, styrning, åtgärder och uppföljning hänger ihop.' },
    { href: '/faroanalys-livsmedel', title: 'Faroanalys', copy: 'Identifiera vilka faror och kontrollåtgärder som är relevanta.' },
    { href: '/kontrollplan-livsmedel', title: 'Kontrollplan', copy: 'Samla kontroller, ansvar och uppföljning i det löpande arbetet.' },
    { href: '/kritiska-gransvarden-livsmedel', title: 'Kritiska gränsvärden', copy: 'Förstå hur gränser och övervakning används vid kritiska styrpunkter.' },
    { href: '/avvikelser-korrigerande-atgarder-livsmedel', title: 'Avvikelser och korrigerande åtgärder', copy: 'Hantera när en rutin eller kritisk gräns inte uppfylls.' },
  ] },
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/dokumentation-egenkontroll-livsmedel', title: 'Nästa steg: samla rätt dokumentation', copy: 'Dokumentation gör det möjligt att följa hur rutiner, kontroller, avvikelser och verifiering har fungerat över tid.', linkLabel: 'Till dokumentation' },
  appBridge: { eyebrow: 'När arbetet återkommer', title: 'Dokumentera löpande arbete i appen', copy: 'Min Egenkontroll kan stötta återkommande kontroller, avvikelser och historik när arbetssättet ska följas upp.', href: '/digital-egenkontroll-livsmedel', linkLabel: 'Se hur appen fungerar' },
};

export const dokumentationEgenkontrollFactPage: FactPageContent = {
  title: 'Dokumentation i livsmedelsföretag | Min Egenkontroll',
  description: 'Förstå dokumentation i egenkontrollen: skillnaden mellan planerade rutiner, löpande registreringar, avvikelser och verifieringsunderlag.',
  canonicalPath: '/dokumentation-egenkontroll-livsmedel',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'HACCP och riskstyrning', href: '/haccp-sma-livsmedelsforetag' },
    { label: 'Dokumentation' },
  ],
  eyebrow: 'Dokumentation',
  heading: 'Dokumentation i livsmedelsföretag',
  shortAnswer: 'Dokumentation i egenkontrollen hjälper verksamheten att visa hur HACCP-baserade förfaranden tillämpas och följs upp. Underlag och journaler behöver vara anpassade till verksamhetens storlek, art och egna risker – inte vara mer omfattande än vad arbetssättet kräver.',
  tableOfContentsTitle: 'På den här sidan',
  definition: {
    title: 'Vad dokumentationen ska hjälpa till med',
    paragraphs: [
      'Livsmedelsverkets vägledning beskriver att dokumentation och journaler för HACCP-baserade förfaranden ska vara avpassade till livsmedelsföretagets storlek och art. Syftet är att kunna visa att åtgärderna i HACCP-arbetet tillämpas effektivt.',
      'En planerad rutin beskriver hur arbetet ska göras. En löpande registrering visar vad som faktiskt har kontrollerats eller observerats. Dokumentation av avvikelser och åtgärder visar hur ett avsteg hanterades, medan verifieringsunderlag används för att bedöma om rutinerna fungerar över tid.',
      'Vad som behöver dokumenteras beror på verksamhetens förutsättningar. Relevanta underlag kan till exempel vara rutiner, resultat från övervakning, avvikelser och åtgärder eller underlag från verifiering. Det är verksamhetens egna faror och arbetssätt som avgör omfattningen.',
    ],
  },
  workflow: { eyebrow: 'Praktisk arbetsgång', title: 'Så kan dokumentationen hållas användbar', steps: [
    { title: 'Utgå från den egna planen', copy: 'Samla de rutiner och kontrollåtgärder som verksamheten har valt för sina egna faror och processer. Planen ska beskriva arbetssättet, inte ersätta det dagliga genomförandet.' },
    { title: 'Registrera det som utförs', copy: 'När verksamheten genomför en relevant kontroll eller övervakning kan resultatet dokumenteras på ett sätt som visar vad som har gjorts och vad utfallet blev.' },
    { title: 'Koppla avvikelser till åtgärder', copy: 'När en rutin eller kritisk gräns inte fungerar som avsett behöver underlaget göra det möjligt att följa avsteget, hanteringen av berörd situation och den åtgärd som valts.' },
    { title: 'Använd underlaget vid verifiering', copy: 'Journaler, avvikelser och observationer kan användas när verksamheten bedömer om HACCP-baserade förfaranden fungerar effektivt. Verifieringen är något annat än den löpande övervakningen.' },
    { title: 'Se över vid förändring', copy: 'När processer, råvaror, utrustning eller arbetssätt förändras behöver verksamheten bedöma om plan, rutiner och dokumentation fortfarande är relevanta.' },
  ] },
  example: {
    eyebrow: 'Illustrativt exempel – måste anpassas',
    title: 'Exempel: underlag för en återkommande rutin',
    introduction: 'Exemplet visar hur dokumentation kan knytas till en egen rutin. Det är inte en färdig myndighetsmall och anger varken generell frekvens, lagringstid eller vilka kontroller som krävs i en viss verksamhet.',
    fields: [
      { label: 'Planerad rutin', value: 'Verksamheten har beskrivit hur ett valt kontrollsteg ska genomföras och vem som ansvarar för det.' },
      { label: 'Löpande registrering', value: 'Den som utför kontrollen noterar att den är genomförd och dokumenterar det resultat som är relevant för verksamhetens egen rutin.' },
      { label: 'Varför det dokumenteras', value: 'Underlaget hjälper verksamheten att följa om den planerade rutinen har tillämpats och ger ett gemensamt stöd i det dagliga arbetet.' },
      { label: 'Ansvar', value: 'En utsedd person ansvarar för att den aktuella kontrollen genomförs och att verksamhetens eget underlag hanteras enligt den valda rutinen.' },
      { label: 'Avvikelsekoppling', value: 'Om resultatet visar ett avsteg noteras avvikelsen tillsammans med den hantering och åtgärd som verksamheten bedömer behövs.' },
      { label: 'Uppföljning', value: 'Ansvarig använder registreringar och avvikelser som underlag för att bedöma om rutinen behöver förtydligas, justeras eller verifieras.' },
    ],
    noteLabel: 'Viktigt:',
    note: 'Exemplet är en praktisk illustration av struktur och ansvar. Varje verksamhet behöver själv avgöra vilket underlag som är relevant för dess processer, risker och kontrollåtgärder.',
  },
  mistakes: { title: 'Vanliga fallgropar', items: [
    { title: 'Planen blandas ihop med bevis på genomförande', copy: 'En rutin beskriver hur arbetet ska gå till. Om verksamheten behöver visa vad som faktiskt har gjorts krävs ett relevant underlag från det löpande arbetet.' },
    { title: 'Avvikelsen noteras utan åtgärd', copy: 'Ett avsteg blir mer användbart som underlag när dokumentationen också visar hur situationen hanterades och vad verksamheten följer upp.' },
    { title: 'Allt dokumenteras på samma sätt', copy: 'Vägledningen betonar att omfattningen ska vara avpassad till verksamhetens storlek och art. Olika rutiner och risker kan därför behöva olika slags underlag.' },
    { title: 'Underlagen används aldrig för förbättring', copy: 'Journaler och avvikelser kan ge underlag för verifiering och översyn. De ska stödja ett fungerande arbetssätt, inte bara samlas utan att följas upp.' },
  ] },
  faq: { title: 'Frågor och svar', items: [
    { question: 'Är en rutin samma sak som en journal?', answer: 'Nej. En rutin beskriver hur verksamheten ska arbeta. En journal eller annan registrering kan visa att en relevant kontroll har genomförts eller vad den visade.' },
    { question: 'Behöver alla kontroller dokumenteras på samma sätt?', answer: 'Nej. Livsmedelsverkets vägledning anger att dokumentation och journaler ska anpassas till verksamhetens storlek och art. Vad som är relevant beror på de egna farorna, kontrollåtgärderna och arbetssätten.' },
    { question: 'Hur hänger dokumentation och verifiering ihop?', answer: 'Dokumentation från kontroller, avvikelser och åtgärder kan vara underlag när verksamheten verifierar om HACCP-baserade förfaranden fungerar effektivt. Verifieringen är inte samma sak som den dagliga registreringen.' },
  ] },
  sourceSectionTitle: 'Källor och faktakontroll',
  source: {
    label: 'Livsmedelsverkets Kontrollwiki: HACCP',
    url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    type: 'myndighetsvägledning',
    factCheckedAt: '2026-07-14',
    limitation: 'Vägledningen är inte bindande och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  additionalSources: [{ label: 'Livsmedelsverkets Kontrollwiki: HACCP-baserade förfaranden', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/247/k-haccp-baserade-forfaranden' }],
  relatedLinks: { title: 'Fördjupa nästa steg', links: [
    { href: '/haccp-sma-livsmedelsforetag', title: 'HACCP och riskstyrning', copy: 'Se hur faroanalys, styrning, åtgärder och uppföljning hänger ihop.' },
    { href: '/faroanalys-livsmedel', title: 'Faroanalys', copy: 'Identifiera vilka faror och kontrollåtgärder som är relevanta.' },
    { href: '/kontrollplan-livsmedel', title: 'Kontrollplan', copy: 'Samla rutiner, ansvar och kontroller i ett praktiskt underlag.' },
    { href: '/kritiska-gransvarden-livsmedel', title: 'Kritiska gränsvärden', copy: 'Förstå hur gränser och övervakning används vid kritiska styrpunkter.' },
    { href: '/avvikelser-korrigerande-atgarder-livsmedel', title: 'Avvikelser och korrigerande åtgärder', copy: 'Hantera när en rutin eller kritisk gräns inte uppfylls.' },
    { href: '/verifiering-haccp-livsmedel', title: 'Verifiering', copy: 'Bedöm om HACCP-baserade förfaranden fungerar effektivt över tid.' },
  ] },
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/haccp-sma-livsmedelsforetag', title: 'Sätt dokumentationen i ett HACCP-sammanhang', copy: 'Gå till HACCP-navet för att se hur dokumentation knyter ihop faroanalys, kontroll, avvikelser och verifiering.', linkLabel: 'Till HACCP och riskstyrning' },
  appBridge: { eyebrow: 'När arbetet återkommer', title: 'Samla löpande dokumentation i appen', copy: 'Min Egenkontroll kan stötta återkommande kontroller, avvikelser och historik när arbetet behöver följas upp över tid.', href: '/digital-egenkontroll-livsmedel', linkLabel: 'Se hur appen fungerar' },
};
