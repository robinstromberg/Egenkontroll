# Kontrolltyper v2 – gemensamt produkt-, UX- och releasekontrakt

Datum: 2026-08-07  
Status: Beslutat kontrakt för fortsatt kontrolltypsarbete

## Syfte

Kontrolltyper v2 ska ge Min Egenkontroll en sammanhängande modell för att skapa, redigera, utföra och dokumentera kontroller utan att varje kontrolltyp blir ett eget delsystem.

Kontraktet gäller nya och omarbetade kontrolltyper och ska läsas tillsammans med:

- `AGENTS.md`
- `docs/strategy/VISUAL_SYSTEM_PLAN.md`
- `docs/AUDIT_TRAIL_AND_VERSIONING.md`
- `docs/product/control-types/README.md`
- respektive kontrolltyps detaljdefinition

En enskild implementationsissue får precisera detaljer men får inte tyst gå emot detta kontrakt.

## 1. En gemensam produktmodell, inte separata miniappar

Kontrolltyper får ha olika utförandeflöden när uppgiften kräver det, men ska dela gemensamma byggstenar för exempelvis:

- kontrollpunkter,
- schema och planerade tillfällen,
- instruktioner och verksamhetens kriterier/gränsvärden,
- `Ej aktuell` när kontrolltypen stödjer det,
- avvikelser och uppföljning,
- automatisk användare/datum/tid,
- versionering och snapshots,
- historik, rapportering och inspektörsvy.

Gemensam logik ska byggas centralt. En kontrolltyp får inte skapa en egen variant av samma plattformsfunktion bara för att den utvecklas senare eller i en separat branch/worktree.

## 2. Gemensam redigeringsmodell

Den nuvarande generella editorn bygger i stor utsträckning på att samma canvas används för förhandsvisning och redigering och att ett nytt formulärkort fälls in i den valda kontrollpunkten.

Kontrolltyper v2 ska i stället använda den tydligare mentala modellen:

> Kontrolltyp → lista/översikt över kontrollpunkter → redigera en punkt i ett tydligt redigeringsläge → spara → tillbaka till översikten.

Principer:

- Redigering av en punkt ska inte presenteras som ett nytt "kort ovanpå/inuti" samma punkt.
- En gemensam redigeringskomposition ska återanvändas mellan kontrolltyper.
- Varje kontrolltyp bestämmer vilka fält som är relevanta. Exempel: rengöring kan använda ett verksamhetsdefinierat godkännandekriterium medan temperatur använder gränsvärden.
- Samma mekanism ska kunna användas för kontextuell snabbredigering för owner/admin utan att skapa ett separat redigeringssystem.
- Staff ska inte få administrativa redigeringsåtgärder.

Detta är en avsiktlig UX-ändring, inte en visuell migrering förklädd till redesign.

## 3. Designsystem och branding är bindande

Nya v2-vyer ska kännas som en del av samma produkt även om de utvecklas efter övriga appen.

Därför gäller det befintliga visuella kontraktet utan undantag:

- semantiska `--ds-*`-tokens används för tema och visuella roller,
- generella UI-primitiver i `packages/design-system` återanvänds när beteendet passar,
- brandassets kommer från `@min-egenkontroll/brand`,
- appens UI-ikonregistry används för produktikoner,
- inga lokala light/dark-paletter eller nya råa temafärger skapas,
- inga lokala brand- eller ikonssystem skapas per kontrolltyp,
- appens `system | light | dark`-kontrakt bevaras.

En framtida ändring av färgschema, typografi, brandassets eller ikonstil ska därför kunna slå igenom centralt även i Kontrolltyper v2.

## 4. Historik och dokumentation får aldrig förvanskas

Offentlig utrullning är blockerad om v2 riskerar att göra tidigare dokumentation felaktig, ofullständig eller svårare att visa.

Hårda regler:

- Befintliga `control_runs`, kontrollposter, avvikelser, bilagereferenser och snapshots får inte destruktivt skrivas om för att passa v2.
- Ändringar i kontrolltyp, punkt, kriterium, instruktion, schema eller gränsvärde gäller framåt. Tidigare kontroller ska fortsätta visa det sammanhang som gällde när de utfördes.
- Nya datamodeller/migrationer ska normalt vara additiva och bakåtkompatibla under utrullningen.
- Gammal och ny dokumentation ska kunna läsas parallellt när format skiljer sig.
- Historik, export, rapporter och inspektörsvy ska utgå från historiskt korrekt data/snapshots, inte från den senaste redigerade definitionen när det skulle ändra betydelsen av en gammal kontroll.
- Rollback av v2 får inte göra redan sparad dokumentation oläslig.
- Produktionsmigrering kräver verifierad backup-/återställningsväg och migrationskontroll.

Grundprincip:

> Vi moderniserar hur framtida kontroller skapas och utförs. Vi skriver inte om sanningen om det som redan har hänt.

## 5. Utvecklings- och releaseisolering

Worktrees och separata branches får användas för parallellt arbete när kontrolltyperna kan utvecklas självständigt. De är ett utvecklingsverktyg, inte releasekontrollen.

Regler:

- Gemensamma motor-/editorförändringar ska etableras i den gemensamma grunden innan flera kontrolltyper bygger egna varianter.
- Flera worktrees ska inte samtidigt äga överlappande gemensam kod.
- Huvudagenten/huvudimplementationen beslutar gemensam arkitektur; parallella agentspår får primärt undersöka eller arbeta i tydligt separerade områden.
- Färdiga delar får mergas stegvis när de är säkra och bakåtkompatibla.
- Den nya användarupplevelsen ska hållas bakom en gemensam release-/feature flag tills den definierade v2-helheten är sammanhängande och godkänd för publik användning.
- Flaggan får inte användas som ursäkt för att mergea databasmigrationer som är destruktiva eller inkompatibla med den publika versionen.

## 6. Gemensamma plattformsberoenden

Följande behov ska inte lösas lokalt i en enskild kontrolltyp:

- Serverstyrd aktuell tid och svensk verksamhetsdag: GitHub issue #402.
- Gemensamma påminnelser/notifieringar: GitHub issue #403. Detta är ett separat planeringsspår och blockerar inte grundläggande dokumentation av en kontrolltyp.
- Missade/försenade schematillfällen ska modelleras generellt och får inte byggas som rengöringsspecifik speciallogik.

## 7. Release gate för Kontrolltyper v2

Publik aktivering får ske först när följande är sant för den releaseomfattning som beslutats:

1. Produkt- och UX-flöden är godkända för kontrolltyperna i releasen.
2. Inga v2-vyer har skapat ett parallellt designsystem eller lokal branding.
3. `npm run contracts`, relevanta typ-/lint-/buildkontroller och kontrolltypsspecifika tester är gröna.
4. Nya/ombyggda appvyer är verifierade enligt appens QA-matris i light, dark och system, inklusive 320 px och relevant desktopbredd.
5. Historiska v1-kontroller kan fortfarande öppnas och förstås korrekt.
6. Historik, export/rapport och inspektörsvy har regressionsverifierats mot äldre dokumentation och ny v2-dokumentation.
7. Databasmigrationer är bakåtkompatibla och backup/rollback är verifierad.
8. Feature flag kan slås av utan att dokumentation som redan skapats blir otillgänglig eller feltolkad.
9. Produktägaren har gjort funktionellt/visuellt sluttest.

Om någon av punkterna inte kan verifieras är releasen `no-go` oavsett om den nya UX:en i övrigt är färdig.
