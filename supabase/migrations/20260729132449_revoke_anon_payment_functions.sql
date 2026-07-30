revoke all on function public.report_installment_payment(uuid, date) from anon;
revoke all on function public.record_installment_payment(uuid, date) from anon;
revoke all on function public.confirm_installment_payment(uuid) from anon;
revoke all on function public.reject_installment_payment(uuid) from anon;
