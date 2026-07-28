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
ljusa oavsett valt apptema. Tekniska QR-, print-, e-post- och publika kompatibilitetsundantag
finns samlade med exakt literal, antal och motivering i
`scripts/contracts/app-visual-allowlist.json`; denna README ska inte hålla en parallell baseline.
InspectorViews print-only light-spegling verifieras dessutom mot temakontraktet av
`reviewSharingVisualContract.test.ts`.

`npm run review-sharing:test --workspace @min-egenkontroll/app` skyddar temagränsen,
History/KPI-kontrakten, delningsbehörigheter, hash/QR, filter, mobiltabellernas kolumner och
`data-label`, export-/e-postordningen samt den centrala light-rapportpaletten.

Efter #351 använder även MenuView, profil, verksamhetsbranding, användare, leverantörer, hjälp,
kontrolltyper, kontrolltypsdetaljen, OrganizationSetup och den fristående AdminControls-ytan
semantiska tokens utan lokala dark-paletter. Layout, DOM, rollgrindar, hashparametrar och
administrativa sparflöden är oförändrade.

`src/config/assets.ts` är appens enda typade registry för UI- och kontrolltypsikoner. Varje registry-
post äger assetpath och standardfallback; `AssetIcon` tillåter endast en kontextuell fallback-
överstyrning när det behövs för att bevara befintligt uttryck. Kontrolltypsresolverns namn- och
kategoriprioritet är oförändrad. Råa `/ui-icons/...`-paths är förbjudna utanför registryn, och
kontraktstestet verifierar att alla registrerade filer finns med exakt skiftläge. Befintliga
oregistrerade alternativ ligger kvar som icke-refererade legacyassets; de är inte en parallell
runtime-registry och nya produktionsreferenser till dem stoppas av guardrailen.

`npm run menu-admin:test --workspace @min-egenkontroll/app` skyddar tema- och ikonkontraktet,
owner/admin/staff-gränserna, inbjudningsgrindar, meny- och kontrolltypshash samt ordningen i
verksamhets-, setup-, leverantörs-, kontrolltyps- och inbjudningsflödena.

## Slutliga guardrails efter #352

`npm run app-visual:check` skannar hela appens produktions-CSS/TS/TSX/JS/HTML/manifest samt
`packages/design-system` och `packages/brand`. Nya råfärger, lokala temapaletter, råa brandpaths,
råa UI-iconpaths och tillväxt i baselinade undantag stoppas. Samma kontroll skyddar centrala
kontrastpar, 320 px-baslinjen, focus-visible, reduced motion och showcasets stödda tillstånd.
`npm run app-visual:test` bevisar de negativa fallen med syntetiska in-memory-fixtures och lämnar
aldrig produktionskoden i ett trasigt tillstånd. Båda körs av `npm run contracts`.

Den manuella light/dark/system-, viewport-, roll-, tillstånds- och tillgänglighetsmatrisen finns i
`QA_MATRIX.md`. Den korta framtida rebrandchecklistan har en enda källa i
`docs/DESIGN_SYSTEM_CORE.md`.
