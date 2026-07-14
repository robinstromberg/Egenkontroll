# AGENTS.md - Min Egenkontroll

Detta dokument styr hur Codex och andra AI-agenter ska arbeta i repot. Det viktigaste är att skydda produktens kärnflöden samtidigt som Min Egenkontroll utvecklas från en app med en hemsida till en bredare plattform för egenkontroll.

## Strategisk källa till sanning

Läs `docs/strategy/PIVOT.md` innan arbete som rör strategi, positionering, publik webb, SEO, innehåll, resurser, varumärke, designsystem, wireframes, repo-separation eller större appredesign.

`PIVOT.md` beskriver vad plattformen ska bli och i vilken ordning större förändringar ska genomföras. En enskild issue får precisera en uppgift men ska inte tyst gå emot den strategin.

Viktiga övergripande principer:

- Hjälp först → bygg förtroende → låt användaren prova värdet → visa sedan att samma arbete kan göras ännu enklare i appen.
- Samma varumärke och designsystem överallt, men olika wireframes beroende på sidans uppgift och besökarens avsikt.
- Appen är kärnprodukten men ska inte pressas fram på varje publik sida.
- Befintliga publika URL:er och värdefullt innehåll ska inventeras innan de tas bort eller byggs om.
- Pivotarbete får inte frysa kritiska buggar eller viktig produktutveckling i appen.

## Projektet i korthet

Min Egenkontroll är en mobilförst tjänst för små livsmedelsverksamheter som restauranger, caféer, bagerier, foodtrucks och butiker.

Kärnprodukten är en SaaS-app som ersätter pärmar, utspridda checklistor och osäker dokumentation med ett enkelt arbetsflöde:

1. ansvarig skapar verksamhet och kontrolltyper,
2. personalen ser dagens kontroller,
3. personalen dokumenterar på plats,
4. avvikelser och åtgärder sparas tydligt,
5. historik och delning kan visas vid kontroll.

Runt appen byggs en publik plattform med kunskap, mallar, checklistor, verktyg och andra resurser. Den publika plattformen ska ge verklig hjälp först och låta appen vara ett naturligt nästa steg när den är relevant.

Produkten ska kännas trygg, snabb och begriplig för användare utan teknisk bakgrund. Appen är inte en teknisk formulärbyggare som råkar kunna dokumentera kontroller; den är ett arbetsverktyg för egenkontroll.

## Arbetsregler för Codex

- Läs relevant GitHub-issue, befintliga docs och berörda filer innan du ändrar något.
- Gör minsta säkra ändring som löser uppgiften. Undvik opportunistiska refaktorer.
- Ändra bara filer som hör till uppgiften. Lämna användarens övriga ändringar i fred.
- Gissa inte tekniska fakta. Inventera koden, databasen eller dokumentationen och markera osäkerhet när något inte kan verifieras.
- Fråga eller pausa vid risk för destruktiva åtgärder, dataförlust, auth/RLS-förändringar, produktionspåverkan eller otydlig scope.
- Kör relevanta kontroller efter ändring. För appkod är normal nivå `npm run typecheck`, `npm run lint` och `npm run build`. För docs-only räcker normalt diffkontroll och en tydlig notering om att appbygge inte behövdes.
- Sammanfatta ändrade filer, verifiering och kvarvarande risker i slutet.
- Större pivotarbete och appbuggar ska normalt hållas i separata issues, branches och PR:er.
- Starta inte flera större pivotfaser samtidigt. Följ genomförandeordningen i `docs/strategy/PIVOT.md` om inte en issue uttryckligen motiverar annat.

## Återkoppling efter pivot- och strategiarbete

- När en uppgift rör pivot, strategi, publik webb, SEO, innehåll, resurser, varumärke, designsystem, wireframes, repo-separation eller större appredesign ska slutsvaret innehålla en tydlig sektion med rubriken `Till ChatGPT inför nästa steg`.
- Där ska agenten lista exakt vilka strategidokument, Epic, issues och PR:er ChatGPT ska läsa innan nästa steg rekommenderas.
- Lista alltid den nya eller uppdaterade leveransen samt de relevanta tidigare källorna. Förlita dig inte på att chattkontexten är komplett.
- En sammanfattning i slutsvaret ersätter inte källorna. Uppmana ChatGPT att läsa dem innan beslut eller nästa uppgift rekommenderas.

