# Content Migration Map

Issue: #247
Date: 2026-07-10
Builds on: #243, #245, PR #246, `docs/strategy/PIVOT.md`, and `docs/strategy/CURRENT_STATE_INVENTORY.md`

This document turns the current-state inventory into a practical migration map. It does not remove, merge, redirect, rewrite, redesign, or rebuild any page.

The default recommendation is to preserve existing URLs until there is clear traffic, Search Console, backlink, conversion, or product evidence for changing them.

## Guiding Principle

The migration should follow the pivot principle:

**Hjalp forst -> bygg fortroende -> lat anvandaren prova vardet -> visa sedan att samma arbete kan goras annu enklare i appen.**

This means:

- informational pages should answer the user's question before showing the app,
- resource pages should deliver the promised template, checklist, or tool before asking for anything,
- high-intent pages may show the app clearly,
- URL, merge, and redirect decisions should wait for evidence when there is any meaningful SEO risk.

## 1. Page-By-Page Migration Map

### React Public Pages And Public App Entrances

| Current URL | Current role / purpose | Future page type | Recommended action | App visibility | Dependencies or risks |
| --- | --- | --- | --- | --- | --- |
| `/` | Product homepage and prelaunch signup path. | Startsida | Behall URL och migrera till ny startsidemall. | Tydlig | Must explain platform breadth, not only app. Depends on future visual direction and web/app split. |
| `/kunskapsbank` | Directory for guides grouped by subject. | Resursbibliotek | Behall URL och bygg ut till real resursbibliotek with filtering and links to navs. | Mattlig | Currently also behaves like a topic hub. Avoid turning it into a sales page. |
| `/digital-egenkontroll-livsmedel` | Explains digital egenkontroll and product value. | Sida med hog kopavsikt | Behall som hog-intent-sida and improve product/value narrative later. | Tydlig | Should keep commercial focus but link back to helpful resources. |
| `/egenkontroll-restaurang` | Product/value page for restaurants. | Sida med hog kopavsikt | Behall som hog-intent-sida. | Tydlig | Good candidate for industry-specific solution page; needs future conversion data. |
| `/egenkontroll-cafe` | Product/value page for cafe and bakery. | Sida med hog kopavsikt | Behall som hog-intent-sida. | Tydlig | Good candidate for industry-specific solution page; needs future conversion data. |
| `/dokumentation-egenkontroll-livsmedel` | Explains documentation and journaling. | Faktasida / artikel | Behall URL och migrera to factual article template. | Diskret | Related to product value, but primary intent is information. |
| `/sparbarhet-livsmedel` | Explains food traceability and links to traceability cluster. | Amnesnav or strong huvudartikel | Bygg ut till amnesnav or strong head article; keep URL. | Mattlig | Overlaps traceability static pages. Do not merge without search/backlink data. |
| `/haccp-sma-livsmedelsforetag` | Explains HACCP for small businesses. | Amnesnav or strong huvudartikel | Bygg ut to HACCP hub or strong head article; keep URL. | Mattlig | Overlaps HACCP/risk pages. Good pilot candidate. |
| `/faroanalys-livsmedel` | Explains hazard analysis. | Faktasida / artikel; possible tool candidate | Behall URL och forbattras as article; evaluate embedded or child generator later. | Diskret | Tool/generator decision needs UX and product scope. |
| `/avvikelser-korrigerande-atgarder-livsmedel` | Explains deviations and corrective actions. | Faktasida / artikel | Behall URL och migrera to factual article template. | Diskret | App is relevant as next step, not main page purpose. |
| `/verifiering-egenkontroll-livsmedel` | Explains verification. | Faktasida / artikel | Behall URL och migrera to factual article template. | Diskret | Part of HACCP/risk cluster. |
| `/spara-sparbarhetsuppgifter-livsmedel` | Explains retention of traceability data. | Faktasida / artikel | Behall URL och forbattras. Candidate merge only after data. | Diskret | Overlaps `/sparbarhet-livsmedel` and static traceability pages. |
| `/login` | Login / magic-link entry. | Inloggning | Behall utanfor innehallsmigrationen. Future target may be `app.minegenkontroll.se/login`. | Tydlig | Auth/session risk. Robots currently disallow. Requires separate web/app split decision. |
| `/signup` | Account creation / prelaunch entry. | Signup | Behall utanfor innehallsmigrationen. Future target may be `app.minegenkontroll.se/signup`. | Tydlig | Auth/session and conversion risk. Robots currently disallow. |
| `/integritetspolicy` | Privacy/legal information. | Legal / stodjande sida | Behall utanfor content migration, but include in future legal page model. | Diskret | Not in sitemap today. Legal text should not be casually rewritten. |
| `/anvandarvillkor` | Terms. | Legal / stodjande sida | Behall utanfor content migration, but include in future legal page model. | Diskret | Not in sitemap today. Legal text should not be casually rewritten. |
| `/#inspector=<key>` | Public-by-token inspection/share view. | Delat appflode / ej SEO-sida | Behall utanfor innehallsmigrationen. | Tydlig within flow | High-risk shared app flow. Must not be treated as SEO content. |

