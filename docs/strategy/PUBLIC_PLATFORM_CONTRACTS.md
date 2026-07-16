# Kontraktskontroller för publik webb och app

Datum: 2026-07-16
Issue: #300
Plan: `docs/strategy/WEB_APP_SEPARATION_PLAN.md`, Etapp 1

## Syfte

Kontrollerna låser den nuvarande produktionens integrationskontrakt innan webb och app flyttas isär. De ändrar ingen runtime eller deployment. Snapshoten skapas från faktiska filer i den befintliga monoliten och jämförs med `scripts/contracts/public-platform-baseline.json`.

Kör lokalt:

```bash
npm run contracts
```

Samma kommando körs i CI före typecheck, lint och build.

## Vad som låses

- aktiva publika routes i nuvarande prioriteringsordning, inklusive moderna React-routes, aktiva legacy-slugs, auth/legal-routes och statiska SEO-filer,
- aktiva canonical paths från sidkonfigurationer, metadata-komponenter, aktiva legacy-slugs och statiska HTML-filer,
- unika route-, canonical-, sitemap- och `publicResources`-href-värden,
- sitemapens nuvarande paths och att varje sådan path har både route och canonical,
- serverless-filerna under `api/` och klientens relativa `/api/...`-anrop,
- `VITE_`-variabler i klienten, servervariabler i API-filerna och deklarationerna i `.env.example`,
- frånvaro av service-role-, secret- och Resend-variabler i klientkoden,
- befintliga brandbilder, manifest, service worker, robots, sitemap, SEO-CSS och samtliga statiska SEO-sidor,
- brand-, PWA- och SEO-assetreferenser samt att de pekar på filer under `public/`.

Den moderna publika dispatchern har företräde framför äldre `SeoLandingPage`-definitioner. Kontrollen räknar därför bara de legacy-slugs som faktiskt nås efter dispatchern. Det bevarar nuvarande produktion utan att legitimera en falsk dubblett.

## Avsiktlig baselineändring

Ändra först den berörda produktionen i en separat, godkänd issue. Kör därefter:

```bash
npm run contracts:update
npm run contracts
```

`contracts:update` vägrar skriva en snapshot om grundregler som dubbletter, brutna resurslänkar, saknade API-filer, saknade assets eller serverhemligheter i klienten redan är brutna. Den uppdaterade JSON-diffen ska granskas rad för rad och committas tillsammans med den avsiktliga produktionsändringen. Uppdatera aldrig baseline endast för att få CI grönt.

## Fel och rollback

Fel anger kontraktstyp och exakt saknat, duplicerat eller nytt värde. De negativa `node:test`-fallen bevisar att en duplicerad route, duplicerad canonical, borttagen obligatorisk route och borttagen obligatorisk API-path stoppar kommandot.

Rollback för Etapp 1 är att reverta tooling-/teständringen. Ingen produktionsfil, runtime, miljövariabel eller deployment behöver återställas.
