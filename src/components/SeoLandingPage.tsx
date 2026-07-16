import { useEffect } from 'react';
import { brandAssets } from '../config/assets';
import './PublicLandingPage.css';

export type SeoPageSlug =
  | 'digital-egenkontroll-livsmedel'
  | 'egenkontroll-restaurang'
  | 'egenkontroll-cafe'
  | 'dokumentation-egenkontroll-livsmedel'
  | 'sparbarhet-livsmedel'
  | 'haccp-sma-livsmedelsforetag'
  | 'faroanalys-livsmedel'
  | 'avvikelser-korrigerande-atgarder-livsmedel'
  | 'verifiering-egenkontroll-livsmedel'
  | 'spara-sparbarhetsuppgifter-livsmedel';

type RelatedPageSlug = SeoPageSlug | 'verifiering-haccp-livsmedel';

type SeoPageContent = {
  slug: SeoPageSlug;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  benefits: Array<[string, string]>;
  practicalHeading: string;
  practicalText: string;
  examplesHeading: string;
  examples: string[];
  faq: Array<[string, string]>;
  sourceLabel?: string;
  sourceUrl?: string;
  sourceNote?: string;
  relatedSlugs?: RelatedPageSlug[];
};

const siteUrl = 'https://minegenkontroll.se';
const livsmedelsverketSourceNote =
  'Faktaunderlaget bygger på Livsmedelsverkets vägledning. Vägledningen är inte bindande och Min Egenkontroll ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.';