### Static SEO Pages

| Current URL | Current role / purpose | Future page type | Recommended action | App visibility | Dependencies or risks |
| --- | --- | --- | --- | --- | --- |
| `/seo/kallor-och-faktagranskning.html` | Source and fact-checking explanation. | Legal / stodjande sida or Faktasida / artikel | Behall URL och forbattras as trust/editorial support page. | Diskret | Could support E-E-A-T. Do not bury if it has trust value. |
| `/seo/kritiska-gransvarden.html` | Critical limits in HACCP. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Strong HACCP support page. |
| `/seo/kontrollplan.html` | Control plan basics. | Mall / checklista / resurs candidate | Kandidat for framtida mall/checklista; keep URL while deciding format. | Mattlig | Good resource candidate. Needs template/checklist UX decision. |
| `/seo/hygien-och-daglig-drift.html` | Hygiene and daily routines overview. | Amnesnav | Bygg ut till amnesnav. | Mattlig | Current thin hub; keep URL and expand before adding many children. |
| `/seo/personlig-hygien-livsmedel.html` | Personal hygiene. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Belongs under hygiene nav. |
| `/seo/rengoring-livsmedelsverksamhet.html` | Cleaning routines. | Faktasida / artikel; checklist candidate | Behall URL och forbattras; candidate for checklist/resource. | Mattlig | Good operational checklist candidate. |
| `/seo/skadedjur-livsmedelsverksamhet.html` | Pest prevention. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Belongs under hygiene or prerequisites nav. |
| `/seo/temperaturkontroll-livsmedel.html` | Temperature control overview. | Faktasida / artikel or strong huvudartikel | Behall URL och improve as head article for temperature cluster. | Mattlig | Overlaps temperature process hub; decide hierarchy later with data. |
| `/seo/allergeninformation-restaurang.html` | Allergen information for restaurants/cafes. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Could later link to checklist/resource. |
| `/seo/hantering-och-forvaring-livsmedel.html` | Handling and storage overview. | Amnesnav | Bygg ut till amnesnav. | Mattlig | Current thin hub; likely strong IA node. |
| `/seo/varumottagning-livsmedel.html` | Receiving goods. | Faktasida / artikel; checklist candidate | Behall URL och forbattras; candidate for receiving checklist. | Mattlig | Good resource/app bridge. |
| `/seo/korskontamination-livsmedel.html` | Cross-contamination. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Belongs under handling/storage. |
| `/seo/separera-raa-och-atfardiga-livsmedel.html` | Separate raw and ready-to-eat foods. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Related to cross-contamination; merge only with data. |
| `/seo/kemikalier-i-livsmedelsverksamhet.html` | Chemicals in food business. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Operational/compliance page. |
| `/seo/allergenkontamination-livsmedel.html` | Allergen contamination. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Related to allergen information; merge only with data. |
| `/seo/grundforutsattningar-livsmedel.html` | Prerequisites overview. | Amnesnav | Bygg ut till amnesnav. | Mattlig | Broad cluster; avoid making it too generic. |
| `/seo/lokaler-och-utrustning-livsmedel.html` | Premises and equipment. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Belongs under prerequisites. |
| `/seo/materialval-livsmedelslokal.html` | Material choices in food premises. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Specific compliance topic. |
| `/seo/underhall-livsmedelslokal.html` | Maintenance. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Could later connect to checklist. |
| `/seo/toalett-och-handfat-livsmedelsverksamhet.html` | Toilet and sink requirements. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Specific compliance topic. |
| `/seo/ventilation-livsmedelsverksamhet.html` | Ventilation. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Specific compliance topic. |
| `/seo/avfall-livsmedelsverksamhet.html` | Waste handling. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Related to waste-room page; merge only with data. |
| `/seo/soprum-och-avfallsutrymme-livsmedel.html` | Waste room / waste space. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Related to waste handling; merge only with data. |
| `/seo/transport-av-livsmedel.html` | Food transport. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Could belong under handling/storage or prerequisites. |
| `/seo/utbildning-livsmedelshygien-personal.html` | Staff hygiene training. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Could later connect to checklist/resource. |
| `/seo/vatten-i-livsmedelsverksamhet.html` | Water in food businesses. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Specific compliance topic. |
| `/seo/is-i-livsmedelsverksamhet.html` | Ice hygiene. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Related to water/hygiene; merge only with data. |
| `/seo/temperaturprocesser-livsmedel.html` | Temperature processes overview. | Amnesnav | Bygg ut till amnesnav. | Mattlig | Needs relationship decision with `/seo/temperaturkontroll-livsmedel.html`. |
| `/seo/kylforvaring-livsmedel.html` | Cold storage. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Temperature cluster. |
| `/seo/upptining-livsmedel.html` | Thawing. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Temperature cluster. |
| `/seo/varmhallning-mat-temperatur.html` | Hot holding. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Temperature cluster. |
| `/seo/nedkylning-mat-livsmedel.html` | Cooling food. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Temperature cluster; strong operational value. |
| `/seo/ateruppvarmning-mat.html` | Reheating food. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Temperature cluster. |
| `/seo/datummarkning-livsmedel.html` | Date marking overview. | Amnesnav | Bygg ut till amnesnav. | Mattlig | Strong cluster already exists. |
| `/seo/bast-fore-eller-sista-forbrukningsdag.html` | Best before vs use by. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Strong informational query. |
| `/seo/salja-mat-efter-bast-fore.html` | Selling after best before. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Compliance/operational topic. |
| `/seo/mat-efter-sista-forbrukningsdag.html` | After use-by date. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Compliance topic; should answer quickly. |
| `/seo/bestamma-hallbarhetsdatum-livsmedel.html` | Setting durability dates. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Could later connect to tool/resource. |
| `/seo/frysa-in-kylvaror-fore-utgangsdatum.html` | Freezing chilled goods near expiry. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Specific operational query. |
| `/seo/information-och-markning-livsmedel.html` | Information and labelling overview. | Amnesnav | Bygg ut till amnesnav. | Mattlig | Large cluster; strong candidate for proper nav. |
| `/seo/ansvar-livsmedelsinformation.html` | Responsibility for food information. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Labelling cluster. |
| `/seo/vilseledande-livsmedelsinformation.html` | Misleading food information. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Labelling cluster. |
| `/seo/fardigforpackade-livsmedel-markning.html` | Prepacked food definition. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Labelling cluster. |
| `/seo/obligatorisk-markning-livsmedel.html` | Mandatory labelling overview. | Faktasida / artikel or strong huvudartikel | Behall URL och improve as major article. | Diskret | Could become head article under labelling nav. |
| `/seo/ingrediensforteckning-livsmedel.html` | Ingredient list. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Labelling cluster. |
| `/seo/livsmedlets-beteckning.html` | Food name / designation. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Labelling cluster. |
| `/seo/forvaringsanvisning-livsmedel.html` | Storage instructions. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Labelling cluster; also related to storage. |
| `/seo/marka-om-fardigforpackade-livsmedel.html` | Relabelling prepacked foods. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Labelling cluster. |
| `/seo/oforpackade-livsmedel-information.html` | Non-prepacked food information. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Labelling cluster. |
| `/seo/obligatorisk-information-oforpackad-mat.html` | Mandatory info for non-prepacked food. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Related to non-prepacked page; merge only with data. |
| `/seo/distansforsaljning-oforpackad-mat.html` | Distance selling of non-prepacked food. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Specific compliance topic. |
| `/seo/intern-sparbarhet-livsmedel.html` | Internal traceability. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Traceability cluster; app can be relevant after answer. |
| `/seo/partimarkning-livsmedel.html` | Lot marking. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Traceability cluster. |
| `/seo/aterkalla-livsmedel-sparbarhet.html` | Recall and traceability. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Strong operational importance. |
| `/seo/mangdbalans-sparbarhet-livsmedel.html` | Mass balance / quantitative traceability. | Faktasida / artikel | Behall URL och migrera to article template. | Diskret | Traceability cluster. |

