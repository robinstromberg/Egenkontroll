# Historik

Issue #11 lägger till första historikvyn för utförda kontroller.

## Funktioner

Historikvyn kan:

- lista de senaste kontrollregistreringarna,
- filtrera på från-datum,
- filtrera på till-datum,
- filtrera på status,
- öppna detaljvy för en kontrollregistrering,
- visa registrerade kontrollposter,
- visa avvikelser,
- visa bilagemetadata.

## Detaljvy

Detaljvyn visar:

- kontrolltyp,
- tidpunkt,
- status,
- registrerade värden,
- avvikelsemarkering,
- åtgärdstext,
- uppföljningskommentarer,
- bilagor.

## Avgränsning

Bilagor visas som metadata i historik, inspektörsvy och rapportunderlag utan att interna storage paths visas i gränssnittet. Bildförhandsvisning, signerade visningslänkar och inbäddade bilagor i PDF kan byggas vidare senare med ett separat åtkomstflöde.
