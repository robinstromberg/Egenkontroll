# Core Web Vitals och mobilprestanda

Datum: 2026-06-27

Det här dokumentet kartlägger tekniska prestandarisker för den publika landingpagen. Det gör ingen designändring.

## Verifierat lokalt

Kört:

- `npm run typecheck`
- `npm run build`
- JSON-LD parse-kontroll med Node

Build-resultat:

- `dist/index.html`: 5.14 kB, gzip 1.37 kB
- CSS bundle: 70.31 kB, gzip 12.30 kB
- main JS bundle: 466.54 kB, gzip 132.67 kB
- small browser chunk: 0.62 kB, gzip 0.43 kB

Lighthouse kördes inte i denna session eftersom projektet inte har Lighthouse installerat och issue-scope inte kräver att externa verktyg läggs till.

## Kartlagda risker

### Stora bilder

Största statiska filer i `public/`:

- `public/brand/OGImage.png`: cirka 1.28 MB
- `public/brand/min-egenkontroll-icon.png`: cirka 1.07 MB
- flera `public/ui-icons/*.png`: cirka 230-470 kB styck

Risk:

- stora PNG-filer kan påverka mobil laddning om de används ovanför fold eller laddas många samtidigt
- app-ikonen används i auth/brandytor och bör optimeras med försiktighet
- Open Graph-bilden laddas normalt inte av vanliga besökare, men påverkar crawler/social delning

Rekommenderat separat issue:

- skapa optimerade WebP/PNG-varianter för stora UI-ikoner och brandbilder
- behåll visuell kvalitet och transparent bakgrund där det behövs
- verifiera visuellt efter komprimering

### JavaScript-storlek

Main JS är cirka 132.67 kB gzip.

Det är inte akut blockerande för MVP, men eftersom landingpage och inloggad app delar SPA-bundle kan publika besökare ladda mer appkod än nödvändigt.

Rekommenderat separat issue:

- utreda route-/view-level code splitting mellan landingpage, auth och inloggad app
- bara göra detta om det kan ske utan regressionsrisk i auth/session-routing

### Layout shift

Landingpage har fasta hero- och kortstrukturer. Inga uppenbara nya layout shift-risker infördes i SEO-ändringen.

Bildstorlekar för logo/phone mockup bör ändå verifieras i browserbaserat prestandatest senare.

### Fontladdning

Ingen extern webbfont identifierades i aktuell CSS. Det minskar risk för font-blockering.

## Små förbättringar genomförda

- Metadata och JSON-LD ligger i statisk HTML och kräver ingen extra klientkörning.
- `robots.txt` och `sitemap.xml` är statiska filer.
- Ingen tracking, extern script eller analytics lades till.

## Nästa steg

1. Kör Lighthouse/PageSpeed mot produktion efter deploy.
2. Optimera stora PNG-assets i separat bildoptimeringsissue.
3. Överväg code splitting om landingpage-besökare ska få mindre JS.
4. Följ Core Web Vitals i Search Console när domänen är verifierad.

## Guardrails

Prestandaändringar ska:

- inte göra redesign
- inte ändra inloggade vyer
- inte ändra routing utan separat beslut
- inte försämra brandbilder visuellt
- verifieras med build och visuell kontroll
