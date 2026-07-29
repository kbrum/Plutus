create function public.accept_loan_request(p_request_id uuid)
returns public.loan_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  request_record public.loan_requests%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select * into request_record
  from public.loan_requests
  where id = p_request_id
  for update;

  if not found or request_record.status <> 'pending' then
    raise exception 'A solicitação não está disponível para aceite';
  end if;

  if request_record.lender_id <> current_user_id then
    raise exception 'Somente o credor pode aceitar a solicitação';
  end if;

  update public.loan_requests
  set status = 'accepted', updated_at = now()
  where id = request_record.id
  returning * into request_record;

  return request_record;
end;
$$;

create function public.reject_loan_request(p_request_id uuid)
returns public.loan_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  request_record public.loan_requests%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select * into request_record
  from public.loan_requests
  where id = p_request_id
  for update;

  if not found or request_record.status <> 'pending' then
    raise exception 'A solicitação não está disponível para recusa';
  end if;

  if request_record.lender_id <> current_user_id then
    raise exception 'Somente o credor pode recusar a solicitação';
  end if;

  update public.loan_requests
  set status = 'rejected', updated_at = now()
  where id = request_record.id
  returning * into request_record;

  return request_record;
end;
$$;

create function public.accept_loan_proposal(p_proposal_id uuid)
returns public.loans
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  request_id uuid;
  request_record public.loan_requests%rowtype;
  proposal_record public.loan_proposals%rowtype;
  created_loan public.loans%rowtype;
  total_interest numeric(14, 2);
  total_amount numeric(14, 2);
  principal_piece numeric(14, 2);
  interest_piece numeric(14, 2);
  accumulated_principal numeric(14, 2) := 0;
  accumulated_interest numeric(14, 2) := 0;
  installment_number integer;
  due_month date;
  installment_due_date date;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select loan_request_id into request_id
  from public.loan_proposals
  where id = p_proposal_id;

  if not found then
    raise exception 'Proposta não encontrada';
  end if;

  select * into request_record
  from public.loan_requests
  where id = request_id
  for update;

  select * into proposal_record
  from public.loan_proposals
  where id = p_proposal_id
    and loan_request_id = request_id
  for update;

  if proposal_record.status <> 'pending' then
    raise exception 'A proposta não está disponível para aceite';
  end if;

  if request_record.status <> 'accepted' then
    raise exception 'A solicitação não está em negociação';
  end if;

  if current_user_id not in (request_record.borrower_id, request_record.lender_id)
    or proposal_record.proposed_by = current_user_id then
    raise exception 'Somente o destinatário pode aceitar a proposta';
  end if;

  if exists (
    select 1 from public.loans
    where loan_request_id = request_record.id
  ) then
    raise exception 'Esta solicitação já foi formalizada';
  end if;

  total_interest := round(
    proposal_record.amount * proposal_record.interest_rate / 100,
    2
  );
  total_amount := proposal_record.amount + total_interest;

  update public.loan_proposals
  set status = 'accepted'
  where id = proposal_record.id;

  insert into public.loans (
    loan_request_id,
    accepted_proposal_id,
    borrower_id,
    lender_id,
    principal_amount,
    total_amount,
    interest_rate,
    installment_count,
    first_due_date
  )
  values (
    request_record.id,
    proposal_record.id,
    request_record.borrower_id,
    request_record.lender_id,
    proposal_record.amount,
    total_amount,
    proposal_record.interest_rate,
    proposal_record.installment_count,
    proposal_record.first_due_date
  )
  returning * into created_loan;

  for installment_number in 1..proposal_record.installment_count loop
    if installment_number = proposal_record.installment_count then
      principal_piece := proposal_record.amount - accumulated_principal;
      interest_piece := total_interest - accumulated_interest;
    else
      principal_piece := round(
        proposal_record.amount / proposal_record.installment_count,
        2
      );
      interest_piece := round(
        total_interest / proposal_record.installment_count,
        2
      );
      accumulated_principal := accumulated_principal + principal_piece;
      accumulated_interest := accumulated_interest + interest_piece;
    end if;

    due_month := (
      date_trunc('month', proposal_record.first_due_date)::date
      + make_interval(months => installment_number - 1)
    )::date;
    installment_due_date := least(
      (due_month + interval '1 month - 1 day')::date,
      due_month + extract(day from proposal_record.first_due_date)::integer - 1
    );

    insert into public.installments (
      loan_id,
      installment_number,
      principal_amount,
      interest_amount,
      total_amount,
      due_date
    )
    values (
      created_loan.id,
      installment_number,
      principal_piece,
      interest_piece,
      principal_piece + interest_piece,
      installment_due_date
    );
  end loop;

  return created_loan;
end;
$$;

revoke all on function public.accept_loan_request(uuid) from public, anon;
revoke all on function public.reject_loan_request(uuid) from public, anon;
revoke all on function public.accept_loan_proposal(uuid) from public, anon;

grant execute on function public.accept_loan_request(uuid) to authenticated;
grant execute on function public.reject_loan_request(uuid) to authenticated;
grant execute on function public.accept_loan_proposal(uuid) to authenticated;
