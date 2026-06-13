revoke execute on function public.get_shared_control_runs(text) from public;

grant execute on function public.get_shared_control_runs(text) to anon;
grant execute on function public.get_shared_control_runs(text) to authenticated;
