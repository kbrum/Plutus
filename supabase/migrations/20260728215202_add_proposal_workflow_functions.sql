create unique index loan_proposals_one_pending_per_request_idx
on public.loan_proposals (loan_request_id)
where status = 'pending';

drop policy if exists loan_proposals_insert_participant
on public.loan_proposals;

revoke insert on table public.loan_proposals from authenticated;

create function public.create_loan_proposal(
  p_loan_request_id uuid,
  p_amount numeric,
  p_interest_rate numeric,
  p_installment_count smallint,
  p_first_due_date date,
  p_message text,
  p_parent_proposal_id uuid default null
)
returns public.loan_proposals
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  request_record public.loan_requests%rowtype;
  parent_record public.loan_proposals%rowtype;
  created_proposal public.loan_proposals%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select *
  into request_record
  from public.loan_requests
  where id = p_loan_request_id
  for update;

  if not found then
    raise exception 'Solicitação não encontrada';
  end if;

  if request_record.status <> 'accepted' then
    raise exception 'A solicitação não está disponível para negociação';
  end if;

  if current_user_id not in (request_record.borrower_id, request_record.lender_id) then
    raise exception 'Usuário não participa desta solicitação';
  end if;

  if exists (
    select 1
    from public.loans
    where loan_request_id = p_loan_request_id
  ) then
    raise exception 'Esta solicitação já foi formalizada';
  end if;

  if p_parent_proposal_id is not null then
    select *
    into parent_record
    from public.loan_proposals
    where id = p_parent_proposal_id
      and loan_request_id = p_loan_request_id
    for update;

    if not found or parent_record.status <> 'pending' then
      raise exception 'A proposta anterior não está disponível';
    end if;

    if parent_record.proposed_by = current_user_id then
      raise exception 'Não é possível contrapropor a própria proposta';
    end if;

    update public.loan_proposals
    set status = 'superseded'
    where id = parent_record.id;
  elsif exists (
    select 1
    from public.loan_proposals
    where loan_request_id = p_loan_request_id
      and status = 'pending'
  ) then
    raise exception 'Já existe uma proposta aguardando resposta';
  end if;

  insert into public.loan_proposals (
    loan_request_id,
    parent_proposal_id,
    proposed_by,
    amount,
    interest_rate,
    installment_count,
    first_due_date,
    message
  )
  values (
    p_loan_request_id,
    p_parent_proposal_id,
    current_user_id,
    p_amount,
    p_interest_rate,
    p_installment_count,
    p_first_due_date,
    nullif(trim(p_message), '')
  )
  returning * into created_proposal;

  return created_proposal;
end;
$$;

create function public.withdraw_loan_proposal(p_proposal_id uuid)
returns public.loan_proposals
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  proposal_record public.loan_proposals%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select *
  into proposal_record
  from public.loan_proposals
  where id = p_proposal_id
  for update;

  if not found or proposal_record.status <> 'pending' then
    raise exception 'A proposta não está disponível para retirada';
  end if;

  if proposal_record.proposed_by <> current_user_id then
    raise exception 'Somente o autor pode retirar a proposta';
  end if;

  update public.loan_proposals
  set status = 'withdrawn'
  where id = proposal_record.id
  returning * into proposal_record;

  return proposal_record;
end;
$$;

create function public.reject_loan_proposal(p_proposal_id uuid)
returns public.loan_proposals
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  proposal_record public.loan_proposals%rowtype;
  request_record public.loan_requests%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select *
  into proposal_record
  from public.loan_proposals
  where id = p_proposal_id
  for update;

  if not found or proposal_record.status <> 'pending' then
    raise exception 'A proposta não está disponível para rejeição';
  end if;

  select *
  into request_record
  from public.loan_requests
  where id = proposal_record.loan_request_id;

  if current_user_id not in (request_record.borrower_id, request_record.lender_id)
    or proposal_record.proposed_by = current_user_id then
    raise exception 'Somente o destinatário pode rejeitar a proposta';
  end if;

  update public.loan_proposals
  set status = 'rejected'
  where id = proposal_record.id
  returning * into proposal_record;

  return proposal_record;
end;
$$;

revoke all on function public.create_loan_proposal(
  uuid,
  numeric,
  numeric,
  smallint,
  date,
  text,
  uuid
) from public, anon;
revoke all on function public.withdraw_loan_proposal(uuid) from public, anon;
revoke all on function public.reject_loan_proposal(uuid) from public, anon;

grant execute on function public.create_loan_proposal(
  uuid,
  numeric,
  numeric,
  smallint,
  date,
  text,
  uuid
) to authenticated;
grant execute on function public.withdraw_loan_proposal(uuid) to authenticated;
grant execute on function public.reject_loan_proposal(uuid) to authenticated;