## Användning av subagents

- Använd inte subagents för små, lokala eller tydligt avgränsade ändringar.
- Använd subagents vid komplex felsökning, större analys eller när problemet kan ligga i flera delar av systemet, till exempel frontend, Supabase, RLS eller deploy.
- Låt subagents i första hand undersöka parallellt med tydligt avgränsade uppdrag.
- Huvudagenten ska väga ihop resultaten och välja väg framåt innan kod ändras.
- Som standard ska endast en agent åt gången göra överlappande kodändringar.
- Använd minsta antal subagents som behövs, normalt 2–3, för att undvika onödig resursförbrukning.
- Subagents får inte kringgå reglerna för särskilt skyddade områden. Riskfyllda eller destruktiva ändringar kräver fortfarande paus och tydligt godkännande.

## Särskilt skyddade områden

Ändra inte följande utan tydlig issue och extra försiktighet:

- Supabase Auth, sessionshantering och lösenords-/magic-link-flöden.
- RLS-policies, helper-funktioner och migrationer.
- Organisations- och rollbehörigheter.
- Historik, export, inspektörslänkar och delning.
- Kontrollsparning, avvikelser och bilagereferenser.
- Storage-bucketar, backup, återställning eller radering.
- Produktionsmiljö, Vercel environment variables och Supabase-projekt.

Service role-nycklar får aldrig in i frontend, repo, issues eller logs. Secrets, backupfiler, manifest från backupkörningar och testdata ska inte committas.

## Produktprinciper

- Mobil först: primära flöden ska fungera väl på smal skärm och med tumme.
- Få steg: användaren ska se nästa rimliga handling utan att läsa instruktioner länge.
- Samma mentala modell: det man bygger i editorn ska likna det personalen fyller i vid kontroll.
- Historik är helig: förändringar får inte förstöra spårbarhet, export, delning eller gamla kontroller.
- Säkert men inte tungt: skydda organisationsdata utan att göra vardagsflödet trögt.
- Svenska först i MVP: UI-copy, felmeddelanden och tomma lägen ska vara tydliga på svenska.
- Stressad användare är default: designa för någon som står i kök, butik eller servering och vill bli klar.

## UI- och frontendregler

- Återanvänd befintliga komponenter, CSS-mönster och ikon-/bildsystem innan du skapar nytt, om inte uppgiften uttryckligen bygger det nya gemensamma design- eller brandsystemet.
- Bevara den etablerade appstrukturen med dashboard-vyer och nedernavigering där den används tills en godkänd uppgiftsanpassad wireframe ersätter den.
- Kontrollera mobilbredd när layout ändras. Text får inte tryckas ihop, hamna utanför kanten eller döljas av nedernavigering.
- Knappar, tomma lägen och felmeddelanden ska beskriva vad användaren kan göra nu.
- Publika sidor ska optimeras efter sidans avsikt. En faktasida, en mall, ett verktyg och en köpsida ska inte automatiskt följa samma layout eller ha samma grad av appförsäljning.
- På publika informations- och resurssidor ska besökaren normalt få den utlovade nyttan före kommersiella budskap.
- Skapa inte stora appbanners, upprepade CTA-knappar, popup-försäljning eller aggressiva registreringsuppmaningar som standard. Appen ska visas där den är ett naturligt och relevant nästa steg.
- AI-synlighet ska byggas in i relevanta sidmallar; skapa inte en separat AI-wireframe.
- PWA ska inte lova offline-funktion som inte finns. Offline-läge ska vara tydligt och blockera osäker sparning.

## Publikt innehåll och URL:er

- Ta inte bort eller bygg om befintliga SEO-/kunskapssidor från grunden utan inventering.
- Klassificera befintliga sidor som behåll, förbättra, byt sidtyp, slå ihop eller ta bort och omdirigera.
- Bevara värdefulla befintliga URL:er när det är möjligt.
- Vid borttagning eller sammanslagning ska omdirigering planeras när en relevant ersättningssida finns.
- Massproduktion av nya sidor ska inte gå före beslut om informationsstruktur, sidtyper och kvalitetsnivå.

