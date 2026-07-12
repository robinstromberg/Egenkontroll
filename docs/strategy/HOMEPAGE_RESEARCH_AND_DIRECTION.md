# Research och riktning for startsidan

Issue: #255
Datum: 2026-07-12
Relaterar till: Epic #243

## Syfte och arbetssatt

Detta ar ett evidensbaserat beslutsunderlag for nasta startsidesprototyp. Det bygger pa de lasta besluten i Fas 3, befintlig innehallsinventering och en avgransad extern research. Det bygger inte UI, andrar inte produktionskod och faststaller inte slutlig marknadsforingscopy.

Tre read-only researchspar genomfordes och vagdes samman av huvudagenten:

1. konverterande SaaS- och produktstartsidor,
2. kunskaps-, resurs-, mall- och sokupplevelser,
3. visuell kvalitet, tekniskt fortroende, tillganglighet och lugn premiumdesign.

### Lasnyckel

- **Observerat**: synligt pa en namngiven extern sida eller verifierat i repot.
- **Princip**: stod i en kallas design- eller tillganglighetsvagledning.
- **Rekommendation**: Min Egenkontrolls egen slutsats. Den ar inte ett pastaende om en extern aktor.

Extern research kontrollerades den 2026-07-12 mot de lankade primarkallorna. Exempel ar principreferenser, inte mallar som ska kopieras.

## 1. Problemdiagnos

Den stangda prototypen i issue #253 och PR #254 var avsiktligt tillfallig, men produktagarens bedomning ar tydlig: uttrycket blev for myndighetslikt, for forsiktigt och for svagt kommersiellt. Den ska inte ateranvandas som visuell grund. [PR #254](https://github.com/robinstromberg/Egenkontroll/pull/254)

### Varfor riktningen missade malet

1. **Lugn forvaxlades med aterhallsamhet i hela hierarkin.** Neutral bas och tydlighet ar lasta beslut, men nar rubriker, produktbild, kontrast, rytm och handlingar alla tonas ned blir resultatet anonymt snarare an tryggt.
2. **Produkten etablerades inte som bevis tidigt nog.** Startsidan ska tydligt visa att appen ar modern, stabil och enkel i vardagen. En abstrakt appbrygga efter mycket orientering racker inte for en besokare som utvarderar losningen.
3. **Plattformens vagar fick inte en tydlig jobbfordelning.** Kunskap, mallar/checklistor, verktyg och appen maste vara begripliga som olika svar pa olika behov, inte likvardiga dekorativa kort eller alternativa kampanjer.
4. **Kommersiell tydlighet blandades ihop med aggressivitet.** En tydlig produktvy, ett specifikt vardelofte och en synlig vag till appen ar inte samma sak som upprepade signup-CTA:er, prisblock eller breda compliance-loften.
5. **Förtroende behandlades som tonalitet snarare an bevis.** For malgruppen byggs fortroende av konkreta arbetsfloden, begriplig begransning, kallprincip och riktigt produktgranssnitt - inte av myndighetslik gråhet eller ogrundade badges.

### Feltolkningar som inte far aterupprepas

- Tolka inte "hjalp forst" som att appen ska dodas visuellt pa startsidan. Startsidan har tydlig app-synlighet enligt [PUBLIC_PILOT_WIREFRAMES.md](PUBLIC_PILOT_WIREFRAMES.md).
- Tolka inte "lugn" som stora tomma ytor, blek kontrast eller enbart tunna kort pa varmvit bakgrund.
- Tolka inte "tekniskt fortroende" som enterprise-språk, pa hittade kundloggor, certifieringar, siffror eller garantier.
- Tolka inte "resurser" som en komplett bibliotekskatalog pa startsidan. Startsidan ska orientera, medan `/kunskapsbank` ar sok- och upptacktsytan.
- Tolka inte "vanliga fragor" som sokdata innan data faktiskt finns.
- Ateranvand inte den avvisade prototypens visuella uttryck som default. Endast dess fristående scope och dess strukturella larande ar historiskt relevant.

## 2. Researchmatris

