# Supabase backup and restore runbook

Senast uppdaterad: 2026-07-06

Den har rutinen galler produktionsprojektet `Egenkontroll` i Supabase.

## Backup-niva

Status 2026-06-30:

- Projektet ar aktivt och friskt i Supabase.
- Projektet kor Postgres 17 i `eu-west-3`.
- Supabase Pro ar aktiverat.
- Supabase-dokumentationen anger att Pro-projekt far dagliga databasbackups med 7 dagars tillgang.
- Aktuella migrationer ar listade via Supabase-connectorn.
- Dashboard visar dagliga scheduled physical backups for 2026-06-23 till 2026-06-30.

Backup-sida att kontrollera manuellt:

https://supabase.com/dashboard/project/eapjywbgxtudqjrlueep/database/backups/scheduled

## Vad backupen tacker

Supabase dagliga databasbackups anvands som standardniva fore publik beta.

Backupen ska anvandas for:

- databasschema
- tabeller
- RLS/policies/functions/triggers som finns i databasen
- kund- och organisationsdata i databasen
- auth-relaterad databasdata som ingar i Supabase backupflode
- storage-metadata som ligger i databasen

Viktiga begransningar enligt Supabase:

- Storage-objekt, till exempel faktiska uppladdade filer/bilder, aterstalls inte som filer bara for att en databasbackup aterstalls.
- Storage-objekt backas upp separat enligt `docs/SUPABASE_STORAGE_BACKUP_RUNBOOK.md`.
- Losenord for egna Postgres-roller sparas inte i dagliga backupfiler.
- En restore mot produktionsprojektet gor projektet otillgangligt under restore-tiden.
- Raderar man ett Supabase-projekt permanent forsvinner aven backups.

## Kontrollrutin

Fore bredare beta:

1. Oppna Supabase Dashboard > Database > Backups.
2. Bekrafta att scheduled backups finns for projektet.
3. Skriv datum for kontrollen i testloggen langst ned i detta dokument.

Efter bredare beta:

- Kontrollera backupstatus minst en gang per manad.
- Kontrollera backupstatus efter storre schemaandringar.
- Kontrollera backupstatus efter andring av Supabase-plan, region, storage eller auth-installningar.

## Restore-test

Restore-test ska i forsta hand goras utan att skriva over produktionsprojektet.

Rekommenderat test for pre-customer/beta:

1. Valj en daily backup i Supabase Dashboard.
2. Aterstall till ett separat test-/temporart projekt om Supabase Dashboard erbjuder det for vald restore-metod, eller duplicera projektet enligt Supabase restore/clone-flode.
3. Oppna det aterstallda projektet.
4. Verifiera:
   - projektet startar
   - senaste migrationer finns
   - centrala tabeller finns
   - RLS ar aktivt pa kunddatatabeller
   - `control-attachments` och `organization-branding` storage-metadata finns
   - testkonto kan logga in eller ny testanvandare kan skapas
   - en kontroll kan skapas
   - historik kan visas
   - dokumentation kan exporteras
5. Kor Storage-backup och verify enligt `docs/SUPABASE_STORAGE_BACKUP_RUNBOOK.md`, eller verifiera att senaste Storage-backup fortfarande ar lasbar.
6. Dokumentera resultatet i testloggen.
7. Ta bort temporart restore-projekt nar testet ar klart, om det inte behovs vidare.

Gor inte ett destruktivt restore-test mot produktionsprojektet nar riktiga kunddata finns.

## Nar produktion maste aterstallas

Om produktionsprojektet faktiskt maste aterstallas:

1. Stoppa eller pausa apptrafik om det gar.
2. Informera berorda anvandare om forvantad driftstorning.
3. Valj narmaste backup fore incidenten.
4. Dokumentera vald backup, tidpunkt och anledning.
5. Starta restore i Supabase Dashboard.
6. Nar restore ar klar:
   - kor appens mest kritiska smoke-test
   - kontrollera inloggning
   - kontrollera att organisationer och kontrollhistorik finns
   - kontrollera att dokumentation/export fungerar
   - kontrollera storage-bilagor manuellt eftersom databasrestore inte aterstaller raderade storage-objekt
   - aterstall saknade Storage-objekt fran separat Storage-backup om det behovs
7. Dokumentera resultat och eventuell dataforlust.

## Testlogg

| Datum | Typ | Backup-kalla | Restore-mal | Resultat | Kommentar |
| --- | --- | --- | --- | --- | --- |
| 2026-06-30 | Rutin skapad | Ej restore | Ej restore | Dokumenterad | Projektet ar aktivt/friskt, migrationer kan listas via Supabase-connectorn. Backup-listan maste bekraftas i Dashboard eftersom connectorn saknar backup-listning. |
| 2026-06-30 | Restore readiness check | Ej restore | Produktionsprojekt, read-only kontroll | Godkand readiness | Projektet ar `ACTIVE_HEALTHY`, Postgres 17 i `eu-west-3`. Supabase-connectorn listar aktuella migrationer. Centrala kunddatatabeller har RLS aktiverat. Buckets `control-attachments` och `organization-branding` finns, ar privata och har forvantade filtyps-/storleksgranser. Full restore ar inte kord eftersom connectorn saknar backup-listning och restore-mal maste valjas i Dashboard. |
| 2026-06-30 | Icke-destruktivt restore-test | Scheduled physical backup `2026-06-30 03:24:37 (+0000)` | `Egenkontroll restore test 2026-06-30` (`htpdkkursnmqgpirmhlx`) | Godkant | Restore-projektet ar `ACTIVE_HEALTHY`, Postgres 17 i `eu-west-3`, och senaste migrationen i Dashboard ar `harden_invitation_accept_rpc_grants`. Connector-verifiering visar 43 migrationer, 13 av 13 kontrollerade publika tabeller med RLS, 2 privata buckets, samt testdata i centrala tabeller: 2 organisationer, 30 kontrolltyper, 16 kontrollrundor och 25 delningslankar. Supabase restore-dialogen anger att storage-objekt/installningar, Edge Functions samt Auth/API keys maste aterkonfigureras manuellt vid restore till nytt projekt. |
