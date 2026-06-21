# AGENTS.md – Egenkontroll

Det här dokumentet styr hur framtida AI-/Codex-sessioner ska arbeta i projektet **Egenkontroll**.

Projektet är i planerings- och uppstartsfas. Den befintliga kodbasen kan vara tom eller ofullständig. GitHub-issues och produktbesluten i detta dokument ska därför väga tyngre än eventuell framtida provisorisk implementation om de står i konflikt.

## Produktmål

Egenkontroll är en mobilförst SaaS-webapp för digital egenkontroll i livsmedelsverksamheter som restauranger, caféer, bagerier, foodtrucks och mindre butiker.

Appen ska göra det enkelt för verksamheter att:

- skapa egna kontrolltyper, objekt, gränsvärden, frekvenser och instruktioner,
- utföra dagens kontroller snabbt från mobilen,
- dokumentera avvikelser direkt i arbetsflödet,
- följa upp öppna avvikelser,
- spara all historik med datum, tid och användare,
- dela dokumentation säkert via tidsbegränsad läslänk/QR vid myndighetskontroll,
- exportera relevant historik till PDF/CSV.

## Grundprincip för användarflödet

Alla kontroller ska följa samma grundlogik:

1. Öppna kontroll.
2. Fyll i uppgifter.
3. Hantera eventuell avvikelse.
4. Spara.
5. Dokumentationen hamnar automatiskt i historiken.

Det ska inte kännas som separata system för temperaturer, städning, datummärkning, varumottagning och spårbarhet. Det ska kännas som ett gemensamt kontrollflöde där endast formulärinnehållet varierar.

## Beslutad MVP-riktning

- MVP ska vara en SaaS-app med stöd för flera kundverksamheter från start.
- Varje verksamhet ska ha isolerad data genom organisation/verksamhetstillhörighet.
- Första versionen ska vara svensk i språk och exempel, men tekniskt förberedd för fler språk.
- Appen ska använda hybridstart: föreslagna mallar finns, men allt ska vara redigerbart.
- Exempelmallar: kyltemperaturer, städning, datummärkning, varumottagning, spårbarhet och egenkontrollrunda.
- Roller i MVP: ägare/admin, personal och inspektör via tidsbegränsad read-only-länk.
- Bilduppladdning ska ingå i MVP, inklusive möjlighet att ta foto direkt från mobil där webbläsaren stödjer det.
- Avvikelser ska kunna vara öppna och följas upp, inte bara dokumenteras historiskt.
- Betalning/prenumeration byggs inte i första MVP, men arkitekturen ska inte blockera framtida prenumerationskoppling.

## Centrala moduler

### 1. Dashboard / Idag

Daglig startsida för personalen. Ska visa:

- dagens kontroller,
- status per kontroll,
- antal klara/ej klara,
- öppna avvikelser,
- snabb väg till att utföra kontroll.

### 2. Kontrollmotor

Generell motor som kan hantera olika kontrolltyper med samma grundflöde:

- mätvärden, t.ex. temperatur,
- checklistor med OK/Ej OK,
- formulärfält,
- kommentarer,
- bilder/foton,
- gränsvärden,
- obligatoriska åtgärder vid avvikelse.

### 3. Kontrolltyper och objekt

Admin ska kunna skapa och redigera:

- kontrolltyper,
- objekt/kontrollpunkter,
- frekvenser,
- gränsvärden,
- instruktioner,
- aktiv/inaktiv-status.

Objekt ska normalt inte hårdraderas om de har historik. Använd inaktiv-status för att bevara historisk begriplighet.

### 4. Avvikelsehantering

När en kontrollpunkt avviker ska appen:

- visa tydlig röd status med text och ikon,
- kräva åtgärdstext innan kontrollen kan sparas,
- skapa avvikelse kopplad till kontrollregistrering, objekt, användare och tidpunkt,
- stödja minst statusarna `open` och `resolved`,
- visa öppna avvikelser på dashboarden,
- spara avvikelser i historiken.

### 5. Historik

Alla registreringar ska sparas med:

- verksamhet,
- kontrolltyp,
- objekt/kontrollpunkter,
- värden/svar,
- status,
- avvikelser och åtgärder,
- datum och tid,
- utförd av.

Historiken ska kunna filtreras på datumperiod, kontrolltyp, objekt, användare och status/avvikelse.

### 6. Delning / Inspektörsvy

Appen ska stödja tidsbegränsad read-only-delning via länk och QR-kod.

Delning ska kunna begränsas till:

- viss period,
- valda kontrolltyper,
- aktuell verksamhet.

Inspektörsvyn ska inte kräva vanligt användarkonto och ska inte kunna ändra data.

### 7. Export

MVP ska planeras för export av delad eller filtrerad historik till:

- PDF,
- CSV.

