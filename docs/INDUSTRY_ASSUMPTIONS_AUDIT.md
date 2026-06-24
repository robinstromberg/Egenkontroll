# Kartläggning: food-/industry-antaganden

Kopplat issue: #136

Det här dokumentet är ett låg-risk-underlag för framtida branschagnostik. Det ändrar inte kod, databas eller UI-flöden.

Syftet är att göra det tydligt för framtida Codex-sessioner var appen idag är byggd med livsmedel som första aktiva bransch, och vad som bör lämnas orört tills en riktig branschutökning planeras.

## Sammanfattning

Appen är redan relativt väl positionerad för branschagnostik eftersom kontrollmotorn bygger på generiska begrepp:

- `control_types`
- `control_objects`
- `control_field_definitions`
- `control_runs`
- `control_run_items`
- `deviations`
- `attachments`
- `share_links`
- `exports`

Det som fortfarande är food-/livsmedelsspecifikt ligger främst i:

- organisationens typning (`industry: 'food'`),
- onboardingens verksamhetstyper,
- startmallarnas innehåll,
- vissa kategorier och fältetiketter,
- rapport-/delningsspråk som utgår från egenkontroll och inspektör.

Detta är okej för MVP. Det bör inte byggas om nu utan särskilt issue.

## Filer där food-/industry-antaganden finns

### `src/types/database.ts`

Nuvarande typning låser organisationens bransch till livsmedel:

```ts
industry: 'food';
business_type: 'restaurant' | 'cafe' | 'bakery' | 'kiosk' | 'foodtruck' | 'catering' | 'chilled_store' | null;
```

Bedömning:

- Helt rimligt för livsmedels-MVP.
- Bör göras mer generiskt först när backend för flera branscher faktiskt ska implementeras.
- Framtida riktning kan vara att introducera `Industry` och branschspecifika `BusinessType`-grupper, men det kräver databas-/typanalys.

### `src/components/OrganizationSetup.tsx`

Onboarding är tydligt livsmedelsbaserad:

- `businessTypes` innehåller restaurang, café, bageri, kiosk, foodtruck, catering och butik med kylda varor.
- `createFirstOrganization` anropas med `industry: 'food'`.
- UI visar `Bransch: Livsmedel`.
- Texterna beskriver livsmedelsverksamheter och startmallar för livsmedel.

Bedömning:

- Detta ska vara kvar i MVP.
- När fler branscher läggs till bör onboarding inte hårdkodas om direkt. Skapa först backendstöd för branschbaserade mallpaket.
- Framtida branschväljare ska vara ett separat issue.

### `src/services/organizationService.ts`

`BusinessType` härleds från `Organization['business_type']`.

`createFirstOrganization` tar:

```ts
businessProfile: { industry: Organization['industry']; businessType: BusinessType }
```

Bedömning:

- Tjänsten är delvis förberedd genom att `industry` skickas in som värde, men typen är fortfarande låst till `food` via `Organization`.
- Bra första steg vid branschagnostik är att göra typerna mer generiska utan att ändra onboarding.

### `src/services/templateService.ts`

Templateflödet är generiskt i struktur:

- `control_templates`
- `template_schema`
- `objects`
- `fields`
- `category`
- `default_frequency`
- kopiering till organisationens egna `control_types`, `control_objects` och `control_field_definitions`

Bedömning:

- Detta är en stark grund för branschbaserade mallpaket.
- Det som saknas för framtida branscher är troligen metadata på mallpaket, t.ex. `industry`, `locale`, `version` och eventuellt `template_pack`.
- Viktigt: mallar ska fortsätta kopieras till redigerbara kontrolltyper, inte vara låsta regler.

### `src/types/database.ts` – `ControlCategory`

Nuvarande kategorier:

```ts
temperature | checklist | receiving | traceability | round | custom
```

Bedömning:

- `temperature`, `checklist`, `round` och `custom` är ganska generiska.
- `receiving` och `traceability` är tydligt användbara för livsmedel men kan även vara relevanta i andra branscher.
- Byt inte dessa nu. Om framtida branscher kräver andra grupper bör man lägga till eller abstrahera försiktigt.

### `src/services/controlAdminService.ts`

Administrationen är i huvudsak generisk:

- skapar kontrolltyper,
- skapar kontrollfält,
- skapar kontrollobjekt,
- hanterar aktiv/inaktiv,
- använder generiska fälttyper.

Bedömning:

- Bra grund.
- Framtida branscher kan behöva fler fälttyper, exempelvis generellt mätvärde med enhet, duration, prioritet, deadline, ansvarig person, asset-/utrustningsmetadata och filbilagor utöver foto.
- Bygg inte dessa förrän en konkret bransch kräver det.

### `src/components/AdminControls.tsx`

Bör kontrolleras i framtida branschutökning eftersom den sannolikt styr skapande av kontrolltyp, kategori och frekvens.

Bedömning:

- Om den bara visar nuvarande kategorier är det okej för MVP.
- Vid ny bransch bör kategorier och mallar komma från branschpaket eller konfiguration, inte hårdkodas per UI-vy.

### `src/services/reportService.ts`

Rapporten använder relativt generiska rubriker:

- Tidpunkt
- Kontrolltyp
- Status
- Värden
- Avvikelse
- Åtgärd
- Bilagor

Bedömning:

- Bra för branschagnostik.
- Rapporttiteln `Egenkontroll - rapport` fungerar för livsmedel och många andra kontrollsammanhang.
- Framtida privatläge eller andra branscher kan behöva annan copy och annan mottagare än myndighet/inspektör, men rapportstrukturen är användbar.

### `src/services/shareRecords.ts`

Delningslogiken är tekniskt generisk:

- tidsbegränsad länk,
- period,
- kontrolltyper,
- exportloggar,
- delade kontrollrader.

Bedömning:

- Bra grund för både andra branscher och framtida självinspektion.
- UI-copy kan behöva ändras per workspace-typ, men backend-idén bör behållas.

## Saker som är ofarliga att behålla nu

- `industry = food` som default/första aktiva bransch.
- Livsmedelsspecifika business types i onboarding.
- Livsmedelsspecifika startmallar.
- Nuvarande kategorier.
- `Egenkontroll` som produktbegrepp.
- Inspektörs-/delningsflödet för livsmedels-MVP.

## Saker som bör göras generiska senare

När faktisk branschutökning ska göras bör Codex analysera:

1. Om `Organization.industry` ska bli en bredare typ eller tabellstyrt värde.
2. Om `business_type` ska kopplas till bransch i stället för att vara en enda union.
3. Om `control_templates` behöver `industry`, `locale`, `version` och `template_pack`.
4. Om `ControlCategory` behöver fler värden eller ett mer generiskt lager.
5. Om fälttyper behöver utökas med generiska mätvärden, enheter, duration, prioritet, deadline, ansvarig och asset-metadata.
6. Om rapporter ska få branschspecifik copy via konfiguration.
7. Om delningsvyn ska kunna heta olika saker beroende på mottagare: inspektör, revisor, kund, intern ansvarig, självinspektion.

## Rekommenderad ordning för framtida Codex-arbete

1. Lös #134 på analysnivå: definiera minsta säkra backendmodell för fler branscher.
2. Lös #135: bestäm struktur för branschbaserade mallpaket.
3. Lägg till metadata på mallpaket/templates om det behövs.
4. Behåll `food` som enda aktiva bransch i UI tills allt är testat.
5. Lägg till en första ny bransch som separat experimentellt mallpaket.
6. Först därefter: bygg branschval i onboarding.

## Viktig avgränsning

Denna kartläggning betyder inte att appen ska bli flerbranschprodukt nu.

Den betyder bara att framtida Codex-sessioner ska ha rätt underlag och inte bygga in fler livsmedelsspecifika antaganden i kontrollmotorn.