# Plan för teknisk separation mellan publik webb och app

Datum: 2026-07-16
Issue: #298
Epic: #243
Status: Beslutad plan för Fas 5; implementation har inte startat

## Syfte och avgränsning

Min Egenkontroll ska kunna bygga, verifiera, deploya och vidareutveckla den publika webbplatsen och den inloggade appen oberoende av varandra, utan att bryta publika URL:er, auth, inspektörslänkar, API-routes eller appens kärnflöden.

Den här leveransen är endast ett beslutsunderlag och en migrationsplan. Ingen produktionskod eller filstruktur flyttas, ingen routing ändras och inga Vercel- eller Supabase-resurser skapas i issue #298.

Planen bygger på:

- `AGENTS.md`
- `docs/strategy/PIVOT.md`
- `docs/strategy/PHASE_3_DECISIONS.md`
- `docs/strategy/CURRENT_STATE_INVENTORY.md`
- `docs/strategy/CONTENT_MIGRATION_MAP.md`
- `docs/strategy/PUBLIC_PLATFORM_CONSOLIDATION.md`
- Epic #243, issue #298 och den faktiska repostrukturen efter PR #297
- två read-only-inventeringar: repo/routing/beroenden respektive deploy/auth/Supabase/PWA

## Beslut i korthet

Målarkitekturen är ett npm-workspace-monorepo med två självständiga applikationer och två små delade paket:

```text
apps/
  web/                  # Astro, statiskt genererad publik webb
  app/                  # Befintlig Vite/React-app
packages/
  brand/                # Masterassets och rena brandreferenser
  design-system/        # Tokens och generella UI-primitiver
docs/
scripts/
supabase/               # Migrationer, seed och SQL-smoketester
package.json
package-lock.json
```

Domänmålet är:

- `https://minegenkontroll.se` för publik webb,
- `https://app.minegenkontroll.se` för auth, inloggad app, inspektörsvy och appens API-routes.

Det befintliga Vercel-projektet ska bli appprojekt. Det behåller därmed sin historik, sina serverhemligheter och sina serverless-funktioner. Ett separat statiskt webbprojekt skapas först i en senare, uttryckligen godkänd migrationsetapp.

## Verifierat nuläge

### Entry, routing och beroenden

- Repot är ett npm-paket utan workspaces. `src/main.tsx` monterar en enda Vite/React-app.
- `src/App.tsx` äger samtidigt Supabase-session, auth, recovery, invitationer, inspektörsvy, organisationsbootstrap, publika/legal routes och inloggad app.
- `src/components/PublicLandingPageWithKnowledgeBase.tsx` är den publika dispatchern för resursbibliotek, sök, ämnesnav, sex FactPage-routes, en TemplatePage, ett verktyg, fyra BusinessPage-routes och kvarvarande SeoLanding-routes.
- Appnavigationen är hashbaserad genom `#view`, `#menu` och `#controlTypeId`. Den ska inte skrivas om under separationen.
- Okända paths faller i dag tillbaka till startsidan för utloggade och appen för inloggade. En riktig 404 införs först i webbens shadow deployment, inte samtidigt med den första mekaniska flytten.
- Publika moderna komponenter importerar inte appens service-lager eller Supabase. Den främsta kodkopplingen är `src/config/assets.ts`, som blandar brandreferenser med appikoner och `ControlCategory`.
- `src/main.tsx` importerar `src/styles/global.css` för både webb och app. Den filen importerar även `bottomNav.css`, så publik webb får i dag appens globala CSS indirekt.

### Publikt innehåll och metadata

- Modern publik produktion använder Homepage, PublicSiteShell, KnowledgeBase, Search, HaccpTopicHub, FactPage, TemplatePage, HazardAnalysisToolPage och BusinessPage.
- `src/config/publicResources.ts` är gemensam källa för kunskapsbank och sök.
- 55 statiska SEO-sidor ligger under `public/seo`, tillsammans med `public/seo-guides.css`, sitemap och robots.
- React-sidornas metadata sätts klient-side. De statiska SEO-filerna har title, description och canonical direkt i HTML.
- Tre bevarade legacy-ingångar har aktuella ersättare men saknar beslutad redirect-/canonicalstrategi. De får inte slås ihop utan separat SEO-underlag.

### Auth, Supabase, API och PWA

