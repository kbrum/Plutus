create function public.create_payment_proof_upload(
  p_installment_id uuid,
  p_original_filename text,
  p_mime_type text,
  p_size_bytes bigint
)
returns public.payment_proofs
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  installment_record public.installments%rowtype;
  loan_record public.loans%rowtype;
  proof_record public.payment_proofs%rowtype;
  proof_id uuid := gen_random_uuid();
  file_extension text;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if char_length(btrim(p_original_filename)) not between 1 and 255
    or position('/' in p_original_filename) > 0
    or position('\\' in p_original_filename) > 0 then
    raise exception 'O nome do arquivo é inválido';
  end if;

  file_extension := case p_mime_type
    when 'image/jpeg' then 'jpg'
    when 'image/png' then 'png'
    when 'image/webp' then 'webp'
    else null
  end;

  if file_extension is null then
    raise exception 'O tipo do arquivo é inválido';
  end if;

  if p_size_bytes not between 1 and 5242880 then
    raise exception 'A imagem deve ter no máximo 5 MB';
  end if;

  select *
  into installment_record
  from public.installments
  where id = p_installment_id;

  if not found then
    raise exception 'Parcela não encontrada';
  end if;

  select *
  into loan_record
  from public.loans
  where id = installment_record.loan_id;

  if current_user_id not in (loan_record.borrower_id, loan_record.lender_id) then
    raise exception 'Você não participa deste empréstimo';
  end if;

  if loan_record.status not in ('active', 'overdue')
    or installment_record.status not in ('pending', 'overdue') then
    raise exception 'Esta parcela não está disponível para pagamento';
  end if;

  insert into public.payment_proofs (
    id,
    installment_id,
    uploaded_by,
    object_key,
    original_filename,
    mime_type,
    size_bytes
  )
  values (
    proof_id,
    installment_record.id,
    current_user_id,
    format('proofs/%s/%s/proof.%s', current_user_id, proof_id, file_extension),
    btrim(p_original_filename),
    p_mime_type,
    p_size_bytes
  )
  returning * into proof_record;

  return proof_record;
end;
$$;

create function public.mark_payment_proof_uploaded(
  p_proof_id uuid,
  p_etag text
)
returns public.payment_proofs
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  proof_record public.payment_proofs%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if char_length(btrim(p_etag)) not between 1 and 128 then
    raise exception 'O identificador do arquivo é inválido';
  end if;

  select *
  into proof_record
  from public.payment_proofs
  where id = p_proof_id
  for update;

  if not found or proof_record.uploaded_by <> current_user_id then
    raise exception 'Comprovante não encontrado';
  end if;

  if proof_record.status <> 'pending' then
    raise exception 'O comprovante já foi processado';
  end if;

  if proof_record.expires_at < now() then
    raise exception 'O envio do comprovante expirou';
  end if;

  update public.payment_proofs
  set
    etag = btrim(p_etag),
    status = 'uploaded',
    uploaded_at = now()
  where id = proof_record.id
  returning * into proof_record;

  return proof_record;
end;
$$;

