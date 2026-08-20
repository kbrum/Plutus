create or replace function private.enforce_payment_proof_upload_quota()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
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
