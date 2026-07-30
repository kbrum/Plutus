create type public.payment_proof_status as enum (
  'pending',
  'uploaded',
  'attached'
);

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  installment_id uuid not null references public.installments(id) on delete cascade,
  payment_id uuid unique references public.payments(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  object_key text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  etag text,
  status public.payment_proof_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  uploaded_at timestamptz,
  attached_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_proofs_object_key_check check (
    object_key like 'proofs/%'
    and position('..' in object_key) = 0
  ),
  constraint payment_proofs_filename_check check (
    char_length(original_filename) between 1 and 255
  ),
  constraint payment_proofs_mime_type_check check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint payment_proofs_size_check check (
    size_bytes between 1 and 5242880
  ),
  constraint payment_proofs_status_check check (
    (status = 'pending' and uploaded_at is null and payment_id is null and attached_at is null)
    or (status = 'uploaded' and uploaded_at is not null and payment_id is null and attached_at is null)
    or (status = 'attached' and uploaded_at is not null and payment_id is not null and attached_at is not null)
  )
);

create index payment_proofs_installment_id_idx
on public.payment_proofs (installment_id);

create index payment_proofs_uploaded_by_idx
on public.payment_proofs (uploaded_by);

create index payment_proofs_pending_expiration_idx
on public.payment_proofs (expires_at)
where status = 'pending';

create trigger payment_proofs_set_updated_at
before update on public.payment_proofs
for each row execute function private.set_updated_at();

create function private.validate_payment_proof_payment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  payment_installment_id uuid;
begin
  if new.payment_id is null then
    return new;
  end if;

  select installment_id
  into payment_installment_id
  from public.payments
  where id = new.payment_id;

  if payment_installment_id is distinct from new.installment_id then
    raise exception 'O comprovante e o pagamento devem pertencer à mesma parcela';
  end if;

  return new;
end;
$$;

create trigger payment_proofs_validate_payment
before insert or update of payment_id, installment_id on public.payment_proofs
for each row execute function private.validate_payment_proof_payment();

alter table public.payment_proofs enable row level security;

create policy payment_proofs_select_participants
on public.payment_proofs
for select
to authenticated
using (
  exists (
    select 1
    from public.installments as installment
    join public.loans as loan on loan.id = installment.loan_id
    where installment.id = payment_proofs.installment_id
      and auth.uid() in (loan.lender_id, loan.borrower_id)
  )
);

revoke all on table public.payment_proofs from public, anon, authenticated;
grant select on table public.payment_proofs to authenticated;
