# Invitations: datamodell och RLS-design

Det här dokumentet beskriver föreslagen datamodell, RLS och migrationsplan för att bjuda in användare till en verksamhet. Det implementerar ingen ny migration eller UI-ändring.

Relaterad epic: #170.

## Mål

En owner/admin ska kunna bjuda in en person till en organization med rollen `admin` eller `staff`. Den inbjudna personen ska kunna acceptera med befintligt konto eller skapa konto och hamna i rätt verksamhet utan att få åtkomst till fel organization.

## Principer

- Inbjudningar tillhör en organization/workspace, inte en global profil.
- Rollen som tilldelas vid acceptans hör till `organization_memberships`.
- Inbjudans e-postadress ska normaliseras till lowercase och trimmas innan jämförelser.
- En inbjudan ska aldrig ge åtkomst i sig; åtkomst skapas först när ett aktivt membership skapas.
- Staff ska inte kunna skapa, uppdatera eller återkalla inbjudningar.
- RLS ska bygga på befintliga private helpers, särskilt `private.is_org_admin()` och `private.is_org_member()`.

## Föreslagen tabell

```sql
create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'staff')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(trim(email))),
  check (
    (status = 'accepted' and accepted_by is not null and accepted_at is not null)
    or (status <> 'accepted' and accepted_by is null and accepted_at is null)
  )
);
```

Rekommenderade index:

```sql
create index organization_invitations_org_idx
  on public.organization_invitations(organization_id);

create index organization_invitations_email_status_idx
  on public.organization_invitations(email, status);

create unique index organization_invitations_one_pending_per_email_idx
  on public.organization_invitations(organization_id, email)
  where status = 'pending';
```

## RLS-mål

Aktivera RLS på tabellen:

```sql
alter table public.organization_invitations enable row level security;
```

### Owner/admin

Owner/admin ska kunna:

- läsa inbjudningar i sin organization
- skapa inbjudningar med roll `admin` eller `staff`
- uppdatera pending-inbjudningar till `revoked`
- eventuellt uppdatera `expires_at` vid "skicka om"

Föreslagna policies:

```sql
create policy "admins can read organization invitations"
on public.organization_invitations
for select
to authenticated
using (private.is_org_admin(organization_id));

create policy "admins can create organization invitations"
on public.organization_invitations
for insert
to authenticated
with check (
  private.is_org_admin(organization_id)
  and invited_by = (select auth.uid())
  and role in ('admin', 'staff')
  and status = 'pending'
  and expires_at > now()
);

create policy "admins can revoke pending organization invitations"
on public.organization_invitations
for update
to authenticated
using (
  private.is_org_admin(organization_id)
  and status = 'pending'
)
with check (
  private.is_org_admin(organization_id)
  and status in ('pending', 'revoked')
);
```

### Invitee

Den inbjudna användaren behöver kunna se sin egen pending-inbjudan efter inloggning. RLS kan jämföra invitation email med `profiles.email`, inte med user-editable metadata.

Föreslagen helper:

```sql
create or replace function private.current_profile_email()
returns text
language sql
security definer
set search_path = public
as $$
  select lower(trim(profile.email))
  from public.profiles profile
  where profile.id = (select auth.uid())
$$;
```

Föreslagen invitee-policy:

```sql
create policy "invitees can read their pending invitations"
on public.organization_invitations
for select
to authenticated
using (
  status = 'pending'
  and expires_at > now()
  and email = private.current_profile_email()
);
```

Acceptans bör inte göras genom fri client-side `UPDATE` på invitation + `INSERT` i membership, eftersom det är lätt att skapa race conditions eller fel organization-koppling. Använd hellre en RPC som gör allt i en transaktion.

## Föreslagen acceptans-RPC

Föreslagen funktion:

```text
public.accept_organization_invitation(invitation_id uuid)
returns uuid -- organization_id
```

Funktionen ska:

1. kräva `auth.uid()`
2. läsa aktuell `profiles.email`
3. låsa invitation-raden `for update`
4. kontrollera `status = 'pending'`
5. kontrollera `expires_at > now()`
6. kontrollera att invitation email matchar aktuell profil-e-post
7. kontrollera att användaren inte redan har aktivt membership i samma organization
8. skapa eller uppdatera `organization_memberships` till `status = 'active'` med invitation role
9. sätta invitation `status = 'accepted'`, `accepted_by = auth.uid()`, `accepted_at = now()`
10. returnera `organization_id`

