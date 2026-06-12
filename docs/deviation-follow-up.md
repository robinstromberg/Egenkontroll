# Avvikelsehantering och uppföljning

Issue #9 gör avvikelser aktiva i arbetsflödet.

## När avvikelse skapas

Kontrollmotorn från issue #8 skapar en avvikelse när en kontrollpunkt avviker.

Avvikelsen sparas med:

- verksamhet,
- kontrollregistrering,
- kontrolltyp,
- kontrollpunkt,
- beskrivning,
- åtgärdstext,
- status `open`,
- användare som öppnade avvikelsen.

## Uppföljning

Idag-vyn visar öppna avvikelser. Användaren kan skriva en uppföljningskommentar och markera avvikelsen som löst.

När avvikelsen stängs sparas:

- status `resolved`,
- `resolved_by`,
- `resolved_at`,
- `follow_up_comment`.

## Viktig princip

Avvikelsen försvinner inte ur historiken. Den ändrar status från öppen till löst och kan senare visas i historik och export.
