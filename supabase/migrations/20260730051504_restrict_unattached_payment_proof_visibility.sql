drop policy if exists payment_proofs_select_participants on public.payment_proofs;

create policy payment_proofs_select_owner_or_attached_participants
on public.payment_proofs
for select
to authenticated
using (
  uploaded_by = (select auth.uid())
  or (
    status = 'attached'
    and payment_id is not null
    and exists (
      select 1
      from public.installments i
      join public.loans l on l.id = i.loan_id
      where i.id = payment_proofs.installment_id
        and ((select auth.uid()) = l.borrower_id or (select auth.uid()) = l.lender_id)
    )
  )
);
