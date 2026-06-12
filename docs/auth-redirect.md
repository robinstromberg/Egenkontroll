# Auth redirect recovery

## Problem

Magic link-inloggningen kan skicka användaren till `http://localhost:3000` om Supabase Auth eller appens miljövariabler pekar fel.

## Kodändring

Appen använder nu `environment.appUrl` som `emailRedirectTo` i `sendEmailLink`.

`environment.appUrl` hämtas från:

```text
VITE_APP_URL
```

Om variabeln saknas faller appen tillbaka till:

```text
https://egenkontroll-robinstrombergs-projects.vercel.app
```

## Vercel

Sätt environment variable i Vercel-projektet:

```text
VITE_APP_URL=https://egenkontroll-robinstrombergs-projects.vercel.app
```

## Supabase Auth

I Supabase Auth settings behöver följande peka mot den publika appen:

- Site URL
- Redirect URLs / Additional Redirect URLs

Rekommenderade URLs:

```text
https://egenkontroll-robinstrombergs-projects.vercel.app
https://egenkontroll-git-main-robinstrombergs-projects.vercel.app
http://localhost:5173
```

`http://localhost:3000` bör tas bort om den inte används aktivt.

## Test

1. Vänta på ny Vercel-deploy eller trigga deploy när deploy-gränsen släpper.
2. Öppna den publika Vercel-appen.
3. Begär en ny magic link.
4. Klicka på länken i mejlet.
5. Kontrollera att länken går till Vercel-domänen och att sessionen skapas.

Gamla magic links ska inte återanvändas. De kan redan vara förbrukade eller ha gått ut.
