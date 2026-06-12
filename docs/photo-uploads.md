# Bilduppladdning och mobil kamera

Issue #10 lägger grunden för foton och bilagor i kontroller.

## Storage

En privat Supabase Storage-bucket skapas:

- `control-attachments`

Bucketen är inte publik. Åtkomst styrs med storage policies som utgår från verksamhetens id i filens sökväg.

## Filstruktur

Filer sparas enligt principen:

`organizationId/controlRunId/controlRunItemId/timestamp-fileName`

Det gör att varje fil kan kopplas till rätt verksamhet, kontroll, kontrollpost och historik.

## Metadata

Efter uppladdning sparas metadata i tabellen `attachments`:

- verksamhet,
- kontrollregistrering,
- kontrollpost,
- bucket,
- storage path,
- filnamn,
- filtyp,
- filstorlek,
- uppladdad av.

## Mobil kamera

Fält av typen `photo` visas som filinput med stöd för mobil kamera där webbläsaren erbjuder det.

## Avgränsning

Issue #10 gör att foto kan sparas vid kontroll. Förhandsvisning i historik byggs vidare i historik- och exportflödena.
