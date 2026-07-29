drop function public.report_installment_payment(uuid, date);
drop function public.record_installment_payment(uuid, date);

create or replace function public.report_installment_payment(
  p_installment_id uuid,
  p_paid_at timestamptz
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

  if p_paid_at > now() then
    raise exception 'A data e o horário do pagamento não podem estar no futuro';
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
    p_paid_at,
    current_user_id,
    'reported'
  )
  returning * into payment_record;

  return payment_record;
end;
$$;

create or replace function public.record_installment_payment(
  p_installment_id uuid,
  p_paid_at timestamptz
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

  if p_paid_at > now() then
    raise exception 'A data e o horário do pagamento não podem estar no futuro';
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
    p_paid_at,
    current_user_id,
    'confirmed',
    now(),
    current_user_id
  )
  returning * into payment_record;

  update public.installments
  set status = 'paid', paid_at = p_paid_at
  where id = installment_record.id;

  if not exists (
    select 1
    from public.installments
    where loan_id = loan_record.id
      and status in ('pending', 'overdue')
  ) then
    update public.loans
    set status = 'paid', paid_at = p_paid_at
    where id = loan_record.id;
  end if;

  return payment_record;
end;
$$;

revoke all on function public.report_installment_payment(uuid, timestamptz) from public, anon;
revoke all on function public.record_installment_payment(uuid, timestamptz) from public, anon;

grant execute on function public.report_installment_payment(uuid, timestamptz) to authenticated;
grant execute on function public.record_installment_payment(uuid, timestamptz) to authenticated;

create or replace function private.validate_payment_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  loan_activated_at timestamptz;
begin
  select loan.activated_at
  into loan_activated_at
  from public.installments as installment
  join public.loans as loan on loan.id = installment.loan_id
  where installment.id = new.installment_id;

  if new.paid_at > now() then
    raise exception 'A data e o horário do pagamento não podem estar no futuro';
  end if;

  if new.paid_at < loan_activated_at then
    raise exception 'A data e o horário do pagamento não podem ser anteriores ao empréstimo';
  end if;

  return new;
end;
$$;
