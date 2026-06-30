create index if not exists organization_invitations_invited_by_idx
on public.organization_invitations(invited_by);

create index if not exists organization_invitations_accepted_by_idx
on public.organization_invitations(accepted_by);
