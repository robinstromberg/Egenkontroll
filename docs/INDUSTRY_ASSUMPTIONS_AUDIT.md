# Branschantaganden i appen

Syftet med den här kartläggningen är att visa var Egenkontroll fortfarande antar livsmedelsverksamhet, utan att ändra kod eller databas. Den kan användas som underlag innan nya branschpaket byggs.

## Sammanfattning

Kontrollmotorn är till stor del generell: kontrolltyper, kontrollpunkter, fält, historik, avvikelser, bilagor och delningslänkar fungerar utan att behöva veta bransch. Det som är branschbundet ligger främst i onboarding, startmallar, exempeldata, marknadsförande copy, ikoner och vissa standardfält.

## Hårda antaganden

- `src/types/database.ts` låser `Organization.industry` till `food`.
- `supabase/migrations/20260622220000_add_onboarding_business_profile.sql` lägger till `organizations.industry` med check constraint `industry in ('food')`.
- `Organization.business_type` är begränsad till livsmedelsnära typer: restaurang, cafe, bageri, kiosk, foodtruck, catering och butik med kylda varor.

Det här är rätt för nuvarande MVP men måste ändras innan andra branscher kan väljas som förstaklassmedborgare.

## Mallar och startdata

Följande filer innehåller tydliga livsmedelsmallar:

- `supabase/migrations/20260612150147_initial_control_templates.sql`
- `supabase/migrations/20260622075943_standardize_core_control_template_fields.sql`
- `supabase/migrations/20260622080640_add_inactive_extended_control_templates.sql`
- `supabase/seed.sql`

Exempel på antaganden:

- Kyltemperaturer, frysar, varmhållning och nedkylning.
- Städning, hygien, skadedjur, vattenkontroll och avfallshantering.
- Varumottagning med leverantör, leveranstemperatur och följesedel.
- Datummärkning, batchnummer, bäst före och produktgrupper.

Rekommendation: behåll dessa som ett `food`-mallpaket och lägg nya branscher som egna mallpaket i stället för att göra befintliga mallar mer abstrakta.

## UI och copy

Följande vyer har livsmedelscopy eller livsmedelsspecifika val:

- `src/App.tsx`: login-copy nämner livsmedelsverksamheter.
- `src/components/PublicLandingPage.tsx`: positionerar produkten för kök, cafe, butik, produktion och livsmedel.
- `src/components/OrganizationSetup.tsx`: erbjuder bara livsmedelsnära verksamhetstyper.
- `src/components/MenuView.tsx`: leverantörer beskrivs för varumottagning och spårbarhet.
- `src/components/TodayDashboard.tsx`: ikonfallbacks och kategoriord baseras på temperatur, städning, mottagning och spårbarhet.
- `src/components/ControlTypeDetailView.tsx`: exempel för kontrollpunkter använder bland annat kyl, beredning och mottagning.

Rekommendation: gör UI-copy beroende av valt branschpaket först när fler branscher faktiskt aktiveras.

## Generella delar som bör återanvändas

Följande delar bör ses som branschagnostiska:

- Kontrolltyper och kontrollfält i `control_types`, `control_objects` och `control_field_definitions`.
- Körning av kontroller i `control_runs` och `control_run_values`.
- Avvikelseflödet i `deviations`.
- Bilagor och foton via `control_attachments`.
- Historik, rapport, CSV/PDF-export och tidsbegränsade läslänkar.
- Adminflödet för att skapa egna kontrolltyper, kontrollpunkter och fält.

## Risker vid ny bransch

- Att nya branscher ärver livsmedelstermer i rapporter och läslänkar.
- Att temperaturfält behandlas som centralt även när branschen inte använder temperatur.
- Att `supplier`, `batch`, `best_before` och `delivery` återanvänds där andra relationer eller dokumentnummer vore bättre.
- Att organisationens `industry`-constraint ändras utan plan för befintliga food-organisationer.

## Rekommenderad ordning senare

1. Behåll nuvarande livsmedels-MVP oförändrad.
2. Introducera ett tydligt mallpaketsbegrepp ovanpå kontrollmotorn.
3. Lägg nya branscher som separata paket med egen copy, egna standardmallar och egna ikoner.
4. Utöka `organizations.industry` först när minst ett nytt paket är definierat och testat.
5. Kontrollera historik, inspektörsvy och export så att de visar neutrala mottagartermer när branschen inte är livsmedel.
