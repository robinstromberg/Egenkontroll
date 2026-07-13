# Projektstatus – Min Egenkontroll

Detta dokument är projektets levande statusöversikt. Det kompletterar, men ersätter inte, den strategiska källan till sanning i `docs/strategy/PIVOT.md` eller beslut i `docs/strategy/PHASE_3_DECISIONS.md`.

Uppdatera dokumentet när en milestone avslutas, ett större beslut ändras eller nästa prioriterade issue byts. Håll det kort och länka till källdokument i stället för att duplicera hela strategin.

## Projektets mål

Min Egenkontroll ska utvecklas från en app för egenkontroll till **Sveriges bästa hjälp med egenkontroll** för små livsmedelsverksamheter.

Appen är kärnprodukten och den viktigaste intäktskällan. Den publika plattformen ska ge verklig hjälp genom kunskap, mallar, checklistor och verktyg, och sedan visa appen som ett naturligt nästa steg.

Grundprincip:

> Hjälp först → bygg förtroende → låt användaren prova värdet → visa sedan att samma arbete kan göras ännu enklare i appen.

## Aktuell milestone

**Milestone 1 – Ny publik webbplats, första kompletta minisystemet**

Målet är att bygga en sammanhängande publik grund med:

1. startsida,
2. ämnesnav,
3. faktasidor,
4. mall eller checklista,
5. verktyg eller generator,
6. resursbibliotek,
7. sömlös väg till inloggning och signup.

Första ämnesklustret är **HACCP och riskstyrning för små livsmedelsverksamheter**.

## Vad som är klart

- Strategiomläggningen är dokumenterad i `docs/strategy/PIVOT.md`.
- Befintliga publika sidor, SEO, brandytor och webb/app-gränser är inventerade.
- En migrationskarta för befintligt innehåll finns i `docs/strategy/CONTENT_MIGRATION_MAP.md`.
- Fas 3-besluten är låsta i `docs/strategy/PHASE_3_DECISIONS.md`.
- Publika sidtyper och pilotens wireframes är dokumenterade.
- Startsidesresearch och visuell riktning är dokumenterade.
- En liten produktionsklar designsystemkärna är mergad till `main`:
  - semantiska design tokens,
  - återanvändbara UI-primitiver,
  - dokumentation och utvecklingsshowcase,
  - en låg-risk-migrering av `OnlineOnlyBanner`.

## Vad som återstår i aktuell milestone

- Slutföra och merga den nya produktionsstartsidan efter slutlig preview- och PR-kontroll.
- Bygga HACCP-ämnesnavet.
- Bygga de första faktasidorna för faroanalys, avvikelser och verifiering.
- Bygga första användbara mall-/checklisteresursen.
- Bygga första verktygs-/generatorkandidaten.
- Bygga eller anpassa resursbiblioteket.
- Säkerställa en sömlös inloggnings- och signup-upplevelse från den publika plattformen.

## Senaste större beslut

- Positionering: **Sveriges bästa hjälp med egenkontroll**.
- Plattformslöfte: **Allt du behöver för att förstå, göra och dokumentera egenkontroll.**
- Publik struktur: kunskap, mallar och checklistor, verktyg, utbildning, referenser och appen.
- Startsidan är ett lugnt och tydligt nav som visar appen med självförtroende och hjälper besökaren vidare; den ska inte vara en informationsdump eller en lång säljsida.
- Samma varumärke och designsystem används överallt, men varje sidtyp ska ha en wireframe anpassad till besökarens avsikt.
- Appens kommersiella väg ska vara naturlig och relevant, inte aggressiv.
- Visuell riktning: varmvit, svart och grafit som bas; hög kontrast; färg främst för funktionell status; light och dark med semantiska tokens.
- Tekniskt mål på sikt: ett repo med `apps/web`, `apps/app` och `packages/brand`. Det är ännu inte den nuvarande strukturen.
- Kritiska buggar och viktig produktutveckling i appen fortsätter parallellt i separata issues, branches och PR:er.

## Nästa prioriterade GitHub-issue

**Issue #265 – ny produktionsstartsida**

Branchen `codex/issue-265-production-homepage` innehåller den implementerade startsidan. Nästa steg är slutlig preview- och PR-granskning, därefter merge om kontrollerna är godkända.

Efter merge ska nästa implementationissue avse **HACCP-ämnesnavet** enligt den låsta pilotplanen.

## Källor för beslut och status

- `AGENTS.md`
- `docs/strategy/PIVOT.md`
- `docs/strategy/CURRENT_STATE_INVENTORY.md`
- `docs/strategy/CONTENT_MIGRATION_MAP.md`
- `docs/strategy/PHASE_3_DECISIONS.md`
- `docs/strategy/PUBLIC_PILOT_WIREFRAMES.md`
- `docs/strategy/HOMEPAGE_RESEARCH_AND_DIRECTION.md`
- `docs/DESIGN_SYSTEM_CORE.md`