### Other Public Or Public-Adjacent Surfaces

These are not content migration targets.

| Surface | Future classification | Recommended action | App visibility | Dependencies or risks |
| --- | --- | --- | --- | --- |
| `/api/leads/index.html` and related static files | Supporting/private admin surface, not SEO content | Behall utanfor innehallsmigrationen. Separate access/security review if needed. | Not applicable | Public reachability was not runtime-verified in #245. |
| `/api/shared-attachment-url` | Supporting API | Behall utanfor innehallsmigrationen. | Not applicable | Shared attachment security and token handling are protected app concerns. |
| `/api/send-inspector-report` | Supporting API | Behall utanfor innehallsmigrationen. | Not applicable | Inspector/report flow is app-adjacent and should not be changed in content migration. |
| `/api/client-error` | Supporting API | Behall utanfor innehallsmigrationen. | Not applicable | Operational endpoint, not content. |

## 2. Recommended Topic Hubs And Clusters

This first structure reuses existing content. It should guide wireframes and IA before any large rewrite.

### Egenkontroll I Vardagen

- Visitor intent: understand what egenkontroll is, why it matters, and how to start practically.
- Current pages: `/`, `/digital-egenkontroll-livsmedel`, `/dokumentation-egenkontroll-livsmedel`, `/seo/kontrollplan.html`.
- Strong head articles: `/dokumentation-egenkontroll-livsmedel`, `/seo/kontrollplan.html`.
- Gaps: beginner overview for "vad ar egenkontroll", printable starter checklist, simple responsibility map for small teams.

