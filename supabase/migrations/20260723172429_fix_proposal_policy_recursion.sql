create function private.proposal_belongs_to_request(
  proposal_id uuid,
  request_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.loan_proposals
    where id = proposal_id
      and loan_request_id = request_id
  );
$$;

revoke all on function private.proposal_belongs_to_request(uuid, uuid)
from public, anon, authenticated;
grant execute on function private.proposal_belongs_to_request(uuid, uuid)
to authenticated;

drop policy loan_proposals_insert_participant on public.loan_proposals;

create policy loan_proposals_insert_participant
on public.loan_proposals
for insert
to authenticated
with check (
  proposed_by = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1
    from public.loan_requests as request
    where request.id = loan_request_id
      and request.status in ('pending', 'negotiating')
      and (
        request.borrower_id = (select auth.uid())
        or request.lender_id = (select auth.uid())
      )
  )
  and (
    parent_proposal_id is null
    or private.proposal_belongs_to_request(
      parent_proposal_id,
      loan_request_id
    )
  )
);
