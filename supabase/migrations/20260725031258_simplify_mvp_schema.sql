drop policy profiles_select_authenticated on public.profiles;
drop policy loan_requests_select_participants on public.loan_requests;
drop policy loan_proposals_select_participants on public.loan_proposals;
drop policy loans_select_participants on public.loans;
drop policy installments_select_loan_participants on public.installments;
drop policy payments_select_loan_participants on public.payments;

create policy profiles_select_authenticated
on public.profiles
for select
to authenticated
using (is_active or id = (select auth.uid()));

create policy loan_requests_select_participants
on public.loan_requests
for select
to authenticated
using (
  borrower_id = (select auth.uid())
  or lender_id = (select auth.uid())
);

create policy loan_proposals_select_participants
on public.loan_proposals
for select
to authenticated
using (
  exists (
    select 1
    from public.loan_requests as request
    where request.id = loan_request_id
      and (
        request.borrower_id = (select auth.uid())
        or request.lender_id = (select auth.uid())
      )
  )
);

create policy loans_select_participants
on public.loans
for select
to authenticated
using (
  borrower_id = (select auth.uid())
  or lender_id = (select auth.uid())
);

create policy installments_select_loan_participants
on public.installments
for select
to authenticated
using (
  exists (
    select 1
    from public.loans as loan
    where loan.id = loan_id
      and (
        loan.borrower_id = (select auth.uid())
        or loan.lender_id = (select auth.uid())
      )
  )
);

create policy payments_select_loan_participants
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.installments as installment
    join public.loans as loan on loan.id = installment.loan_id
    where installment.id = installment_id
      and (
        loan.borrower_id = (select auth.uid())
        or loan.lender_id = (select auth.uid())
      )
  )
);

drop table public.notifications;
drop table public.audit_logs;

revoke update (avatar_url, bio) on public.profiles from authenticated;

alter table public.profiles
  drop column avatar_url,
  drop column bio,
  drop column role;

alter table public.loan_proposals
  drop column expires_at,
  drop column interest_calculation;

alter table public.loans
  drop column interest_calculation;

drop function private.is_admin();
drop type public.app_role;
drop type public.interest_calculation;

comment on table public.profiles is 'Minimal user directory for authenticated members.';
