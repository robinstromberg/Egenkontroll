# Datamodell - Egenkontroll

Det här dokumentet sammanfattar Supabase-datamodellen för MVP:n.

## Grundprincip

All kunddata ska vara kopplad till en verksamhet via `organization_id`. Det gör appen redo för SaaS från start och minskar risken att data blandas mellan kunder.

## Centrala Tabeller

### `organizations`
Verksamhetens rapportbranding lagras frivilligt som `logo_url` och `brand_color`.
Verksamheter/kundkonton. Innehåller namn, land, tidszon, standardspråk och prenumerationsstatus.

### `profiles`
Användarprofil kopplad 1:1 till `auth.users`.

### `organization_memberships`
Kopplar användare till verksamheter med roll:

- `owner`
- `admin`
- `staff`

### `control_templates`
Globala startmallar, till exempel Kyltemperaturer, Städning, Varumottagning och Spårbarhet. Dessa är föreslagna mallar och kopieras/anpassas till verksamhetens egna `control_types`.

### `control_types`
Verksamhetens egna kontrolltyper. Exempel: Kyltemperaturer, Städning, Datummärkning.

### `control_objects`
Objekt eller kontrollpunkter inom en kontrolltyp. Exempel: Kyl 1 - Kök, Toaletter, Frys 1 - Lager.

Objekt har `active`-status så gamla objekt kan inaktiveras utan att historik blir obegriplig.

### `control_field_definitions`
Dynamiska fält för kontrollflöden. Stödjer bland annat text, nummer, temperatur, OK/Ej OK, datum, foto och select.

### `control_runs`
En utförd kontroll. Innehåller kontrolltyp, utförd av, tidpunkt och övergripande status.

### `control_run_items`
De enskilda svaren/värdena i en utförd kontroll. Här sparas även snapshots av objekt och fältdefinitioner så historiken fortsätter vara begriplig även efter senare ändringar.

### `deviations`
Avvikelser som skapas när en kontrollpunkt avviker. Stödjer minst:

- `open`
- `resolved`

Avvikelser kopplas till kontroll, objekt, användare, åtgärdstext och eventuell uppföljning.

### `attachments`
Metadata för bilder och dokument som lagras i den privata Supabase Storage-bucketen `control-attachments`. Appens historik- och inspektörsvyer visar bilagemetadata utan att visa interna storage paths.

### `share_links`
Tidsbegränsade read-only-delningar för inspektörsvy. Tabellen sparar hashad token, period, giltighet och vilka kontrolltyper som ingår.

### `export_logs`
Logg över PDF-/CSV-exporter från inspektörsflöden.

## RLS-Princip

RLS är aktiverat på centrala tabeller och policyerna utgår från organisationsmedlemskap.

Grundlogiken är:

- Medlemmar kan läsa sin verksamhets data.
- Admin/owner kan hantera struktur som kontrolltyper, objekt och delningar.
- Personal kan skapa kontrollregistreringar, avvikelser och bilagemetadata.
- Inspektörslänkar läser dokumentation via tokenbegränsade `SECURITY DEFINER`-RPC:er, inte genom direkt tabellåtkomst.
- Inspektörs-RPC:erna kontrollerar hashad token, aktiv status, giltighetsperiod, delningsscope, vald period och valda kontrolltyper.
- Inspektörs-RPC:n returnerar kontrollrader, avvikelser och begränsad bilagemetadata, men inga interna storage paths och ingen write-yta.

## Startmallar

Migrationerna skapar svenska startmallar för:

- Kyltemperaturer
- Städning
- Datummärkning
- Varumottagning
- Spårbarhet
- Egenkontrollrunda
