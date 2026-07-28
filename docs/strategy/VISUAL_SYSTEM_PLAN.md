# Framtidssäkert visuellt system för app och webb

Datum: 2026-07-25  
Issue: #345  
Epic: #346  
Status: Beslutad genomförandeplan

## Syfte

Min Egenkontroll ska kunna ändra färgschema, typografi, varumärkesassets, ikonstil och grundläggande komponentuttryck utan att appens eller webbens funktionalitet behöver byggas om.

Arbetet ska samtidigt göra repot begripligt och säkert att vidareutveckla för både AI-agenter och framtida mänskliga utvecklare.

Målet är låg förändringskostnad, inte att varje tänkbar redesign ska bli automatisk. Layout, informationsarkitektur och användarflöden kan fortfarande kräva produkt- och utvecklingsarbete, men de får inte skapa nya lokala färg-, brand- eller ikonssystem.

## Absolut avgränsning

Det visuella systemarbetet får inte ändra:

- affärslogik eller datamodell,
- auth, sessioner, Supabase, RLS eller organisationstillhörighet,
- routing, hashparametrar eller navigationsmål,
- kontrollsparning, schemaläggning, avvikelser, åtgärdskrav eller bilagor,
- historik, KPI-beräkningar, export, rapporter eller delningsbehörigheter,
- användarflödenas stegordning eller funktionella innehåll,
- publik informationsarkitektur, URL-struktur eller SEO-innehåll.

En visuell migrering får inte användas som förevändning för opportunistisk UX-, layout- eller kodrefaktorering.

## Verifierat startläge inför #347

### Gemensam grund finns

Repot är ett npm-workspace-monorepo med:

```text
apps/web
apps/app
packages/brand
packages/design-system
```

`packages/design-system` innehåller semantiska tokens för light, dark och systemstyrt tema samt generella primitiver som Button, LinkButton, Badge, Field, TextField, SearchField, Alert och Card.

`packages/brand` är källa för masterassets och typade referenser till logotyp, ikon, Open Graph-bild och PWA-ikoner. Brandassets synkas deterministiskt till båda applikationernas publika kataloger.

### Appen var bara delvis ansluten

Inför #347 importerade appen det gemensamma tokenpaketet, men större delen av produktionsgränssnittet använde fortfarande:

- hårdkodade färger och genomskinligheter,
- lokala lila legacy-paletter,
- separata `prefers-color-scheme: dark`-block med duplicerade färgvärden,
- lokala varianter av kort, knappar, formulär, badges och statusytor,
- UI-ikoner i blandade format och filnamn,
- statiska browser- och PWA-färger som tidigare har behövt korrigeras manuellt.

De största visuella ytorna finns i global CSS, bottennavigation, dagens kontroller, kontrollutförande, historik, delning, inspektörsvy, administration och menyvyer.

## Status efter leveransen i #352 (2026-07-28)

Appspåret #347–#352 är genomfört: appen har maskinläsbara tema-/brandkontrakt, pre-render theme runtime, semantiska tokens på centrala produktvyer, typat UI-ikonregistry, central exakt allowlist, negativa guardrail-fixtures, dokumenterad rebrandväg och en full QA-matris. Kvarvarande råvärden är tekniska QR-/print-/e-postundantag eller frysta publika kompatibilitetsytor; varje literal och antal är baselinat med motivering i `scripts/contracts/app-visual-allowlist.json`.

Detta avslutar appdelen av Epic #346 men ändrar inte webbspårets status eller ordning. Autentiserad owner/admin/staff-/inspektörs-QA kräver fortfarande produktägarens befintliga säkra testsession enligt `apps/app/src/theme/QA_MATRIX.md`.

### Webben är närmare målbilden

Den publika webben använder gemensamma tokens, brandreferenser och ett explicit `data-theme`-kontrakt med systempreferens som standard.

Det finns ändå kvar hårdkodade färger i vissa sidmallar och visuella kompositioner. En del är avsiktliga dekorativa eller innehållsbundna färger, medan andra är lokal temaskuld. Därför behövs:

