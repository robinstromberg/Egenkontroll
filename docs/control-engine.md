# Kontrollmotor

Issue #8 skapar första generella kontrollflödet.

## Grundflöde

1. Användaren öppnar en kontroll från Idag-vyn.
2. Appen hämtar kontrolltyp, aktiva objekt och aktiva fält.
3. Formuläret byggs dynamiskt.
4. Användaren fyller i värden.
5. Appen markerar avvikelser direkt.
6. Avvikelser kräver åtgärdstext innan sparning.
7. Appen sparar `control_runs`, `control_run_items` och öppna `deviations`.
8. Dashboarden uppdateras.

## Avvikelselogik i första version

- `ok_not_ok`: `Ej OK` skapar avvikelse.
- `boolean`: `Nej` skapar avvikelse.
- `temperature`: värde jämförs mot objektets `limit_min` och `limit_max`.

## Stöd i första version

Formuläret stödjer:

- text
- textarea
- number
- temperature
- boolean
- OK/Ej OK
- date

Foto och mer avancerade fälttyper byggs vidare i senare issue.

## Viktig princip

Kontrollmotorn är gemensam. Skillnaden mellan temperaturkontroll, städning och varumottagning ska ligga i kontrolltypens objekt och fält, inte i separata hårdkodade flöden.
