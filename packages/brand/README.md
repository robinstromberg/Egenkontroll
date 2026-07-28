# @min-egenkontroll/brand

Paketet är den enda källan för Min Egenkontrolls brandassets och deras stabila publika URL:er. Appens UI-ikoner och innehållsassets har separata ägare.

## Export

`brandAssets` exporterar de typade URL-kontrakten för logotyp, ikon, favicon, Apple touch-ikon, Open Graph-bild, PWA-ikoner och rapport/PDF. `brandMetadata` exporterar delad metadata för Open Graph-ytan. Paketet har inga runtimeberoenden.

Masterfilerna ligger i `assets/`. Både appens Vite-output och webbens Astro-output kräver fortsatt `/brand/...`, så `npm run brand:sync` speglar masterfilerna till de genererade och git-ignorerade katalogerna `apps/app/public/brand/` och `apps/web/public/brand/`. Redigera aldrig dessa genererade kataloger manuellt. Kommandot körs automatiskt vid `npm ci`, `dev`, `build` och kontraktskontroll.

Filnamn och URL:er får bara ändras tillsammans med en uttryckligt godkänd asset- och kontraktsändring.

## Ändra brandassets

Ersätt eller lägg den nya masterfilen i `assets/`. Ändra `brand-contract.json` endast när en assetroll/path eller Open Graph-dimension/alt ändras; ett byte med samma filnamn kräver normalt ingen kontraktsändring. Kör sedan `npm run visual:sync` och `npm run brand:sync` från reporoten. Appmetadata, manifest och statiska SEO-loggor synkas deterministiskt; TypeScript-, Astro- och rapportkonsumenter fortsätter använda sina semantiska `brandAssets`-roller utan komponentändringar.

Den fullständiga rebrandchecklistan finns i `docs/DESIGN_SYSTEM_CORE.md`.
