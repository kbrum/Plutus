drop index public.loan_proposals_status_idx;
drop index public.loan_proposals_one_pending_per_request_idx;

alter table public.loan_proposals
  alter column status drop default;

alter type public.loan_proposal_status
  rename to loan_proposal_status_old;

create type public.loan_proposal_status as enum (
  'pending',
  'accepted',
  'rejected',
  'withdrawn',
  'superseded'
);

alter table public.loan_proposals
  alter column status type public.loan_proposal_status
  using status::text::public.loan_proposal_status;

alter table public.loan_proposals
  alter column status set default 'pending'::public.loan_proposal_status;

drop type public.loan_proposal_status_old;

create index loan_proposals_status_idx
on public.loan_proposals (status);

create unique index loan_proposals_one_pending_per_request_idx
on public.loan_proposals (loan_request_id)
where status = 'pending';
