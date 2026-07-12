# Research och riktning för startsidan

Issue: #255
Datum: 2026-07-12
Relaterar till: Epic #243

## Syfte och arbetssätt

Detta är ett evidensbaserat beslutsunderlag för nästa startsidesprototyp. Det bygger på de låsta besluten i Fas 3, befintlig innehållsinventering och en avgränsad extern research. Det bygger inte UI, ändrar inte produktionskod och fastställer inte slutlig marknadsföringscopy.

Tre read-only researchspår genomfördes och vägdes samman av huvudagenten:

1. konverterande SaaS- och produktstartsidor,
2. kunskaps-, resurs-, mall- och sökupplevelser,
3. visuell kvalitet, tekniskt förtroende, tillgänglighet och lugn premiumdesign.

### Läsnyckel

- **Observerat**: synligt på en namngiven extern sida eller verifierat i repot.
- **Princip**: stöd i en källas design- eller tillgänglighetsvägledning.
- **Rekommendation**: Min Egenkontrolls egen slutsats. Den är inte ett påstående om en extern aktör.

Extern research kontrollerades den 2026-07-12 mot de länkade primärkällorna. Exempel är principreferenser, inte mallar som ska kopieras.

## 1. Problemdiagnos

Den stängda prototypen i issue #253 och PR #254 var avsiktligt tillfällig, men produktägarens bedömning är tydlig: uttrycket blev för myndighetslikt, för försiktigt och för svagt kommersiellt. Den ska inte återanvändas som visuell grund. [PR #254](https://github.com/robinstromberg/Egenkontroll/pull/254)

### Varför riktningen missade målet

1. **Lugn förväxlades med återhållsamhet i hela hierarkin.** Neutral bas och tydlighet är låsta beslut, men när rubriker, produktbild, kontrast, rytm och handlingar alla tonas ned blir resultatet anonymt snarare än tryggt.
2. **Produkten etablerades inte som bevis tidigt nog.** Startsidan ska tydligt visa att appen är modern, stabil och enkel i vardagen. En abstrakt appbrygga efter mycket orientering räcker inte för en besökare som utvärderar lösningen.
3. **Plattformens vägar fick inte en tydlig jobbfördelning.** Kunskap, mallar/checklistor, verktyg och appen måste vara begripliga som olika svar på olika behov, inte likvärdiga dekorativa kort eller alternativa kampanjer.
4. **Kommersiell tydlighet blandades ihop med aggressivitet.** En tydlig produktvy, ett specifikt värdelöfte och en synlig väg till appen är inte samma sak som upprepade signup-CTA:er, prisblock eller breda compliance-löften.
5. **Förtroende behandlades som tonalitet snarare än bevis.** För målgruppen byggs förtroende av konkreta arbetsflöden, begriplig begränsning, källprincip och riktigt produktgränssnitt - inte av myndighetslik gråhet eller ogrundade badges.

### Feltolkningar som inte får återupprepas

- Tolka inte "hjälp först" som att appen ska dödas visuellt på startsidan. Startsidan har tydlig app-synlighet enligt [PUBLIC_PILOT_WIREFRAMES.md](PUBLIC_PILOT_WIREFRAMES.md).
- Tolka inte "lugn" som stora tomma ytor, blek kontrast eller enbart tunna kort på varmvit bakgrund.
- Tolka inte "tekniskt förtroende" som enterprise-språk, på hittade kundloggor, certifieringar, siffror eller garantier.
- Tolka inte "resurser" som en komplett bibliotekskatalog på startsidan. Startsidan ska orientera, medan `/kunskapsbank` är sök- och upptäcktsytan.
- Tolka inte "vanliga frågor" som sökdata innan data faktiskt finns.
- Återanvänd inte den avvisade prototypens visuella uttryck som default. Endast dess fristående scope och dess strukturella lärande är historiskt relevant.

## 2. Researchmatris