const seoPages: Record<SeoPageSlug, SeoPageContent> = {
  'digital-egenkontroll-livsmedel': {
    slug: 'digital-egenkontroll-livsmedel',
    title: 'Digital egenkontroll för livsmedelsverksamheter | Min Egenkontroll',
    description:
      'Samla temperaturkontroller, städning, datummärkning, varumottagning, spårbarhet och avvikelser digitalt i mobilen.',
    eyebrow: 'Digital egenkontroll för livsmedel',
    heading: 'Digital egenkontroll för livsmedelsverksamheter',
    intro:
      'Samla dagens kontroller, avvikelser och historik på ett ställe. Min Egenkontroll är byggd för att personalen snabbt ska se vad som ska göras och för att dokumentationen ska vara enkel att hitta när den behövs.',
    benefits: [
      ['Dagens kontroller på en plats', 'Personalen ser vad som ska göras, vad som är klart och vad som återstår.'],
      ['Avvikelser där de hör hemma', 'Om något inte stämmer dokumenteras åtgärden direkt tillsammans med kontrollen.'],
      ['Historik som går att hitta', 'Slipp leta i pärmar, kalkylblad och chattar när någon vill se vad som gjorts.'],
    ],
    practicalHeading: 'Vad innebär digital egenkontroll i praktiken?',
    practicalText:
      'I stället för att sprida rutiner och dokumentation mellan papper, pärmar och olika filer görs kontrollerna direkt i mobilen. Verksamheten väljer vilka kontroller som behövs och anpassar dem efter sitt eget arbetssätt. Vanliga områden är temperaturer, städning, datummärkning, varumottagning, spårbarhet och kontrollrundor.',
    examplesHeading: 'Passar bland annat för',
    examples: ['Restauranger', 'Caféer och bagerier', 'Mindre livsmedelsproduktion', 'Butiker och kiosker', 'Foodtrucks och andra mobila verksamheter'],
    faq: [
      ['Måste personalen installera en app?', 'Nej. Min Egenkontroll körs i webbläsaren och är byggd för mobil användning.'],
      ['Kan verksamheten anpassa kontrollerna?', 'Ja. Kontrolltyper och kontrollpunkter kan anpassas efter hur verksamheten faktiskt arbetar.'],
      ['Kan dokumentationen visas vid kontroll?', 'Ja. Historik och dokumentation kan samlas och delas via en tidsbegränsad läslänk.'],
    ],
    relatedSlugs: ['haccp-sma-livsmedelsforetag', 'avvikelser-korrigerande-atgarder-livsmedel', 'verifiering-haccp-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'sparbarhet-livsmedel', 'faroanalys-livsmedel'],
  },
  'egenkontroll-restaurang': {
    slug: 'egenkontroll-restaurang',
    title: 'Egenkontroll för restaurang – digitalt och enkelt | Min Egenkontroll',
    description:
      'Digital egenkontroll för restaurang. Samla temperaturer, städning, varumottagning, avvikelser och historik i mobilen.',
    eyebrow: 'För restauranger',
    heading: 'Egenkontroll för restaurang – digitalt och enkelt',
    intro:
      'I en restaurang måste egenkontrollen fungera mitt i den vanliga arbetsdagen. Min Egenkontroll gör det lättare för personalen att se vad som ska göras, dokumentera direkt och hitta historiken senare.',
    benefits: [
      ['Snabbt för personalen', 'Öppna dagens kontroller och fyll i rätt värde eller status direkt i mobilen.'],
      ['Tydligt vid skiftbyten', 'Det syns vad som redan är gjort och vilka kontroller som fortfarande återstår.'],
      ['Enklare när något avviker', 'Dokumentera åtgärden på samma plats som den kontroll där problemet upptäcktes.'],
    ],
    practicalHeading: 'Egenkontroll som passar restaurangens vardag',
    practicalText:
      'Temperaturkontroller, städning, datummärkning och varumottagning sker ofta samtidigt som köket är i full gång. Därför är systemet byggt för korta arbetsflöden. Personalen ska inte behöva leta efter rätt formulär eller gå igenom flera menyer för att registrera en enkel kontroll.',
    examplesHeading: 'Vanliga delar att samla digitalt',
    examples: ['Kyl- och frystemperaturer', 'Städning och rengöring', 'Datummärkning', 'Varumottagning', 'Spårbarhet', 'Avvikelser och åtgärder'],
    faq: [
      ['Kan flera medarbetare använda systemet?', 'Ja. Tanken är att dagens kontroller ska kunna utföras av personalen i det dagliga arbetet.'],
      ['Syns det vem som har gjort en kontroll?', 'Kontroller sparas tillsammans med uppgifter om vem som utfört dem.'],
      ['Behöver vi byta alla rutiner på en gång?', 'Nej. Verksamheten kan börja med de viktigaste kontrollerna och bygga vidare efter behov.'],
    ],
    relatedSlugs: ['digital-egenkontroll-livsmedel', 'haccp-sma-livsmedelsforetag', 'avvikelser-korrigerande-atgarder-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'sparbarhet-livsmedel', 'egenkontroll-cafe'],
  },
  'egenkontroll-cafe': {
    slug: 'egenkontroll-cafe',
    title: 'Digital egenkontroll för café och bageri | Min Egenkontroll',
    description:
      'Enkel digital egenkontroll för café och bageri. Samla temperaturer, städning, datummärkning, mottagning och historik i mobilen.',
    eyebrow: 'För café och bageri',
    heading: 'Digital egenkontroll för café och bageri',
    intro:
      'När öppning, produktion, servering och stängning avlöser varandra behöver egenkontrollen vara enkel att få gjord. Min Egenkontroll samlar dagens uppgifter i mobilen så att personalen snabbt ser vad som återstår.',
    benefits: [
      ['Lätt att komma igång med', 'Börja med vanliga kontrolltyper och anpassa dem efter caféets eller bageriets arbetssätt.'],
      ['Kontroller i rätt ögonblick', 'Registrera temperatur, status, foto eller kommentar direkt där arbetet sker.'],
      ['Mindre letande i efterhand', 'Historiken samlas så att tidigare kontroller och åtgärder blir lättare att hitta.'],
    ],
    practicalHeading: 'Byggt för små verksamheter med högt tempo',
    practicalText:
      'Ett café eller bageri behöver ofta hålla ordning på flera återkommande moment utan att administrationen får ta över arbetsdagen. Därför är målet att varje kontroll ska vara så enkel som möjligt att utföra och att samma system ska kunna användas för olika delar av verksamheten.',
    examplesHeading: 'Exempel på kontroller',
    examples: ['Kyl- och frystemperaturer', 'Städning', 'Datummärkning', 'Varumottagning', 'Spårbarhet', 'Öppnings- och stängningsrundor'],
    faq: [
      ['Passar systemet även en liten verksamhet?', 'Ja. Min Egenkontroll är utvecklad med små livsmedelsverksamheter i åtanke.'],
      ['Kan vi anpassa vad som ska kontrolleras?', 'Ja. Kontrollerna kan anpassas efter verksamhetens egna behov och arbetssätt.'],
      ['Kan vi använda mobilen?', 'Ja. Tjänsten är byggd för att användas direkt i mobilens webbläsare.'],
    ],
    relatedSlugs: ['digital-egenkontroll-livsmedel', 'haccp-sma-livsmedelsforetag', 'avvikelser-korrigerande-atgarder-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'sparbarhet-livsmedel', 'egenkontroll-restaurang'],
  },
  'dokumentation-egenkontroll-livsmedel': {
    slug: 'dokumentation-egenkontroll-livsmedel',
    title: 'Dokumentation och journalföring i egenkontrollen | Min Egenkontroll',
    description:
      'Vad behöver dokumenteras i livsmedelsverksamhetens egenkontroll? Läs om journaler, avvikelser, korrigerande åtgärder och flexibel dokumentation.',
    eyebrow: 'Dokumentation och journalföring',
    heading: 'Dokumentation och journalföring i livsmedelsverksamhet',
    intro:
      'Dokumentationen ska hjälpa verksamheten att visa att kontroller och HACCP-baserade arbetssätt fungerar. Livsmedelsverkets vägledning betonar att omfattningen ska anpassas efter verksamhetens storlek och art och inte bli större än vad som faktiskt behövs.',
    benefits: [
      ['Anpassa efter verksamheten', 'En liten verksamhet behöver inte automatiskt samma mängd dokumentation som en stor och komplex produktion.'],
      ['Spara resultat och avvikelser', 'Journaler kan visa resultat, observerade avsteg och vilka korrigerande åtgärder som har utförts.'],
      ['Gör historiken användbar', 'Dokumentation är mest värdefull när den går att hitta och använda för att visa hur verksamheten arbetar.'],
    ],
    practicalHeading: 'Vad kan behöva dokumenteras?',
    practicalText:
      'För verksamheter med HACCP-baserade förfaranden kan dokumentationen bland annat omfatta arbetsinstruktioner, faroanalys, kritiska gränsvärden, planerad övervakning och planerade korrigerande åtgärder. Journaler kan visa resultat, avvikelser, utförda åtgärder och verifiering. Samtidigt säger Livsmedelsverkets vägledning att det inte krävs mer dokumentation än vad som behövs för att styrningen av farorna ska fungera effektivt.',
    examplesHeading: 'Exempel på sådant som kan sparas',
    examples: ['Temperaturkontroller', 'Avvikelser', 'Korrigerande åtgärder', 'Checklistor', 'Verifiering', 'Arbetsinstruktioner'],
    faq: [
      ['Måste allt i egenkontrollen dokumenteras?', 'Nej, inte nödvändigtvis. Livsmedelsverkets vägledning säger att dokumentation och journalföring ska anpassas efter verksamheten och inte vara mer omfattande än vad som behövs för att styrningen av farorna ska fungera effektivt.'],
      ['Måste journaler vara på papper?', 'Nej. Vägledningen beskriver att journalsystemet kan integreras i verksamhetens befintliga lednings- och kvalitetssystem. Det viktiga är att dokumentationen fungerar och går att använda.'],
      ['Måste varje kontroll alltid journalföras?', 'Inte i alla situationer. Livsmedelsverkets vägledning anger att journalföring i vissa fall kan ske endast vid avvikelse från en kritisk gräns, framför allt vid okulär övervakning. Vad som är lämpligt beror på verksamheten och riskerna.'],
    ],
    sourceLabel: 'Livsmedelsverkets Kontrollwiki: HACCP, princip 7 – Dokumentation och journaler',
    sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp#princip-7-dokumentation-och-journaler',
    sourceNote: livsmedelsverketSourceNote,
    relatedSlugs: ['haccp-sma-livsmedelsforetag', 'faroanalys-livsmedel', 'avvikelser-korrigerande-atgarder-livsmedel', 'verifiering-haccp-livsmedel', 'digital-egenkontroll-livsmedel', 'sparbarhet-livsmedel'],
  },
  'sparbarhet-livsmedel': {
    slug: 'sparbarhet-livsmedel',
    title: 'Spårbarhet för livsmedelsföretag – vad behöver sparas? | Min Egenkontroll',
    description:
      'Läs vad spårbarhet innebär för restaurang, café och andra livsmedelsföretag: leverantörer, mottagare, leveranser och dokumentation.',
    eyebrow: 'Spårbarhet för livsmedel',
    heading: 'Spårbarhet för livsmedelsföretag – vad behöver sparas?',
    intro:
      'Livsmedelsföretag ska kunna visa var livsmedel och ingredienser kommer från och, när de levereras vidare till andra livsmedelsföretag, vem mottagaren är. Systemet kan vara digitalt eller bestå av fysiska dokument, men uppgifterna måste kunna verifieras.',
    benefits: [
      ['Ett steg bakåt', 'Verksamheten ska kunna visa från vilka leverantörer livsmedel och ingredienser har tagits emot.'],
      ['Ett steg framåt', 'Vid leverans till andra livsmedelsföretag ska verksamheten kunna visa vilka mottagarna är. Det gäller inte försäljning till slutkonsument.'],
      ['Hitta uppgifterna snabbt', 'Spårbarhetsinformationen behöver vara ordnad så att relevanta uppgifter kan tas fram när de behövs.'],
    ],
    practicalHeading: 'Vilka uppgifter är viktiga för spårbarheten?',
    practicalText:
      'Underlagen kan finnas i följesedlar, fakturor, kvitton, kundregister, produktlarm eller transport- och leveransdokument. När samma leverantör eller mottagare förekommer flera gånger behövs datum eller andra uppgifter som skiljer leveranserna åt. Informationen bör vara ordnad så att den snabbt kan tas fram när myndigheten frågar eller när ett problem med ett livsmedel måste utredas.',
    examplesHeading: 'Exempel på spårbarhetsuppgifter',
    examples: ['Leverantörens namn och adress', 'Typ av produkt', 'Mängd', 'Leveransdatum', 'Mottagande livsmedelsföretag', 'Följesedel eller annat underlag'],
    faq: [
      ['Måste en restaurang kunna spåra sina gäster?', 'Nej. Kravet på spårbarhet framåt gäller mottagande livsmedelsföretag, inte försäljning till slutkonsument.'],
      ['Räcker ett kvitto eller en faktura?', 'Det kan vara en del av underlaget, men dokumentationen behöver innehålla tillräcklig information för att varans flöde ska kunna verifieras. Fakturor och kvitton visar inte alltid allt som behövs.'],
      ['Kan man spara bilder eller skannade kopior?', 'Ja. Livsmedelsverkets vägledning nämner att företag kan behöva skanna, fotografera eller kopiera underlag för att informationen ska vara snabbt tillgänglig, till exempel om original lämnas vidare eller riskerar att blekna.'],
    ],
    sourceLabel: 'Livsmedelsverkets Kontrollwiki: Spårbarhet',
    sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/741/sparbarhet',
    sourceNote: livsmedelsverketSourceNote,
    relatedSlugs: ['spara-sparbarhetsuppgifter-livsmedel', 'digital-egenkontroll-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'haccp-sma-livsmedelsforetag', 'egenkontroll-restaurang', 'egenkontroll-cafe'],
  },
  'haccp-sma-livsmedelsforetag': {
    slug: 'haccp-sma-livsmedelsforetag',
    title: 'HACCP för små livsmedelsföretag – enkelt förklarat | Min Egenkontroll',
    description:
      'Hur fungerar HACCP för en liten restaurang, ett café eller annat litet livsmedelsföretag? Läs om flexibilitet, faror, styrning och dokumentation.',
    eyebrow: 'HACCP för små företag',
    heading: 'HACCP för små livsmedelsföretag – vad behöver du förstå?',
    intro:
      'HACCP handlar om att identifiera faror i verksamheten och se till att de styrs på ett fungerande sätt. Livsmedelsverket betonar samtidigt att HACCP-baserade förfaranden ska kunna anpassas efter verksamhetens storlek och art. Flexibiliteten får dock aldrig äventyra livsmedelssäkerheten.',
    benefits: [
      ['Små företag får vara små', 'En liten verksamhet behöver inte automatiskt samma mängd dokumentation och formalia som en stor livsmedelsindustri.'],
      ['Kritiska styrpunkter behövs inte alltid', 'I vissa verksamheter kan farorna styras genom bra grundförutsättningar och rutiner utan att särskilda kritiska styrpunkter identifieras.'],
      ['Alla gränser är inte siffror', 'Livsmedelsverkets vägledning beskriver att ett kritiskt gränsvärde inte alltid måste vara numeriskt, även om det ska vara tydligt och användbart.'],
    ],
    practicalHeading: 'Vad betyder flexibilitet kring HACCP?',
    practicalText:
      'Upplägget ska spegla den faktiska risken och verksamheten. Bedömningen kan påverkas av till exempel om maten är ätfärdig, om råvaror bearbetas, om processen innehåller ett steg som reducerar risk, vilka temperaturkrav som finns och om maten riktar sig till särskilt känsliga konsumenter. För mycket administration ska undvikas, men inte på bekostnad av säkerheten.',
    examplesHeading: 'HACCP-arbetet kan omfatta',
    examples: ['Faroanalys', 'Grundförutsättningar', 'Kritiska styrpunkter', 'Gränsvärden', 'Övervakning', 'Korrigerande åtgärder', 'Verifiering', 'Dokumentation'],
    faq: [
      ['Måste ett litet företag ha samma HACCP-system som en fabrik?', 'Nej. Livsmedelsverkets vägledning lyfter uttryckligen flexibilitet utifrån verksamhetens storlek och art. En liten verksamhet kan ha ett betydligt enklare upplägg, så länge farorna styrs effektivt.'],
      ['Måste alla verksamheter ha kritiska styrpunkter?', 'Nej. Vägledningen beskriver att det i vissa verksamheter inte går eller inte behövs att fastställa kritiska styrpunkter, eftersom farorna kan styras genom grundförutsättningarna.'],
      ['Betyder flexibilitet att kraven försvinner?', 'Nej. Flexibiliteten handlar om hur kraven tillämpas. Den får inte äventyra livsmedelssäkerheten.'],
    ],
    sourceLabel: 'Livsmedelsverkets Kontrollwiki: HACCP och flexibilitet kring HACCP',
    sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    sourceNote: livsmedelsverketSourceNote,
    relatedSlugs: ['faroanalys-livsmedel', 'avvikelser-korrigerande-atgarder-livsmedel', 'verifiering-haccp-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'digital-egenkontroll-livsmedel', 'sparbarhet-livsmedel'],
  },
  'faroanalys-livsmedel': {
    slug: 'faroanalys-livsmedel',
    title: 'Faroanalys för livsmedelsföretag – enkelt förklarat | Min Egenkontroll',
    description:
      'Vad är en faroanalys i livsmedelsverksamhet? Läs hur relevanta faror identifieras, hur detaljnivån kan anpassas och när skriftlig dokumentation hjälper.',
    eyebrow: 'Faroanalys',
    heading: 'Faroanalys för livsmedelsföretag – enkelt förklarat',
    intro:
      'En faroanalys ska hjälpa företagaren att identifiera de faror som kan innebära en stor risk om processen eller hanteringen inte styrs. Det viktiga är inte att använda svåra ord, utan att kunna förklara vilka betydande faror som finns och hur verksamheten håller dem under kontroll.',
    benefits: [
      ['Fokusera på relevanta faror', 'Analysen ska identifiera sådant som faktiskt kan bli en betydande risk i den egna verksamheten.'],
      ['Anpassa detaljnivån', 'Små företag kan i vissa fall beskriva grupper av faror i stället för att namnge varje enskild mikroorganism eller kemisk fara.'],
      ['Utgå från verksamheten', 'Generiska faroanalyser och branschriktlinjer kan vara stöd, men behöver anpassas när den egna processen kräver det.'],
    ],
    practicalHeading: 'Måste faroanalysen vara skriftlig?',
    practicalText:
      'Livsmedelsverkets vägledning anger att alla företagare inte behöver redogöra för faroanalysen skriftligt. Företagaren måste däremot kunna visa att relevanta faror har identifierats och kunna redogöra för dem. Om det inte går muntligt tyder det på att en skriftlig faroanalys behövs. Skriftlig dokumentation kan också vara till stor hjälp både för företaget och vid kontroll.',
    examplesHeading: 'Sådant faroanalysen kan behöva väga in',
    examples: ['Mikrobiologiska faror', 'Kemiska faror', 'Allergener', 'Råvaror', 'Processteg', 'Temperatur och tid', 'Konsumentgrupper', 'Kontrollåtgärder'],
    faq: [
      ['Måste en liten verksamhet lista varje bakterie vid namn?', 'Inte alltid. Livsmedelsverkets vägledning beskriver att det i små företag ibland kan räcka att ange exempelvis mikrobiologiska faror som grupp, om verksamheten tydligt kan visa hur farorna styrs.'],
      ['Kan man använda en färdig faroanalys från en branschriktlinje?', 'Ja, generiska faroanalyser kan användas som stöd. Företagaren behöver ändå anpassa analysen när den egna verksamhetens förutsättningar eller processer kräver det.'],
      ['Är mer detaljer alltid bättre?', 'Nej. Vägledningen säger att mer detaljkrav än vad som behövs för att farorna ska kunna kontrolleras inte ska ställas.'],
    ],
    sourceLabel: 'Livsmedelsverkets Kontrollwiki: HACCP, princip 1 – Identifiera relevanta faror',
    sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    sourceNote: livsmedelsverketSourceNote,
    relatedSlugs: ['haccp-sma-livsmedelsforetag', 'avvikelser-korrigerande-atgarder-livsmedel', 'verifiering-haccp-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'digital-egenkontroll-livsmedel', 'sparbarhet-livsmedel'],
  },
  'avvikelser-korrigerande-atgarder-livsmedel': {
    slug: 'avvikelser-korrigerande-atgarder-livsmedel',
    title: 'Avvikelser och korrigerande åtgärder i egenkontrollen | Min Egenkontroll',
    description:
      'Vad gör man när en kontroll avviker? Läs om korrigerande åtgärder, vad som händer med livsmedlet, hur processen återställs och hur orsaken följs upp.',
    eyebrow: 'Avvikelser och åtgärder',
    heading: 'Avvikelser och korrigerande åtgärder i egenkontrollen',
    intro:
      'En avvikelse betyder i praktiken att resultatet inte blev som planerat eller att en fastställd gräns passerades. I HACCP-arbetet ska korrigerande åtgärder för kritiska styrpunkter planeras i förväg så att verksamheten kan agera direkt när ett avsteg upptäcks.',
    benefits: [
      ['Hantera livsmedlet', 'Det behöver vara tydligt vad som händer med livsmedel som inte uppfyller den kritiska gränsen och hur man hindrar att osäkra produkter går vidare.'],
      ['Återställ processen', 'Åtgärden ska hjälpa verksamheten att få den kritiska styrpunkten under kontroll igen.'],
      ['Ta bort orsaken', 'Det räcker inte alltid att rätta det akuta felet. Orsaken behöver hanteras så att problemet inte upprepas.'],
    ],
    practicalHeading: 'Vad bör en bra avvikelsehantering svara på?',
    practicalText:
      'För kritiska styrpunkter beskriver Livsmedelsverket att det ska vara klart vilka åtgärder som vidtas när ett avsteg upptäcks, hur berört livsmedel hindras från att gå vidare, hur processen återställs och hur orsaken till avsteget åtgärdas. I den vardagliga egenkontrollen används ordet avvikelse ofta bredare, till exempel när en temperatur, städpunkt eller annan kontroll inte uppfyller verksamhetens egna krav. Principen är densamma: dokumentera vad som hände, vad som gjordes och vad som behöver följas upp.',
    examplesHeading: 'En avvikelse kan behöva beskriva',
    examples: ['Vad som avvek', 'Berört livsmedel eller område', 'Omedelbar åtgärd', 'Vad som hände med produkten', 'Orsak', 'Förebyggande åtgärd', 'Ansvarig', 'Uppföljning'],
    faq: [
      ['Är en kommentar samma sak som en korrigerande åtgärd?', 'Inte alltid. En kommentar beskriver vad som hänt. En korrigerande åtgärd beskriver vad verksamheten faktiskt gjorde för att hantera produkten eller processen och få situationen under kontroll.'],
      ['Måste åtgärden vara bestämd i förväg?', 'För kritiska styrpunkter ska korrigerande åtgärder planeras i förväg. För andra vardagliga avvikelser kan den konkreta åtgärden bero på situationen, men verksamheten bör veta hur den ska agera.'],
      ['Varför ska orsaken dokumenteras?', 'För att minska risken att samma problem upprepas. Livsmedelsverkets vägledning lyfter att orsaken till avsteget ska åtgärdas, inte bara den synliga konsekvensen.'],
    ],
    sourceLabel: 'Livsmedelsverkets Kontrollwiki: HACCP, princip 5 – Fastställa korrigerande åtgärder',
    sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    sourceNote: livsmedelsverketSourceNote,
    relatedSlugs: ['haccp-sma-livsmedelsforetag', 'verifiering-haccp-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'faroanalys-livsmedel', 'digital-egenkontroll-livsmedel', 'sparbarhet-livsmedel'],
  },
  'verifiering-egenkontroll-livsmedel': {
    slug: 'verifiering-egenkontroll-livsmedel',
    title: 'Verifiering av egenkontrollen – fungerar rutinerna? | Min Egenkontroll',
    description:
      'Vad betyder verifiering i HACCP och egenkontroll? Läs hur verksamheten kan kontrollera att övervakning, journaler och korrigerande åtgärder fungerar.',
    eyebrow: 'Verifiering av egenkontrollen',
    heading: 'Verifiering av egenkontrollen – hur vet du att rutinerna fungerar?',
    intro:
      'Verifiering är återkommande aktiviteter som visar om det önskade resultatet faktiskt har uppnåtts. Enkelt uttryckt: verksamheten ska inte bara göra kontrollerna, utan ibland också kontrollera att kontrollsystemet fungerar som tänkt.',
    benefits: [
      ['Kontrollera att rutinen följs', 'Verifiering kan innebära att se hur övervakningen utförs i praktiken.'],
      ['Granska historiken', 'Journaler och korrigerande åtgärder kan följas upp för att se om avvikelser hanteras på rätt sätt.'],
      ['Anpassa omfattningen', 'I mindre verksamheter kan verifieringen ofta vara enkel och praktisk, så länge den ger en rimlig kontroll av att systemet fungerar.'],
    ],
    practicalHeading: 'Vad kan verifiering vara i praktiken?',
    practicalText:
      'Livsmedelsverket nämner bland annat provtagning och analys, granskning av HACCP-förfaranden och dokumentation, kontroll av hur personalen följer planen, fysisk kontroll av processen och kalibrering av instrument. För mindre verksamheter kan enkla förfaranden räcka, till exempel fysisk kontroll av övervakningen eller genomgång av övervakningsjournaler och korrigerande åtgärder.',
    examplesHeading: 'Exempel på verifiering',
    examples: ['Följa en kontroll på plats', 'Granska journaler', 'Kontrollera avvikelser', 'Se att åtgärder följts upp', 'Kalibrera termometer', 'Provtagning vid behov'],
    faq: [
      ['Är verifiering samma sak som den vanliga kontrollen?', 'Nej. Den vanliga övervakningen visar ett aktuellt resultat. Verifieringen kontrollerar återkommande om övervakningen och systemet i stort fungerar som avsett.'],
      ['Vad är skillnaden mellan verifiering och validering?', 'Verifiering frågar om systemet fungerar i praktiken och ger önskat resultat. Validering handlar om att i förväg eller vid förändringar visa att de valda kontrollåtgärderna är effektiva när de genomförs korrekt.'],
      ['Måste verifiering vara komplicerad?', 'Nej. Livsmedelsverkets vägledning beskriver att verifiering i många fall kan vara en enkel procedur, till exempel att kontrollera övervakningen eller granska journaler och korrigerande åtgärder.'],
    ],
    sourceLabel: 'Livsmedelsverkets Kontrollwiki: HACCP, princip 6 – Verifiera att åtgärderna fungerar effektivt',
    sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
    sourceNote: livsmedelsverketSourceNote,
    relatedSlugs: ['haccp-sma-livsmedelsforetag', 'avvikelser-korrigerande-atgarder-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'faroanalys-livsmedel', 'digital-egenkontroll-livsmedel', 'sparbarhet-livsmedel'],
  },
  'spara-sparbarhetsuppgifter-livsmedel': {
    slug: 'spara-sparbarhetsuppgifter-livsmedel',
    title: 'Hur länge ska spårbarhetsuppgifter sparas? | Min Egenkontroll',
    description:
      'Hur länge bör spårbarhetsuppgifter för livsmedel sparas? Läs om Livsmedelsverkets vägledning och EU-kommissionens rekommendationer för olika produkter.',
    eyebrow: 'Spara spårbarhetsuppgifter',
    heading: 'Hur länge ska spårbarhetsuppgifter för livsmedel sparas?',
    intro:
      'Det finns ingen enda lagstadgad tidsgräns som gäller alla livsmedel. Livsmedelsverkets vägledning förklarar att uppgifterna behöver sparas så länge företaget kan komma att behöva dem. Produktens verkliga livslängd och möjliga risker spelar därför roll.',
    benefits: [
      ['Ingen universell tidsgräns', 'Hur länge uppgifterna behöver finnas kvar beror på produkten och hur länge den kan användas eller finnas kvar i livsmedelskedjan.'],
      ['Hållbarhet är inte alltid livslängd', 'En produkt kan frysas in eller tillagas och därmed finnas kvar betydligt längre än datumet på den ursprungliga förpackningen antyder.'],
      ['Utgå från rekommendationerna', 'EU-kommissionens vägledning ger rekommenderade tidsperioder för kort hållbarhet, längre hållbarhet och produkter utan specificerad hållbarhetstid.'],
    ],
    practicalHeading: 'Vilka lagringstider rekommenderas?',
    practicalText:
      'Enligt den EU-kommissionsvägledning som Livsmedelsverket hänvisar till bör uppgifter för produkter med kortare hållbarhet än tre månader, samt vissa färska eller oförpackade produkter direkt till slutkonsument, sparas sex månader efter tillverknings- eller leveransdatum. För produkter med längre hållbarhet än tre månader rekommenderas hela hållbarhetstiden plus sex månader. För produkter utan specificerad hållbarhetstid anges att fem år normalt bör räcka. Det här är rekommendationer och inte en enda fast lagstadgad tidsgräns för alla situationer.',
    examplesHeading: 'Praktisk tumregel från vägledningen',
    examples: ['Kort hållbarhet: datum + 6 månader', 'Lång hållbarhet: hållbarhetstid + 6 månader', 'Ingen angiven hållbarhet: omkring 5 år', 'Bedöm produktens verkliga livslängd', 'Spara så uppgifterna går att hitta'],
    faq: [
      ['Finns det ett lagkrav på exakt fem år?', 'Nej. Livsmedelsverkets vägledning säger att lagstiftningen inte föreskriver en bestämd lagringstid för alla spårbarhetsuppgifter. Fem år är en rekommendation för produkter utan specificerad hållbarhetstid.'],
      ['Kan jag radera uppgifterna direkt efter bäst före-datum?', 'Inte nödvändigtvis. Produktens verkliga livslängd kan vara längre än hållbarhetstiden, till exempel om mottagaren fryser in eller tillagar produkten.'],
      ['Varför behöver uppgifterna sparas?', 'För att företaget ska kunna agera om ett problem upptäcks senare och för att spårbarheten fortfarande ska fungera när informationen behövs.'],
    ],
    sourceLabel: 'Livsmedelsverkets Kontrollwiki: Spårbarhet – hur länge behöver uppgifterna sparas?',
    sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/741/sparbarhet',
    sourceNote: livsmedelsverketSourceNote,
    relatedSlugs: ['sparbarhet-livsmedel', 'dokumentation-egenkontroll-livsmedel', 'digital-egenkontroll-livsmedel', 'haccp-sma-livsmedelsforetag', 'egenkontroll-restaurang', 'egenkontroll-cafe'],
  },
};

const guideLinks: Record<RelatedPageSlug, { title: string; copy: string }> = {
  'digital-egenkontroll-livsmedel': {
    title: 'Digital egenkontroll för livsmedel',
    copy: 'Se hur kontroller, avvikelser och historik kan samlas digitalt.',
  },
  'egenkontroll-restaurang': {
    title: 'Egenkontroll för restaurang',
    copy: 'Se ett enkelt upplägg för restaurangens dagliga kontroller.',
  },
  'egenkontroll-cafe': {
    title: 'Egenkontroll för café och bageri',
    copy: 'Se hur återkommande kontroller kan bli enklare i ett högt arbetstempo.',
  },
  'dokumentation-egenkontroll-livsmedel': {
    title: 'Dokumentation och journalföring',
    copy: 'Vad behöver dokumenteras och hur mycket journalföring behövs?',
  },
  'sparbarhet-livsmedel': {
    title: 'Spårbarhet för livsmedelsföretag',
    copy: 'Se vilka uppgifter som behöver kunna tas fram om leveranser och leverantörer.',
  },
  'haccp-sma-livsmedelsforetag': {
    title: 'HACCP för små livsmedelsföretag',
    copy: 'Förstå hur flexibilitet, risker och dokumentation kan anpassas till en liten verksamhet.',
  },
  'faroanalys-livsmedel': {
    title: 'Faroanalys för livsmedelsföretag',
    copy: 'Se hur relevanta faror identifieras och hur detaljnivån kan anpassas.',
  },
  'avvikelser-korrigerande-atgarder-livsmedel': {
    title: 'Avvikelser och korrigerande åtgärder',
    copy: 'Vad bör hända när en kontroll eller kritisk gräns inte blir som planerat?',
  },
  'verifiering-egenkontroll-livsmedel': {
    title: 'Verifiering av egenkontrollen',
    copy: 'Se hur verksamheten kan kontrollera att rutiner och uppföljning verkligen fungerar.',
  },
  'verifiering-haccp-livsmedel': {
    title: 'Verifiering av HACCP-baserade förfaranden',
    copy: 'Se hur verksamheten kan kontrollera att rutiner och uppföljning verkligen fungerar.',
  },
  'spara-sparbarhetsuppgifter-livsmedel': {
    title: 'Hur länge ska spårbarhetsuppgifter sparas?',
    copy: 'Läs om rekommenderade lagringstider och varför produktens verkliga livslängd spelar roll.',
  },
};

function setMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function setOpenGraphMeta(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

export function getSeoPageSlugFromPath(pathname: string): SeoPageSlug | null {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
  return normalizedPath in seoPages ? (normalizedPath as SeoPageSlug) : null;
}


type SeoLandingPageProps = {
  page: SeoPageSlug;
};

export function SeoLandingPage({ page }: SeoLandingPageProps) {
  const content = seoPages[page];
  const canonicalUrl = `${siteUrl}/${content.slug}`;
  const relatedSlugs = content.relatedSlugs ?? [];

  useEffect(() => {
    document.title = content.title;
    setMeta('description', content.description);
    setMeta('robots', 'index, follow');
    setCanonical(canonicalUrl);
    setOpenGraphMeta('og:title', content.title);
    setOpenGraphMeta('og:description', content.description);
    setOpenGraphMeta('og:url', canonicalUrl);
  }, [canonicalUrl, content.description, content.title]);

  return (
    <main className="public-site">
      <nav className="public-nav" aria-label="Publik navigation">
        <a className="public-brand" href="/">
          <img src={brandAssets.logo} alt="Min Egenkontroll" />
        </a>
        <div className="public-nav-actions">
          <a href="/#how">Så fungerar det</a>
          <a href="/signup">Gå med</a>
        </div>
      </nav>

      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-eyebrow">{content.eyebrow}</p>
          <h1>{content.heading}</h1>
          <p className="public-copy">{content.intro}</p>
          <div className="public-hero-actions">
            <a className="public-primary" href="/signup">Gå med i förhandslanseringen</a>
            <a className="public-secondary" href="/">Se Min Egenkontroll</a>
          </div>
        </div>
      </section>

      <section className="public-band">
        <div className="public-section-heading">
          <p className="public-eyebrow">Det viktigaste</p>
          <h2>Förstå vad som behöver fungera i praktiken.</h2>
        </div>
        <div className="public-steps">
          {content.benefits.map(([title, copy]) => (
            <article className="public-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section">
        <div>
          <p className="public-eyebrow">Så fungerar det</p>
          <h2>{content.practicalHeading}</h2>
          <p className="public-copy">{content.practicalText}</p>
          {content.sourceUrl && content.sourceLabel ? (
            <p className="public-copy">
              Källa och vidare läsning: <a href={content.sourceUrl}>{content.sourceLabel}</a>.
            </p>
          ) : null}
          {content.sourceNote ? <p className="public-copy">{content.sourceNote}</p> : null}
        </div>
        <div>
          <h2>{content.examplesHeading}</h2>
          <div className="control-chip-grid">
            {content.examples.map((example) => <span key={example}>{example}</span>)}
          </div>
        </div>
      </section>

      <section className="public-band">
        <div className="public-section-heading">
          <p className="public-eyebrow">Frågor och svar</p>
          <h2>Vanliga frågor</h2>
        </div>
        <div className="faq-list">
          {content.faq.map(([question, answer]) => (
            <article className="public-card" key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section">
        <div>
          <p className="public-eyebrow">Läs vidare</p>
          <h2>Fortsätt med nästa del</h2>
        </div>
        <div className="faq-list">
          {relatedSlugs.map((slug) => (
            <a className="public-card" href={`/${slug}`} key={slug}>
              <h3>{guideLinks[slug].title}</h3>
              <p>{guideLinks[slug].copy}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="public-cta">
        <p className="public-eyebrow">Förhandslansering</p>
        <h2>Prova Min Egenkontroll kostnadsfritt under utvecklingsperioden.</h2>
        <a className="public-primary" href="/signup">Gå med i förhandslanseringen</a>
      </section>

      <footer className="public-footer">
        <span>© 2026 Min Egenkontroll</span>
        <div className="public-footer-links">
          <a href="/integritetspolicy">Integritetspolicy</a>
          <a href="/anvandarvillkor">Användarvillkor</a>
        </div>
      </footer>
    </main>
  );
}
