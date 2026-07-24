create index payments_confirmed_by_idx on public.payments (confirmed_by);

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