create function private.attach_payment_proof(
  p_proof_id uuid,
  p_payment_id uuid,
  p_installment_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  proof_record public.payment_proofs%rowtype;
begin
  if p_proof_id is null then
    return;
  end if;

  select *
  into proof_record
  from public.payment_proofs
  where id = p_proof_id
  for update;

  if not found
    or proof_record.uploaded_by <> p_user_id
    or proof_record.installment_id <> p_installment_id then
    raise exception 'Comprovante não encontrado para esta parcela';
  end if;

  if proof_record.status <> 'uploaded' then
    raise exception 'O comprovante ainda não foi enviado';
  end if;

  update public.payment_proofs
  set
    payment_id = p_payment_id,
    status = 'attached',
    attached_at = now()
  where id = proof_record.id;
end;
$$;

drop function public.report_installment_payment(uuid, timestamptz);
drop function public.record_installment_payment(uuid, timestamptz);

create function public.report_installment_payment(
  p_installment_id uuid,
  p_paid_at timestamptz,
  p_proof_id uuid default null
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  installment_record public.installments%rowtype;
  loan_record public.loans%rowtype;
  payment_record public.payments%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if p_paid_at > now() then
    raise exception 'A data e o horário do pagamento não podem estar no futuro';
  end if;

  select *
  into installment_record
  from public.installments
  where id = p_installment_id
  for update;

  if not found then
    raise exception 'Parcela não encontrada';
  end if;

  select *
  into loan_record
  from public.loans
  where id = installment_record.loan_id
  for update;

  if loan_record.borrower_id <> current_user_id then
    raise exception 'Somente o devedor pode informar este pagamento';
  end if;

  if loan_record.status not in ('active', 'overdue')
    or installment_record.status not in ('pending', 'overdue') then
    raise exception 'Esta parcela não está disponível para pagamento';
  end if;

  insert into public.payments (
    installment_id,
    amount,
    paid_at,
    reported_by,
    status
  )
  values (
    installment_record.id,
    installment_record.total_amount,
    p_paid_at,
    current_user_id,
    'reported'
  )
  returning * into payment_record;

  perform private.attach_payment_proof(
    p_proof_id,
    payment_record.id,
    installment_record.id,
    current_user_id
  );

  return payment_record;
end;
$$;

create function public.record_installment_payment(
  p_installment_id uuid,
  p_paid_at timestamptz,
  p_proof_id uuid default null
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  installment_record public.installments%rowtype;
  loan_record public.loans%rowtype;
  payment_record public.payments%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if p_paid_at > now() then
    raise exception 'A data e o horário do pagamento não podem estar no futuro';
  end if;

  select *
  into installment_record
  from public.installments
  where id = p_installment_id
  for update;

  if not found then
    raise exception 'Parcela não encontrada';
  end if;

  select *
  into loan_record
  from public.loans
  where id = installment_record.loan_id
  for update;

  if loan_record.lender_id <> current_user_id then
    raise exception 'Somente o credor pode registrar este pagamento';
  end if;

  if loan_record.status not in ('active', 'overdue')
    or installment_record.status not in ('pending', 'overdue') then
    raise exception 'Esta parcela não está disponível para pagamento';
  end if;

  if exists (
    select 1
    from public.payments
    where installment_id = installment_record.id
      and status = 'reported'
  ) then
    raise exception 'Existe uma solicitação de pagamento aguardando sua decisão';
  end if;

  insert into public.payments (
    installment_id,
    amount,
    paid_at,
    reported_by,
    status,
    confirmed_at,
    confirmed_by
  )
  values (
    installment_record.id,
    installment_record.total_amount,
    p_paid_at,
    current_user_id,
    'confirmed',
    now(),
    current_user_id
  )
  returning * into payment_record;

  perform private.attach_payment_proof(
    p_proof_id,
    payment_record.id,
    installment_record.id,
    current_user_id
  );

  update public.installments
  set status = 'paid', paid_at = p_paid_at
  where id = installment_record.id;

  if not exists (
    select 1
    from public.installments
    where loan_id = loan_record.id
      and status in ('pending', 'overdue')
  ) then
    update public.loans
    set status = 'paid', paid_at = p_paid_at
    where id = loan_record.id;
  end if;

  return payment_record;
end;
$$;

revoke all on function public.create_payment_proof_upload(uuid, text, text, bigint) from public, anon;
revoke all on function public.mark_payment_proof_uploaded(uuid, text) from public, anon;
revoke all on function private.attach_payment_proof(uuid, uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.report_installment_payment(uuid, timestamptz, uuid) from public, anon;
revoke all on function public.record_installment_payment(uuid, timestamptz, uuid) from public, anon;

grant execute on function public.create_payment_proof_upload(uuid, text, text, bigint) to authenticated;
grant execute on function public.mark_payment_proof_uploaded(uuid, text) to authenticated;
grant execute on function public.report_installment_payment(uuid, timestamptz, uuid) to authenticated;
grant execute on function public.record_installment_payment(uuid, timestamptz, uuid) to authenticated;
