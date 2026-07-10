# Current State Inventory

Issue: #245  
Date: 2026-07-10  
Scope: public pages, SEO/routing, brand surfaces, and the current boundary between public web and logged-in app.

This inventory is descriptive. It does not decide what to remove, merge, redirect, redesign, or rebuild.

## Method

Verified by reading the repository only:

- `AGENTS.md`
- `docs/strategy/PIVOT.md`
- public routing and SEO files
- brand assets and usage sites
- app/auth boundary and shared modules
- sitemap, robots, manifest, and static SEO files

Three read-only subagents were used as requested:

- public pages, routes, SEO, and internal linking
- brand files and usage sites
- public web / logged-in app boundary

No app code, routing, metadata, brand files, Supabase files, URL structure, or architecture was changed.

## Executive Summary

Verified current state:

- The repo is one Vite/React app with one entrypoint, not yet split into `apps/web`, `apps/app`, and `packages/brand`.
- Public web content exists in two parallel forms: React-rendered public pages and static HTML guide pages in `public/seo`.
- The sitemap lists 67 public content URLs: `/`, `/kunskapsbank`, 10 React SEO pages, and 55 static SEO guide pages.
- The logged-in app, public landing pages, legal pages, inspector view, invitation flow, recovery flow, and organization bootstrapping are all coordinated by `src/App.tsx`.
- Brand file paths are partly centralized through `src/config/assets.ts`, but `index.html`, `public/manifest.webmanifest`, and all static SEO HTML files hardcode brand paths.
- SEO metadata for React public pages is set client-side with `useEffect`; static SEO pages include their own title, description, and canonical tags in HTML.
- `/login` and `/signup` are public auth entry routes but are disallowed in `public/robots.txt`.

Important observations:

- The knowledge bank already behaves like a resource library plus topic hub.
- Several static pages already act as thin topic hubs and could become proper topic hubs later.
- High purchase-intent pages already exist around digital egenkontroll, restaurant, and cafe use cases.
- There is meaningful overlap between root React SEO pages and static `/seo/*.html` articles in HACCP, traceability, temperature, and documentation clusters.
- Logged-in users do not currently see React public pages such as `/kunskapsbank` after session resolution; they fall into the app shell because public React content is only rendered for unauthenticated users.

Uncertainties:

- Static file precedence for `public/seo/*.html` under Vercel was inferred from repo layout and Vercel conventions, not browser-verified in this issue.
- Search performance, traffic, backlinks, and conversion data were not inspected.
- The private leads page under `public/api/leads` appears publicly reachable as a static path with `noindex,nofollow`, but runtime access behavior was not verified.

## 1. Public Pages And URLs

### React Public Pages

These routes are handled inside the SPA. Public route detection is manual in `src/App.tsx`, `src/components/PublicLandingPageWithKnowledgeBase.tsx`, and `src/components/SeoLandingPage.tsx`.

