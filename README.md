# Egenkontroll

Mobilförst SaaS-webapp för digital egenkontroll i livsmedelsverksamheter.

## Teknisk grund

- React
- TypeScript
- Vite
- Vercel
- Supabase för auth, databas och storage

## Kom igång lokalt

```bash
npm install
npm run dev
```

För lokal miljö, kopiera `.env.example` till `.env.local` och fyll i Supabase-värden när de ska användas.

```bash
cp .env.example .env.local
```

## Auth redirect

Magic link-inloggning använder `VITE_APP_URL` som redirect-adress.

I Vercel ska `VITE_APP_URL` peka på den publika appdomänen, till exempel:

```text
https://egenkontroll-indol.vercel.app
```

I Supabase Auth behöver samma domän vara tillåten som Site URL/Redirect URL. `localhost` ska bara användas för lokal utveckling.

Efter ändring av redirect-inställningar behöver en ny magic link skickas. Gamla länkar kan vara ogiltiga eller redan förbrukade.

## Kvalitetskommandon

```bash
npm run typecheck
npm run lint
npm run build
```

## Arbetsregler

Läs `AGENTS.md` innan du implementerar nya issues. Projektet ska byggas issue för issue med tydlig koppling till planerad MVP.
