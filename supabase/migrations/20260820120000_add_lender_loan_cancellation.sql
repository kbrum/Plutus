alter table public.loans
  add column cancelled_at timestamptz,
  add column cancelled_by uuid references public.profiles (id) on delete restrict,
  add column cancellation_reason text;

update public.loans
set
  cancelled_at = created_at,
  cancelled_by = lender_id
where status = 'cancelled';

alter table public.loans
  add constraint loans_cancellation_reason_length check (
    cancellation_reason is null or char_length(cancellation_reason) <= 1000
  ),
  add constraint loans_cancellation_consistency check (
    (
      status = 'cancelled'
      and cancelled_at is not null
      and cancelled_by is not null
    )
    or (
      status <> 'cancelled'
      and cancelled_at is null
      and cancelled_by is null
      and cancellation_reason is null
    )
  );

create function public.cancel_loan(
  p_loan_id uuid,
  p_reason text default null
)
returns public.loans
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  loan_record public.loans%rowtype;
  normalized_reason text := nullif(btrim(p_reason), '');
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if normalized_reason is not null and char_length(normalized_reason) > 1000 then
    raise exception 'O motivo do cancelamento deve ter no máximo 1000 caracteres';
  end if;

  select *
  into loan_record
  from public.loans
  where id = p_loan_id
  for update;

  if not found then
    raise exception 'Empréstimo não encontrado';
  end if;

  if loan_record.lender_id <> current_user_id then
    raise exception 'Somente o credor pode cancelar o empréstimo';
  end if;

  if loan_record.status not in ('active', 'overdue') then
    raise exception 'Este empréstimo não está disponível para cancelamento';
  end if;

  update public.payments
  set status = 'rejected'
  where status = 'reported'
    and installment_id in (
      select id
      from public.installments
      where loan_id = loan_record.id
    );

  update public.installments
  set status = 'cancelled'
  where loan_id = loan_record.id
    and status in ('pending', 'overdue');

  update public.loans
  set
    status = 'cancelled',
    cancelled_at = now(),
    cancelled_by = current_user_id,
    cancellation_reason = normalized_reason
  where id = loan_record.id
  returning * into loan_record;

  return loan_record;
end;
$$;

revoke all on function public.cancel_loan(uuid, text) from public, anon;
grant execute on function public.cancel_loan(uuid, text) to authenticated;
