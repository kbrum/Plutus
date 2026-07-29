drop policy if exists payments_insert_participant on public.payments;

revoke insert, update, delete on table public.payments from authenticated;

create unique index payments_one_reported_per_installment_idx
on public.payments (installment_id)
where status = 'reported';

create unique index payments_one_confirmed_per_installment_idx
on public.payments (installment_id)
where status = 'confirmed';

create or replace function public.report_installment_payment(
  p_installment_id uuid,
  p_paid_on date
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  installment_record public.installments%rowtype;
  loan_record public.loans%rowtype;
  payment_record public.payments%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if p_paid_on > current_date then
    raise exception 'A data do pagamento não pode estar no futuro';
  end if;

  select *
  into installment_record
  from public.installments
  where id = p_installment_id
  for update;

  if not found then
    raise exception 'Parcela não encontrada';
  end if;

  select *
  into loan_record
  from public.loans
  where id = installment_record.loan_id
  for update;

  if loan_record.borrower_id <> current_user_id then
    raise exception 'Somente o devedor pode informar este pagamento';
  end if;

  if loan_record.status not in ('active', 'overdue')
    or installment_record.status not in ('pending', 'overdue') then
    raise exception 'Esta parcela não está disponível para pagamento';
  end if;

  insert into public.payments (
    installment_id,
    amount,
    paid_at,
    reported_by,
    status
  )
  values (
    installment_record.id,
    installment_record.total_amount,
    p_paid_on::timestamp at time zone 'UTC',
    current_user_id,
    'reported'
  )
  returning * into payment_record;

  return payment_record;
end;
$$;

create or replace function public.record_installment_payment(
  p_installment_id uuid,
  p_paid_on date
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  installment_record public.installments%rowtype;
  loan_record public.loans%rowtype;
  payment_record public.payments%rowtype;
  paid_timestamp timestamptz := p_paid_on::timestamp at time zone 'UTC';
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if p_paid_on > current_date then
    raise exception 'A data do pagamento não pode estar no futuro';
  end if;

  select *
  into installment_record
  from public.installments
  where id = p_installment_id
  for update;

  if not found then
    raise exception 'Parcela não encontrada';
  end if;

  select *
  into loan_record
  from public.loans
  where id = installment_record.loan_id
  for update;

  if loan_record.lender_id <> current_user_id then
    raise exception 'Somente o credor pode registrar este pagamento';
  end if;

  if loan_record.status not in ('active', 'overdue')
    or installment_record.status not in ('pending', 'overdue') then
    raise exception 'Esta parcela não está disponível para pagamento';
  end if;

  if exists (
    select 1
    from public.payments
    where installment_id = installment_record.id
      and status = 'reported'
  ) then
    raise exception 'Existe uma solicitação de pagamento aguardando sua decisão';
  end if;

  insert into public.payments (
    installment_id,
    amount,
    paid_at,
    reported_by,
    status,
    confirmed_at,
    confirmed_by
  )
  values (
    installment_record.id,
    installment_record.total_amount,
    paid_timestamp,
    current_user_id,
    'confirmed',
    now(),
    current_user_id
  )
  returning * into payment_record;

  update public.installments
  set status = 'paid', paid_at = paid_timestamp
  where id = installment_record.id;

  if not exists (
    select 1
    from public.installments
    where loan_id = loan_record.id
      and status in ('pending', 'overdue')
  ) then
    update public.loans
    set status = 'paid', paid_at = paid_timestamp
    where id = loan_record.id;
  end if;

  return payment_record;
end;
$$;

create or replace function public.confirm_installment_payment(
  p_payment_id uuid
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  payment_record public.payments%rowtype;
  installment_record public.installments%rowtype;
  loan_record public.loans%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select *
  into payment_record
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Solicitação de pagamento não encontrada';
  end if;

  select *
  into installment_record
  from public.installments
  where id = payment_record.installment_id
  for update;

  select *
  into loan_record
  from public.loans
  where id = installment_record.loan_id
  for update;

  if loan_record.lender_id <> current_user_id then
    raise exception 'Somente o credor pode confirmar este pagamento';
  end if;

  if payment_record.status <> 'reported' then
    raise exception 'Esta solicitação já foi processada';
  end if;

  if loan_record.status not in ('active', 'overdue')
    or installment_record.status not in ('pending', 'overdue') then
    raise exception 'Esta parcela não está disponível para pagamento';
  end if;

  update public.payments
  set
    status = 'confirmed',
    confirmed_at = now(),
    confirmed_by = current_user_id
  where id = payment_record.id
  returning * into payment_record;

  update public.installments
  set status = 'paid', paid_at = payment_record.paid_at
  where id = installment_record.id;

  if not exists (
    select 1
    from public.installments
    where loan_id = loan_record.id
      and status in ('pending', 'overdue')
  ) then
    update public.loans
    set status = 'paid', paid_at = payment_record.paid_at
    where id = loan_record.id;
  end if;

  return payment_record;
end;
$$;

create or replace function public.reject_installment_payment(
  p_payment_id uuid
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  payment_record public.payments%rowtype;
  installment_record public.installments%rowtype;
  loan_record public.loans%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select *
  into payment_record
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Solicitação de pagamento não encontrada';
  end if;

  select *
  into installment_record
  from public.installments
  where id = payment_record.installment_id;

  select *
  into loan_record
  from public.loans
  where id = installment_record.loan_id;

  if loan_record.lender_id <> current_user_id then
    raise exception 'Somente o credor pode rejeitar este pagamento';
  end if;

  if payment_record.status <> 'reported' then
    raise exception 'Esta solicitação já foi processada';
  end if;

  update public.payments
  set status = 'rejected'
  where id = payment_record.id
  returning * into payment_record;

  return payment_record;
end;
$$;

revoke all on function public.report_installment_payment(uuid, date) from public;
revoke all on function public.record_installment_payment(uuid, date) from public;
revoke all on function public.confirm_installment_payment(uuid) from public;
revoke all on function public.reject_installment_payment(uuid) from public;

grant execute on function public.report_installment_payment(uuid, date) to authenticated;
grant execute on function public.record_installment_payment(uuid, date) to authenticated;
grant execute on function public.confirm_installment_payment(uuid) to authenticated;
grant execute on function public.reject_installment_payment(uuid) to authenticated;