1. guardrails innan fler sidor migreras,
2. en full slutrevision först när innehållsmigrationen är klar.

## Målarkitektur och ägarskap

### `packages/design-system`

Äger sådant som ska betyda samma sak i både app och webb:

- maskinläsbart temaavtal,
- genererade eller deterministiskt validerade CSS-tokens,
- semantiska roller för yta, text, kant, handling, fokus och status,
- typografi-, spacing-, radius- och skuggskalor,
- generella tillgängliga UI-primitiver,
- dokumentation av komponenttillstånd och temaavtal.

Paketet får inte importera appdomän, routing, auth, Supabase eller webbspecifika sidkompositioner.

### `packages/brand`

Äger fasta varumärkestillgångar och deras typade kontrakt:

- masterlogga och masterikon,
- favicon och PWA-varianter,
- Open Graph-/delningsbild,
- PDF- och eventuella framtida e-postreferenser,
- brandmetadata som måste delas mellan ytor.

Ett assetbyte ska ske här och via synk-/byggkontrakt, inte genom att komponenter ändras en och en.

### `apps/app`

Äger:

- appens layout och produktkompositioner,
- appens temaruntime och användarens val `system`, `light` eller `dark`,
- appspecifika komponenter ovanpå generella primitiver,
- typad registry för UI- och kontrolltypsikoner,
- PWA- och browserytor som genereras eller valideras mot det gemensamma tema-/brandkontraktet.

Appspecifika komponenter får vara visuellt specialiserade men ska använda semantiska tokens, inte skapa egna paletter.

### `apps/web`

Äger:

- publikt shell och sidmallar,
- webbspecifika redaktionella och kommersiella kompositioner,
- Astro-layout, metadata och sidtypsspecifik CSS,
- interaktiva React-islands.

Webben ska använda samma tema- och brandkällor som appen men ska inte dela appens layoutkomponenter.

## Temaavtal

Stödda lägen är:

- `system` – standard; följer operativsystemets eller webbläsarens preferens,
- `light` – uttryckligt ljust tema,
- `dark` – uttryckligt mörkt tema.

Principer:

1. Komponenter använder semantiska roller, exempelvis `canvas`, `surface`, `text`, `border`, `action`, `success`, `warning` och `danger`.
2. Light och dark har egna anpassade värden för samma betydelser; dark är inte en enkel invertering.
3. Explicit tema appliceras genom `data-theme` på en dokumenterad rot.
4. Sparat tema ska appliceras före första rendering så att fel tema inte blinkar vid laddning.
5. Separata lokala dark-mode-paletter ska avvecklas.
6. Status får aldrig kommuniceras enbart med färg.

## Statiska visuella ytor

Följande måste omfattas av samma centrala kontrakt även när de inte styrs av vanlig komponent-CSS:

- `<meta name="theme-color">` för app och webb,
- PWA-manifestets `theme_color` och `background_color`,
- favicon, Apple touch-ikon och PWA-ikoner,
- Open Graph- och delningsbilder,
- logotyp och färger i PDF-/utskriftsrapporter,
- eventuella framtida e-postmallar,
- browser canvas, safe areas och overscroll.

De ska genereras från eller valideras mot samma maskinläsbara tema- och brandkälla.

## Ikonpolicy

Brandikoner och produktikoner är olika ansvar:

- varumärkesikon hör till `packages/brand`,
- appens navigations-, åtgärds- och kontrolltypsikoner hör till en typad registry i `apps/app`,
- råa `/ui-icons/...`-sökvägar får inte spridas i komponenter,
- registry ska definiera fallback och verifiera att alla refererade filer finns,
- layoutändringar eller nya komponenter ska använda registry, så att ett framtida ikonbyte slår igenom utan komponentjakt.

## Tillåtna visuella undantag

Alla råa färgvärden är inte automatiskt fel. Följande kan tillåtas efter dokumentation:

