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

Efter #348 är global canvas, shell, authytor, formulärbas och bottennavigation migrerade.
Vyspecifik legacy-CSS migreras av #349 (dagens kontroller/kontrollutförande), #350
(historik/KPI/delning/inspektör/rapport) och #351 (meny/administration/onboarding/ikoner).
Under mellanfasen kan dessa omigrerade vyer fortfarande följa operativsystemets tema via
egna media queries även när appens explicita val är det motsatta.