PDF ska vara läsbar och inspektörsvänlig. CSV ska vara enkel och strukturerad.

## Designprinciper

Appen ska vara:

- mobilförst,
- tumvänlig,
- tydlig,
- tillgänglig,
- modern men inte dekorativ på bekostnad av funktion,
- säker,
- konsekvent över alla kontrolltyper.

### CRUD-princip för administrerade resurser

När användaren kan skapa en verksamhetsrelaterad resurs ska AI:n som huvudregel även planera för:

- visa/lista,
- redigera,
- ta bort eller arkivera/inaktivera.

Detta gäller exempelvis:

- leverantörer,
- kontrolltyper,
- kontrollpunkter,
- kontrollobjekt,
- användare,
- roller,
- delningslänkar.

Undantag ska vara medvetna och dokumenterade. Historiska registreringar, revisionsspår och signerade kontroller ska normalt inte hårdraderas.

Nya funktioner ska inte betraktas som kompletta enbart för att användaren kan lägga till data.

### Gemensamma UI-komponenter och konsekvens

Återkommande UI-element ska byggas som gemensamma komponenter och återanvändas, inte återskapas lokalt i varje vy.

Detta gäller särskilt:

- tillbaka-knappar,
- sidhuvuden,
- formulärfält,
- datumfält,
- primär- och sekundärknappar,
- statusbadges,
- kortlayout,
- tabeller/listor,
- tomma tillstånd och felmeddelanden.

Innan en ny vy eller funktion implementeras ska AI/Codex först kontrollera om det redan finns en komponent eller ett etablerat mönster som ska återanvändas.

Om en vy behöver avvika från ett befintligt UI-mönster ska avvikelsen vara medveten och motiveras i issue eller PR. Små visuella skillnader, som olika pilsymboler i tillbaka-knappar, olika datumfält eller olika statusbadges, ska betraktas som inkonsekvenser om de inte är uttryckligen motiverade.

Visuell riktning:

- ljus, ren layout,
- rundade kort,
- mycket vit yta,
- lila/blå primär accent,
- grönt för OK,
- rött för avvikelse,
- status ska alltid visas med text och ikon, inte endast färg,
- stöd för mörkt läge bör planeras, men är inte viktigare än tydlig MVP.

Primär bottennavigation bör i MVP utgå från:

- Idag,
- Historik,
- Lägg till,
- Delning,
- Meny.

## Tekniska riktlinjer

Föreslagen standard om inget annat är beslutat:

- TypeScript.
- React-baserad webapp, gärna Next.js eller Vite beroende på projektets faktiska startpunkt.
- Supabase för databas, auth, storage och RLS.
- Vercel för hosting.
- GitHub issues ska vara huvudkälla för arbetsplan.

Om teknisk stack redan har skapats i repo ska den analyseras innan ändringar. Byt inte stack utan att först förklara varför och få godkännande.

## Datamodell – principer

Datamodellen ska förberedas för SaaS och multi-tenant från start.

Centrala begrepp att planera för:

- organization/business,
- users/profiles,
- organization_memberships,
- roles,
- control_templates,
- control_types,
- control_objects,
- control_fields eller field definitions,
- control_runs / performed checks,
- control_run_items,
- deviations,
- attachments,
- share_links,
- exports.

RLS ska utgå från att en användare bara får läsa/skriva data i verksamheter där användaren är medlem, förutom tidsbegränsade read-only-länkar för inspektörer.

## Arbetssätt för AI/Codex

- Börja inte bygga stora funktioner utan att först kontrollera relevant issue.
- Håll varje ändring liten, testbar och kopplad till en issue.
- Fråga om saknade värden innan kod skrivs, särskilt Supabase project id, tabellnamn, miljövariabler, auth-flöden och RLS-antaganden.
- Gissa inte vid tekniska oklarheter.
- Förklara först kort vad som ska göras och varför.
- Leverera kompletta filer eller tydliga diff-liknande ändringar när användaren behöver klistra in manuellt.
- Undvik att skapa provisoriska mönster som senare måste rivas upp, särskilt kring auth, multi-tenant och historik.
- Prioritera stabil grundarkitektur före många UI-detaljer.
- Betalning ska inte byggas i MVP om det inte finns ett särskilt issue för det.

## Definition av klar MVP

En första MVP är klar när en verksamhet kan:

1. logga in,
2. skapa eller använda föreslagna kontrolltyper,
3. skapa/redigera objekt,
4. utföra dagens kontroller från mobil vy,
5. registrera avvikelser med obligatorisk åtgärd,
6. se öppna avvikelser,
7. stänga/följa upp avvikelser,
8. se filtrerbar historik,
9. ladda upp/ta bilder i relevanta kontroller,
10. skapa tidsbegränsad läslänk/QR för inspektör,
11. exportera historik/delning till PDF och CSV.