| URL | Current purpose | Likely intent | Current page type | Likely future page type per `PIVOT.md` | Important dependencies |
| --- | --- | --- | --- | --- | --- |
| `/` | Product homepage and prelaunch signup path | Brand, product evaluation, high purchase intent | Product landing page | Startsida | `src/App.tsx`, `src/components/PublicLandingPageWithKnowledgeBase.tsx`, `src/components/PublicLandingPage.css`, `src/config/assets.ts`, `src/config/subscription.ts` |
| `/kunskapsbank` | Directory for guides grouped by subject | Browse and find help | Resource library plus topic hub | Resursbibliotek, possibly ämnesnav | `src/components/KnowledgeBasePageV2.tsx`, `src/components/PublicLandingPageWithKnowledgeBase.tsx`, `src/components/PublicLandingPage.css`, `src/config/assets.ts` |
| `/digital-egenkontroll-livsmedel` | Explain digital egenkontroll and product value | High purchase intent / solution search | SEO/product landing article | Sida med hög köpavsikt | `src/components/SeoLandingPage.tsx`, related slug graph, shared public CSS |
| `/egenkontroll-restaurang` | Product/value page for restaurants | High purchase intent | SEO/product landing article | Sida med hög köpavsikt | `src/components/SeoLandingPage.tsx`, related slug graph, shared public CSS |
| `/egenkontroll-cafe` | Product/value page for cafe and bakery | High purchase intent | SEO/product landing article | Sida med hög köpavsikt | `src/components/SeoLandingPage.tsx`, related slug graph, shared public CSS |
| `/dokumentation-egenkontroll-livsmedel` | Explain documentation and journaling | Informational, mid-intent | Fact/guide page with product CTA | Faktasida / artikel | `src/components/SeoLandingPage.tsx`, source metadata, related slugs |
| `/sparbarhet-livsmedel` | Explain food traceability | Informational, can lead to tool/app need | Fact/guide page with hub potential | Faktasida / artikel or ämnesnav | `src/components/SeoLandingPage.tsx`, related traceability pages |
| `/haccp-sma-livsmedelsforetag` | Explain HACCP for small businesses | Informational / problem-aware | Fact/guide page with hub potential | Faktasida / artikel or ämnesnav | `src/components/SeoLandingPage.tsx`, HACCP cluster links |
| `/faroanalys-livsmedel` | Explain hazard analysis | Informational | Fact/guide page | Faktasida / artikel | `src/components/SeoLandingPage.tsx` |
| `/avvikelser-korrigerande-atgarder-livsmedel` | Explain deviations and corrective actions | Informational, operational | Fact/guide page | Faktasida / artikel | `src/components/SeoLandingPage.tsx`, app deviation value proposition |
| `/verifiering-egenkontroll-livsmedel` | Explain verification | Informational | Fact/guide page | Faktasida / artikel | `src/components/SeoLandingPage.tsx` |
| `/spara-sparbarhetsuppgifter-livsmedel` | Explain retention of traceability data | Informational | Fact/guide page | Faktasida / artikel | `src/components/SeoLandingPage.tsx`, traceability cluster |
| `/login` | Login / magic-link entry | Return user or invited user | Auth page | Inloggning | `src/App.tsx`, `src/components/AuthPanel.tsx`, Supabase auth, robots disallow |
| `/signup` | Create account / prelaunch entry | Signup / high purchase intent | Auth page | Signup | `src/App.tsx`, `src/components/AuthPanel.tsx`, Supabase auth, robots disallow |
| `/integritetspolicy` | Legal/privacy information | Compliance and trust | Legal page | Supporting legal page | `src/App.tsx`, `src/components/PrivacyPolicyPage.tsx` |
| `/anvandarvillkor` | Terms | Compliance and trust | Legal page | Supporting legal page | `src/App.tsx`, `src/components/TermsPage.tsx` |
| `/#inspector=<key>` | Read-only shared inspection view | Inspector/customer sharing | Public-by-token app view | Shared inspection flow, not SEO page | `src/App.tsx`, `src/components/InspectorView.tsx`, sharing RPC/API |

### Static SEO Pages

There are 55 static `.html` guides in `public/seo`. They share:

- one-line static HTML documents
- page-specific `<title>`, `<meta name="description">`, and canonical URL
- `/seo-guides.css`
- nav logo linking to `/`
- nav links to `/kunskapsbank` and `/signup`
- footer links to nearby related guides

