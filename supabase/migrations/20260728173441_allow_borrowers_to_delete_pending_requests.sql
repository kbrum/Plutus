grant delete on table public.loan_requests to authenticated;

create policy loan_requests_delete_pending_borrower
on public.loan_requests
for delete
to authenticated
using (
  borrower_id = (select auth.uid())
  and status = 'pending'
);