- `src/lib/supabaseClient.ts` använder beständig session, automatisk tokenförnyelse och URL-baserad sessionsdetektion.
- Magic link, signup och lösenordsåterställning använder `VITE_APP_URL`. Invitationer och inspektörslänkar byggs delvis från `window.location.origin`.
- Supabase-session, aktiv organisation och onboardingstatus ligger i originbunden browserlagring. De följer inte automatiskt från apexdomänen till appsubdomänen.
- `api/client-error.js`, `api/shared-attachment-url.js` och `api/send-inspector-report.js` används av app-/inspektörsflöden och ska stanna med appen.
- `SUPABASE_SERVICE_ROLE_KEY`, Resend-nycklar och andra serverhemligheter får aldrig kopieras till webbprojektet.
- PWA-manifestet har `start_url` och `scope` `/`; service workern registreras globalt från `/service-worker.js`. Den är network-only, men installationen är ändå bunden till nuvarande origin.
- Separationen kräver ingen Supabase-migration, RLS-förändring eller ny databas.

## Rekommenderad målarkitektur

### `apps/web`: Astro med statisk output och React-islands

Webben ska använda Astro i statiskt läge med React-integrationen. Astro väljs eftersom den publika ytan huvudsakligen består av indexerbart innehåll, samtidigt som befintliga React-komponenter kan återanvändas för interaktiva delar. Astro genererar statisk HTML som standard och hydrerar endast uttryckligen markerade islands.

`apps/web` äger:

- startsidan och `PublicSiteShell`,
- `/kunskapsbank` och `/sok`,
- HACCP-navet,
- FactPage-, TemplatePage-, HazardAnalysisToolPage- och BusinessPage-innehåll,
- de kvarvarande aktiva SeoLanding-sidorna,
- integritetspolicy och användarvillkor,
- `publicResources`, faktasides-, mall-, verktygs-, verksamhets- och ämneskonfiguration,
- `types/publicTools.ts`,
- `public/seo`, `seo-guides.css`, sitemap, robots och publika brandassets,
- build-time metadata, structured data, canonical och 404,
- en minimal kompatibilitetsbrygga för gamla hash-/authlänkar på apex.

Mallverktyget, faroanalysverktyget, sök, temaväxlare och mobilmeny får vara React-islands. Övrigt innehåll ska genereras som statisk HTML. Under shadow-migrationen får hela befintliga React-sidor tillfälligt hydreras för paritet, men slutgränsen ska vara selektiv hydrering.

Webben får inte importera:

- `@supabase/supabase-js`,
- `src/lib/supabaseClient.ts`,
- appens services eller databasdomäntyper,
- appnavigation, PWA-installationslogik eller operativa API-klienter.

### `apps/app`: befintlig Vite/React-produkt

Appen ska förbli Vite/React. Ingen ramverks- eller routeromskrivning görs i separationen.

`apps/app` äger:

- auth, magic link, signup, recovery och invitationer,
- Supabaseklient och all appmiljö,
- organisationer, roller och onboarding,
- dashboard, kontroller, historik, avvikelser, delning och rapporter,
- inspektörsvyn och dess hashbaserade kompatibilitet,
- `src/services`, appens `src/lib`, `types/database.ts` och locales,
- appens globala CSS, bottom navigation och appspecifika UI-komponenter,
- `api/*.js`,
- PWA-manifest, service worker, PWA-ikoner och installationsflöde,
- `public/api/leads` tills den ytan fått en separat säkerhets- och ägarbedömning.

Efter stabilisering ska `App.tsx` endast koordinera auth, invitation/recovery, organisation, inspektör och inloggad app. Publik dispatch och publika sidkomponenter tas bort först i den sista migrationsetappen.

### `packages/brand`

Paketet ska ha noll runtimeberoenden och vara enda källan för:

- masterlogga, masterikon, Open Graph-bild och nödvändiga varianter,
- typade brandreferenser och brandmetadata,
- ett deterministiskt build-/copy-kontrakt som kan ge båda apparna stabila `/brand/...`-URL:er när sådana krävs.

Appens UI- och kontrollikoner hör inte till brandpaketet.

### `packages/design-system`

Paketet ska innehålla:

- `tokens.css`,
- grundläggande design-system-CSS,
- Button, LinkButton, TextField, Field, Badge, Alert och Card,
- React och React DOM som peer dependencies, inte inbundna dubbletter.

