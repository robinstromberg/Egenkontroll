# Konsolidering av publik plattform inför webb/app-separation

Datum: 2026-07-16
Issue: #296
Strategisk källa: `docs/strategy/PIVOT.md` och Epic #243

## Inventerade ytor

- `src/config/publicResources.ts`, inklusive grupper, unika href-värden och sökindex.
- Den publika dispatchern i `PublicLandingPageWithKnowledgeBase.tsx` och avgränsningen mot `App.tsx`.
- `/kunskapsbank` och `/sok`, inklusive deras gemensamma användning av resursregistret.
- Bokstavliga interna länkar i `src` och statiska HTML-sidor under `public/seo`.
- Titel, beskrivning, robots, Open Graph och canonical-hantering i `FactPage`, `TemplatePage`, `HazardAnalysisToolPage` och `BusinessPage`.
- Canonical paths och sidtitlar i samtliga konfigurationer för de fyra sidtyperna.

## Resultat

Det gemensamma registret innehåller 69 unika resurser utan duplicerade href-värden. Kunskapsbanken renderar grupperna direkt från registret och sökfunktionen söker i samma flacka resurslista. Alla registrerade mål motsvaras av en publik route eller en statisk produktionsfil.

Den publika dispatchern innehåller ämnesnavet, sex faktasidor, en mall, ett verktyg och fyra verksamhetssidor. De tolv konfigurationsstyrda Fact/Template/Tool/Business-sidorna har unika titlar och canonical paths, och varje canonical path stämmer med sin route. Samtliga fyra mallkomponenter sätter titel, beskrivning, robots, Open Graph-titel, Open Graph-beskrivning, Open Graph-URL och canonical.

`App.tsx` väljer fortfarande mellan publik yta, auth/legal och inloggad app, men innehåller ingen sidunik routing för de inventerade publika innehållssidorna. Dessa ligger i den gemensamma publika dispatchern.

## Korrigerade integrationsfel

- Startsidan hämtade legacy-URL:en `/seo/kontrollplan.html` från registret. Den saknade registerpost och gav därför ett ofullständigt resurskort. Kortet använder nu den registrerade mallen `/mall-kontrollplan-livsmedel`.
- Startsidan beskrev faroanalysverktyget som kommande och länkade till faktasidan. Den använder nu den registrerade produktionsresursen `/verktyg-faroanalys-livsmedel`.
- Startsidas foodtruck-ingång pekade på varumottagningsguiden. Den pekar nu på `/egenkontroll-kiosk-foodtruck`.
- Det gemensamma publika skalets mall- och verktygslänkar pekade på äldre guide-/faktarutter. De pekar nu på produktionsmallen och produktionsverktyget.
- Relaterade länkar i äldre SeoLanding-innehåll pekade på `/verifiering-egenkontroll-livsmedel`. De leder nu till den återanvändbara faktasidan `/verifiering-haccp-livsmedel`.
- Korslänkar i bevarade statiska legacy-sidor pekade vidare till äldre kontrollplans- och gränsvärdessidor. Länkarna leder nu till de aktuella faktasidorna utan att legacy-sidornas egna URL:er eller canonical ändras.

## Bevarade legacy-URL:er

`/seo/kontrollplan.html`, `/seo/kritiska-gransvarden.html` och `/verifiering-egenkontroll-livsmedel` finns kvar för att inte bryta befintliga publika URL:er. De är inte registerposter eftersom deras nuvarande, konsoliderade motsvarigheter redan är sökbara. Omdirigering eller canonical-sammanslagning kräver ett separat SEO-beslut med underlag om indexering och trafik.

## Kvarvarande risker inför webb/app-separation

- Publik webb, auth och inloggad app startar fortfarande från samma Vite-entry och samma `App.tsx`.
- `PublicSiteShell` går till auth genom callbacks som ägs av `App.tsx`; domänövergången till `app.minegenkontroll.se` är ännu inte implementerad.
- React-sidornas metadata sätts klient-side. En framtida separat webbapp behöver besluta om rendering/prerendering för robust metadata och indexering.
- Statiska SEO-filer och React-renderade publika sidor lever parallellt och behöver en uttrycklig flytt-/redirectplan när `apps/web` skapas.
- Publik webb och app delar fortfarande källträd, globala beroenden, brandfiler och byggpipeline. Målstrukturen `apps/web`, `apps/app` och `packages/brand` är inte genomförd.
- Legacy-URL:erna ovan saknar ännu beslutad redirect- och canonicalstrategi.

Nästa stora steg i Epic #243 bör vara en avgränsad teknisk separationsplan och därefter implementation av Fas 5, inte fler sidtyper eller nya innehållssidor.
