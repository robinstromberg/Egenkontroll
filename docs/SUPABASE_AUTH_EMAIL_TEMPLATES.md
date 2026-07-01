# Supabase Auth email templates

## Syfte

Supabase Auth-mail ska vara pa svenska och kannas som Min Egenkontroll. Mallarna hanteras i Supabase Dashboard, inte i React-appen.

Supabase dokumenterar att hosted projects kan redigera Auth-mallar i Dashboard under Email Templates. Samma mallar kan ocksa uppdateras via Supabase Management API. Variabeln `{{ .ConfirmationURL }}` ar den viktiga lanken for signup, magic link, reset password och invite.

Kalla: https://supabase.com/docs/guides/auth/auth-email-templates

## Dashboard-vag

1. Oppna Supabase Dashboard.
2. Valj projektet `Min Egenkontroll`.
3. Ga till Authentication > Emails > Templates.
4. Uppdatera mallarna nedan.
5. Spara.
6. Skicka nya testmail for signup, magic link och glomt losenord.
7. Kontrollera att lankarna leder tillbaka till `https://minegenkontroll.se`.

## Avsandare

Rekommenderat:

- Sender name: `Min Egenkontroll`
- Sender email: `no-reply@minegenkontroll.se`

## Confirm sign up

Subject:

```text
Bekrafta din e-postadress
```

Body:

```html
<h2>Bekrafta din e-postadress</h2>
<p>Valkommen till Min Egenkontroll.</p>
<p>Folj lanken nedan for att bekrafta din e-postadress och slutfora ditt konto.</p>
<p><a href="{{ .ConfirmationURL }}">Bekrafta e-postadress</a></p>
<p>Om du inte skapade ett konto kan du ignorera det har meddelandet.</p>
```

## Magic link or OTP

Subject:

```text
Din inloggningslank till Min Egenkontroll
```

Body:

```html
<h2>Logga in i Min Egenkontroll</h2>
<p>Folj lanken nedan for att logga in. Lanken galler en kort stund och kan bara anvandas en gang.</p>
<p><a href="{{ .ConfirmationURL }}">Logga in</a></p>
<p>Om du inte forsokte logga in kan du ignorera det har meddelandet.</p>
```

## Reset password

Subject:

```text
Aterstall ditt losenord
```

Body:

```html
<h2>Aterstall ditt losenord</h2>
<p>Vi har fatt en begaran om att aterstalla losenordet for ditt konto i Min Egenkontroll.</p>
<p>Folj lanken nedan for att valja ett nytt losenord.</p>
<p><a href="{{ .ConfirmationURL }}">Valj nytt losenord</a></p>
<p>Om du inte begarde detta kan du ignorera det har meddelandet.</p>
```

## Invite user

Subject:

```text
Du har blivit inbjuden till Min Egenkontroll
```

Body:

```html
<h2>Du har blivit inbjuden</h2>
<p>Du har blivit inbjuden att anvanda Min Egenkontroll.</p>
<p>Folj lanken nedan for att acceptera inbjudan.</p>
<p><a href="{{ .ConfirmationURL }}">Acceptera inbjudan</a></p>
<p>Om du inte vantade dig en inbjudan kan du ignorera det har meddelandet.</p>
```

## Change email address

Subject:

```text
Bekrafta din nya e-postadress
```

Body:

```html
<h2>Bekrafta din nya e-postadress</h2>
<p>Folj lanken nedan for att bekrafta att {{ .NewEmail }} ska vara din nya e-postadress i Min Egenkontroll.</p>
<p><a href="{{ .ConfirmationURL }}">Bekrafta ny e-postadress</a></p>
<p>Om du inte begarde detta kan du ignorera det har meddelandet.</p>
```

## Reauthentication

Subject:

```text
{{ .Token }} ar din verifieringskod
```

Body:

```html
<h2>Verifiera din identitet</h2>
<p>Anvand koden nedan for att verifiera din identitet. Koden galler en kort stund.</p>
<p><strong>{{ .Token }}</strong></p>
```

## Test efter andring

Testa minst:

- skapa nytt konto med e-post och losenord
- magic link
- glomt losenord
- inbjudan, om Supabase Auth invite-mail anvands senare

For varje test:

- mailet har svensk amnesrad
- texten ar pa svenska
- avsandaren ar `Min Egenkontroll <no-reply@minegenkontroll.se>`
- lanken fungerar och landar i appen
- gamla mail/lankar ignoreras vid test, eftersom de kan vara forbrukade eller utgangna
