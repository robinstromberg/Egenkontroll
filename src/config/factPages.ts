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
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/seo/kontrollplan.html', title: 'Nästa steg: planera kontroller', copy: 'När farorna är bedömda kan kontrollplanen hjälpa dig att samla kontrollpunkter, ansvar och uppföljning.', linkLabel: 'Till kontrollplanen' },
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
    { href: '/seo/kritiska-gransvarden.html', title: 'Kritiska gränsvärden', copy: 'Läs om hur gränser och övervakning hör ihop i HACCP-arbetet.' },
    { href: '/avvikelser-korrigerande-atgarder-livsmedel', title: 'Avvikelser och korrigerande åtgärder', copy: 'Hantera när en rutin eller kontroll inte fungerar som avsett.' },
    { href: '/verifiering-egenkontroll-livsmedel', title: 'Verifiering', copy: 'Följ upp att arbetssätten fungerar över tid.' },
    { href: '/dokumentation-egenkontroll-livsmedel', title: 'Dokumentation', copy: 'Samla rätt underlag för det löpande arbetet.' },
  ] },
  sequentialNextStep: { eyebrow: 'Fortsätt i arbetsordning', href: '/haccp-sma-livsmedelsforetag', title: 'Sätt kontrollplanen i ett sammanhang', copy: 'Gå tillbaka till HACCP-navet för att se hur faroanalys, kontroll, avvikelser och verifiering hänger ihop.', linkLabel: 'Till HACCP och riskstyrning' },
  appBridge: { eyebrow: 'När arbetet återkommer', title: 'Dokumentera löpande arbete i appen', copy: 'Min Egenkontroll kan stötta återkommande kontroller, avvikelser och historik när rutinerna ska följas upp.', href: '/digital-egenkontroll-livsmedel', linkLabel: 'Se hur appen fungerar' },
};