| Referens | Observerat strukturellt och visuellt | Produkt, resurser och konvertering | Princip att lana | Ska uttryckligen inte kopieras |
| --- | --- | --- | --- | --- |
| [SafetyCulture Library](https://safetyculture.com/library) | Biblioteket har synlig sokning, kategorier och en tydlig uppdelning i mallar, kurser och kuraterade samlingar. | Resurser ar en egen ingang till nyttan, inte bara en footerlank. Produktens arbetsuppgifter, inte funktionsnamn, ar den naturliga bron till anvandning. | Separera "hitta en resurs" fran "anvanda arbetsverktyget" och gor båda begripliga pa forsta skarmen. | Marketplace-bredd, mycket stora kategorimangder, nedladdningssiffror och global enterprise-ton. |
| [MaintainX](https://www.getmaintainx.com/) | Sidan grupperar produktutbud kring vardagliga arbetsresultat som arbetsorder, checklistor och rapportering. Resursnavet ar separat och innehaller bland annat resurscenter, larande och kalkylator. | Hero kombinerar ett klart produktlofte med en fri start och en demoingang. | Lat produktomraden forklaras med vad anvandaren far gjort, och hall resursvagen synlig men separat fran saljvagen. | Tat enterprise-navigering, demo som standardvag for alla och tal/logotyper som Min Egenkontroll inte kan belagga. |
| [FoodDocs](https://www.fooddocs.com/) och [How FoodDocs works](https://www.fooddocs.com/how-does-fooddocs-work) | Branschrelevant exempel med produktforhandsvisning nara hero, resursnav med fria mallar och kunskapsbas, samt en tydlig arbetsflodesforklaring. | Provar/demo och produktvy ar framtradande. FoodDocs anger ocksa att fria mallar ar vagledning och ska granskas och anpassas. | Visa ett verkligt, vardagsnara appflode tidigt och mark resursers begransningar tydligt. | Snabba tidsloften, betyg-/compliance-pastaenden eller formuleringar som antyder att en mall automatiskt ger regelefterlevnad. |
| [Linear](https://linear.app/) och [Linear Method](https://linear.app/method) | Hero visar produkten omedelbart. Den fortsatta sidan ar ordnad som fa steg i en sammanhangande arbetsberattelse, inte som en blandad funktionskatalog. | Produkt, resurser, inloggning och signup ar tydligt avskilda i navigationen. | En huvuduppgift per sektion, verkliga produktvyer och ett flode som gor nasta steg uppenbart. | Mork, teknikcentrerad stil, AI-agent-sprak och produktutvecklingsmetaforer som inte passar smä verksamheter inom livsmedel. |
| [USWDS Search](https://designsystem.digital.gov/components/search/) | Vägledningen rekommenderar ett fullt sokfalt pa startsidan, en riktig faltetikett och att soktermen finns kvar pa resultatsidan. | Sok ar en orienteringshandling, inte en dekorativ ikon eller ersattning for en resultatsida. | Sokfalt med synlig svensk fraga, riktig label, submit-knapp och separat resultatsida. | Avancerad sokning som standard eller en autocomplete som försöker ersatta resultat och filtrering. |
| [GOV.UK Content Design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/) | Vägledningen utgar fran vad anvandaren behover veta eller gora och fran ratt mangd, format och plats for innehall. | Principen ar innehallsstrategisk, inte en visuell stilreferens. | Namnge ingangar efter anvandarbehov och gor varje sektion ansvarig for en tydlig nasta handling. | Myndighetsestetik, generisk offentlig ton eller att anvanda GOV.UK som visuell mall. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | AA omfattar bland annat minst 4.5:1 kontrast for normal text, reflow vid 320 CSS-pixlar och tangentbordsatkomst. | Tillganglighet ar en del av fortroende och kvalitet, inte en efterkontroll. | Kontrast, semantisk struktur, synligt fokus, tangentbord och mobil reflow ska vara designkrav for bada koncepten. | Att reducera tillganglighet till enbart fargkontrast eller ikonval. |

### Samlad slutsats fran researchen

**Observerat:** De starkaste referenserna gor produkten konkret tidigt, men later resurser ha en egen tydlig roll. De forsoker inte trycka in hela informationsarkitekturen i hero.

**Princip:** En startsida ar battre nar den hjalper besokaren att snabbt valja ratt nasta steg, nar sokning ar en faktisk vag till resultat och nar kvaliteten fungerar pa mobil och med tangentbord.

**Rekommendation:** Min Egenkontroll ska kombinera FoodDocs branschnarhet, SafetyCultures resursorientering och Linears hierarkiska disciplin - utan att lana deras copy, stil eller kommersiella pastaenden.

## 3. Designprinciper for Min Egenkontroll

### Typografi

- Anvand en varm, rak sans-serif med god svensk teckentackning och tydliga siffror. Rubriker ska vara kompakta och beslutsstarka; brodtext ska vara lugn och saklig.
- Skapa hierarki med vikt, storlek, radlangd och sektionstitlar - inte med versaler, små grå etiketter eller dekorativa ord.
- Hero-rubriken ska tala om vilket konkret vardagsproblem plattformen hjalper till med. Den ska inte vara ett abstrakt varumarkesmantra.

### Luft och densitet

- Ge hero och produktbevis luft, men lat varje foljande sektion ha en tydlig uppgift och synlig informationstethet.
- Anvand fasta vertikala rytmer och tydliga sektionsbrott. Luft kommer fran ordning och lasbarhet, inte fran en stor tom yta mellan svaga budskap.
- Undvik kortmattor. En rad med fa vagval far vara kompakt; resursurval ska visa tillrackligt med metadata for att skilja format, amne och nytta.

### Farg och kontrast

- Folj den lasta basen: varm vit, svart och grafit dominerar. Gront, gult/orange och rott ar funktionella statusfarger med textlig forklaring.
- Hero och primar handling far ha hog kontrast och en tydlig färgroll. Kontrast ar en premiumsignal nar den anvands precist.
- Sakra minst WCAG 2.2 AA for normal text och testa reflow pa 320 CSS-pixlar. Se [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Produktbilder och appskarmar

- Visa en riktig eller mycket realistisk appskarm i hero: exempelvis dagens kontroller, en avvikelse med atgard eller historik som gar att folja upp. Visa ett avgransat flode, inte en miniatyr av hela systemet.
- Produktvyn ska svara pa "hur ser arbetet ut i praktiken?" med lasbara UI-detaljer och en diskret bildtext. Den ar bevis, inte bakgrundsdekoration.
- Anvand inte dashboard-collage, abstrakta grafer eller funktioner som produkten saknar.

### Illustrationer och ikoner

- Anvand ikoner for etablerade handlingar och resurstyp: artikel, mall/checklista, verktyg och app. Texten ska fortfarande tala om vart handlingen leder.
- Eventuella illustrationer ska forklara en process eller ge en konkret situationskontext. Undvik generiska stockbilder och dekoration som konkurrerar med produkten.
- Informativa bilder ska ha andamalsenlig alt-text; dekorativa bilder ska vara dolda for hjalpmedel.

### Kort, sektioner och bakgrunder

- Kort anvands for verkligt avgransade val, resurser eller bevis. Varje kort har en huvudlank eller handling och ska inte innehalla flera konkurrerande CTA:er.
- Variera sektioner med kompakta neutraltonade band, tydliga linjer och enstaka kontrastytor. Undvik att varje sektion blir en svavande, rundad panel.
- Lagg inte produktbild, kundloggor och flera saljbudskap i samma kort.

### Rorelse och animation

- Rorelse far enbart forklara en overgang, visa respons eller styra fokus. Den ska vara kort, aldrig ett krav for att forsta innehall och respektera `prefers-reduced-motion`.
- Undvik autoplay, parallax, oavbrutna karuseller och visuella effekter som gor sidan "techig" men svarare att lasa.

### Mobil och desktop

- Mobilens enkolumnsordning ar den semantiska sanningen. Desktop far skapa en tydlig hero-duo och en bredare oversikt, aldrig en annan informationshistoria.
- Minst 44 x 44 px for meny- och ikonhandlingar ar fortsatt riktmarke i wireframearbetet. Alla interaktioner ska vara tangentbordsatkomliga och ha synligt fokus.
- Sok, vagval, resurskort och CTA ska rymmas utan horisontell scroll eller kolliderande text pa liten skarm.

### Tekniskt fortroende

- Bygg fortroende med observerbar konkrethet: produktvy, "sa fungerar det", faktagranskningsprincip, källor och tydliga begransningar.
- Visa endast verifierbara bevis. Kundcase, loggor, statistik, certifieringar, integrationsloggor och driftsiftsloften ar frivilliga tills de finns underlag for dem.
- Anvand status och dokumentationssprak sakligt: exempelvis "spara, folj upp och visa historik" i stallet for oprecisa lovord.

### Kommersiell sjalvsakerhet utan aggressivitet

- Hero har en tydlig apphandling, men den paras med en lika begriplig hjalp- eller orienteringsvag.
- Varje efterfoljande sektion har hogst en primar handling. Upprepa inte "Kom igang" efter varje block.
- Appen kopplas till ett konkret nasta steg: borja digitalt, samla aterkommande kontroller eller folj upp avvikelser. Resurser och information ska fortfarande fungera utan konto.

## 4. Informationsarkitektur for startsidan

Startsidan ar plattformens vagvisare. Den ska inte bli en lang faktasida, ett miniatyrbibliotek eller en traditionell SaaS-landningssida. Blockordningen nedan behaller de lasta kraven fran [PUBLIC_PILOT_WIREFRAMES.md](PUBLIC_PILOT_WIREFRAMES.md) och skarper produktbevis och sokning.

| Ordning | Block | Syfte och innehall | Primar handling | Ska inte finnas |
| --- | --- | --- | --- | --- |
| 1 | Header | Varumarke, innehallsvagarna Kunskap, Mallar och checklistor, Verktyg, Utbildning, Referenser och kallor, Appen samt Logga in och Kom igang. | Oppna vald faktisk destination. | Dold menydjup, otydliga samlingsnamn eller en salj-CTA som ersatter navigationen. |
| 2 | Hero: plattform och produkt | Ett tydligt svensk vardelofte for sma livsmedelsverksamheter, kort forklaring av hjalp + app och en konkret produktvy av ett vardagsflode. | Primar: oppna appens start-/signupvag. Sekundar: "Hitta ratt hjalp" till orienteringsytan nedan. | Prisblock, kundloggor utan tillstand eller produktpastaenden som inte kan visas. |
| 3 | Snabb orientering | Fyra tydliga vagar: **Appen**, **Information**, **Mallar och checklistor**, **Verktyg**. Varje vag namnger behov, format och en destination. | En specifik handling per vag, exempelvis "Las om HACCP" eller "Oppna kontrollplansmallen". | Fyra likadana generiska kort med samma signupknapp. |
| 4 | Sok | Fullbreddsfalt med labeln "Sok i Min Egenkontroll" och texten "Sok i vagledning, mallar och checklistor". Skickar till en separat resultatsida och behaller sokfrasen. | "Sok". | En ensam forstoringsglasikon, falsk autocomplete eller avancerad sokning som standard. |
| 5 | Fragor och svar att borja med | Tre datamarkta platshallare: **[Verifiera i Search Console: fraga 1]**, **[Verifiera i Search Console: fraga 2]**, **[Verifiera i Search Console: fraga 3]**. Varje leder till befintlig eller planerad relevant sida. | Oppna svaret. | Pastaendet "vanligast" innan Search Console, sokloggar eller anvandarresearch verifierar urvalet. |
| 6 | Utvalt for HACCP-piloten | Ett begransat urval: HACCP-navet, faroanalys, kontrollplan och en tydligt markerad framtida verktygskandidat. Visar resurstyp och konkret nytta. | Oppna respektive resurs. | Hela katalogen eller en listning utan resurstyp och relevans. |
| 7 | Sa fungerar appen | Tre steg med riktig produktvy: planera kontroll, genomfor och dokumentera, folj upp och hitta historik. Forbinder appen med vardagsnyttan utan att beskriva den som ett komplett HACCP-system. | "Se hur appen stottar vardagen" till relevant app-/hogintentsida. | Funktionskatalog, abstrakta ikoner i stallet for produktbevis eller ogrundad compliance-garanti. |
| 8 | Fortroende och kallprincip | Kort forklaring: primarkallor, direktlankar, faktakontrolldatum och skillnad mellan regel, myndighetsvagledning och praktiskt exempel. | "Sa arbetar vi med kallor". | Myndighetston, tomma kvalitetssigill eller en lang redaktionell uppsats. |
| 9 | Lugn slutvag | En sammanfattande nasta-steg-yta med ett appval och ett hjalpval, beroende pa besokarens avsikt. | Antingen appingang eller resursbibliotek. | Upprepade CTA:er, pop-up eller registreringsvagg. |
| 10 | Footer | Orientering, legal/förtroende, appingangar och kontakt/support nar destinationen ar beslutad. | Vald footerlank. | En andra hero eller stor saljkampanj. |

### Sok- och fragelogik

**Verifierat datalage:** Repot innehaller en installationsguide for Search Console och Bing Webmaster, men ingen export med sokfragor, klick eller visningar. [SEARCH_MEASUREMENT_SETUP.md](../SEARCH_MEASUREMENT_SETUP.md) anger ocksa att Search Console maste skapas och verifieras manuellt. Darfor far inga tre fragor kallas storst, vanligast eller mest sokta i denna fas.

**Rekommenderat beteende:**

1. Sokfrasen skickas till en tydlig resultatsida och fylls i igen dar.
2. Resultatet visar resurstyp, amne, kort nytta och tydlig lank.
3. Nolltraff visar den sokta frasen, gor en ny sokning enkel och erbjuder relevanta amnen eller resurstypvagar - aldrig pastaende alternativa traffar.
4. Efter att data finns valjs de tre fragorna utifran Search Console, interna sokloggar/nolltraffar och anvandarresearch. Urval, datumintervall och kriterium dokumenteras pa sidan eller i dess innehallskallor.

## 5. Tva visuella koncept

### Koncept A: Precisionsateljen

**Karnkansla:** Modern, varm och exakt. Känslan ar ett välgjort arbetsverktyg med redaktionell sakerhet, snarare an en myndighetssida eller en generisk SaaS-sida.

- **Typografisk karaktar:** Tydlig grotesk, stark rubrikhierarki, lugn brodtext och små funktionella metadataetiketter.
- **Layoutprincip:** Kontrasterande hero i tva kolumner med appskarm som bevis. Darest efter en tät, rytmisk foljd av vagval, sokning, utvalda resurser och produktflode.
- **Produktbildens roll:** Heroens andra halva visar ett avgransat mobil- eller desktopflode med lasbara handlingar och status.
- **Farganvandning:** Varmvit bakgrund, grafitsvart text och en djupt gron primar handling. Gult/orange och rott enbart for meningsbar status.
- **Hero och sektioner:** Hero med appskarm; orienteringsband med fyra vagar; sokyta med konkret fraga; resurslista med tydliga typetiketter; sakligt fortroendeblock.
- **Styrkor:** Bygger fortroende och kommersiell tydlighet snabbt. Passar en stressad, icke-teknisk malgrupp utan att bli enkelspårigt.
- **Risker:** Kan bli for "operations-SaaS" om kontrast, statusmarkeringar eller produktpanelen blir for tunga. Kraver en verklig produktbild av god kvalitet.
- **Rekommenderad anvandning:** Forstahandsval for startsidan och hogintentsidor som ska visa appen med trygghet.

### Koncept B: Den redaktionella verkstaden

**Karnkansla:** En samtida kunskapsplattform dar produkt, praktiska resurser och forklaringar sitter ihop. Mer editorial än Koncept A, men fortfarande tydligt kommersiell.

- **Typografisk karaktar:** Mer markerad rubrikkaraktar och generos men kontrollerad lasyta. Formaten markeras med tydliga ord och diskreta ikoner.
- **Layoutprincip:** Hero har en konkret situationsbild eller ett dokument-/produktutdrag som ram for plattformens lovte. Sokning och resursvagar kommer mycket tidigt; appdemonstrationen foljer efter att besokaren har valt avsikt.
- **Produktbildens roll:** Produktvyn visas som en del av "sa fungerar det" och i ett sammanhang med mall, kontroll och uppfoljning.
- **Farganvandning:** Mer varmvit och grafit, med en enda mork kontrastyta for produkt eller app. Accenter ar sparsmakade och semantiska.
- **Hero och sektioner:** Hero med plattformslöfte; sokyta nara toppen; redaktionellt kuraterade fragor och resurser; produktflode i tre steg; stark kallprincip.
- **Styrkor:** Gor "Sveriges basta hjalp med egenkontroll" mycket tydligt och kan vaxa till bred kunskapsplattform utan att sida efter sida ser likadan ut.
- **Risker:** Appen kan bli for sekundar om hero inte har ett tillrackligt starkt produktbevis och en tydlig appvag.
- **Rekommenderad anvandning:** Stark riktning for kunskapsnav, resursbibliotek och content-ledda kampanjer; kan anvandas pa startsidan om appbeviset skarps.

### Det som skiljer koncepten

Koncept A borjar med **produktens vardagsbevis** och leder sedan till hjalp. Koncept B borjar med **plattformens orientering och nytta** och forankrar sedan appen i ett sammanhang. Bada avvisar myndighetsminimalism och flashig SaaS: de anvander hog kontrast, tydlig rytm, konkret innehall och begransad rorelse.

## 6. Rekommendation

**Valj Koncept A: Precisionsateljen som grund for nasta startsidesprototyp.**

Det ar det starkaste svaret pa produktagarens korrigerade malbild:

- Det gor appen synlig och vardig som huvudprodukt fran forsta skarmen.
- Det gor tekniskt fortroende konkret genom ett riktigt arbetsflode, inte genom abstrakt design eller ogrundade bevis.
- Det bevarar strategin "hjalp forst" genom att ge kunskap, mallar/checklistor, verktyg och sokning lika tydliga men annorlunda jobb.
- Det passar sma livsmedelsverksamheter som vill forsta vad som ska goras och snabbt kunna borja, snarare an att utvardera en stor enterpriseplattform.
- Det ger den visuella kraft som saknades i den avvisade prototypen, samtidigt som den lasta neutrala och skandinaviska arbetsriktningen behalls.

Koncept B ska inte kasseras. Det ar den rekommenderade sekundara riktningen for ett alternativ i nasta prototyp och ar sannolikt mer passande for `/kunskapsbank` och bredare innehallsytor. Men det bor inte vara startsidans huvudriktning innan ett starkt produktbevis kan garanteras.

## 7. Exakt designbrief for nasta startsidesprototyp

### Uppdrag

Bygg **tva visuellt olika startsidesalternativ**, bade mobilforst och desktopanpassade, pa samma informationsarkitektur. Alternativ A bygger pa Precisionsateljen och alternativ B pa Den redaktionella verkstaden. De ska vara visuella prototyper, inte produktion och inte slutlig copy.

### Gemensamma fasta krav

- Behall `/` som startsida och respektera de lasta innehalldelarna: Kunskap, Mallar och checklistor, Verktyg, Utbildning, Referenser och kallor och Appen.
- Hero ska visa ett konkret appflode och ett tydligt vardelofte for sma livsmedelsverksamheter. Ingen generisk dashboard, ingen falsk data och inget lofte om komplett HACCP-system.
- Visa fyra tydliga snabba vagar: Appen, Information, Mallar och checklistor, Verktyg. Varje har en riktig eller tydligt markerad framtida destination och en egen handling.
- Satt ett riktigt sokfalt tidigt pa sidan: synlig text **"Sok i vagledning, mallar och checklistor"**, korrekt label **"Sok i Min Egenkontroll"**, submit-knapp och design for separat resultatsida med kvarvarande sokfras.
- Visa tre fragokort som tydligt ar markerade **"Plats for verifierad sokfraga"** tills Search Console-/sokdata finns. Utlat dig inte om sokvolym eller rangordning.
- Visa ett begransat HACCP-urval med minst: HACCP-navet, faroanalys, kontrollplansmallen och en markerad verktygskandidat. Resurstyp och praktisk nytta ska synas.
- Pa framtida informationssidor ska relevanta utskrivbara eller nedladdningsbara mallar visas i sitt sammanhang och samtidigt vara samlade i resursbiblioteket. En resurs far aldrig ersattas av en registreringsvagg.
- Inkludera "Sa fungerar det" med tre observerbara appsteg: planera, genomfora/dokumentera, folja upp/hitta historik.
- Inkludera ett kort fortroendeblock om kallor, faktagranskning och begransningar. Anvand inga ogrundade loggor, kundcitat, certifieringar eller siffror.
- Avsluta med en lugn tvavagseyta: en apphandling och en hjalpvag. Ingen popup, registreringsvagg eller upprepad signup-CTA.
- Mobil: en kolumn, logisk lasordning, inga horisontella listor, stora tryckytor och synligt fokus. Desktop: hero far vara tva kolumner, men andra brytpunkter far inte andra historiens ordning.
- Visuellt system: varmvit, svart och grafit; cirka 95 procent neutralt; semantiska statusfarger med text; WCAG 2.2 AA som minimikrav; rorelse bara nar den forklarar en interaktion.

### Alternativ A: prototypinstruktion

Lat hero vara den visuellt starkaste ytan: tydlig rubrik, en mork eller grafitkontrasterande produktpanel och en primar apphandling. Direkt under visar sidan fyra kompakta vagar och sokning. Håll korten plana och exakta, med tydliga avdelare i stallet for mycket skugga eller rundning. Det ska kannas som ett modernt arbetsverktyg som ocksa kan guida.

### Alternativ B: prototypinstruktion

Lat hero ge plattformens orientering och en mer redaktionell situations- eller resursyta, men behall en tydlig produktbild och appvag i samma forsta skarm. Sokning och de fyra vagarna ar mer framtradande an i A. Låt utvalda fragor och resurser skapa en redaktionell rytm, medan produktflodet visar hur hjalp kan bli lopande arbete.

### Bedomningsfragor for produktagaren

1. Visar hero tydligt bade plattformens hjalp och ett verkligt appbevis utan att tvinga fram signup?
2. Kan en besokare pa fem sekunder valja mellan app, information, mall/checklista och verktyg?
3. Känns kontrast, typografi och produktbild attraktivt och modernt utan att bli flashigt eller enterprise-kallt?
4. Ar sok, resurser och fragor tillrackligt tydliga utan att pasta data som saknas?
5. Fungerar samma hierarki pa 375 px och bred desktop utan att viktig information doldas eller klams ihop?

## Kallor

### Strategiska källor i repot

- [AGENTS.md](../../AGENTS.md)
- [PIVOT.md](PIVOT.md)
- [CURRENT_STATE_INVENTORY.md](CURRENT_STATE_INVENTORY.md)
- [CONTENT_MIGRATION_MAP.md](CONTENT_MIGRATION_MAP.md)
- [PHASE_3_DECISIONS.md](PHASE_3_DECISIONS.md)
- [PUBLIC_PILOT_WIREFRAMES.md](PUBLIC_PILOT_WIREFRAMES.md)
- [Epic #243](https://github.com/robinstromberg/Egenkontroll/issues/243)
- [Issue #253](https://github.com/robinstromberg/Egenkontroll/issues/253) och [stangda PR #254](https://github.com/robinstromberg/Egenkontroll/pull/254)

### Externa kallor, kontrollerade 2026-07-12

- [SafetyCulture Library](https://safetyculture.com/library)
- [MaintainX](https://www.getmaintainx.com/)
- [FoodDocs](https://www.fooddocs.com/) och [How FoodDocs works](https://www.fooddocs.com/how-does-fooddocs-work)
- [Linear](https://linear.app/) och [Linear Method](https://linear.app/method)
- [USWDS Search](https://designsystem.digital.gov/components/search/)
- [GOV.UK Content Design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
