comment on function public.get_shared_control_runs(raw_token text) is
  'Intentional read-only inspector access RPC. Public execution is required for temporary share links, but access is restricted by hashed token, active status, validity period and included control type scope.';