### HACCP Och Riskstyrning

- Visitor intent: understand HACCP, hazard analysis, limits, deviations, and verification.
- Current pages: `/haccp-sma-livsmedelsforetag`, `/faroanalys-livsmedel`, `/avvikelser-korrigerande-atgarder-livsmedel`, `/verifiering-egenkontroll-livsmedel`, `/seo/kritiska-gransvarden.html`, `/seo/kontrollplan.html`.
- Strong head articles: `/haccp-sma-livsmedelsforetag`, `/faroanalys-livsmedel`.
- Gaps: HACCP step-by-step hub, simple hazard-analysis worksheet, critical-limit examples, generator for first draft hazard analysis.

### Hygien Och Daglig Drift

- Visitor intent: solve daily operational hygiene questions and routines.
- Current pages: `/seo/hygien-och-daglig-drift.html`, `/seo/personlig-hygien-livsmedel.html`, `/seo/rengoring-livsmedelsverksamhet.html`, `/seo/skadedjur-livsmedelsverksamhet.html`, `/seo/allergeninformation-restaurang.html`, `/seo/utbildning-livsmedelshygien-personal.html`.
- Strong head articles: `/seo/hygien-och-daglig-drift.html`, `/seo/rengoring-livsmedelsverksamhet.html`.
- Gaps: daily hygiene checklist, cleaning schedule template, staff hygiene onboarding resource.

### Hantering Och Forvaring

- Visitor intent: handle, receive, store, and separate food safely.
- Current pages: `/seo/hantering-och-forvaring-livsmedel.html`, `/seo/varumottagning-livsmedel.html`, `/seo/korskontamination-livsmedel.html`, `/seo/separera-raa-och-atfardiga-livsmedel.html`, `/seo/kemikalier-i-livsmedelsverksamhet.html`, `/seo/allergenkontamination-livsmedel.html`, `/seo/transport-av-livsmedel.html`.
- Strong head articles: `/seo/hantering-och-forvaring-livsmedel.html`, `/seo/varumottagning-livsmedel.html`.
- Gaps: receiving checklist, storage-zone checklist, cross-contamination quick guide.

### Grundforutsattningar

