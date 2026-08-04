# Onboarding och startmallar

> Detta dokument beskriver den implementerade MVP-modellen. Den beslutade produktmålbilden och statusen för de 16 livsmedelskontrollerna finns i [`docs/product/control-types/README.md`](./product/control-types/README.md).

Issue #5 gör att en ny verksamhet kan komma igång med föreslagna kontrolltyper utan manuell databashantering.

## Flöde

1. Användaren loggar in.
2. Om användaren saknar verksamhet visas startflödet.
3. Användaren anger verksamhetsnamn.
4. Appen hämtar aktiva startmallar från `control_templates`.
5. Alla mallar är valda som standard.
6. Användaren kan avmarkera mallar som inte behövs.
7. När verksamheten skapas kopieras valda mallar till verksamhetens egna tabeller.

## Vad kopieras

För varje vald mall skapas:

- en `control_types`-rad,
- eventuella `control_objects`,
- eventuella `control_field_definitions`.

Det betyder att mallarna bara är en startpunkt. Efter onboarding tillhör kontrolltyperna verksamheten och kan redigeras i senare adminflöde.

## MVP-mallar

Första svenska malluppsättningen är:

- Kyltemperaturer
- Städning
- Datummärkning
- Varumottagning
- Spårbarhet
- Egenkontrollrunda

## Viktig princip

MVP:n använder hybridstart: färdiga exempel finns, men verksamheten ska inte låsas till standardmallar.

I målbilden gäller detta de verksamhetsspecifika val som katalogen tillåter. Mallens syfte och grundläggande kontrollogik ska inte kunna ändras fritt så att kontrolltypen förlorar sin betydelse.
