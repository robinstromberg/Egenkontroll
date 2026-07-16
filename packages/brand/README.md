# @min-egenkontroll/brand

Paketet är den enda källan för Min Egenkontrolls fasta produktionsassets och deras stabila publika URL:er.

## Export

`brandAssets` exporterar de typade URL-kontrakten för logotyp, ikon, Open Graph-bild och PWA-ikoner. Paketet har inga runtimeberoenden.

Masterfilerna ligger i `assets/`. Appens Vite-output kräver fortsatt `/brand/...`, så `npm run brand:sync` speglar masterfilerna till den genererade och git-ignorerade katalogen `apps/app/public/brand/`. Kommandot körs automatiskt vid `npm ci`, `dev`, `build` och kontraktskontroll.

Filnamn och URL:er får bara ändras tillsammans med en uttryckligt godkänd asset- och kontraktsändring.
