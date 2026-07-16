# Framtida Vercel Root Directory för appen

Issue #304 flyttar den befintliga Vite/React-monoliten mekaniskt till npm-workspacen `apps/app`. Repositoryts kod är därmed förberedd för att det befintliga Vercel-projektet senare ska använda:

```text
Root Directory: apps/app
```

Den externa Vercel-inställningen ändras inte i issue #304. Root Directory får aktiveras först i ett separat, uttryckligen godkänt deploymentsteg efter att en preview har verifierat samma routes, API-funktioner, PWA-assets, authflöden och miljövariabler som tidigare.

När Root Directory aktiveras ska Vercel använda appens `package.json`, `vite.config.ts` och `vercel.json`. Installation sker fortsatt från monorepots lockfil. Inga domäner, miljövariabler, Supabase-inställningar eller publika URL:er ska ändras i samband med den mekaniska växlingen.

Rollback är att återställa Vercel-projektets Root Directory till reporoten, återgå till föregående fungerande deployment och reverta flytt-PR:n vid behov. Den fullständiga ordningen och verifieringsgränsen finns i `docs/strategy/WEB_APP_SEPARATION_PLAN.md`, etapp 3.
