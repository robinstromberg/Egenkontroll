# Appens visuella QA-matris

Matrisen är obligatorisk efter ändringar av tema, appskal, komponentutseende, brandassets, UI-ikoner, metadata eller rapportutseende. Den kompletterar automatiska kontrakt; den får inte användas för att skapa konton, ändra produktionsdata eller kringgå roll-/behörighetsgränser.

## Tema och viewport

Kör varje vald yta i följande lägen:

| Temafall | Förutsättning | Förväntat kontrakt |
| --- | --- | --- |
| Light | `egenkontroll:app-theme=light`, ladda om | `<html data-theme="light">`; ingen felaktig första mörk rendering |
| Dark | `egenkontroll:app-theme=dark`, ladda om | `<html data-theme="dark">`; ingen felaktig första ljus rendering |
| System / OS light | ta bort lagringsnyckeln, OS/browser light | inget `data-theme`; upplöst light |
| System / OS dark | ta bort lagringsnyckeln, OS/browser dark | inget `data-theme`; upplöst dark |

Primära bredder är 320 × 800, 375 × 812, 768 × 1024 och 1280 × 800. Varje primär yta kontrolleras minst vid 320 och 1280 px; modal-, formulär- och tabellbeteende kontrolleras dessutom vid 375 eller 768 px. Kontrollera ingen horisontell dokumentoverflow, läsbar text, 44 px tryckytor där kontraktet kräver det samt att bottennavigation inte täcker innehåll.

## Säker lokal matris utan konto

| Yta | Light | Dark | System light/dark | 320/375 | 768/1280 | Tangentbord/fokus | Reduced motion | Kontroll |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/utveckling/designsystem` | krävs | krävs | båda krävs | krävs | krävs | Tab/Shift+Tab, Enter/Space, synligt `focus-visible` | on/off | alla button/link/card/badge/alert/field/search/app-status/icon/nav-tillstånd |
| `/login` | krävs | krävs | representativt | krävs | 1280 | tabbordning, lokal tom/ogiltig validering; skicka inte | on | authkort, labels, fel, länkar |
| `/signup` | krävs | krävs | representativt | krävs | 1280 | tabbordning och lokal validering; skapa inte konto | on | formulär/reflow, disabled/loading endast utan submission |

Kontrollera även 200 % zoom/reflow, textkontrast, fokus mot intilliggande ytor och att systemläget reagerar på en ändrad OS/browser-preferens. Dev-showcasets assertive alert ska annonseras först efter att knappen har aktiverats.

## Autentiserad matris med befintlig säker testsession

Använd bara produktägarens befintliga icke-produktionskonton och testdata. För varje grupp körs light vid 320 px, dark vid 375 px och system vid 1280 px. Kör dessutom OS light/dark på appskalet och en representativ data-, modal- och formuläryta.

| Grupp | Roller | Tillstånd och kontrakt |
| --- | --- | --- |
| Appskal | owner/admin/staff | workspace switcher, bottennavigation, aktiv/inaktiv ikon, offlinebanner, ingen rollförskjutning |
| Today/PWA | owner/staff | loading, error, tomt, planerat, klart, avvikelse, first-run; PWA-banner och alla fyra modalsteg |
| Kontrollutförande | owner/staff | loading/saknad/tom definition, alla fälttyper/defaults/required/disabled, temperaturgränser, OK/Ej OK/åtgärd, foto, leverantör, offline, sparar, sparad, navigation |
| Historik | owner/admin/staff | loading/error/tomt, filter, träffar, detalj, avvikelse/åtgärd, bilaga, bildmodal, CSV och print |
| KPI | owner/admin/staff | loading/error/tomt, summering/warning, alla tre flikar, en datapunkt och fyllda diagram |
| Delning | staff | quick link endast; inga managerkontroller |
| Delning | owner/admin | quick/managed links, datum, QR/länkmodal, kopiera/dela/öppna/stäng, active/expired/revoked, exportlogg/fel |
| Inspektör | tokenyta | loading, invalid/expired/error/tomt, filter/träffar, mobiltabeller/`data-label`, bilagemodal, CSV/print/PDF/e-post |
| Meny/admin | owner/admin/staff | korrekt menymängd/abonnemang; staff endast tillåtna ytor; profil, branding, användare/inbjudningar, leverantörer, kontrolltyper/detalj/editor/preview, setup och hjälp |

## Tillgänglighet och funktionell smoke

- Tangentbord: Tab/Shift+Tab genom en representativ navigation, form och modal; Enter/Space på native och `role="button"`; Escape och fokusåtergång där befintlig modalimplementation stöder det. Rapportera modal som ej verifierad om fokus kan lämna den eller stängning saknar tangentbordsstöd.
- Fokus: ingen fokuserbar kontroll får sakna synlig indikator i light eller dark. Kontrollera särskilt kontrolltypeditorns tabb-bara canvasyta, bottennavigation, ikonknappar och modalens stängknapp.
- Kontrast: automatiska tokenpar ska passera `npm run app-visual:test`; gör dessutom visuell kontroll av QR, diagram, print/PDF, e-post och publika/tekniska allowlistundantag.
- Reduced motion: slå på OS/browser `prefers-reduced-motion: reduce`; designsystemknappar och sparbekräftelsen ska sakna transition/animation utan att ändra funktion.
- Funktion: återanvänd `docs/first-success-manual-test-plan.md` och `docs/CONTROL_TYPE_EDITOR_VISUAL_VERIFICATION.md`. Bevara auth, session, roller, hashes, filter, sparning, avvikelse, foto, leverantör, export, delning, rapport och navigation.

## Genomförande i #352 (2026-07-28)

| Nivå | Status | Bevis/avgränsning |
| --- | --- | --- |
| Automatiska kontrakt och negativa fixtures | godkänd | `npm run contracts`; 10/10 app-visual-tester inklusive syntetiska negativa fixtures |
| Lokal dev-showcase light/dark/system | delvis godkänd | explicit light/dark och system med OS dark godkända; system med OS light kräver en andra riktig systempreferens |
| Lokal 320/375/768/1280 och authytor | godkänd inom säker scope | ingen overflow utanför viewport; 44 px aktiv tryckyta; login/signup utan submission, konto eller data |
| Lokal tangentbord/fokus/reduced motion | delvis godkänd | 3 px focus-visible verifierat; full Tab/Shift+Tab/Enter/Space och emulerad reduced motion kräver manuell browser-QA (aktuell miljö rapporterade reduced motion av) |
| Autentiserade owner/admin/staff-/inspektörsytor | produktägar-QA återstår | kräver befintlig säker testsession och representativ data |
| Funktionella spar-/delnings-/exportsmokes | produktägar-QA återstår | får inte köras mot produktion och inga nya konton får skapas |

Uppdatera genomförandestatusen med faktiskt resultat i implementations-PR:n. Markera aldrig en rad godkänd enbart genom källkodsinspektion.