| URL | Current purpose | Likely intent | Current page type | Likely future page type |
| --- | --- | --- | --- | --- |
| `/seo/kallor-och-faktagranskning.html` | Source and fact-checking explanation | Trust / editorial policy | Supporting trust page | Faktasida / artikel |
| `/seo/kritiska-gransvarden.html` | Critical limits in HACCP | Informational | Fact guide | Faktasida / artikel |
| `/seo/kontrollplan.html` | Control plan basics | Informational / operational planning | Fact guide | Faktasida / artikel or mall/checklista later |
| `/seo/hygien-och-daglig-drift.html` | Hygiene and daily routines overview | Topic browsing | Thin hub / collection page | Ämnesnav |
| `/seo/personlig-hygien-livsmedel.html` | Personal hygiene | Informational | Fact guide | Faktasida / artikel |
| `/seo/rengoring-livsmedelsverksamhet.html` | Cleaning routines | Informational / operational | Fact guide | Faktasida / artikel or checklist resource later |
| `/seo/skadedjur-livsmedelsverksamhet.html` | Pest prevention | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/temperaturkontroll-livsmedel.html` | Temperature control overview | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/allergeninformation-restaurang.html` | Allergen information for restaurants/cafes | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/hantering-och-forvaring-livsmedel.html` | Handling and storage overview | Topic browsing | Thin hub / collection page | Ämnesnav |
| `/seo/varumottagning-livsmedel.html` | Receiving goods | Informational / operational | Fact guide | Faktasida / artikel or checklist resource later |
| `/seo/korskontamination-livsmedel.html` | Cross-contamination | Informational | Fact guide | Faktasida / artikel |
| `/seo/separera-raa-och-atfardiga-livsmedel.html` | Separate raw and ready-to-eat foods | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/kemikalier-i-livsmedelsverksamhet.html` | Chemicals in food business | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/allergenkontamination-livsmedel.html` | Allergen contamination | Informational | Fact guide | Faktasida / artikel |
| `/seo/grundforutsattningar-livsmedel.html` | Prerequisites overview | Topic browsing | Thin hub / collection page | Ämnesnav |
| `/seo/lokaler-och-utrustning-livsmedel.html` | Premises and equipment | Informational | Fact guide | Faktasida / artikel |
| `/seo/materialval-livsmedelslokal.html` | Material choices in food premises | Informational | Fact guide | Faktasida / artikel |
| `/seo/underhall-livsmedelslokal.html` | Maintenance | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/toalett-och-handfat-livsmedelsverksamhet.html` | Toilet and sink requirements | Informational | Fact guide | Faktasida / artikel |
| `/seo/ventilation-livsmedelsverksamhet.html` | Ventilation | Informational | Fact guide | Faktasida / artikel |
| `/seo/avfall-livsmedelsverksamhet.html` | Waste handling | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/soprum-och-avfallsutrymme-livsmedel.html` | Waste room / waste space | Informational | Fact guide | Faktasida / artikel |
| `/seo/transport-av-livsmedel.html` | Food transport | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/utbildning-livsmedelshygien-personal.html` | Staff hygiene training | Informational | Fact guide | Faktasida / artikel |
| `/seo/vatten-i-livsmedelsverksamhet.html` | Water in food businesses | Informational | Fact guide | Faktasida / artikel |
| `/seo/is-i-livsmedelsverksamhet.html` | Ice hygiene | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/temperaturprocesser-livsmedel.html` | Temperature processes overview | Topic browsing | Thin hub / collection page | Ämnesnav |
| `/seo/kylforvaring-livsmedel.html` | Cold storage | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/upptining-livsmedel.html` | Thawing | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/varmhallning-mat-temperatur.html` | Hot holding | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/nedkylning-mat-livsmedel.html` | Cooling food | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/ateruppvarmning-mat.html` | Reheating food | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/datummarkning-livsmedel.html` | Date marking overview | Topic browsing | Thin hub / collection page | Ämnesnav |
| `/seo/bast-fore-eller-sista-forbrukningsdag.html` | Best before vs use by | Informational | Fact guide | Faktasida / artikel |
| `/seo/salja-mat-efter-bast-fore.html` | Selling after best before | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/mat-efter-sista-forbrukningsdag.html` | After use-by date | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/bestamma-hallbarhetsdatum-livsmedel.html` | Setting durability dates | Informational | Fact guide | Faktasida / artikel |
| `/seo/frysa-in-kylvaror-fore-utgangsdatum.html` | Freezing chilled goods near expiry | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/information-och-markning-livsmedel.html` | Information and labelling overview | Topic browsing | Thin hub / collection page | Ämnesnav |
| `/seo/ansvar-livsmedelsinformation.html` | Responsibility for food information | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/vilseledande-livsmedelsinformation.html` | Misleading food information | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/fardigforpackade-livsmedel-markning.html` | Prepacked food definition | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/obligatorisk-markning-livsmedel.html` | Mandatory labelling overview | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/ingrediensforteckning-livsmedel.html` | Ingredient list | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/livsmedlets-beteckning.html` | Food name / designation | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/forvaringsanvisning-livsmedel.html` | Storage instructions | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/marka-om-fardigforpackade-livsmedel.html` | Relabelling prepacked foods | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/oforpackade-livsmedel-information.html` | Non-prepacked food information | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/obligatorisk-information-oforpackad-mat.html` | Mandatory info for non-prepacked food | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/distansforsaljning-oforpackad-mat.html` | Distance selling of non-prepacked food | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/intern-sparbarhet-livsmedel.html` | Internal traceability | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/partimarkning-livsmedel.html` | Lot marking | Informational / compliance | Fact guide | Faktasida / artikel |
| `/seo/aterkalla-livsmedel-sparbarhet.html` | Recall and traceability | Informational / operational | Fact guide | Faktasida / artikel |
| `/seo/mangdbalans-sparbarhet-livsmedel.html` | Mass balance / quantitative traceability | Informational / operational | Fact guide | Faktasida / artikel |

### Other Public Or Public-Adjacent Surfaces

| URL/surface | Verified current state | Notes |
| --- | --- | --- |
| `/api/leads/index.html` and related static files under `public/api/leads` | Static private-admin lead UI with `<meta name="robots" content="noindex,nofollow">` | Publicly hosted static files appear to exist under an `/api` path. Runtime gating was not verified. |
| `/api/shared-attachment-url` | Serverless API for shared attachment links | Public-by-token/supporting API, not a content page. |
| `/api/send-inspector-report` | Serverless API for emailed inspector PDF report | Public-by-token/supporting API, not a content page. |
| `/api/client-error` | Client error reporting endpoint | Supporting API, not a content page. |

## Duplications, Thin Pages, Overlap, Topic Hubs, Purchase Intent

### Duplications And Overlap

Verified overlap clusters:

- Traceability: `/sparbarhet-livsmedel`, `/spara-sparbarhetsuppgifter-livsmedel`, `/seo/intern-sparbarhet-livsmedel.html`, `/seo/partimarkning-livsmedel.html`, `/seo/aterkalla-livsmedel-sparbarhet.html`, `/seo/mangdbalans-sparbarhet-livsmedel.html`.
- HACCP/risk control: `/haccp-sma-livsmedelsforetag`, `/faroanalys-livsmedel`, `/avvikelser-korrigerande-atgarder-livsmedel`, `/verifiering-egenkontroll-livsmedel`, `/seo/kritiska-gransvarden.html`, `/seo/kontrollplan.html`.
- Temperature: `/seo/temperaturkontroll-livsmedel.html`, `/seo/temperaturprocesser-livsmedel.html`, `/seo/kylforvaring-livsmedel.html`, `/seo/upptining-livsmedel.html`, `/seo/nedkylning-mat-livsmedel.html`, `/seo/varmhallning-mat-temperatur.html`, `/seo/ateruppvarmning-mat.html`.
- Date marking: `/seo/datummarkning-livsmedel.html`, `/seo/bast-fore-eller-sista-forbrukningsdag.html`, `/seo/salja-mat-efter-bast-fore.html`, `/seo/mat-efter-sista-forbrukningsdag.html`, `/seo/bestamma-hallbarhetsdatum-livsmedel.html`, `/seo/frysa-in-kylvaror-fore-utgangsdatum.html`.
- Labelling/information: `/seo/information-och-markning-livsmedel.html` plus responsibility, misleading information, prepacked, mandatory labelling, ingredients, designation, storage instructions, relabelling, non-prepacked, and distance-selling pages.

These overlaps are not necessarily problems. They are current content clusters that make future hub/article decisions possible.

### Thin Or Hub-Like Pages

Likely hub-like pages in current state:

- `/kunskapsbank`
- `/seo/hygien-och-daglig-drift.html`
- `/seo/hantering-och-forvaring-livsmedel.html`
- `/seo/grundforutsattningar-livsmedel.html`
- `/seo/temperaturprocesser-livsmedel.html`
- `/seo/datummarkning-livsmedel.html`
- `/seo/information-och-markning-livsmedel.html`
- `/sparbarhet-livsmedel`
- `/haccp-sma-livsmedelsforetag`

Observation: the static hub-like pages are currently implemented with the same compact guide template as article pages. They appear lighter than a future `PIVOT.md` ämnesnav.

### Possible Topic Hubs

Current groups in `KnowledgeBasePageV2.tsx` suggest these future hubs:

- Egenkontroll i vardagen
- Hygien och daglig drift
- Hantering och förvaring
- Grundförutsättningar
- Temperatur
- Datummärkning och hållbarhet
- Information och märkning
- HACCP och riskstyrning
- Spårbarhet

### High Purchase-Intent Pages

Most likely high purchase-intent pages:

- `/`
- `/digital-egenkontroll-livsmedel`
- `/egenkontroll-restaurang`
- `/egenkontroll-cafe`
- `/signup`

Operational pages that may also have commercial intent when paired with templates/tools later:

- `/seo/varumottagning-livsmedel.html`
- `/seo/rengoring-livsmedelsverksamhet.html`
- `/seo/temperaturkontroll-livsmedel.html`
- `/seo/kontrollplan.html`
- `/seo/datummarkning-livsmedel.html`
- `/seo/intern-sparbarhet-livsmedel.html`

## 2. Routing, SEO, And Internal Linking

### Routing

Verified current routing:

- `vercel.json` rewrites all non-API paths to `/index.html`.
- `src/main.tsx` renders a single React app.
- `src/App.tsx` manually identifies `/login`, `/signup`, `/integritetspolicy`, and `/anvandarvillkor`.
- `src/App.tsx` reads hash params for `#inspector=`, `#view=`, `#menu=`, `#controlTypeId=`, password recovery, and invitation state.
- `src/components/PublicLandingPageWithKnowledgeBase.tsx` routes unauthenticated public home traffic to the homepage, `/kunskapsbank`, or a root-level React SEO page.
- `src/components/SeoLandingPage.tsx` owns the root-level SEO slug registry and lookup.
- Static `/seo/*.html` pages live in `public/seo`.

