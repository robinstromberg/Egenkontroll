# Egenkontroll

Min Egenkontroll är en mobilförst tjänst för egenkontroll i livsmedelsverksamheter. Kärnprodukten är en SaaS-app, och runt den byggs en publik plattform med kunskap, mallar, checklistor, verktyg och andra resurser.

## Strategi

Den pågående strategiomläggningen styrs av `docs/strategy/PIVOT.md`.

Nuvarande tekniska struktur är ännu inte den långsiktiga målstrukturen. Större förändringar av publik webb, appseparation, varumärke, designsystem eller sidtyper ska följa genomförandeordningen i strategidokumentet.

## Teknisk grund

- React
- TypeScript
- Vite
- Vercel
- Supabase för auth, databas och storage

Produktionsappen ligger i npm-workspacen `apps/app`. Delade brand- och designsystempaket ligger i `packages/`. Kommandona nedan körs fortsatt från reporoten och delegerar till app-workspacen när det är relevant.

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

Läs `AGENTS.md` innan du implementerar nya issues. Läs även `docs/strategy/PIVOT.md` när arbetet rör strategi, publik webb, SEO, innehåll, varumärke, designsystem, wireframes, repo-separation eller större appredesign.

Projektet ska byggas issue för issue med tydlig koppling till aktuell fas och prioritet.
