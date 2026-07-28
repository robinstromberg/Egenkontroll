# Designsystemets kärna

Den här kärnan är Min Egenkontrolls gemensamma visuella kontrakt. Den ersätter inte appspecifika kompositioner och motiverar inte en generell redesign, ändrad routing eller ändrade produktflöden.

## Ägarskap och källor

- `packages/design-system/theme-contract.json` är kanonisk källa för semantiska light-/dark-värden, typografi, spacing, radier, skuggor och statiska tema-/PWA-ytor.
- `packages/design-system/styles/tokens.css` genereras av `npm run visual:sync`; redigera den inte manuellt.
- Generella primitiver ligger direkt i `packages/design-system/src/` och exporteras från paketet.
- Appspecifica kompositioner ligger i `apps/app/src/components/ui/AppPrimitives.tsx` och använder de genererade `--ds-*`-variablerna.
- `packages/brand/brand-contract.json` och `packages/brand/assets/` äger brandroller respektive masterassets.
- `apps/app/src/config/assets.ts` är appens enda registry för `/ui-icons/...`.
- `apps/app/src/reports/reportPalette.js` härleder alltid rapportfärger från light-temat.

Använd betydelser i stället för råa färger: yta/text (`--ds-canvas`, `--ds-surface`, `--ds-text`), handling/fokus (`--ds-action-*`, `--ds-focus`), status (`--ds-status-*`) och gemensam rytm (`--ds-font-*`, `--ds-space-*`, `--ds-radius-*`, `--ds-shadow-*`).

## Komponenter och tillstånd

- `Button`/`LinkButton`: primary, secondary, ghost och relevanta danger-, disabled- och loadinglägen.
- `Badge`/`Alert`: neutral, success, warning och danger; live-region används bara vid ny återkoppling.
- `Field`/`TextField`/`SearchField`: label, hint, required, error/invalid, disabled och read-only där API:t stödjer det.
- `Card`: default och elevated.
- Appprimitiver: surface, section card, icon button, neutral/success/warning/danger-status samt aktiv/inaktiv/disabled navigation.

Alla stödda representativa tillstånd visas i det dev-only showcase som finns på `/utveckling/designsystem`. Hover, active, fokus, tangentbord och viewportbeteende verifieras interaktivt enligt `apps/app/src/theme/QA_MATRIX.md`.

## Automatiska guardrails

`npm run app-visual:check` skannar produktionsfiler i `apps/app`, `packages/design-system` och `packages/brand`. Kontrollen stoppar:

- nya råa hex-/rgb(a)-/hsl(a)-värden,
- lokala `prefers-color-scheme`-paletter, theme-selektorer och `--ds-*`-definitioner,
- råa `/brand/...`-paths utanför kanoniska/genererade konsumenter,
- råa `/ui-icons/...`-paths utanför ikonregistryn,
- förändring eller tillväxt i ett dokumenterat undantag,
- otillräcklig kontrast i centrala text-, status-, fokus- och kantpar,
- förlust av 320 px-, focus-visible- eller reduced-motion-kontrakt samt stödda showcase-tillstånd.

Den enda maskinläsbara allowlisten finns i `scripts/contracts/app-visual-allowlist.json`. Kanoniska/genererade poster delegerar till tema-, brand- och ikonkontrakten. Varje tekniskt undantag baselinar exakt literal och antal med en motivering. `npm run app-visual:test` använder enbart syntetiska in-memory-fixtures för negativa fall och ändrar aldrig produktionsfiler.

## Kort rebrandchecklista

1. Tema, typografi, spacing, radier och skuggor: ändra endast `packages/design-system/theme-contract.json`. Behåll samma ordnade semantiska tokennycklar i light och dark. Välj browser-/PWA-värden via `staticSurfaces`; redigera inte genererad tokens-CSS, `apps/app/index.html` eller manifestvärden manuellt. Rapporter följer light-kontraktet via `apps/app/src/reports/reportPalette.js`.
2. Brand: ersätt eller lägg masterfiler i `packages/brand/assets/`. Ändra `packages/brand/brand-contract.json` endast när en roll/path eller `metadata.openGraph.{width,height,alt}` ändras. Redigera aldrig de genererade `apps/*/public/brand/`-katalogerna.
3. Produktikoner: ersätt eller lägg filer i `apps/app/public/ui-icons/` och uppdatera registry/fallback i `apps/app/src/config/assets.ts`. Använd gemener, exakt skiftläge och säker textfallback; lägg inte brandikoner här.
4. Synka från reporoten med `npm run visual:sync` och `npm run brand:sync`.
5. Verifiera med `npm run visual:check`, `npm run app-visual:check`, `npm run contracts`, `npm run typecheck`, `npm run lint`, `npm run build` och `git diff --check`. Kör därefter showcase och full QA-matris i light/dark/system vid 320/375 px och desktop, inklusive tangentbord, fokus, kontrast och reduced motion.

Alla allowlistförändringar är en separat granskningspunkt. En rebrand får inte lägga till ett nytt undantag bara för att få guardrailen att passera.