ActionButton, BackButton, AssetIcon, SegmentedChoice, PublicSiteShell och andra app-/webbspecifika kompositioner delas inte initialt.

### Reporoten

Roten ska äga npm workspaces, gemensamma kvalitetskommandon, dokumentation, scripts och `supabase/`. Ingen Turborepo-, Nx-, pnpm- eller Yarn-migration behövs; npm workspaces och befintlig lockfil är minsta förändringen.

## Alternativ som avvisas

### Fortsatt gemensam SPA

Avvisas eftersom auth, PWA, publika metadata, bundle och deploy förblir sammankopplade. Det löser inte Fas 5.

### Två separata repos

Avvisas eftersom brand, designsystem och releasekoordination skulle driva isär. Den låsta målbilden i `PIVOT.md` är ett gemensamt repo.

### Två Vite-SPA:er utan prerendering

Avvisas eftersom den publika webbens metadata fortsatt skulle vara klient-side och icke-JS-klienter få fel initial HTML.

### Egen Vite SSR-/SSG-pipeline

Avvisas eftersom den skulle kräva en egen server-entry, prerenderscript, hydration- och routehantering. Astro ger motsvarande statiska output och React-islands med mindre egen infrastruktur.

### Next.js eller omskrivning av båda ytorna

Avvisas eftersom det skulle kombinera separationen med en bred ramverks-, routing- och renderingsmigration. Appen har inget verifierat behov av detta.

### Delad Supabaseklient eller delat publikt shell

Avvisas. Supabase är en appgräns och PublicSiteShell är webbkomposition, inte generell design-systemkod.

## Domän- och deploymentmodell

### Vercel-projekt

1. Det befintliga Vercel-projektet behålls och blir appprojekt med Root Directory `apps/app` först när den mekaniska appflytten är verifierad.
2. Ett nytt Vercel-projekt skapas senare med Root Directory `apps/web` och statisk Astro-output.
3. Båda projekten använder samma Git-repo men separata build-, output- och miljökonfigurationer.
4. Produktionens apexdomän flyttas sist. Innan dess körs webben endast som shadow/preview.

Vercels dokumentation stödjer flera projekt med olika Root Directory i samma monorepo: https://vercel.com/docs/monorepos.

### Miljövariabler

Appprojektet äger:

- `VITE_APP_URL=https://app.minegenkontroll.se`,
- `VITE_SUPABASE_URL`,
- `VITE_SUPABASE_PUBLISHABLE_KEY`,
- server-side `SUPABASE_URL`/publik nyckel där API-funktionerna behöver dem,
- `SUPABASE_SERVICE_ROLE_KEY`,
- `RESEND_API_KEY`,
- `RESEND_FROM_EMAIL`.

Webbprojektet äger endast publika buildvärden:

- `PUBLIC_SITE_ORIGIN=https://minegenkontroll.se`,
- `PUBLIC_APP_ORIGIN=https://app.minegenkontroll.se`.

Webbens preview ska fortsatt använda produktionscanonical och länka till den verifierade appmiljön. Inga Supabase- eller Resendvariabler ska finnas i webbprojektet.

### API-gräns

App- och inspektörsklienter ska fortsätta använda same-origin `/api/...` på appdomänen. Detta undviker en ny CORS-yta och håller serverhemligheter borta från webben. Externa API-kontrakt införs inte i separationen.

## Auth- och Supabasegräns

1. Samma Supabaseprojekt används initialt. Schema, RLS, RPC och Storage ändras inte.
2. `https://app.minegenkontroll.se/**` läggs till som exakt tillåten redirect innan appens environment eller CTA ändras.
3. Apex behålls som tillåten övergångsadress tills äldre mail- och invitationslänkar rimligen har löpt ut och kompatibilitetslagret är stabilt.
4. Supabase Site URL ändras till appdomänen först efter verifierat login/signup/recovery på appdomänen.
5. Lokal utveckling får en explicit localhost-regel. Godtyckliga Vercel-previewdomäner ska inte globtillåtas; auth-preview använder en namngiven stabil testadress eller separat framtida stagingmiljö.
6. Browser-session och localStorage flyttas inte mellan origins. Användaren kan behöva logga in en gång på appdomänen. Ingen klientbaserad tokenkopiering byggs.
7. Nya inspektörs- och invitationslänkar ska använda en explicit app-origin, inte `window.location.origin`.

Supabase redirectregler ska följa https://supabase.com/docs/guides/auth/redirect-urls.