- Visitor intent: understand premises, equipment, water, waste, ventilation, and maintenance requirements.
- Current pages: `/seo/grundforutsattningar-livsmedel.html`, `/seo/lokaler-och-utrustning-livsmedel.html`, `/seo/materialval-livsmedelslokal.html`, `/seo/underhall-livsmedelslokal.html`, `/seo/toalett-och-handfat-livsmedelsverksamhet.html`, `/seo/ventilation-livsmedelsverksamhet.html`, `/seo/avfall-livsmedelsverksamhet.html`, `/seo/soprum-och-avfallsutrymme-livsmedel.html`, `/seo/vatten-i-livsmedelsverksamhet.html`, `/seo/is-i-livsmedelsverksamhet.html`.
- Strong head articles: `/seo/grundforutsattningar-livsmedel.html`, `/seo/lokaler-och-utrustning-livsmedel.html`.
- Gaps: premises self-check checklist, maintenance plan template, waste-handling checklist.

### Temperatur

- Visitor intent: understand temperature control and specific temperature processes.
- Current pages: `/seo/temperaturkontroll-livsmedel.html`, `/seo/temperaturprocesser-livsmedel.html`, `/seo/kylforvaring-livsmedel.html`, `/seo/upptining-livsmedel.html`, `/seo/varmhallning-mat-temperatur.html`, `/seo/nedkylning-mat-livsmedel.html`, `/seo/ateruppvarmning-mat.html`.
- Strong head articles: `/seo/temperaturkontroll-livsmedel.html`, `/seo/temperaturprocesser-livsmedel.html`.
- Gaps: temperature log template, cooling-time calculator/generator candidate, control-frequency guide.

### Datummarkning Och Hallbarhet

- Visitor intent: understand durability dates, what may be sold, and how to decide dates.
- Current pages: `/seo/datummarkning-livsmedel.html`, `/seo/bast-fore-eller-sista-forbrukningsdag.html`, `/seo/salja-mat-efter-bast-fore.html`, `/seo/mat-efter-sista-forbrukningsdag.html`, `/seo/bestamma-hallbarhetsdatum-livsmedel.html`, `/seo/frysa-in-kylvaror-fore-utgangsdatum.html`.
- Strong head articles: `/seo/datummarkning-livsmedel.html`, `/seo/bast-fore-eller-sista-forbrukningsdag.html`.
- Gaps: date-marking decision tree, durability-date worksheet, printable date-labelling checklist.

### Information Och Markning

- Visitor intent: understand food information and labelling obligations.
- Current pages: `/seo/information-och-markning-livsmedel.html`, `/seo/ansvar-livsmedelsinformation.html`, `/seo/vilseledande-livsmedelsinformation.html`, `/seo/fardigforpackade-livsmedel-markning.html`, `/seo/obligatorisk-markning-livsmedel.html`, `/seo/ingrediensforteckning-livsmedel.html`, `/seo/livsmedlets-beteckning.html`, `/seo/forvaringsanvisning-livsmedel.html`, `/seo/marka-om-fardigforpackade-livsmedel.html`, `/seo/oforpackade-livsmedel-information.html`, `/seo/obligatorisk-information-oforpackad-mat.html`, `/seo/distansforsaljning-oforpackad-mat.html`.
- Strong head articles: `/seo/information-och-markning-livsmedel.html`, `/seo/obligatorisk-markning-livsmedel.html`.
- Gaps: labelling checklist, non-prepacked information checklist, simple label review tool.

### Sparbarhet

- Visitor intent: understand what traceability information to save, how to identify batches, and what to do during recall.
- Current pages: `/sparbarhet-livsmedel`, `/spara-sparbarhetsuppgifter-livsmedel`, `/seo/intern-sparbarhet-livsmedel.html`, `/seo/partimarkning-livsmedel.html`, `/seo/aterkalla-livsmedel-sparbarhet.html`, `/seo/mangdbalans-sparbarhet-livsmedel.html`.
- Strong head articles: `/sparbarhet-livsmedel`, `/seo/intern-sparbarhet-livsmedel.html`.
- Gaps: traceability record template, recall checklist, batch/lot marking examples, mass-balance worksheet.

## 3. Commercial Restraint By Page Type

