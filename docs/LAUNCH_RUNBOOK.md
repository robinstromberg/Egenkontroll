# Lanseringsrutin

## Syfte

Den har rutinen beskriver hur Min Egenkontroll ska kontrolleras fore och efter en produktionsdeploy.

Forhandslansering har bara testdata, men rutinen ar skriven sa den ocksa fungerar nar riktiga kunder finns.

## Fore deploy

1. Kontrollera att arbetskopian ar ren eller att alla andringar hor till deployen.

```bash
git status --short
```

2. Kor kvalitetstester.

```bash
npm run typecheck
npm run lint
npm run build
```

3. Kontrollera att inga hemligheter eller `.env`-filer har hamnat i diffen.

```bash
git diff --check
git diff --stat
```

4. Om databasmigration ingar:

- las migrationen manuellt
- undvik hardkodade test-id:n
- kor migrationen via Supabase migration flow
- verifiera med en lasande SQL-fraga efterat

## Deploy

Normal vag ar GitHub main till Vercel production.

1. Commit:a avgransade andringar.
2. Pusha till `main`.
3. Kontrollera att Vercel-deployen blir `READY`.
4. Kontrollera att produktionsdomanen svarar.

```bash
curl -I https://minegenkontroll.se/
```

Forvantat: `HTTP/1.1 200 OK`.

## Smoke test efter deploy

Kors pa `https://minegenkontroll.se`.

### Login

Testa minst ett av foljande:

- logga in med e-post och losenord
- magic link
- glomt losenord om auth-mail har andrats

Kontrollera:

- appen landar i inloggat lage
- auth-lanken gar till `minegenkontroll.se`
- inga dubbla auth-mail skickas vid ett normalt klick

### Ny anvandare

Anvand bara testkonto/testdata.

1. Skapa konto.
2. Bekrafta e-post om Supabase kraver det.
3. Skapa verksamhet.
4. Kontrollera att startsidan visas.

### Forsta sparade kontroll

1. Oppna `Idag`.
2. Valj en kontroll.
3. Fyll i alla obligatoriska falt.
4. Spara.
5. Kontrollera att sparad-vyn visas.
6. Oppna `Historik`.
7. Kontrollera att kontrollen syns med ratt namn, datum och utforare.

### Avvikelse

1. Skapa en kontroll med avvikelse, t.ex. Ej OK eller temperatur utanfor gransvarde.
2. Fyll i atgard.
3. Spara.
4. Kontrollera att avvikelsen syns i historik och rapport.

### Delning och QR

1. Skapa en tidsbegransad delningslank.
2. Oppna lanken i privat fonster/utan inloggning.
3. Kontrollera att inspektorsvyn bara visar valt urval.
4. Kontrollera PDF/CSV om exporten har berorts.

### Bilder

Om bildflode har andrats:

1. Ladda upp en testbild.
2. Spara kontrollen.
3. Kontrollera bilden i historik.
4. Kontrollera bildvisning i inspektorslank om server-side signed URLs ar konfigurerade.

## Efter deploy

1. Kontrollera Vercel deployment status.
2. Kontrollera Supabase logs om login eller databasflode har andrats.
3. Dokumentera eventuell manuell verifiering i GitHub-issue eller releaseanteckning.
4. Lagg inte in riktiga kunduppgifter i smoke tester.

## Rollback

Om produktion ar trasig:

1. Identifiera senaste fungerande Vercel deployment.
2. Promota/rollbacka via Vercel Dashboard.
3. Om databasmigration ar inblandad: stoppa och gor separat databasplan. Rollback av kod racker inte alltid.
4. Dokumentera vad som hande i GitHub-issue.

## Budget och spend alerts

Vercel billing/spend alerts hanteras i Vercel-kontot och kan normalt inte konfigureras fran appkoden.

Manuell kontroll:

1. Oppna Vercel Dashboard.
2. Ga till teamets Billing/Usage/Alerts eller motsvarande spend management-sida.
3. Satt rimliga notifieringar for manadskostnad och ovanlig anvandning.
4. Kontrollera aven Supabase Billing/Usage alerts i Supabase Dashboard.

Via Vercel CLI kan man lasa usage och alert-regler nar CLI ar inloggat:

```bash
vercel usage
vercel alerts rules ls --all
```

Notera i GitHub-issue #172 nar budget/spend alerts faktiskt ar aktiverade i kontona.