## Metadata och prerendering

Webben ska ha ett typat route-/metadataregister som minst innehåller:

- path,
- sidtyp,
- title,
- description,
- canonical path,
- indexeringsstatus,
- Open Graph-data,
- källa för sidans innehåll eller statiska fil.

Astro-layouten ska skriva title, description, robots, canonical, Open Graph och relevanta structured-data-block vid build. Canonical ska alltid använda `PUBLIC_SITE_ORIGIN`, även i preview.

Registret ska driva sitemap och kontraktskontroller. Build ska misslyckas vid:

- duplicerad path eller canonical,
- registrerad route utan byggd HTML,
- saknad title/description/canonical på indexerbar modern sida,
- app-, auth- eller API-route i webbens innehållssitemap.

Klient-side metadataeffekter får tas bort först när shadow-webbens råa HTML har verifierats route för route.

## Statiska SEO-sidor och legacy-URL:er

`public/seo`, `seo-guides.css`, sitemap och robots flyttas initialt byte-identiskt till `apps/web/public`. Paths, innehåll och canonical ändras inte i separationsprojektet.

Följande principer gäller:

- bevara samtliga nuvarande publika URL:er under separationen,
- skilj fysisk flytt från innehållsmigration,
- gör inga redirect-, merge- eller canonicalbeslut utan Search Console-, trafik-, inlänks- och konverteringsunderlag,
- verifiera att Vercels rewrites inte skuggar statiska `/seo/*.html`,
- behåll de konsoliderade moderna resurserna som sökbara huvudresurser,
- behandla legacy-URL:er som kompatibilitetsytor tills en separat SEO-issue beslutar annat.

`public/api/leads` hör inte till den publika webben. Den stannar tillfälligt med appen. Före apexbytet ska dess åtkomstmodell verifieras och apex får vid behov en explicit kompatibilitetsredirect till appdomänen.

## Kompatibilitetslager vid domänbyte

### Inspector

Gamla länkar använder `https://minegenkontroll.se/#inspector=<token>`. URL-fragment skickas inte till servern och kan därför inte lösas med en Vercel-redirect. Webbens tidiga klientkod ska före normal render kontrollera kända appfragment och ersätta origin med `https://app.minegenkontroll.se` utan att logga eller förändra token.

### Auth, invitation och recovery

- `/login` och `/signup` på apex får permanenta redirects till appdomänen med bevarad query.
- `?invitation=` samt recovery-/authfragment ska testas separat och vidarebefordras oförändrade.
- Kompatibilitetsbryggan ska endast känna igen dokumenterade appmarkörer; den får inte bli en generell open redirect.

### PWA

Installerade PWA:er på apex kan inte flyttas automatiskt till en ny origin. Före apexbytet ska appens manifest och worker fungera på appdomänen. Webbens apex ska under övergången serva en cleanup-worker på den gamla sökvägen som avregistrerar den gamla workern och rensar eventuella egna cacher. Användare kan behöva installera appen igen från appdomänen.

Den nuvarande workern är network-only, vilket begränsar cacherisken men inte origin-, scope- eller installationsrisken.

## Migreringsetapper

Varje etapp ska ha en egen issue, branch och PR. Ingen etapp får kräva att nästa etapp mergas för att produktionen ska fungera.

### Etapp 1: kontrakt och guardrails

Omfattning:

- lägg till automatiska baselinekontroller för publika routes, canonicals, sitemap, statiska filer, auth-/inspektörs-URL:er, API-paths, PWA-paths och env-gränser,
- dokumentera aktuell build/output utan att flytta runtimekod,
- lägg till separata framtida buildnamn i CI endast om nuvarande produktionsbuild förblir oförändrad.

Binära acceptanskriterier:

- ingen produktionskomponent, route, asset eller deploy flyttas,
- nuvarande `typecheck`, `lint` och `build` passerar,
- route-/canonical-baseline omfattar alla registrerade och statiska produktionssidor,
- kontrollen stoppar Supabase-/server-secret-import i framtida webbgräns,
- Vercels nuvarande produktion använder oförändrat buildkommando och output.

Rollback: revert av en tooling-/CI-PR. Ingen domän eller extern konfiguration berörs.

### Etapp 2: npm workspaces och delade paket

Omfattning:

- inför npm workspaces,
- etablera `packages/brand` och `packages/design-system`,
- separera `brandAssets` från appikoner/databastyper,
- behåll root-appen som produktionsruntime tills paketgränserna är verifierade.

Binära acceptanskriterier:

- en ren `npm ci` från reporoten fungerar,
- root-appens build och publika URL-baseline är oförändrade,
- brandpaketet saknar runtimeberoenden,
- designsystemet har React som peer dependency och inga route-/auth-/Supabase-importer.

Rollback: revert av workspace- och importändringarna. Befintligt Vercel-projekt fortsätter från root.

### Etapp 3: flytta monoliten intakt till `apps/app`

Omfattning:

- flytta hela nuvarande Vite-runtime, PWA, API-routes och tillfälligt även publik kod till `apps/app`,
- ändra befintligt Vercel-projekts Root Directory/build först efter previewverifiering,
- behåll apex, routes, auth, Supabase och beteende oförändrade.

Binära acceptanskriterier:

- samtliga tidigare routes svarar på samma paths,
- login, signup, magic link, recovery, invitation, organisation, dashboard och signout fungerar,
- inspector, bilagor, rapportmail och client-error API fungerar,
- PWA-manifest, worker, installprompt och online-banner fungerar,
- inga databas- eller authinställningar har ändrats.

Rollback: återställ föregående Vercel-deployment/Root Directory och revert PR:n.

### Etapp 4: bygg `apps/web` som shadow deployment

Omfattning:

- bygg Astro-webben från den konsoliderade publika ytan,
- flytta statiska SEO-filer byte-identiskt,
- implementera build-time metadata, route-register, sitemap och 404,
- behåll appens publika compatibility-routes tills apexbytet är stabilt,
- skapa ett separat Vercel-webbprojekt utan produktionsdomän och utan Supabasevariabler.

Binära acceptanskriterier:

- alla aktuella publika routes har korrekt status, HTML, title, description och canonical i preview,
- alla 55 statiska SEO-filer finns på oförändrade paths,
- sök, mall, verktyg, tema och mobilnavigation fungerar,
- webbbygget saknar Supabase- och appservice-importer,
- appens produktion är oförändrad.

Rollback: koppla bort eller ignorera shadow-deploymenten. Produktionsdomänen påverkas inte.

### Etapp 5: aktivera appdomän och auth

Omfattning:

- koppla `app.minegenkontroll.se` till befintligt appprojekt medan apex fortfarande visar appen,
- lägg till exakta Supabase-redirects,
- sätt appens explicita origin,
- låt nya inspector-/invitationslänkar använda appdomänen,
- verifiera appens PWA och API på appdomänen.

Binära acceptanskriterier:

- login, signup, magic link, reset och invitation landar på appdomänen,
- användaren kan ladda organisation och utföra kärnflöden efter auth,
- nya och befintliga inspector-länkar fungerar,
- API-routes är same-origin och serverhemligheter finns endast i appprojektet,
- apex fortsätter fungera som före etappen.

Rollback: återställ `VITE_APP_URL` och Supabase Site URL till verifierad tidigare adress; behåll apex som primär appdomän. Den extra tillåtna appredirecten kan ligga kvar ofarligt.

### Etapp 6: flytta apex till webbprojektet

Omfattning:

- aktivera app-CTA:er, `/login`-/`/signup`-redirects, hash-/authbrygga, leads-kompatibilitet och PWA-cleanup,
- flytta `minegenkontroll.se` till webbprojektet först efter full preview- och appdomänverifiering,
- behåll appens publika compatibility-kod under stabiliseringsperioden.

Binära acceptanskriterier:

- samtliga publika routes, canonicals och statiska SEO-filer svarar korrekt på apex,
- auth-CTA, login/signup, invitation, recovery och gamla `#inspector`-länkar når appdomänen,
- inga serverhemligheter finns i webben,
- fel- och 404-loggar visar ingen systematisk routeförlust,
- Search Console/sitemap kan verifiera oförändrade indexerbara URL:er.

Rollback: flytta apex tillbaka till det befintliga appprojektet och återaktivera dess tidigare deployment. Webbprojektet ligger kvar som preview.

### Etapp 7: stabilisering och borttagning

Omfattning:

- behåll kompatibilitetslagret minst 14 dagar och en full releasecykel,
- följ authfel, 404, inspector-användning, API-fel, PWA-övergång och indexering,
- ta därefter bort publik duplicering ur appen och temporära bryggor som inte längre behövs,
- uppdatera drift- och authdokumentation till de faktiska domänerna.