## Arbetsgång för SEO-, GEO- och kunskapsinnehåll

När en ny faktasida, artikel, FAQ eller ett nytt ämneskluster tas fram ska följande arbetsgång användas:

1. Utgå från ett verifierat sökbehov, en dokumenterad användarfråga eller en tydlig del av ett beslutat ämneskluster. Kontrollera först att frågan inte redan besvaras tillräckligt på en befintlig sida.
2. Definiera en primär fråga och sökintention för sidan. När en närliggande fråga kan besvaras självständigt ska den normalt få en egen sida i stället för att göra den första sidan onödigt bred.
3. Hitta den mest precisa relevanta primärkällan. För sakfrågor som behandlas i Livsmedelsverkets vägledning ska Kontrollwiki användas som förstahandskälla: https://kontrollwiki.livsmedelsverket.se/. Följ vidare till den konkreta artikeln eller underkategorin som faktiskt stöder svaret; hänvisa inte enbart till startsidan.
4. Komplettera vid behov med Livsmedelsverket, EUR-Lex, svensk lagstiftning eller annan ansvarig myndighets primärmaterial. Kontrollwiki är inte en ersättning för själva rättsakten när lagtexten behöver kontrolleras.
5. Skilj tydligt mellan bindande regler, myndighetsvägledning och Min Egenkontrolls praktiska förklaring eller exempel.
6. Skriv med egna ord. Kopiera inte källtext. Ge ett kort, självständigt svar nära toppen och fördjupa endast med den information som behövs för den avgränsade frågan.
7. Använd tydliga definitioner, frågebaserade mellanrubriker, konkreta steg, relevanta småföretagsexempel och tydliga gränsdragningar där svaret beror på verksamhetens risker eller förutsättningar.
8. Länka direkt till de källsidor som använts och ange källtyp, faktakontrolldatum och relevanta begränsningar. Varje väsentligt sakpåstående ska kunna spåras till en källa.
9. Länka sidan till rätt ämnesnav och till ett begränsat antal närliggande frågor med förklarad relation. Undvik duplicerat innehåll och flera sidor som konkurrerar om samma sökintention.
10. Leverera hela svaret och den praktiska nyttan före appbudskap. Appen får därefter visas som ett naturligt nästa steg när den löser ett konkret återkommande arbetsbehov.

Målet är en konsekvent kedja:

**verifierad fråga → avgränsad sida → exakt primärkälla → lättbegripligt svar → tydlig internlänkning → relevant nästa steg**

## Datamodell och säkerhet

Den centrala modellen är organisationsbaserad. Data ska alltid kopplas till rätt `organization_id` och skyddas av RLS. Viktiga områden:

- profiler, organisationer, medlemskap och inbjudningar,
- kontrolltyper, kontrollpunkter/objekt och fältdefinitioner,
- kontrollkörningar, kontrollrader, avvikelser och bilagor,
- delningslänkar, exportloggar och inspektörsvyer.

Barnrader ska höra till rätt parent och organisation. Vid arkivering används i första hand `active=false` när historik kan finnas. Hård radering ska behandlas som riskfyllt.

## Supabase och Vercel

- Supabase används för Auth, Postgres, RLS, RPC och Storage.
- Vercel används för frontend/API-deploys och miljövariabler.
- Migrationer ska alltid skapas som nya filer. Ändra inte gamla applicerade migrationer.
- RLS- och RPC-ändringar ska ha smoke-test eller tydlig manuell verifiering.
- Storage-filer ingår inte i vanliga databasbackuper och kräver separat backup-rutin.
- Vercel Preview är rätt plats för visuell kontroll innan merge när UI ändras.

## När du är osäker

Välj det som:

1. skyddar kunddata,
2. bevarar historik och spårbarhet,
3. gör vardagsflödet enklare för en icke-teknisk användare,
4. följer den aktuella fasen i `docs/strategy/PIVOT.md`,
5. håller ändringen liten och testbar,
6. lämnar en tydlig issue eller dokumenterad uppföljning för större förbättringar.
