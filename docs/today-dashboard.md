# Idag-vy

Issue #7 skapar den första dagliga startsidan för inloggad personal.

## Syfte

Startsidan ska visa vad som ska göras idag, vad som är klart och vad som kräver uppmärksamhet.

## Dagens kontroller

Appen hämtar aktiva kontrolltyper för verksamheten och visar kontroller med frekvens:

- `daily`
- `weekly`

Kontroller med `per_delivery` visas inte som daglig rutin ännu, eftersom de ska användas vid leveransflöde.

## Status

För varje kontrolltyp visas:

- Ej utförd
- Klar
- Klar med avvikelse

Status baseras på om det finns en `control_runs`-rad för kontrolltypen under dagens datumintervall.

## Öppna avvikelser

Idag-vyn visar öppna avvikelser från `deviations` där `status = open`.

## Avgränsning

Knappen “Utför kontroll” är med som tydlig nästa handling, men själva kontrollflödet byggs i issue #8.