Binära acceptanskriterier:

- inga P0/P1-regressioner under stabiliseringsperioden,
- ingen aktiv route eller appövergång beror på borttagen compatibility-kod,
- båda projekten bygger och deployas oberoende,
- rollbackdeploymenten och dess konfiguration är dokumenterad innan borttagning.

Rollback: återaktivera senaste compatibility-deployment eller återlägg den specifika bryggan. SEO-redirects ingår inte i denna etapp.

## Uttrycklig avgränsning för första implementationssteget

Nästa implementationsissue ska endast omfatta Etapp 1: kontrakt och guardrails.

Den får inte:

- skapa eller flytta `apps/web` eller `apps/app`-runtime,
- flytta produktionskomponenter, assets, API-routes eller PWA-filer,
- ändra routing, canonical, sitemap-innehåll eller publika URL:er,
- ändra Vercel-projekt, Root Directory, domäner eller miljövariabler,
- ändra Supabase Auth, Site URL, redirectlistor, RLS, RPC eller migrationer,
- ändra `VITE_APP_URL`,
- kopiera eller exponera serverhemligheter,
- skapa ett nytt Vercel-projekt,
- introducera Astro i produktionen.

Etappen är klar endast när baselinekontrollerna kan köras mot den befintliga monoliten och nuvarande produktionsbuild är oförändrad.

## Riskregister inför implementation

1. **Originbyte och session:** Supabase-session och lokal appstatus följer inte till appsubdomänen. Mitigation: acceptera engångsinloggning och bygg ingen tokenkopiering.
2. **Gamla inspector-länkar:** hashfragment kan inte serverredirectas. Mitigation: strikt klientbrygga på apex och behållen appkompatibilitet.
3. **Authordning:** fel Site URL eller `emailRedirectTo` kan skicka användare fel. Mitigation: verifiera appdomän och allowlist innan någon primär adress ändras.
4. **PWA-origin:** installerad apex-PWA blir annars webbplatsen efter cutover. Mitigation: app-PWA på appdomänen, cleanup-worker och tydlig ominstallationsväg.
5. **Serverhemligheter:** två projekt ökar risken för felkopierade env-vars. Mitigation: explicit env-matris och förbud mot Supabase/Resend i webbprojektet.
6. **API/CORS:** flytt till annan origin kan bryta relativa anrop. Mitigation: API följer appen och förblir same-origin.
7. **SEO-skuggning:** fel rewrite kan skugga statiska HTML-filer eller ändra canonical. Mitigation: route-/canonical-baseline och rå HTML-kontroll före apexbyte.
8. **Global CSS:** webben får i dag appreset och tokens indirekt. Mitigation: explicit webbreset, tokens och fokusregler i shadow deployment före bortkoppling.
9. **Okända paths:** nuvarande fallback maskerar 404. Mitigation: testa riktig webb-404 i shadow, inte i första appflytten.
10. **Brist på automatiserade frontend/auth-tester:** mitigation: Etapp 1 skapar kontraktskontroller och varje senare etapp har en binär smoke-matris.
11. **Historiska driftdokument:** äldre Vercel-domäner i `docs/auth-redirect.md` kan vara inaktuella. Mitigation: verifiera verklig Dashboard-konfiguration innan Etapp 5 och uppdatera dokument efter cutover.
12. **`public/api/leads`:** ytan är varken normal publik webb eller kärnapp. Mitigation: behåll den med appen och kräv separat åtkomst-/säkerhetsgranskning före flytt eller exponering.

## Verifiering och styrning

Varje implementationsetapp ska minst köra:

- workspace-relevant typecheck,
- workspace-relevant lint,
- separat build för berörd app och delade paket,
- `git diff --check`,
- route-/canonical-/asset-kontrakt från Etapp 1,
- den etappspecifika binära smoke-matrisen ovan.

UI- eller deployetapper verifieras i Vercel Preview innan produktionsändring. Auth-, RLS-, API- eller domänändringar kräver dokumenterad manuell produktionskontroll och en namngiven rollbackdeployment.

Epic #243 ska behandla denna plan som avslutad planering för Fas 5, men Fas 5 förblir öppen tills separationen är implementerad och stabiliserad. Nästa stora steg är Etapp 1, inte fler nya sidtyper eller bred innehållsexpansion.