Observation: there is no React Router or route manifest. Public route knowledge is distributed across `App.tsx`, `PublicLandingPageWithKnowledgeBase.tsx`, `SeoLandingPage.tsx`, `KnowledgeBasePageV2.tsx`, `public/seo`, and `public/sitemap.xml`.

### Metadata

Verified current metadata:

- `index.html` has default title, description, robots, theme color, OG/Twitter metadata, and JSON-LD.
- React homepage sets title, description, robots, canonical, `og:title`, `og:description`, and `og:url` client-side.
- React knowledge bank sets title, description, and canonical client-side.
- React SEO pages set title, description, robots, canonical, `og:title`, `og:description`, and `og:url` client-side.
- Static SEO pages include title, description, and canonical directly in each HTML file.
- Legal pages do not appear to set page-specific metadata.
- Static SEO pages do not appear to define per-page OG/Twitter images.

Observation: because React metadata is written in `useEffect`, non-JS crawlers initially receive the default `index.html` metadata for React routes.

### Canonical

Verified current canonical handling:

- React homepage canonical: `https://minegenkontroll.se/`
- React knowledge bank canonical: `https://minegenkontroll.se/kunskapsbank`
- React SEO pages canonical: `https://minegenkontroll.se/{slug}`
- Static SEO pages canonical: `https://minegenkontroll.se/seo/{file}.html`

