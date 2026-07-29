grant update (status, cancelled_at)
on table public.loan_requests
to authenticated;

create policy loan_requests_cancel_pending_borrower
on public.loan_requests
for update
to authenticated
using (
  borrower_id = (select auth.uid())
  and status = 'pending'
)
with check (
  borrower_id = (select auth.uid())
  and status = 'cancelled'
  and cancelled_at is not null
);