- fotografier och illustrationsassets,
- datavisualiseringar som behöver en separat tillgänglig seriepalett,
- utskrifts- eller PDF-tekniska begränsningar,
- genomskinliga overlays där ett semantiskt token inte ger tillräcklig kontroll,
- avsiktliga innehållsbundna eller dekorativa färger som inte representerar produktens tema.

Undantag ska ligga i en liten allowlist med motivering. De får inte bilda parallella light/dark-paletter.

## Guardrails för AI och utvecklare

Det färdiga systemet ska skyddas av både instruktioner och automatiska kontroller:

- `AGENTS.md` ska kräva semantiska tokens, brandreferenser och ikonregistry,
- nya eller ändrade produktionsfiler ska kontrolleras för råa tema- och assetvärden,
- tillåtna undantag ska vara explicit baselined och får inte växa obemärkt,
- generella komponenter ska återanvändas innan nya skapas,
- varje UI-issue ska verifiera light och dark,
- förändringar ska rapportera kvarvarande undantag och faktiskt funktionellt smoke-test,
- designsystem-showcase ska visa stödda komponenter och tillstånd.

Dokumentationen ska räcka för en agent eller utvecklare utan tillgång till tidigare chattar.

## Genomförandeordning

### Appspåret – genomfört i #347–#352

1. #347 – maskinläsbart tema- och brandkontrakt samt statiska ytor.
2. #348 – appens temaruntime, shell och visuella primitiver.
3. #349 – dagens kontroller och kontrollutförande.
4. #350 – historik, KPI, delning, inspektör och rapporter.
5. #351 – meny, administration och ikonlager. #350 och #351 kan genomföras parallellt först när #348 är stabil, men överlappande filer ska ägas av en agent.
6. #352 – full guardrail-, dokumentations- och QA-slutkontroll.

Kritiska buggar och data-/auth-risker får fortsatt prioriteras direkt. Större ny apputveckling bör normalt vänta tills appspåret ovan är stabilt, så att nya funktioner byggs på rätt visuella grund.

### Webbspåret – före och efter migration

1. #353 genomförs efter #347 och före nästa innehållsmigrationsbatch i #315.
2. #315 fortsätter med guardrails som krav för varje ny eller migrerad sida.
3. #354 genomförs först när #315 är klar eller uttryckligen tillräckligt komplett för en slutrevision.

Det undviker både ny visuell skuld under migrationen och dubbelarbete genom att inte slutstäda sidor som ännu ska ersättas.

## Verifieringsprincip

Varje implementationsissue ska minst köra relevanta delar av:

- `npm run contracts`,
- `npm run typecheck`,
- `npm run lint`,
- `npm run build`,
- workspace-specifika tester,
- `git diff --check`,
- manuell Preview-QA i light och dark,
- systemtemakontroll,
- mobilbredd 320/375 px och relevanta större brytpunkter,
- tangentbord, fokus, kontrast och reduced motion,
- funktionella smoke-scenarier för den berörda vyn.

Visuell paritet betyder inte pixelidentitet med legacyutseendet. Det betyder att samma innehåll, funktion, tillstånd, steg och resultat finns kvar, medan presentationen förs över till den beslutade visuella grunden.

## Definition of done

Initiativet är klart när:

- appens produktionsyta använder semantiska tokens i light, dark och systemläge,
- ingen odokumenterad lokal tema- eller brandpalett återstår,
- appens UI-ikoner nås via typad registry,
- brand-, browser-, PWA-, PDF- och delningsytor styrs centralt,
- webbens slutliga sidbestånd följer samma tema- och brandkällor,
- guardrails stoppar ny visuell skuld,
- dokumentationen visar exakt vilka få filer som ändras vid rebrand,
- alla skyddade funktionella flöden är verifierade oförändrade,
- Epic #346 kan stängas.

## Nästa steg

Nya appvyer ska byggas mot de färdiga guardrailsen och QA-matrisen. Det visuella webbspåret fortsätter i beslutad ordning med #353, innehållsmigrationen i #315 och därefter #354. Epic #346 ska inte stängas förrän även webbspårets definition of done är verifierad.