Observation: canonical handling exists, but is implemented in two different systems: React DOM mutation and static HTML.

### Sitemap And Robots

Verified current state:

- `public/sitemap.xml` lists `/`, `/kunskapsbank`, all 10 React SEO pages, and 55 static SEO pages.
- `public/robots.txt` allows all, disallows `/login` and `/signup`, and points to `https://minegenkontroll.se/sitemap.xml`.
- `/integritetspolicy` and `/anvandarvillkor` are not listed in the sitemap.

### Structured Data

Verified current state:

- `index.html` includes JSON-LD with `WebSite`, `Organization`, and `SoftwareApplication`-like product information.
- Static SEO pages and React SEO components do not appear to add per-page JSON-LD.

### Internal Linking

Verified current state:

- Homepage links to anchors, signup/login actions, `/kunskapsbank`, legal pages, and selected guide pages.
- `KnowledgeBasePageV2.tsx` is the main internal content directory, grouping public guide URLs into nine subject groups.
- React SEO pages use `relatedSlugs` and a `Läs vidare` section.
- Static SEO pages have simple nav to `/`, `/kunskapsbank`, `/signup`, plus footer links to related pages.

Observation: internal linking exists, but is spread across React arrays, static HTML footers, and sitemap XML. There is no single content graph source.

## 3. Brand Inventory

### Brand Asset Files

| File | Current role | Duplication / variant observation |
| --- | --- | --- |
| `public/brand/min-egenkontroll-logo2.png` | Full logo with wordmark | Main logo; hardcoded in static SEO pages and JSON-LD; referenced through `brandAssets.logo` in React. |
| `public/brand/min-egenkontroll-icon.png` | Main icon/symbol | Used as favicon, Apple touch icon, auth hero icon, and report/print icon. |
| `public/brand/pwa-icon-192.png` | PWA icon | Variant/resized icon used by manifest. |
| `public/brand/pwa-icon-512.png` | PWA icon | Variant/resized icon used by manifest. |
| `public/brand/OGImage.png` | Open Graph / Twitter image | Used in root `index.html` metadata. |

