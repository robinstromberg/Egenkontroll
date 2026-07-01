# Supabase operations runbook

Senast uppdaterad: 2026-06-30

Den har runbooken kompletterar Epic #172 och samlar de Supabase-steg som maste vara tydliga fore bredare beta eller skarp drift.

## Auth-mail och egen SMTP

Supabase standard-SMTP ar bara for test. For publik beta ska Auth-mail skickas via egen SMTP-provider.

Status 2026-06-30: custom SMTP ar aktiverad i Supabase och testmail har kommit fran `Min Egenkontroll <no-reply@minegenkontroll.se>`. Appen har ocksa fatt en submit-sparr sa magic link och glomt losenord inte skickar dubbla requests vid snabb dubbel-submit.

Svenska Auth-mallar for signup, magic link, glomt losenord och inbjudan finns i `docs/SUPABASE_AUTH_EMAIL_TEMPLATES.md`. Mallarna maste laggas in i Supabase Dashboard under Authentication > Emails > Templates eller via Supabase Management API.

Rekommenderad avsandare:

- `no-reply@minegenkontroll.se`
- avsandarnamn: `Min Egenkontroll`

Supabase-installning:

1. Valj SMTP-provider och skapa SMTP-uppgifter for auth-mail.
2. Oppna Supabase Dashboard > Authentication > Emails > SMTP.
3. Aktivera custom SMTP.
4. Fyll i host, port, user, password, sender email och sender name fran providern.
5. Skicka testmail for minst:
   - skapa konto
   - glomt losenord
   - magic link
   - invitation om invitation-mail aktiveras senare

Supabase-dokumentation: https://supabase.com/docs/guides/auth/auth-smtp

## DNS for maildoman

Verifierat 2026-06-30 for `minegenkontroll.se`:

- SPF finns: `v=spf1 include:_spf.protonmail.ch ~all`
- DMARC finns: `v=DMARC1; p=quarantine`
- Proton DKIM finns via CNAME for:
  - `protonmail._domainkey.minegenkontroll.se`
  - `protonmail2._domainkey.minegenkontroll.se`
  - `protonmail3._domainkey.minegenkontroll.se`

Nar Supabase Auth kopplas till en annan SMTP-provider an Proton maste providerns egna SPF/DKIM-krav laggas till och kontrolleras igen. SPF far normalt bara ha en `v=spf1`-post per doman, sa lagg nya include-regler i befintlig SPF-post i stallet for att skapa en extra SPF-post.

## Security Advisor

Senaste genomgang: 2026-06-30.

Security Advisor visar fortfarande avsiktliga varningar for tokenstyrda `SECURITY DEFINER`-RPC:er:

- `get_shared_control_runs`
- `get_shared_control_type_options`
- `log_shared_export`

De ar avsiktligt korbara for `anon`/`authenticated` eftersom inspektorslankar ska fungera utan app-inloggning. De begransas av hashad token, aktiv status, giltighetstid och delningsscope. Ta inte bort dessa grants utan att samtidigt bygga om inspektorsflodet.

Security Advisor visar ocksa en avsiktlig varning for `accept_organization_invitation`. Funktionen ar korbar for `authenticated` eftersom inloggade anvandare maste kunna acceptera en inbjudan. `public` och `anon` ar revokade, och funktionen validerar auth-user, profil-e-post, invitation-status, utgangstid och medlemskap innan den skriver.

Status 2026-06-30: leaked password protection ar aktiverat i Supabase Auth och Security Advisor-varningen ar borta.

Om installningen nagon gang stangs av igen ska den aktiveras fore publik beta:

1. Oppna Supabase Dashboard > Authentication > Security.
2. Aktivera leaked password protection.
3. Testa att normal inloggning, skapa konto och glomt losenord fortfarande fungerar.

Supabase-dokumentation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Performance Advisor

Atgardat 2026-06-30:

- Saknade FK-index for `organization_invitations.invited_by` och `organization_invitations.accepted_by` har lagts till i migration `20260630152000_add_invitation_user_indexes.sql`.

Kanda kvarvarande advisor-noteringar:

- Vissa index kan visas som oanvanda eftersom databasen fortfarande har lag trafik/testdata.
- Overlappande permissive policies finns for forsta-agare-flodet och admin-inbjudningar. Det ar avsiktligt tills onboarding/invitations-flodet byggs om.

## Backup och restore-test

Status 2026-06-30: backup- och restore-rutinen ar dokumenterad i `docs/SUPABASE_BACKUP_RESTORE_RUNBOOK.md`, dagliga scheduled backups har bekraftats i Dashboard, och forsta icke-destruktiva restore-testet ar godkant mot separat restore-projekt.

Supabase Pro ger dagliga backups. Enligt Supabase har Pro-projekt tillgang till de senaste 7 dagarna av dagliga backups. PITR ar ett separat add-on och ska bara aktiveras om verksamheten behover kortare aterstallningspunkt an daglig backup.

Supabase-dokumentation: https://supabase.com/docs/guides/platform/backups

Kort rutin fore publik beta:

1. Bekrafta i Supabase Dashboard > Database > Backups att dagliga backups visas for produktionsprojektet.
2. Dokumentera vilken backup-niva som anvands:
   - Daily backups, 7 dagar, eller
   - PITR med vald retention om add-on aktiveras senare.
3. Gor restore-test enligt `docs/SUPABASE_BACKUP_RESTORE_RUNBOOK.md` fore bredare publik beta och darefter minst efter storre schema-/driftandringar.
4. Efter restore-test:
   - verifiera att migrationer finns
   - verifiera att tabeller, RLS och storage metadata finns
   - logga in med testkonto
   - skapa en kontroll
   - exportera dokumentation
   - dokumentera datum, restore-kalla, restore-mal och resultat

Gor inte ett destruktivt restore-test mot produktionsprojektet nar riktiga kunddata finns.
