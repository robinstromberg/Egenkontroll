# Egenkontroll

Mobilförst SaaS-webapp för digital egenkontroll i livsmedelsverksamheter.

## Teknisk grund

- React
- TypeScript
- Vite
- Vercel
- Supabase för kommande auth, databas och storage

## Kom igång lokalt

```bash
npm install
npm run dev
```

För lokal miljö, kopiera `.env.example` till `.env.local` och fyll i Supabase-värden när de ska användas.

```bash
cp .env.example .env.local
```

## Kvalitetskommandon

```bash
npm run typecheck
npm run lint
npm run build
```

## Arbetsregler

Läs `AGENTS.md` innan du implementerar nya issues. Projektet ska byggas issue för issue med tydlig koppling till planerad MVP.
