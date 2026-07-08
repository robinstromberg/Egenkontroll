# AGENTS.md - Min Egenkontroll

Detta dokument styr hur Codex och andra AI-agenter ska arbeta i repot. Det viktigaste är att skydda produktens kärnflöden: en liten livsmedelsverksamhet ska kunna öppna mobilen, se vad som ska göras, dokumentera kontrollen och visa historiken utan krångel.

## Projektet i korthet

Min Egenkontroll är en mobilförst SaaS-app för små livsmedelsverksamheter som restauranger, caféer, bagerier, foodtrucks och butiker. Appen ersätter pärmar, utspridda checklistor och osäker dokumentation med ett enkelt arbetsflöde:

1. ansvarig skapar verksamhet och kontrolltyper,
2. personalen ser dagens kontroller,
3. personalen dokumenterar på plats,
4. avvikelser och åtgärder sparas tydligt,
5. historik och delning kan visas vid kontroll.

Produkten ska kännas trygg, snabb och begriplig för användare utan teknisk bakgrund. Den är inte en teknisk formulärbyggare som råkar kunna dokumentera kontroller; den är ett arbetsverktyg för egenkontroll.

## Arbetsregler för Codex

- Läs relevant GitHub-issue, befintliga docs och berörda filer innan du ändrar något.
- Gör minsta säkra ändring som löser uppgiften. Undvik opportunistiska refaktorer.
- Ändra bara filer som hör till uppgiften. Lämna användarens övriga ändringar i fred.
- Gissa inte tekniska fakta. Inventera koden, databasen eller dokumentationen och markera osäkerhet när något inte kan verifieras.
- Fråga eller pausa vid risk för destruktiva åtgärder, dataförlust, auth/RLS-förändringar, produktionspåverkan eller otydlig scope.
- Kör relevanta kontroller efter ändring. För appkod är normal nivå `npm run typecheck`, `npm run lint` och `npm run build`. För docs-only räcker normalt diffkontroll och en tydlig notering om att appbygge inte behövdes.
- Sammanfatta ändrade filer, verifiering och kvarvarande risker i slutet.

## Särskilt skyddade områden

Ändra inte följande utan tydlig issue och extra försiktighet:

- Supabase Auth, sessionshantering och lösenords-/magic-link-flöden.
- RLS-policies, helper-funktioner och migrationer.
- Organisations- och rollbehörigheter.
- Historik, export, inspektörslänkar och delning.
- Kontrollsparning, avvikelser och bilagereferenser.
- Storage-bucketar, backup, återställning eller radering.
- Produktionsmiljö, Vercel environment variables och Supabase-projekt.

Service role-nycklar får aldrig in i frontend, repo, issues eller logs. Secrets, backupfiler, manifest från backupkörningar och testdata ska inte committas.

## Produktprinciper

- Mobil först: primära flöden ska fungera väl på smal skärm och med tumme.
- Få steg: användaren ska se nästa rimliga handling utan att läsa instruktioner länge.
- Samma mentala modell: det man bygger i editorn ska likna det personalen fyller i vid kontroll.
- Historik är helig: förändringar får inte förstöra spårbarhet, export, delning eller gamla kontroller.
- Säkert men inte tungt: skydda organisationsdata utan att göra vardagsflödet trögt.
- Svenska först i MVP: UI-copy, felmeddelanden och tomma lägen ska vara tydliga på svenska.
- Stressad användare är default: designa för någon som står i kök, butik eller servering och vill bli klar.

## UI- och frontendregler

- Återanvänd befintliga komponenter, CSS-mönster och ikon-/bildsystem innan du skapar nytt.
- Bevara den etablerade appstrukturen med dashboard-vyer och nedernavigering där den används.
- Kontrollera mobilbredd när layout ändras. Text får inte tryckas ihop, hamna utanför kanten eller döljas av nedernavigering.
- Knappar, tomma lägen och felmeddelanden ska beskriva vad användaren kan göra nu.
- Landningssida och appflöden har olika mål: landningssidan ska konvertera, appen ska få arbetet gjort.
- PWA ska inte lova offline-funktion som inte finns. Offline-läge ska vara tydligt och blockera osäker sparning.

## Datamodell och säkerhet

Den centrala modellen är organisationsbaserad. Data ska alltid kopplas till rätt `organization_id` och skyddas av RLS. Viktiga områden:

- profiler, organisationer, medlemskap och inbjudningar,
- kontrolltyper, kontrollpunkter/objekt och fältdefinitioner,
- kontrollkörningar, kontrollrader, avvikelser och bilagor,
- delningslänkar, exportloggar och inspektörsvyer.

Barnrader ska höra till rätt parent och organisation. Vid arkivering används i första hand `active=false` när historik kan finnas. Hård radering ska behandlas som riskfyllt.

## Supabase och Vercel

- Supabase används för Auth, Postgres, RLS, RPC och Storage.
- Vercel används för frontend/API-deploys och miljövariabler.
- Migrationer ska alltid skapas som nya filer. Ändra inte gamla applicerade migrationer.
- RLS- och RPC-ändringar ska ha smoke-test eller tydlig manuell verifiering.
- Storage-filer ingår inte i vanliga databasbackuper och kräver separat backup-rutin.
- Vercel Preview är rätt plats för visuell kontroll innan merge när UI ändras.

## När du är osäker

Välj det som:

1. skyddar kunddata,
2. bevarar historik och spårbarhet,
3. gör vardagsflödet enklare för en icke-teknisk användare,
4. håller ändringen liten och testbar,
5. lämnar en tydlig issue eller dokumenterad uppföljning för större förbättringar.