| Future page type | Recommended app visibility | Rationale |
| --- | --- | --- |
| Startsida | Tydlig | The visitor is evaluating the whole offer, so the app can be clear while still leading to knowledge and resources. |
| Amnesnav | Mattlig | The visitor is orienting within a topic. The app should be present as a relevant next step, not the main content. |
| Faktasida / artikel | Diskret | The visitor wants an answer. App promotion should come after the answer and be tied to the page's practical problem. |
| Sida med hog kopavsikt | Tydlig | The visitor is already solution-aware, so app value, signup, and proof can be prominent. |
| Mall / checklista / nedladdningsbar resurs | Mattlig | The resource must be usable first. App value can be shown as the easier ongoing workflow after the resource. |
| Verktyg / generator | Mattlig | The tool and result come first. The app can be offered after the result when it helps save or repeat the work. |
| Resursbibliotek | Mattlig | The visitor is browsing for help. App visibility should support discovery without blocking resources. |
| Inloggning | Tydlig | The page is already an app entry flow and should be frictionless. |
| Signup | Tydlig | The page is already a conversion flow and should be frictionless. |
| Legal / stodjande sida | Diskret | The visitor needs trust/compliance information. Commercial content should stay minimal. |
| Delat appflode / ej SEO-sida | Tydlig within flow | The user is inside an app-supported workflow. Do not treat as public content or SEO. |

## 4. First Complete Minisystem

The first pilot should test the full strategy on a narrow but commercially relevant area with existing content and clear product adjacency. The recommended pilot is **HACCP och riskstyrning for small food businesses**.

| Required part | Recommended URL / asset | Why this is a good pilot |
| --- | --- | --- |
| 1 startsida | `/` | Tests the new platform promise and routes users toward knowledge, resources, and app without making the app the only path. |
| 1 amnesnav | `/haccp-sma-livsmedelsforetag` | Already strong and broad enough to become a HACCP/risk hub. High relevance to the product. |
| 2-3 faktasidor | `/faroanalys-livsmedel`, `/avvikelser-korrigerande-atgarder-livsmedel`, `/verifiering-egenkontroll-livsmedel` | Together they cover understand -> assess risk -> document deviation -> verify control. |
| 1 mall/checklista candidate | `/seo/kontrollplan.html` | A control plan naturally becomes a practical worksheet/checklist and connects directly to app workflows. |
| 1 tool/generator candidate | `/faroanalys-livsmedel` | Hazard analysis can support a future guided generator for a first draft or structured worksheet. |
| Resursbibliotek | `/kunskapsbank` | Tests whether the library can expose the pilot hub, articles, resource, and tool candidate clearly. |
| Login/signup flow | `/login`, `/signup` | Tests a natural transition from public help to app entry without changing auth in this issue. |

Pilot boundaries:

- Keep current URLs.
- Do not redirect or remove overlapping pages.
- Do not introduce a new tool URL until the wireframe/product decision is made.
- Use the pilot to validate page-type wireframes, app visibility, internal linking, and metadata approach before scaling.

## 5. Decisions

### Can Be Decided Now From Repo And Strategy

- Existing public URLs should be preserved as the default migration rule.
- `/` should remain the public startsida.
- `/kunskapsbank` should become the resource library rather than a purely commercial page.
- High-intent pages are `/digital-egenkontroll-livsmedel`, `/egenkontroll-restaurang`, and `/egenkontroll-cafe`.
- Most current static SEO pages should remain fact/article pages and receive better article templates later.
- Current thin hub-like pages are better treated as future amnesnav than as pages to remove.
- App visibility should be lower on factual pages than on high-intent and auth pages.
- `/login`, `/signup`, legal pages, inspector links, and API surfaces should stay outside content migration.
- The first minisystem should use an existing topic cluster before broad page migration.

### Requires Data Or User Decision First

- Any redirect, deletion, or permanent merge of existing URLs.
- Whether `/sparbarhet-livsmedel` or `/haccp-sma-livsmedelsforetag` should be final hub URLs or head articles.
- Whether `/seo/temperaturkontroll-livsmedel.html` or `/seo/temperaturprocesser-livsmedel.html` should lead the temperature cluster.
- Which overlapping traceability, allergen, waste, and non-prepacked-information pages should remain separate.
- Search Console impressions, clicks, queries, indexed status, and cannibalization signals.
- Organic traffic, backlinks, assisted conversions, signup paths, and paid/customer value by page.
- Final visual direction and design-system decisions for each page type.
- Whether public web and app should move to `minegenkontroll.se` and `app.minegenkontroll.se` in one step or staged releases.
- Whether future tools/generators get dedicated URLs, embedded sections, or both.
- Whether `/api/leads` should remain in the deployed public surface.

## Next-Step Use

Use this map to guide the next phase only after reading the strategic context and the current-state inventory. The next safe work product is likely page-type wireframes or an implementation-neutral IA decision document, not content rewrites or route changes.
