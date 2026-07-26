# Appens temakontrakt

Appen äger valet `system | light | dark`; färgvärdena ägs av
`packages/design-system/theme-contract.json` och används genom semantiska `--ds-*`-tokens.

- `system` är standard, lagras inte och lämnar `<html>` utan `data-theme` så att
  `prefers-color-scheme` styr.
- `light` och `dark` lagras under `egenkontroll:app-theme` och appliceras som
  `data-theme="light|dark"` på `<html>`.
- Den synkrona bootstrapen i `apps/app/index.html` applicerar ett explicit val före första
  rendering. `appTheme.ts` håller därefter runtime och systemändringar synkroniserade.
- Produkt-UI har ingen temaväljare i denna fas. Utvecklingsshowcaset använder samma runtime
  för att verifiera alla tre lägen.

Appspecifika kompositioner finns i `components/ui/AppPrimitives.tsx` och behåller appens
etablerade mått ovanpå designsystemets generella primitiver. Nya appvyer ska återanvända
`AppSurface`, `AppSectionCard`, `AppIconButton`, `AppStatusIndicator` och `AppNavButton`
när respektive mönster passar; de får inte skapa lokala färgpaletter.

Efter #349 är även TodayDashboard, den befintliga PWA-onboardingen, kontrollutförandet,
ControlDefinitionCanvas och SavedControlView migrerade. Deras kontrollspecifika kompositioner
ligger kvar i appen eftersom generella primitiver skulle ändra DOM-, mått- eller
required-/disabled-kontrakten. De använder enbart semantiska tokens; inga råa färgundantag
finns i de tre migrerade CSS-filerna. PWA-guidens fyra skärmbilder är innehållsassets och
behåller sina befintliga paths och sin befintliga stegordning.

`npm run control-execution:test --workspace @min-egenkontroll/app` skyddar fältdefaults,
avvikelser, foto- och leverantörskontrakt, offline- och sparordning, PWA-stegen, navigation,
frånvaro av lokala temapaletter samt SavedControlViews reduced-motion-kontrakt.

Efter #350 använder även HistoryView, KpiView, SharingView och InspectorView enbart semantiska
tokens i produktläget. Deras tidigare lokala dark-paletter är borttagna, så `system | light |
dark` följer den gemensamma runtime-källan även på review- och delningsytorna. Filter, KPI-
beräkningar, permissions, tabellkolumner, `data-label`, exportordning och rapportinnehåll är
oförändrade.

Browser-rapporter och PDFKit använder den statiska `src/reports/reportPalette.js`, vars samtliga
värden härleds från `themes.light.tokens` i design-systemets kontrakt. Rapporter är därför alltid
ljusa oavsett valt apptema. Endast två råfärgsundantag finns kvar: QR-kodens fasta mörk/vita
skanningskontrast samt InspectorViews print-only-överskrivning av light-tokenvärden. Den senare
behövs eftersom en CSS-fil inte kan importera JSON-kontraktet och verifieras mot samma källa av
`reviewSharingVisualContract.test.ts`.

`npm run review-sharing:test --workspace @min-egenkontroll/app` skyddar temagränsen,
History/KPI-kontrakten, delningsbehörigheter, hash/QR, filter, mobiltabellernas kolumner och
`data-label`, export-/e-postordningen samt den centrala light-rapportpaletten.

Kvarvarande vyspecifik legacy-CSS migreras av #351
(meny/administration/onboarding/ikoner). Under mellanfasen kan dessa omigrerade vyer fortfarande
följa operativsystemets tema via egna media queries även när appens explicita val är det motsatta.
