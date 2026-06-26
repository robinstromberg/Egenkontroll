# Branschbaserade mallpaket

Det här dokumentet beskriver hur Egenkontroll kan stödja fler branscher senare utan att ändra kontrollmotorn eller störa livsmedels-MVP:n.

## Princip

Livsmedel är första mallpaketet, inte hela systemets identitet. Samma motor ska fortsätta användas:

`mallpaket -> kontrolltyp -> kontrollpunkt -> fält -> utförd kontroll -> avvikelse -> historik -> delning/export`

Mallar ska vara startpunkter. När en mall används ska den kopieras till organisationens egna `control_types`, `control_objects` och `control_field_definitions`, så att admin kan redigera allt.

## Nuvarande läge

Nuvarande `control_templates` räcker för enkla mallar:

- namn
- beskrivning
- kategori
- standardfrekvens
- `template_schema`
- locale
- aktiv/inaktiv

Det som saknas för flera branscher är ett tydligt paketlager ovanpå mallarna.

## Föreslagen modell senare

Ett framtida `template_packs`-begrepp bör kunna innehålla:

- `industry`, till exempel `food`, `fire_safety`, `property`, `cleaning`, `work_environment`, `vehicle`, `custom`
- `locale`, till exempel `sv-SE`
- `version`
- namn och beskrivning
- aktiv/inaktiv-status
- sorteringsordning

Varje `control_template` bör sedan kunna kopplas till ett paket, exempelvis via `template_pack_id`.

## Food som första paket

Nuvarande livsmedelsmallar kan behandlas som `food`-paketet:

- Kyltemperaturer
- Städning
- Datummärkning
- Varumottagning
- Spårbarhet
- Egenkontrollrunda
- övriga inaktiva tilläggsmallar

Inga nya branscher ska exponeras i UI förrän minst ett nytt paket är definierat, testat och har egen copy.

## Rekommenderad framtida migrationsordning

1. Lägg till `template_packs` med `food` som första paket.
2. Koppla befintliga `control_templates` till food-paketet.
3. Behåll `organizations.industry = food` som default.
4. Utöka `organizations.industry` först när ett nytt paket faktiskt finns.
5. Låt onboarding välja paket senare, men ändra inte nuvarande MVP-flöde innan det behövs.

## Vad som inte ska göras nu

- Ingen branschväljare i onboarding.
- Inga nya branschmallar i produktflödet.
- Ingen ny kontrollmotor.
- Ingen låsning av mallar efter att de kopierats till en organisation.
- Ingen rapportombyggnad enbart för framtida branscher.

## Testprincip när detta byggs

När ett paketlager införs ska följande testas:

- En ny livsmedelsorganisation får samma mallar som idag.
- Befintliga organisationer fortsätter fungera.
- Kontrolltyper skapade från mall är fortsatt redigerbara.
- Historik, avvikelser, delning och export påverkas inte av paketlagret.
