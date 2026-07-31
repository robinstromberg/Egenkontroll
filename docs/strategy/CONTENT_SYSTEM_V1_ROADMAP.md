# Innehållssystem v1 – permanent roadmapplan

Status: **Beslutad genomförandeordning**

Parent: **#384 – Implementera permanent innehålls-, SEO- och granskningssystem**

Strategisk fas: **Fas 6B**, före fortsatt innehållsmigration i #315

## Syfte och normativ grund

Den här planen avgränsar ordningen för Innehållssystem v1. Den ersätter inte
den normativa specifikationen i
[`docs/content-governance-system.md`](../content-governance-system.md), som
styr modell, risk, publiceringsgrindar, automation och granskningskrav.

Den tekniska read-only-inventeringen och den föreslagna uppdelningen finns i
#384. Fortsatt #315-migration börjar inte förrän v1:s Definition of Done är
uppfylld.

## Låst v1-scope

1. Governance-kontrakt v2 för artiklar, claims, källor, scope, risk, SEO-roll
   och godkännande.
2. Register för alla nuvarande indexerbara routes och en uttrycklig
   legacybaseline.
3. Full governance för grundförutsättningar, lokaler och utrustning samt
   faroanalys.
4. Publiceringsgrind för nya indexerbara innehållssidor.
5. Avgränsad källhämtning, normalisering, versionshistorik och riktad
   impactanalys.
6. Privat isolerad lagring för snapshots, diffar och körningshistorik.
7. Daglig driftkontroll, retries, hälsostatus, strukturerad GitHub-kö med
   dubblettskydd och riktad AI-granskning med kostnadstak/fail-closed.
8. Tester, dokumentation, dry-run och manuell end-to-end-verifiering.

Utanför v1 ligger bland annat separat dashboard, eget CMS, generell
AI-generering, automatisk publicering eller merge samt funktioner utan direkt
koppling till Definition of Done.

## Sekventiell genomförandeordning

1. Etablera governance-kontrakt v2 och deterministiska fixtures.
2. Registrera route-täckning och legacybaseline; därefter governance för de gula
   pilotsidorna och den röda faroanalysen.
3. Inför publiceringsgrinden innan ny indexerbar innehållsexpansion.
4. Bygg deterministisk källhämtning, normalisering, diff och riktad impactanalys.
5. Verifiera manuell Actions-dry-run utan persistens.
6. Lägg till privat isolerad persistens med snäv autentisering, följt av drift,
   retries, hälsa och deduplicerad GitHub-kö.
7. Lägg till oberoende AI-granskning först efter materiell deterministisk diff,
   med schemasvar, budget och fail-closed.
8. Slutför dokumentation, CI, dry-run och manuell end-to-end-verifiering.

Varje steg ska vara ett separat child issue under #384. Nya idéer får bara
läggas till aktivt scope om de behövs för v1:s Definition of Done; övriga
dokumenteras för senare arbete.

## Fasens slutpunkt

Fas 6B kan avslutas först när följande är verifierat:

- samtliga indexerbara routes har en av statusarna `full`, `transitional`,
  `legacy-inventory` eller `seo-only`;
- nya indexerbara innehållssidor inte kan kringgå full governance;
- pilotsidorna är claim- och källspårade samt godkända enligt risk;
- ändrade registrerade källor kan upptäckas, versionslagras och kopplas till
  berörda claims och artiklar;
- materiella ändringar kan generera ett sanerat GitHub-fynd efter oberoende
  AI-granskning;
- driftfel, missade körningar och degraderad AI-status är synliga;
- ingen materiell innehållsändring publiceras eller mergas automatiskt; och
- Robin har godkänt att systemet kan lämnas i normal drift.

När dessa villkor är uppfyllda fortsätter #315 i sina befintliga, avgränsade
migrationsbatcher. #354 förblir en senare webbuppföljning och #364 är ett
separat data-/produktspår.