No byte-identical duplicate brand files were reported by the brand subagent. The PWA icons are variant-like resized versions of the main icon.

### Usage Sites

| Surface | Usage |
| --- | --- |
| React brand mapping | `src/config/assets.ts` maps `brandAssets.logo` and `brandAssets.icon`. |
| React public navs | `KnowledgeBasePageV2.tsx`, `PublicLandingPageWithKnowledgeBase.tsx`, `SeoLandingPage.tsx`, `PrivacyPolicyPage.tsx`, and `TermsPage.tsx` use `brandAssets.logo`. |
| Static SEO navs | All 55 `public/seo/*.html` files hardcode `/brand/min-egenkontroll-logo2.png`. |
| JSON-LD | `index.html` uses `https://minegenkontroll.se/brand/min-egenkontroll-logo2.png` as organization logo. |
| Favicon | `index.html` uses `/brand/min-egenkontroll-icon.png`. |
| Apple touch icon | `index.html` uses `/brand/min-egenkontroll-icon.png`. |
| Auth hero | `src/App.tsx` uses `brandAssets.icon`. |
| Manifest | `public/manifest.webmanifest` uses `/brand/pwa-icon-192.png` and `/brand/pwa-icon-512.png`. |
| Open Graph / Twitter | `index.html` uses `https://minegenkontroll.se/brand/OGImage.png`. |
| Browser print/report | `src/services/reportService.ts` uses `brandAssets.icon`. |
| Inspector print/share report | `src/components/SharedRunList.tsx` uses `brandAssets.icon`. |
| Emailed inspector PDF | `api/send-inspector-report.js` draws a colored square and `ME` initials in code; no logo file embedded. |
| Supabase auth email templates | `supabase/auth-email-templates.sv.json` uses brand name in copy; no logo/image asset. |
| Resend inspector report email | `api/send-inspector-report.js` uses sender fallback `Egenkontroll <onboarding@resend.dev>` and text email body. |
| Organization report branding | Database fields and private logo storage exist in migrations; code usage appears incomplete or reset-oriented. |

### Brand Observations

- React surfaces mostly use `src/config/assets.ts`.
- Static SEO HTML, `index.html`, and `manifest.webmanifest` use hardcoded paths.
- There is no dedicated `.ico` favicon file.
- The Apple touch icon reuses the large main icon rather than a dedicated Apple-sized asset.
- The server-generated PDF branding does not use the same logo/icon as browser reports.
- `public/brand/README.md` already states the intended destination: app, landing page, PDF export, reports, inspector view, favicon/app icon.

### Brand Uncertainties

- The actual visual equivalence between icon variants was not formally image-diffed in this issue.
- Organization-uploaded report logos are documented, but current usage in rendered reports needs separate verification before any decision.

## 4. Current Boundary Between Public Web And App

### Current Public Web

Verified public web areas:

- React homepage and public marketing/knowledge pages.
- React legal pages.
- Static SEO HTML guides under `public/seo`.
- Public-by-token inspector view.
- Public auth entry routes `/login` and `/signup`.
- Static private-admin lead UI under `public/api/leads` with `noindex,nofollow`.

### Current Logged-In App

Verified logged-in app areas:

- Organization setup.
- Today dashboard.
- History.
- KPI.
- Sharing.
- Menu and menu subviews.
- Control type editor and run flows.
- Suppliers, users, profile, organization branding, reports, admin controls, help, and related app views.

The app view state is hash-driven through `#view=...` and menu-specific hash params.

### Shared Surfaces

Shared code and assets:

- `src/App.tsx` owns public routing, auth routing, app routing, invitation handling, recovery handling, inspector handling, and organization bootstrapping.
- `src/config/assets.ts` combines brand assets, app UI icons, and control-type icons.
- `src/components/PublicLandingPage.css` is shared by public landing, knowledge, SEO, and legal surfaces.
- `src/styles/global.css` supports app shell/auth/global styling.
- Public landing imports app-flavored helpers such as `AssetIcon`, `readControlTypeIcon`, and subscription config.
- Inspector view is public-by-token but uses app/report services and serverless APIs.

