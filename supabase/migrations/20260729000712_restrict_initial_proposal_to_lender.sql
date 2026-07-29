create function private.validate_initial_proposal_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.parent_proposal_id is null
    and not exists (
      select 1
      from public.loan_requests
      where id = new.loan_request_id
        and lender_id = new.proposed_by
        and status = 'accepted'
    ) then
    raise exception 'Somente o credor pode enviar a proposta inicial';
  end if;

  return new;
end;
$$;

create trigger loan_proposals_validate_initial_author
before insert on public.loan_proposals
for each row execute function private.validate_initial_proposal_author();