| Referens | Observerat strukturellt och visuellt | Produkt, resurser och konvertering | Princip att låna | Ska uttryckligen inte kopieras |
| --- | --- | --- | --- | --- |
| [SafetyCulture Library](https://safetyculture.com/library) | Biblioteket har synlig sökning, kategorier och en tydlig uppdelning i mallar, kurser och kuraterade samlingar. | Resurser är en egen ingång till nyttan, inte bara en footerlänk. Produktens arbetsuppgifter, inte funktionsnamn, är den naturliga bron till användning. | Separera "hitta en resurs" från "använda arbetsverktyget" och gör båda begripliga på första skärmen. | Marketplace-bredd, mycket stora kategorimängder, nedladdningssiffror och global enterprise-ton. |
| [MaintainX](https://www.getmaintainx.com/) | Sidan grupperar produktutbud kring vardagliga arbetsresultat som arbetsorder, checklistor och rapportering. Resursnavet är separat och innehåller bland annat resurscenter, lärande och kalkylator. | Hero kombinerar ett klart produktlöfte med en fri start och en demoingång. | Låt produktområden förklaras med vad användaren får gjort, och håll resursvägen synlig men separat från säljvägen. | Tät enterprise-navigering, demo som standardväg för alla och tal/logotyper som Min Egenkontroll inte kan belägga. |
| [FoodDocs](https://www.fooddocs.com/) och [How FoodDocs works](https://www.fooddocs.com/how-does-fooddocs-work) | Branschrelevant exempel med produktförhandsvisning nära hero, resursnav med fria mallar och kunskapsbas, samt en tydlig arbetsflödesförklaring. | Prova/demo och produktvy är framträdande. FoodDocs anger också att fria mallar är vägledning och ska granskas och anpassas. | Visa ett verkligt, vardagsnära appflöde tidigt och mark resursers begränsningar tydligt. | Snabba tidslöften, betyg-/compliance-påståenden eller formuleringar som antyder att en mall automatiskt ger regelefterlevnad. |
| [Linear](https://linear.app/) och [Linear Method](https://linear.app/method) | Hero visar produkten omedelbart. Den fortsatta sidan är ordnad som få steg i en sammanhängande arbetsberättelse, inte som en blandad funktionskatalog. | Produkt, resurser, inloggning och signup är tydligt avskilda i navigationen. | En huvuduppgift per sektion, verkliga produktvyer och ett flöde som gör nästa steg uppenbart. | Mörk, teknikcentrerad stil, AI-agent-språk och produktutvecklingsmetaforer som inte passar små verksamheter inom livsmedel. |
| [USWDS Search](https://designsystem.digital.gov/components/search/) | Vägledningen rekommenderar ett fullt sökfält på startsidan, en riktig fältetikett och att söktermen finns kvar på resultatsidan. | Sök är en orienteringshandling, inte en dekorativ ikon eller ersättning för en resultatsida. | Sokfalt med synlig svensk fråga, riktig label, submit-knapp och separat resultatsida. | Avancerad sökning som standard eller en autocomplete som försöker ersatta resultat och filtrering. |
| [GOV.UK Content Design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/) | Vägledningen utgår från vad användaren behöver veta eller gora och från rätt mängd, format och plats för innehåll. | Principen är innehållsstrategisk, inte en visuell stilreferens. | Namnge ingångar efter användarbehov och gör varje sektion ansvarig för en tydlig nästa handling. | Myndighetsestetik, generisk offentlig ton eller att använda GOV.UK som visuell mall. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | AA omfattar bland annat minst 4.5:1 kontrast för normal text, reflow vid 320 CSS-pixlar och tangentbordsatkomst. | Tillgänglighet är en del av förtroende och kvalitet, inte en efterkontroll. | Kontrast, semantisk struktur, synligt fokus, tangentbord och mobil reflow ska vara designkrav för båda koncepten. | Att reducera tillgänglighet till enbart färgkontrast eller ikonval. |

### Samlad slutsats från researchen

**Observerat:** De starkaste referenserna gör produkten konkret tidigt, men låter resurser ha en egen tydlig roll. De försöker inte trycka in hela informationsarkitekturen i hero.

**Princip:** En startsida är bättre när den hjälper besökaren att snabbt välja rätt nästa steg, när sökning är en faktisk väg till resultat och när kvaliteten fungerar på mobil och med tangentbord.

**Rekommendation:** Min Egenkontroll ska kombinera FoodDocs branschnärhet, SafetyCultures resursorientering och Linears hierarkiska disciplin - utan att låna deras copy, stil eller kommersiella påståenden.

## 3. Designprinciper för Min Egenkontroll

### Typografi

- Använd en varm, rak sans-serif med god svensk teckentäckning och tydliga siffror. Rubriker ska vara kompakta och beslutsstarka; brödtext ska vara lugn och saklig.
- Skapa hierarki med vikt, storlek, radlängd och sektionstitlar - inte med versaler, små grå etiketter eller dekorativa ord.
- Hero-rubriken ska tala om vilket konkret vardagsproblem plattformen hjälper till med. Den ska inte vara ett abstrakt varumärkesmantra.

### Luft och densitet

- Ge hero och produktbevis luft, men låt varje följande sektion ha en tydlig uppgift och synlig informationstäthet.
- Använd fasta vertikala rytmer och tydliga sektionsbrott. Luft kommer från ordning och läsbarhet, inte från en stor tom yta mellan svaga budskap.
- Undvik kortmattor. En rad med få vägval får vara kompakt; resursurval ska visa tillräckligt med metadata för att skilja format, ämne och nytta.

### Färg och kontrast

- Följ den låsta basen: varm vit, svart och grafit dominerar. Grönt, gult/orange och rött är funktionella statusfärger med textlig förklaring.
- Hero och primär handling får ha hög kontrast och en tydlig färgroll. Kontrast är en premiumsignal när den används precist.
- Säkra minst WCAG 2.2 AA för normal text och testa reflow på 320 CSS-pixlar. Se [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Produktbilder och appskärmar

- Visa en riktig eller mycket realistisk appskärm i hero: exempelvis dagens kontroller, en avvikelse med åtgärd eller historik som går att följa upp. Visa ett avgränsat flöde, inte en miniatyr av hela systemet.
- Produktvyn ska svara på "hur ser arbetet ut i praktiken?" med läsbara UI-detaljer och en diskret bildtext. Den är bevis, inte bakgrundsdekoration.
- Använd inte dashboard-collage, abstrakta grafer eller funktioner som produkten saknar.

### Illustrationer och ikoner

- Använd ikoner för etablerade handlingar och resurstyp: artikel, mall/checklista, verktyg och app. Texten ska fortfarande tala om vart handlingen leder.
- Eventuella illustrationer ska förklara en process eller ge en konkret situationskontext. Undvik generiska stockbilder och dekoration som konkurrerar med produkten.
- Informativa bilder ska ha ändamålsenlig alt-text; dekorativa bilder ska vara dolda för hjälpmedel.

### Kort, sektioner och bakgrunder

- Kort används för verkligt avgränsade val, resurser eller bevis. Varje kort har en huvudlänk eller handling och ska inte innehålla flera konkurrerande CTA:er.
- Variera sektioner med kompakta neutraltonade band, tydliga linjer och enstaka kontrastytor. Undvik att varje sektion blir en svavande, rundad panel.
- Lägg inte produktbild, kundloggor och flera säljbudskap i samma kort.

### Rörelse och animation

- Rörelse får enbart förklara en övergång, visa respons eller styra fokus. Den ska vara kort, aldrig ett krav för att förstå innehåll och respektera `prefers-reduced-motion`.
- Undvik autoplay, parallax, oavbrutna karuseller och visuella effekter som gör sidan "techig" men svårare att läsa.

### Mobil och desktop

- Mobilens enkolumnsordning är den semantiska sanningen. Desktop får skapa en tydlig hero-duo och en bredare översikt, aldrig en annan informationshistoria.
- Minst 44 x 44 px för meny- och ikonhandlingar är fortsatt riktmärke i wireframearbetet. Alla interaktioner ska vara tangentbordsåtkomliga och ha synligt fokus.
- Sök, vägval, resurskort och CTA ska rymmas utan horisontell scroll eller kolliderande text på liten skärm.

### Tekniskt förtroende

- Bygg förtroende med observerbar konkrethet: produktvy, "så fungerar det", faktagranskningsprincip, källor och tydliga begränsningar.
- Visa endast verifierbara bevis. Kundcase, loggor, statistik, certifieringar, integrationsloggor och driftslöften är frivilliga tills de finns underlag för dem.
- Använd status och dokumentationsspråk sakligt: exempelvis "spara, följ upp och visa historik" i stället för oprecisa lovord.

### Kommersiell självsäkerhet utan aggressivitet

- Hero har en tydlig apphandling, men den paras med en lika begriplig hjälp- eller orienteringsväg.
- Varje efterföljande sektion har högst en primär handling. Upprepa inte "Kom igång" efter varje block.
- Appen kopplas till ett konkret nästa steg: börja digitalt, samla återkommande kontroller eller följ upp avvikelser. Resurser och information ska fortfarande fungera utan konto.

## 4. Informationsarkitektur för startsidan

Startsidan är plattformens vägvisare. Den ska inte bli en lång faktasida, ett miniatyrbibliotek eller en traditionell SaaS-landningssida. Blockordningen nedan behåller de låsta kraven från [PUBLIC_PILOT_WIREFRAMES.md](PUBLIC_PILOT_WIREFRAMES.md) och skärper produktbevis och sökning.

| Ordning | Block | Syfte och innehåll | Primär handling | Ska inte finnas |
| --- | --- | --- | --- | --- |
| 1 | Header | Varumärke, innehållsvägarna Kunskap, Mallar och checklistor, Verktyg, Utbildning, Referenser och källor, Appen samt Logga in och Kom igång. | Öppna vald faktisk destination. | Dold menydjup, otydliga samlingsnamn eller en sälj-CTA som ersätter navigationen. |
| 2 | Hero: plattform och produkt | Ett tydligt svenskt värdelöfte för små livsmedelsverksamheter, kort förklaring av hjälp + app och en konkret produktvy av ett vardagsflöde. | Primär: öppna appens start-/signupväg. Sekundär: "Hitta rätt hjälp" till orienteringsytan nedan. | Prisblock, kundloggor utan tillstånd eller produktpåståenden som inte kan visas. |
| 3 | Snabb orientering | Fyra tydliga vägar: **Appen**, **Information**, **Mallar och checklistor**, **Verktyg**. Varje väg namnger behov, format och en destination. | En specifik handling per väg, exempelvis "Läs om HACCP" eller "Öppna kontrollplansmallen". | Fyra likadana generiska kort med samma signupknapp. |
| 4 | Sök | Fullbreddsfält med labeln "Sök i Min Egenkontroll" och texten "Sök i vägledning, mallar och checklistor". Skickar till en separat resultatsida och behåller sökfrasen. | "Sök". | En ensam förstoringsglasikon, falsk autocomplete eller avancerad sökning som standard. |
| 5 | Frågor och svar att börja med | Tre datamärkta platshållare: **[Verifiera i Search Console: fråga 1]**, **[Verifiera i Search Console: fråga 2]**, **[Verifiera i Search Console: fråga 3]**. Varje leder till befintlig eller planerad relevant sida. | Öppna svaret. | Påståendet "vanligast" innan Search Console, sökloggar eller användarresearch verifierar urvalet. |
| 6 | Utvalt för HACCP-piloten | Ett begränsat urval: HACCP-navet, faroanalys, kontrollplan och en tydligt markerad framtida verktygskandidat. Visar resurstyp och konkret nytta. | Öppna respektive resurs. | Hela katalogen eller en listning utan resurstyp och relevans. |
| 7 | Så fungerar appen | Tre steg med riktig produktvy: planera kontroll, genomför och dokumentera, följ upp och hitta historik. Förbinder appen med vardagsnyttan utan att beskriva den som ett komplett HACCP-system. | "Se hur appen stöttar vardagen" till relevant app-/högintentsida. | Funktionskatalog, abstrakta ikoner i stället för produktbevis eller ogrundad compliance-garanti. |
| 8 | Förtroende och källprincip | Kort förklaring: primärkällor, direktlänkar, faktakontrolldatum och skillnad mellan regel, myndighetsvägledning och praktiskt exempel. | "Så arbetar vi med källor". | Myndighetston, tomma kvalitetssigill eller en lång redaktionell uppsats. |
| 9 | Lugn slutväg | En sammanfattande nästa-steg-yta med ett appval och ett hjälpval, beroende på besökarens avsikt. | Antingen appingång eller resursbibliotek. | Upprepade CTA:er, pop-up eller registreringsvägg. |
| 10 | Footer | Orientering, legal/förtroende, appingångar och kontakt/support när destinationen är beslutad. | Vald footerlänk. | En andra hero eller stor säljkampanj. |

### Sök- och frågelogik

**Verifierat dataläge:** Repot innehåller en installationsguide för Search Console och Bing Webmaster, men ingen export med sökfrågor, klick eller visningar. [SEARCH_MEASUREMENT_SETUP.md](../SEARCH_MEASUREMENT_SETUP.md) anger också att Search Console måste skapas och verifieras manuellt. Därför får inga tre frågor kallas störst, vanligast eller mest sökta i denna fas.

**Rekommenderat beteende:**

1. Sökfrasen skickas till en tydlig resultatsida och fylls i igen där.
2. Resultatet visar resurstyp, ämne, kort nytta och tydlig länk.
3. Nollträff visar den sökta frasen, gör en ny sökning enkel och erbjuder relevanta ämnen eller resurstypvägar - aldrig påstådda alternativa träffar.
4. Efter att data finns väljs de tre frågorna utifrån Search Console, interna sökloggar/nollträffar och användarresearch. Urval, datumintervall och kriterium dokumenteras på sidan eller i dess innehållskällor.

## 5. Två visuella koncept

### Koncept A: Precisionsateljén

**Kärnkänsla:** Modern, varm och exakt. Känslan är ett välgjort arbetsverktyg med redaktionell säkerhet, snarare än en myndighetssida eller en generisk SaaS-sida.

- **Typografisk karaktär:** Tydlig grotesk, stark rubrikhierarki, lugn brödtext och små funktionella metadataetiketter.
- **Layoutprincip:** Kontrasterande hero i två kolumner med appskärm som bevis. Därefter en tät, rytmisk följd av vägval, sökning, utvalda resurser och produktflöde.
- **Produktbildens roll:** Herons andra halva visar ett avgränsat mobil- eller desktopflöde med läsbara handlingar och status.
- **Färganvändning:** Varmvit bakgrund, grafitsvart text och en djupt grön primär handling. Gult/orange och rött enbart för meningsbärande status.
- **Hero och sektioner:** Hero med appskärm; orienteringsband med fyra vägar; sökyta med konkret fråga; resurslista med tydliga typetiketter; sakligt förtroendeblock.
- **Styrkor:** Bygger förtroende och kommersiell tydlighet snabbt. Passar en stressad, icke-teknisk målgrupp utan att bli enkelspårigt.
- **Risker:** Kan bli för "operations-SaaS" om kontrast, statusmarkeringar eller produktpanelen blir för tunga. Kräver en verklig produktbild av god kvalitet.
- **Rekommenderad användning:** Förstahandsval för startsidan och högintentsidor som ska visa appen med trygghet.

### Koncept B: Den redaktionella verkstaden

**Kärnkänsla:** En samtida kunskapsplattform där produkt, praktiska resurser och förklaringar sitter ihop. Mer editorial än Koncept A, men fortfarande tydligt kommersiell.

- **Typografisk karaktär:** Mer markerad rubrikkaraktär och generös men kontrollerad läsyta. Formaten markeras med tydliga ord och diskreta ikoner.
- **Layoutprincip:** Hero har en konkret situationsbild eller ett dokument-/produktutdrag som ram för plattformens löfte. Sökning och resursvägar kommer mycket tidigt; appdemonstrationen följer efter att besökaren har valt avsikt.
- **Produktbildens roll:** Produktvyn visas som en del av "så fungerar det" och i ett sammanhang med mall, kontroll och uppföljning.
- **Färganvändning:** Mer varmvit och grafit, med en enda mörk kontrastyta för produkt eller app. Accenter är sparsmakade och semantiska.
- **Hero och sektioner:** Hero med plattformslöfte; sökyta nära toppen; redaktionellt kuraterade frågor och resurser; produktflöde i tre steg; stark källprincip.
- **Styrkor:** Gör "Sveriges bästa hjälp med egenkontroll" mycket tydligt och kan växa till bred kunskapsplattform utan att sida efter sida ser likadan ut.
- **Risker:** Appen kan bli för sekundär om hero inte har ett tillräckligt starkt produktbevis och en tydlig appväg.
- **Rekommenderad användning:** Stark riktning för kunskapsnav, resursbibliotek och content-ledda kampanjer; kan användas på startsidan om appbeviset skarps.

### Det som skiljer koncepten

Koncept A börjar med **produktens vardagsbevis** och leder sedan till hjälp. Koncept B börjar med **plattformens orientering och nytta** och förankrar sedan appen i ett sammanhang. Båda avvisar myndighetsminimalism och flashig SaaS: de använder hög kontrast, tydlig rytm, konkret innehåll och begränsad rörelse.

## 6. Rekommendation

**Välj Koncept A: Precisionsateljén som grund för nästa startsidesprototyp.**

Det är det starkaste svaret på produktägarens korrigerade målbild:

- Det gör appen synlig och värdig som huvudprodukt från första skärmen.
- Det gör tekniskt förtroende konkret genom ett riktigt arbetsflöde, inte genom abstrakt design eller ogrundade bevis.
- Det bevarar strategin "hjälp först" genom att ge kunskap, mallar/checklistor, verktyg och sökning lika tydliga men annorlunda jobb.
- Det passar små livsmedelsverksamheter som vill förstå vad som ska göras och snabbt kunna börja, snarare än att utvärdera en stor enterpriseplattform.
- Det ger den visuella kraft som saknades i den avvisade prototypen, samtidigt som den låsta neutrala och skandinaviska arbetsriktningen behålls.

Koncept B ska inte kasseras. Det är den rekommenderade sekundära riktningen för ett alternativ i nästa prototyp och är sannolikt mer passande för `/kunskapsbank` och bredare innehållsytor. Men det bör inte vara startsidans huvudriktning innan ett starkt produktbevis kan garanteras.

## 7. Exakt designbrief för nästa startsidesprototyp

### Uppdrag

Bygg **två visuellt olika startsidesalternativ**, både mobilförst och desktopanpassade, på samma informationsarkitektur. Alternativ A bygger på Precisionsateljén och alternativ B på Den redaktionella verkstaden. De ska vara visuella prototyper, inte produktion och inte slutlig copy.

### Gemensamma fasta krav

- Behåll `/` som startsida och respektera de låsta innehålldelarna: Kunskap, Mallar och checklistor, Verktyg, Utbildning, Referenser och källor och Appen.
- Hero ska visa ett konkret appflöde och ett tydligt värdelöfte för små livsmedelsverksamheter. Ingen generisk dashboard, ingen falsk data och inget löfte om komplett HACCP-system.
- Visa fyra tydliga snabba vägar: Appen, Information, Mallar och checklistor, Verktyg. Varje har en riktig eller tydligt markerad framtida destination och en egen handling.
- Sätt ett riktigt sökfält tidigt på sidan: synlig text **"Sök i vägledning, mallar och checklistor"**, korrekt label **"Sök i Min Egenkontroll"**, submit-knapp och design för separat resultatsida med kvarvarande sökfras.
- Visa tre frågekort som tydligt är markerade **"Plats för verifierad sökfråga"** tills Search Console-/sökdata finns. Uttala dig inte om sökvolym eller rangordning.
- Visa ett begränsat HACCP-urval med minst: HACCP-navet, faroanalys, kontrollplansmallen och en markerad verktygskandidat. Resurstyp och praktisk nytta ska synas.
- På framtida informationssidor ska relevanta utskrivbara eller nedladdningsbara mallar visas i sitt sammanhang och samtidigt vara samlade i resursbiblioteket. En resurs får aldrig ersättas av en registreringsvägg.
- Inkludera "Så fungerar det" med tre observerbara appsteg: planera, genomföra/dokumentera, följa upp/hitta historik.
- Inkludera ett kort förtroendeblock om källor, faktagranskning och begränsningar. Använd inga ogrundade loggor, kundcitat, certifieringar eller siffror.
- Avsluta med en lugn tvåvägsyta: en apphandling och en hjälpväg. Ingen popup, registreringsvägg eller upprepad signup-CTA.
- Mobil: en kolumn, logisk läsordning, inga horisontella listor, stora tryckytor och synligt fokus. Desktop: hero får vara två kolumner, men andra brytpunkter får inte ändra historiens ordning.
- Visuellt system: varmvit, svart och grafit; cirka 95 procent neutralt; semantiska statusfärger med text; WCAG 2.2 AA som minimikrav; rörelse bara när den förklarar en interaktion.

### Alternativ A: prototypinstruktion

Låt hero vara den visuellt starkaste ytan: tydlig rubrik, en mörk eller grafitkontrasterande produktpanel och en primär apphandling. Direkt under visar sidan fyra kompakta vägar och sökning. Håll korten plana och exakta, med tydliga avdelare i stället för mycket skugga eller rundning. Det ska kännas som ett modernt arbetsverktyg som också kan guida.

### Alternativ B: prototypinstruktion

Låt hero ge plattformens orientering och en mer redaktionell situations- eller resursyta, men behåll en tydlig produktbild och appväg i samma första skärm. Sökning och de fyra vägarna är mer framträdande än i A. Låt utvalda frågor och resurser skapa en redaktionell rytm, medan produktflödet visar hur hjälp kan bli löpande arbete.

### Bedömningsfrågor för produktägaren

1. Visar hero tydligt både plattformens hjälp och ett verkligt appbevis utan att tvinga fram signup?
2. Kan en besökare på fem sekunder välja mellan app, information, mall/checklista och verktyg?
3. Känns kontrast, typografi och produktbild attraktivt och modernt utan att bli flashigt eller enterprise-kallt?
4. Är sök, resurser och frågor tillräckligt tydliga utan att påstå data som saknas?
5. Fungerar samma hierarki på 375 px och bred desktop utan att viktig information doldas eller kläms ihop?

## Källor

### Strategiska källor i repot

- [AGENTS.md](../../AGENTS.md)
- [PIVOT.md](PIVOT.md)
- [CURRENT_STATE_INVENTORY.md](CURRENT_STATE_INVENTORY.md)
- [CONTENT_MIGRATION_MAP.md](CONTENT_MIGRATION_MAP.md)
- [PHASE_3_DECISIONS.md](PHASE_3_DECISIONS.md)
- [PUBLIC_PILOT_WIREFRAMES.md](PUBLIC_PILOT_WIREFRAMES.md)
- [Epic #243](https://github.com/robinstromberg/Egenkontroll/issues/243)
- [Issue #253](https://github.com/robinstromberg/Egenkontroll/issues/253) och [stängda PR #254](https://github.com/robinstromberg/Egenkontroll/pull/254)

### Externa källor, kontrollerade 2026-07-12

- [SafetyCulture Library](https://safetyculture.com/library)
- [MaintainX](https://www.getmaintainx.com/)
- [FoodDocs](https://www.fooddocs.com/) och [How FoodDocs works](https://www.fooddocs.com/how-does-fooddocs-work)
- [Linear](https://linear.app/) och [Linear Method](https://linear.app/method)
- [USWDS Search](https://designsystem.digital.gov/components/search/)
- [GOV.UK Content Design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
