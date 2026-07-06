# Supabase Storage backup runbook

Senast uppdaterad: 2026-07-06

Den har rutinen kompletterar `docs/SUPABASE_BACKUP_RESTORE_RUNBOOK.md`.
Databasbackups skyddar databasen och storage-metadata, men inte sjalva filerna i Supabase Storage.

## Syfte

Sakerstall att uppladdade filer kan sparas och verifieras utan att lagga secrets, manifest eller backupfiler i repo.

## Buckets som ska backas upp

| Bucket | Status | Varfor den ar viktig |
| --- | --- | --- |
| `control-attachments` | Kundkritisk | Bilder och PDF-bilagor som laddas upp vid kontrollrundor. |
| `organization-branding` | Potentiellt kundkritisk | Privat bucket for verksamhetslogotyper. Datamodell och policies finns, aven om aktuell appvy inte laddar upp loggor just nu. |

## Vad backupen tacker

Storage-backupen tacker:

- faktiska filer i `control-attachments`
- faktiska filer i `organization-branding`
- manifest med bucket, storage path, filstorlek, sha256 och metadata fran Storage-listningen

Storage-backupen tacker inte:

- databasschema
- tabeller
- RLS/policies/functions
- auth-data

Det hanteras av databasbackupen i Supabase.

## Sakerhetsregler

- Kor scriptet lokalt fran en terminal.
- Ange secrets bara som tillfalliga miljovariabler.
- Spara backupmappen utanfor repot.
- Anvand krypterad disk eller annan skyddad plats for backupen.
- Dela inte manifestet publikt, eftersom det kan innehalla storage paths och filnamn.
- Commit:a aldrig backupfiler, manifest, `.env`, service role key, access token eller connection string.

Scriptet vagrar kora om `STORAGE_BACKUP_DIR` pekar inuti repot.

## Forutsattningar

- Node dependencies ar installerade med `npm ci`.
- Operatorn har tillgang till projektets Supabase URL.
- Operatorn har tillgang till `SUPABASE_SERVICE_ROLE_KEY`.
- Backupmalet ligger utanfor repo, till exempel pa krypterad lokal disk.

## Kor backup

PowerShell-exempel:

```powershell
$env:SUPABASE_URL="https://<project-ref>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
$env:STORAGE_BACKUP_DIR="D:\MinEgenkontroll-storage-backups\2026-07-06"

node .\scripts\backup-supabase-storage.mjs
```

Scriptet:

1. listar `control-attachments` och `organization-branding`
2. laddar ner varje objekt till `STORAGE_BACKUP_DIR`
3. skapar `storage-backup-manifest-<timestamp>.json`
4. skriver inte nagot till Supabase

## Verifiera backup

Kor verifiering direkt efter backup:

```powershell
node .\scripts\verify-supabase-storage-backup.mjs
```

Om `STORAGE_BACKUP_MANIFEST` inte anges valjs senaste manifestet i `STORAGE_BACKUP_DIR`.

Valfritt: ange exakt manifest:

```powershell
$env:STORAGE_BACKUP_MANIFEST="D:\MinEgenkontroll-storage-backups\2026-07-06\storage-backup-manifest-2026-07-06T10-00-00-000Z.json"
node .\scripts\verify-supabase-storage-backup.mjs
```

Verifieringen:

- kontrollerar att varje lokal fil finns
- kontrollerar filstorlek
- kontrollerar sha256
- jamfor remote Storage mot manifest om `SUPABASE_URL` och `SUPABASE_SERVICE_ROLE_KEY` finns

Om remote-jamforelse saknar env-variabler gors lokal verifiering anda.

## Nar rutinen ska koras

Fore bredare publik beta:

1. Kor storage-backup.
2. Kor verify-scriptet.
3. Oppna minst en testbilaga fran backupmappen om `control-attachments` innehaller testdata.
4. Skriv resultat i testloggen nedan.

Efter beta/skarp drift:

- minst en gang per manad
- fore storre datareset eller migration
- efter forandringar i Storage, RLS/policies eller filuppladdning
- efter incident dar filer kan ha forsvunnit

## Restore-princip

Forsta versionen har inget restore-script.

Vid incident:

1. Stoppa eller pausa berord apptrafik om det gar.
2. Aterstall databasen enligt `docs/SUPABASE_BACKUP_RESTORE_RUNBOOK.md` om databasen ocksa paverkats.
3. Anvand Storage-manifestet for att identifiera vilka objekt som saknas.
4. Aterladda saknade filer manuellt eller via ett separat granskat restore-script.
5. Verifiera att appen kan oppna bilagor via historik/delning.
6. Dokumentera vilka filer som aterstalldes och eventuell dataforlust.

## Vad som absolut inte ska committas

- `.env`
- `SUPABASE_SERVICE_ROLE_KEY`
- Supabase access tokens
- databaslosenord eller connection strings
- backupmappar
- `storage-backup-manifest-*.json`
- nedladdade bilder, PDF:er eller andra kundfiler
- ZIP-filer med backupdata

## Testlogg

| Datum | Typ | Backup-mal | Resultat | Kommentar |
| --- | --- | --- | --- | --- |
| 2026-07-06 | Rutin skapad | Ej kord | Dokumenterad | Script och verifieringsrutin skapade. Forsta riktiga backup ska koras manuellt med service role key utanfor repo. |