RPC:n bör vara `security definer` endast om den behövs för att göra medlemskapsinsert trots RLS. I så fall ska den ligga i `public` bara om den är hårt begränsad enligt stegen ovan, ha explicit `grant execute to authenticated`, och `revoke execute from public`.

## Email och token

Första säkra versionen kan fungera utan publik hemlig token om flödet kräver inloggning:

1. admin skapar invitation kopplad till e-post
2. appen skickar e-post med länk till `/login?invitation=<id>` eller `/#invitation=<id>`
3. användaren loggar in eller skapar konto med samma e-post
4. appen visar pending invitation och användaren accepterar

För friktionsfri acceptans via länk kan tabellen senare kompletteras med:

- `token_hash text`
- token skapas server-side
- endast hash lagras
- rå token skickas i e-postlänk

Tokenvarianten ska inte ge åtkomst utan att e-post/account fortfarande matchar eller att acceptansflödet säkert verifierar identitet.

## Edge cases

### Fel organization

En användare får bara acceptera invitation där normaliserad `profiles.email` matchar invitation email. Membership ska alltid skapas för invitationens `organization_id`, aldrig för ett client-skickat organization-id.

### Redan medlem

Om användaren redan har aktivt membership i organization:

- markera invitation som `accepted` om e-post och invitation är giltiga
- returnera organization_id
- skapa inte dubblett

Om användaren har disabled membership:

- första versionen bör stoppa med begripligt fel och låta owner/admin hantera återaktivering
- alternativ återaktivering kräver separat policybeslut

### Utgången inbjudan

Invitation med `expires_at <= now()` ska inte kunna accepteras. Den kan antingen:

- visas som utgången via admin-listan
- markeras `expired` av admin/UI eller framtida cron

### Återkallad inbjudan

`revoked` ska aldrig kunna accepteras. Endast owner/admin ska kunna återkalla pending-inbjudan i sin organization.

### Byte av e-post

Eftersom Supabase auth-e-post och `profiles.email` kan hamna ur synk bör acceptansflödet först säkerställa att profilen är uppdaterad efter login. Appen gör redan `ensureProfile(user)` vid session.

### Rolleskalering

En admin ska i första versionen kunna bjuda in `staff` och `admin`, men aldrig `owner`. Ägarbyte kräver separat successionsflöde.

## Migrationsplan

1. Skapa migration med `supabase migration new create_organization_invitations`.
2. Lägg till `organization_invitations` med checks, index, RLS och `set_updated_at` trigger.
3. Lägg till private helper för aktuell profile email om den behövs.
4. Lägg till RLS-policies för admin och invitee read.
5. Lägg till `accept_organization_invitation(invitation_id uuid)` som transaktionssäker acceptans-RPC.
6. Revoke/grant execute explicit för RPC och helpers.
7. Uppdatera `docs/database-schema.md` efter migration.
8. Lägg till RLS smoke-test för:
   - admin kan skapa invitation i egen organization
   - staff kan inte skapa invitation
   - invitee kan läsa egen pending invitation
   - annan användare kan inte läsa invitation
   - invitee kan acceptera och blir medlem i rätt organization
   - revoked/expired invitation kan inte accepteras
9. Kör Supabase advisors eller motsvarande säkerhetsgenomgång innan merge.
10. Först därefter bygg UI i `UsersView` och acceptansvy.

## Första UI-steg efter migration

- `UsersView` visar medlemmar och pending invitations.
- Owner/admin kan skapa invitation med e-post och roll.
- Owner/admin kan återkalla pending invitation.
- Inbjuden användare ser "Du har blivit inbjuden till ..." efter login.
- Efter acceptans ska workspace-väljaren kunna välja den nya organization.

## Out of scope för första versionen

- Ägarbyte.
- Betalning per användare.
- Publik acceptans utan login.
- Komplexa behörighetspaket utöver `owner`, `admin`, `staff`.
- Automatisk cron för att sätta `expired`, om UI kan tolka `expires_at`.
