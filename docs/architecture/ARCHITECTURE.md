# ARCHITECTURE - Min Egenkontroll

Detta dokument beskriver den faktiska arkitekturen i repot på en nivå som hjälper framtida implementationer. Det är inte en komplett databasreferens och ska inte ersätta migrationer, RLS-tester eller kodläsning inför riskfyllda ändringar.

## Stack

- Frontend: React, TypeScript och Vite.
- Styling: komponentnära CSS-filer och globala stilar i `src/styles/global.css`.
- Backend/data: Supabase Auth, Postgres, RLS, RPC och Storage.
- Hosting/API: Vercel med serverless API-filer under `api/`.
- PWA: manifest/service worker finns i projektet, men appen är i praktiken online-only för sparning.

## Appens start och routing

`src/main.tsx` bootstrappas React-appen och omsluter den med `ErrorBoundary`.

`src/App.tsx` är huvudroten för sessions-, auth- och routinglogik:

- läser Supabase-session och lyssnar på `onAuthStateChange`,
- hanterar publika paths som `/`, `/login`, `/signup`, `/integritetspolicy` och `/anvandarvillkor`,
- läser hash-parametrar för appvyer, menyvyer, kontrolltyp, inbjudan och inspektörslänk,
- visar `PublicLandingPage` för oinloggade startsidan,
- visar `AuthPanel`, lösenordsflöde eller inbjudningsflöde när det behövs,
- säkerställer profil och organisationskontext före appen öppnas,
- visar `OrganizationSetup` om användaren saknar organisation,
- visar `AppDashboard` när användaren har aktiv organisation.

Den inloggade navigationen bygger på hash-state och appens huvudvyer:

- `today`
- `history`
- `kpi`
- `sharing`
- `menu`

## Auth, organisation och roller

Supabase Auth används för inloggning. Appen kompletterar Auth-användaren med:

- `profiles`,
- `organizations`,
- `organization_memberships`,
- `organization_invitations`.

`src/services/organizationService.ts` ansvarar för att säkerställa profil, lista organisationskontexter, skapa första organisationen, hantera medlemmar och inbjudningar. Roller representeras som `owner`, `admin` och `staff`. Administrativa ytor begränsas i UI med bland annat `canManageOrganization`, men säkerheten ska alltid ligga i Supabase RLS och policies.

Aktiv organisation sparas lokalt i browsern med nyckeln `egenkontroll:active-organization-id`.

## Inloggat appskal

`src/components/AppDashboard.tsx` är skalet för inloggat läge. Det:

- väljer aktiv vy,
- visar organisationsväxlare när användaren har flera organisationer,
- styr menyunderlägen som profil, organisation, användare, kontrolltyper, leverantörer och hjälp,
- öppnar kontrollformulär när användaren startar en kontroll,
- visar sparad kontrollvy efter lyckad sparning,
- skickar användaren tillbaka till Idag, Historik, KPI, Delning eller Meny.

Huvudvyerna är:

- `TodayDashboard` för dagens kontroller och öppna avvikelser,
- `HistoryView` för tidigare kontroller,
- `KpiView` för uppföljning,
- `SharingView` för inspektörs-/myndighetsdelning,
- `MenuView` och menyunderkomponenter för inställningar och administration.

## Kontrollflöde

Det dagliga dokumentationsflödet börjar i `TodayDashboard`:

1. appen hämtar dagens aktiva kontrolltyper via dashboard-service,
2. användaren startar en kontroll,
3. `AppDashboard` renderar `ControlRunFormWithPhotos`,
4. kontrollens definition hämtas från kontrolltyp, aktiva objekt och aktiva fält,
5. `ControlDefinitionCanvas` används för att visa och fylla kontrollen,
6. kontrollen sparas via service-lager,
7. användaren får en sparad sammanfattning och historiken kan visa kontrollen.

Det finns två sparvägar:

- `src/services/controlRunService.ts` för kontroller utan bilagor,
- `src/services/controlRunWithAttachmentsService.ts` för kontroller med bilder/filer.

Båda använder RPC-funktionen `save_control_run_transactional` för att spara kontrollkörning, rader, avvikelser och bilagemetadata i en databastransaktion. Själva Storage-uppladdningen sker före RPC-anropet och kan inte ingå i Postgres-transaktionen.

## Kontrolltyper och editor

Kontrolltyper administreras framför allt genom:

- `ControlTypesView`,
- `ControlTypeDetailView`,
- `AdminControls`,
- `src/services/controlAdminService.ts`.

Datamodellen skiljer på:

- kontrolltyp: exempelvis Kyltemperaturer, Städning, Spårbarhet,
- kontrollobjekt/kontrollpunkt: exempelvis Kyl 1 - Kök eller Toaletter,
- fältdefinition: vad som fylls i, exempelvis temperatur, text, datum, foto eller OK/Ej OK.

