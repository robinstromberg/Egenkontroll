revoke execute on function public.accept_organization_invitation(uuid) from public;
revoke execute on function public.accept_organization_invitation(uuid) from anon;
grant execute on function public.accept_organization_invitation(uuid) to authenticated;
