drop policy payment_proofs_select_participants on public.payment_proofs;

create policy payment_proofs_select_participants
on public.payment_proofs
for select
to authenticated
using (
  exists (
    select 1
    from public.installments as installment
    join public.loans as loan on loan.id = installment.loan_id
    where installment.id = payment_proofs.installment_id
      and (select auth.uid()) in (loan.lender_id, loan.borrower_id)
  )
);