Editorn har arbetats mot en mer WYSIWYG-liknande modell där preview ska ligga nära dokumentationsflödet. Beslut och guardrails för den fortsatta editorn finns i `docs/CONTROL_TYPE_EDITOR_IMPLEMENTATION_BRIEF.md`.

## Service-lager

Frontend pratar med Supabase via service-filer under `src/services/`. Viktiga exempel:

- `organizationService.ts` för profiler, organisationer, medlemskap och inbjudningar,
- `dashboardService.ts` för dagens kontroller och öppna avvikelser,
- `controlRunService.ts` och `controlRunWithAttachmentsService.ts` för sparning,
- `attachmentService.ts` för komprimering, upload och signerade bilagelänkar,
- `historyService.ts` för historikdetaljer,
- `kpiService.ts` för uppföljning,
- `controlAdminService.ts` för kontrolltyper, fält och objekt,
- `shareRecords.ts` för delningslänkar, inspektörsdata och exportloggning,
- `productEventService.ts` för enkel, allowlistad produkttelemetri.

Service-lagret ska fortsätta vara platsen där Supabase-anrop samlas. Komponenter bör inte sprida nya databasanrop om det finns en naturlig service.

## Supabase-data

Den centrala datan är organisationsscopad. Verifierade tabell-/områdesnamn i kod och migrationer inkluderar:

- `profiles`,
- `organizations`,
- `organization_memberships`,
- `organization_invitations`,
- `control_templates`,
- `control_types`,
- `control_objects`,
- `control_field_definitions`,
- `control_runs`,
- `control_run_items`,
- `deviations`,
- `control_attachments`,
- `share_links`,
- `export_logs`,
- `product_events`.

RLS är en kärndel av arkitekturen. Barnrader som kontrollrader, avvikelser och bilagor ska verifieras mot rätt parent och `organization_id`. Senare migrationer har hårdnat dessa samband med preflight-kontroller och helper-funktioner. Ändra inte gamla migrationer; skapa alltid ny migration.

## Bilagor och Storage

Kontrollbilder och bilagor laddas upp till Supabase Storage-bucketen `control-attachments`. Sökvägen börjar med organisationens id:

`{organizationId}/{controlRunId}/{controlRunItemId}/{timestamp}-{safeFileName}`

Metadata sparas i databasen. Själva filerna omfattas inte av vanliga databasbackuper. Rutiner för backup och verifiering finns i:

- `docs/SUPABASE_STORAGE_BACKUP_RUNBOOK.md`,
- `docs/SUPABASE_BACKUP_RESTORE_RUNBOOK.md`,
- `docs/SUPABASE_OPERATIONS_RUNBOOK.md`.

## Delning, export och inspektörsvy

Delning skapas i `SharingView` via `shareRecords.ts`. Appen skapar ett rått delningstoken, sparar hash i `share_links` och bygger en länk med `#inspector=...`.

Inspektörsvyn läser data via RPC-funktioner som validerar token, giltighetstid och urval. Bilagor i delad vy hämtas via Vercel API-endpointen `api/shared-attachment-url.js`, som skapar signerade länkar utan att exponera service-secrets i frontend.

QR-koder genereras lokalt i frontend, inte via extern QR-tjänst.

## PWA och online-only

Appen har PWA-onboarding i `TodayDashboard` med bilder under `public/pwa-onboarding`. Den ska vara synlig för nya användare tills installation/hem-skärmshantering är löst eller snoozad enligt befintlig logik.

Sparning av kontroller är online-only. `useOnlineStatus` och `OnlineOnlyBanner` visar offline-status och kontrollformulären ska blockera sparning när nät saknas.

## Felspårning

Grundläggande klientfel fångas av `ErrorBoundary` och rapporteras via `src/lib/errorReporting.ts` till `api/client-error.js`. Serverless API:er ska logga med användbar men icke-känslig kontext. Tokens, delningslänkar, e-postinnehåll, service keys och formulärsvar ska inte loggas.

## Riskområden

Var extra försiktig med:

- Auth och recovery/magic-link-flöden.
- RLS och organisationsisolering.
- Kontrollsparning och RPC-signaturer.
- Bilagor: Storage-upload, metadata och signerade länkar.
- Historik, export och delning.
- Kontrolltypseditorn, eftersom ändringar kan påverka både admin och dokumentationsflöde.
- Mobil layout och nedernavigering.
- PWA-installation och online/offline-kommunikation.

När arkitekturen är osäker ska koden och migrationerna inventeras före implementation. Dokumentera osäkerheten istället för att fylla ut med antaganden.
