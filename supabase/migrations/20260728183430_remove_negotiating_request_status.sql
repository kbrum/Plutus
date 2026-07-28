drop trigger if exists loan_proposals_mark_request_negotiating
on public.loan_proposals;

drop function if exists private.mark_request_negotiating();

drop policy loan_proposals_insert_participant
on public.loan_proposals;

drop policy loan_requests_insert_borrower
on public.loan_requests;

drop policy loan_requests_delete_pending_borrower
on public.loan_requests;

alter table public.loan_requests
  drop constraint loan_requests_cancellation_consistency;

update public.loan_requests
set status = 'accepted'
where status = 'negotiating';

alter table public.loan_requests
  alter column status drop default;

alter type public.loan_request_status
  rename to loan_request_status_old;

create type public.loan_request_status as enum (
  'pending',
  'accepted',
  'rejected',
  'cancelled'
);

alter table public.loan_requests
  alter column status type public.loan_request_status
  using status::text::public.loan_request_status,
  alter column status set default 'pending'::public.loan_request_status;

drop type public.loan_request_status_old;

alter table public.loan_requests
  add constraint loan_requests_cancellation_consistency check (
    (status = 'cancelled' and cancelled_at is not null)
    or (status <> 'cancelled' and cancelled_at is null)
  );

create policy loan_requests_insert_borrower
on public.loan_requests
for insert
to authenticated
with check (
  borrower_id = (select auth.uid())
  and borrower_id <> lender_id
  and status = 'pending'
  and cancelled_at is null
  and exists (
    select 1
    from public.profiles as lender
    where lender.id = lender_id
      and lender.is_active
  )
);

create policy loan_requests_delete_pending_borrower
on public.loan_requests
for delete
to authenticated
using (
  borrower_id = (select auth.uid())
  and status = 'pending'
);

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
      and request.status = 'accepted'
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
