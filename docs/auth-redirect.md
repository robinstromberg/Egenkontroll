# Auth Redirect Recovery

## Problem

Magic link-login can send the user to `http://localhost:3000` if Supabase Auth or the app environment points to the wrong URL.

## Code Change

The app uses `environment.appUrl` as `emailRedirectTo` when sending magic links.

`environment.appUrl` is read from:

```text
VITE_APP_URL
```

If the variable is missing, the app falls back to:

```text
https://egenkontroll-indol.vercel.app
```

The Vercel project currently also has these domains:

```text
https://egenkontroll-robinstrombergs-projects.vercel.app
https://egenkontroll-git-main-robinstrombergs-projects.vercel.app
```

## Vercel

Recommended environment variable for production:

```text
VITE_APP_URL=https://egenkontroll-indol.vercel.app
```

Use the matching preview URL only if a preview deployment must send magic links back to preview.

## Supabase Auth

In Supabase Auth settings, these should point to the public app:

- Site URL
- Redirect URLs / Additional Redirect URLs

Recommended URLs:

```text
https://egenkontroll-indol.vercel.app
https://egenkontroll-robinstrombergs-projects.vercel.app
https://egenkontroll-git-main-robinstrombergs-projects.vercel.app
http://localhost:5173
```

Remove `http://localhost:3000` unless it is actively used.

## Test

1. Wait for a new Vercel deployment.
2. Open the public Vercel app.
3. Request a new magic link.
4. Click the link in the email.
5. Confirm the link goes to the Vercel domain and creates a session.

Old magic links should not be reused. They may already be consumed or expired.