### Where Auth Decides

Verified decision order in `src/App.tsx`:

1. `#inspector=` renders `InspectorView` before normal auth flow.
2. `/integritetspolicy` and `/anvandarvillkor` render regardless of session.
3. When not loading, no session, no recovery, no invitation, and `publicPath === 'home'`, React public pages render.
4. Otherwise unauthenticated users see `AuthPanel`.
5. Authenticated users see password recovery, invitation acceptance, `AppDashboard`, or `OrganizationSetup`.

Observation: logged-in users visiting `/kunskapsbank` or root SEO slugs do not remain on those public pages after session resolution. The session path takes over and shows the app.

### Separation Enablers

These current patterns should make later separation easier:

- App data access is mostly clustered in `src/services/*`.
- Public React content is clustered in `PublicLandingPageWithKnowledgeBase.tsx`, `KnowledgeBasePageV2.tsx`, `SeoLandingPage.tsx`, legal pages, and `public/seo`.
- Brand paths have a small central point in `src/config/assets.ts`.
- Static SEO content is already separated from app runtime code in `public/seo`.

### Separation Friction

These current patterns make later separation harder:

- One `App.tsx` controls too many boundaries: public web, auth, app, inspector, invitations, recovery, and organization setup.
- Public pages and app share one JavaScript bundle, Supabase client, service worker, global CSS environment, and Vercel deployment rewrite.
- React public pages depend on app-adjacent config and components.
- Brand and UI icon registries are mixed in one module.
- Metadata, sitemap, static HTML, and React route definitions are not generated from one source.
- Public-by-token inspector flows are neither purely marketing web nor fully authenticated app.

## Verified Current State vs Observations vs Uncertainties

### Verified Current State

- `docs/strategy/PIVOT.md` defines the future target as `minegenkontroll.se` for public platform and `app.minegenkontroll.se` for the app.
- Current repo is a single Vite/React app.
- Public content exists in both React components and static HTML files.
- Sitemap currently lists 67 content URLs.
- Robots disallows `/login` and `/signup`.
- React public metadata is set client-side.
- Static SEO files contain their own title, description, and canonical.
- Brand assets live under `public/brand`.
- Brand usage is partially centralized but not fully.
- Auth boundary is primarily in `src/App.tsx`.

### Observations

- The current content already maps well to PIVOT's future page types, but all pages currently use only a few templates.
- Several article clusters are ready for future ämnesnav decisions.
- Static pages are fact-focused and useful, but many are lightweight compared with the future ambition for richer topic hubs, tools, templates, and resource libraries.
- High purchase-intent pages already exist and are separate from broad informational pages.
- The public/app boundary is understandable but tightly coupled in `App.tsx`.

### Uncertainties Requiring Later Control

- Real production behavior for static SEO files under the Vercel rewrite should be browser-verified.
- Actual traffic, search impressions, backlinks, conversion paths, and page value should be checked before deciding moves/merges/redirects.
- Whether `/api/leads` should be considered a public surface, private admin tool, or deployment artifact needs a separate access/security review.
- Organization logo/report branding needs a separate product/code verification before brand decisions.
- No decision has been made here about deleting, merging, redirecting, or changing URL structure.

## Decisions This Inventory Enables

This inventory makes the following later decisions possible, but does not make them:

1. Which current pages should become future startsida, ämnesnav, faktasida, high-intent page, resource page, or tool page.
2. Which SEO clusters should become first-class topic hubs.
3. Which overlapping pages should be kept separate, merged, expanded, or redirected.
4. Whether React public pages should move to server-rendered/static web pages for stronger SEO metadata.
5. How to create one route/content registry for sitemap, canonical metadata, internal linking, and page inventory.
6. How to split `minegenkontroll.se` and `app.minegenkontroll.se` without breaking auth, inspector links, or existing URLs.
7. What belongs in a future `packages/brand` and which hardcoded paths should be replaced by brand tokens.
8. Whether the static `/seo` guide template should remain, be migrated, or be replaced by new page-type templates.
9. How the public-by-token inspector view should be classified in a future web/app split.
10. Whether `/api/leads` should remain in this deployment surface and how it should be protected and documented.

