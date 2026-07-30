create function private.enforce_payment_proof_upload_quota()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.payment_proofs
    where uploaded_by = new.uploaded_by
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Muitas tentativas de envio. Aguarde antes de tentar novamente';
  end if;

  if (
    select count(*)
    from public.payment_proofs
    where uploaded_by = new.uploaded_by
      and created_at > now() - interval '1 day'
  ) >= 20 then
    raise exception 'Limite diário de comprovantes atingido';
  end if;

  return new;
end;
$$;

create trigger payment_proofs_enforce_upload_quota
before insert on public.payment_proofs
for each row execute function private.enforce_payment_proof_upload_quota();

revoke all on function private.enforce_payment_proof_upload_quota() from public, anon, authenticated;
