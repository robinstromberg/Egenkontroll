# Auth-redirects och app-origin

Det här dokumentet beskriver den aktuella Production- och Preview-konfigurationen efter #328, #338 och PR #339.

## Kanonisk origin

Den autentiserade appens kanoniska Production-origin är:

```text
https://app.minegenkontroll.se
```

Publika webbplatsen ligger på `https://minegenkontroll.se`. Webbens `/login` och `/signup` redirectar permanent till motsvarande route på appdomänen och bevarar query-parametrar.

## Vercel

### Production

Appprojektets Production-miljö måste ha följande explicita värde:

```text
VITE_APP_URL=https://app.minegenkontroll.se
```

Production har ingen inbyggd reservadress. Om `VITE_APP_URL` saknas eller inte är den kanoniska appdomänen ska bygget stoppa med ett konfigurationsfel.

### Preview

I Preview ska `VITE_APP_URL` inte sättas. App-origin härleds i stället från Vercels systemvariabel `VERCEL_URL`, så att länkar stannar på den aktuella Preview-deploymenten.

Preview måste samtidigt ha den uttryckliga Supabase staging-konfiguration som beskrivs i `docs/reporting.md`. Miljövalet är fail-closed: saknad konfiguration eller produktions-Supabase i Preview ska stoppa bygget eller ge ett avgränsat konfigurationsfel.

## Supabase Auth

Supabase Auth ska använda följande Site URL:

```text
https://app.minegenkontroll.se
```

Följande auth-redirect ska behållas permanent:

```text
https://app.minegenkontroll.se/**
```

Den täcker appens avsedda login-, signup-, magic-link-, recovery- och invitationsflöden. Nya authlänkar ska skapas för appdomänen.

## Tillfälligt övergångsstöd

Följande origins är endast kompatibilitetsstöd för äldre länkar från tiden före appdomänens cutover:

```text
https://minegenkontroll.se
https://www.minegenkontroll.se
https://egenkontroll-indol.vercel.app
```

De är inte kanoniska authdestinationer och ska inte användas för nya länkar.

Projektalias som redirectar till Vercel SSO, inklusive följande historiska alias, är inte publika authcallbacks:

```text
https://egenkontroll-robinstrombergs-projects.vercel.app
https://egenkontroll-git-main-robinstrombergs-projects.vercel.app
```

De ska inte dokumenteras eller användas som publika destinationer för magic link, recovery eller invitationer.

## Ta bort gamla redirect-URL:er

Ta inte bort någon äldre URL enbart utifrån repodokumentationen. Kontrollera alltid den faktiska listan under Supabase Dashboard → Authentication → URL Configuration.

Övergångsadresser får tas bort först när:

1. stabiliseringsperioden på minst 14 dagar och en full releasecykel är avslutad,
2. äldre magic-link-, recovery- och invitationslänkar rimligen har löpt ut,
3. Production-flödena på appdomänen fortfarande är verifierade,
4. aktiva eller väntande verksamhetsflöden inte är beroende av den äldre originen,
5. den exakta Dashboard-ändringen och en återställningsplan har dokumenterats.

Lokala redirect-URL:er ska vara exakta och endast behållas för portar som faktiskt används i lokal utveckling. Ta bort historiska localhost-adresser som inte längre används.

## Manuell verifiering

Efter en ändring i Vercel eller Supabase Auth:

1. kontrollera att `VITE_APP_URL` har Production-scope och exakt värde `https://app.minegenkontroll.se`,
2. kontrollera att Supabase Site URL är `https://app.minegenkontroll.se`,
3. kontrollera att `https://app.minegenkontroll.se/**` finns kvar som tillåten redirect,
4. verifiera login, signup, magic link, recovery och invitation med nygenererade länkar,
5. verifiera att länkarna landar på appdomänen utan redirectloop,
6. kör repots `deploy:smoke` mot verkliga webb- och apporigins.

Återanvänd inte gamla magic links i testet; de kan redan vara förbrukade eller utgångna.
