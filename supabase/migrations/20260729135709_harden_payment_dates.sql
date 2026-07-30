create or replace function private.validate_payment_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  loan_activated_on date;
  payment_date date := (new.paid_at at time zone 'UTC')::date;
begin
  select loan.activated_at::date
  into loan_activated_on
  from public.installments as installment
  join public.loans as loan on loan.id = installment.loan_id
  where installment.id = new.installment_id;

  if payment_date > current_date then
    raise exception 'A data do pagamento não pode estar no futuro';
  end if;

  if payment_date < loan_activated_on then
    raise exception 'A data do pagamento não pode ser anterior ao empréstimo';
  end if;

  return new;
end;
$$;

create trigger payments_validate_date_before_insert
before insert on public.payments
for each row execute function private.validate_payment_date();

create or replace function private.set_loan_payoff_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  latest_payment_at timestamptz;
begin
  if new.status = 'paid' and old.status <> 'paid' then
    select max(installment.paid_at)
    into latest_payment_at
    from public.installments as installment
    where installment.loan_id = new.id
      and installment.status = 'paid';

    if latest_payment_at is null then
      raise exception 'Não é possível quitar um empréstimo sem parcelas pagas';
    end if;

    new.paid_at := latest_payment_at;
  end if;

  return new;
end;
$$;

create trigger loans_set_payoff_date_before_update
before update of status on public.loans
for each row execute function private.set_loan_payoff_date();
