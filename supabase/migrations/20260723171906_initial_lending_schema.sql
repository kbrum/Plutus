create schema if not exists private;

create type public.app_role as enum ('user', 'admin');
create type public.loan_request_status as enum (
  'pending',
  'negotiating',
  'accepted',
  'rejected',
  'cancelled'
);
create type public.loan_proposal_status as enum (
  'pending',
  'accepted',
  'rejected',
  'withdrawn',
  'superseded',
  'expired'
);
create type public.interest_calculation as enum ('simple', 'compound');
create type public.loan_status as enum ('active', 'paid', 'overdue', 'cancelled');
create type public.installment_status as enum ('pending', 'paid', 'overdue', 'cancelled');
create type public.payment_status as enum ('reported', 'confirmed', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_url text,
  bio text check (bio is null or char_length(bio) <= 280),
  role public.app_role not null default 'user',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.loan_requests (
  id uuid primary key default gen_random_uuid(),
  borrower_id uuid not null references public.profiles (id) on delete restrict,
  lender_id uuid not null references public.profiles (id) on delete restrict,
  requested_amount numeric(14, 2) not null check (requested_amount > 0),
  message text check (message is null or char_length(message) <= 1000),
  status public.loan_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint loan_requests_different_participants check (borrower_id <> lender_id),
  constraint loan_requests_cancellation_consistency check (
    (status = 'cancelled' and cancelled_at is not null)
    or (status <> 'cancelled' and cancelled_at is null)
  )
);

create table public.loan_proposals (
  id uuid primary key default gen_random_uuid(),
  loan_request_id uuid not null references public.loan_requests (id) on delete restrict,
  parent_proposal_id uuid references public.loan_proposals (id) on delete restrict,
  proposed_by uuid not null references public.profiles (id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  interest_rate numeric(7, 4) not null check (interest_rate >= 0 and interest_rate <= 100),
  interest_calculation public.interest_calculation not null default 'simple',
  installment_count smallint not null check (installment_count between 1 and 360),
  first_due_date date not null,
  message text check (message is null or char_length(message) <= 1000),
  status public.loan_proposal_status not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  loan_request_id uuid not null unique references public.loan_requests (id) on delete restrict,
  accepted_proposal_id uuid not null unique references public.loan_proposals (id) on delete restrict,
  borrower_id uuid not null references public.profiles (id) on delete restrict,
  lender_id uuid not null references public.profiles (id) on delete restrict,
  principal_amount numeric(14, 2) not null check (principal_amount > 0),
  total_amount numeric(14, 2) not null check (total_amount >= principal_amount),
  interest_rate numeric(7, 4) not null check (interest_rate >= 0 and interest_rate <= 100),
  interest_calculation public.interest_calculation not null,
  installment_count smallint not null check (installment_count between 1 and 360),
  first_due_date date not null,
  status public.loan_status not null default 'active',
  created_at timestamptz not null default now(),
  activated_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint loans_different_participants check (borrower_id <> lender_id),
  constraint loans_payment_consistency check (
    (status = 'paid' and paid_at is not null)
    or (status <> 'paid' and paid_at is null)
  )
);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans (id) on delete restrict,
  installment_number smallint not null check (installment_number > 0),
  principal_amount numeric(14, 2) not null check (principal_amount >= 0),
  interest_amount numeric(14, 2) not null check (interest_amount >= 0),
  total_amount numeric(14, 2) not null check (total_amount > 0),
  due_date date not null,
  status public.installment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  constraint installments_number_per_loan unique (loan_id, installment_number),
  constraint installments_amount_consistency check (
    total_amount = principal_amount + interest_amount
  ),
  constraint installments_payment_consistency check (
    (status = 'paid' and paid_at is not null)
    or (status <> 'paid' and paid_at is null)
  )
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  installment_id uuid not null references public.installments (id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  paid_at timestamptz not null,
  reported_by uuid not null references public.profiles (id) on delete restrict,
  status public.payment_status not null default 'reported',
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles (id) on delete restrict,
  constraint payments_confirmation_consistency check (
    (status = 'confirmed' and confirmed_at is not null and confirmed_by is not null)
    or (status <> 'confirmed' and confirmed_at is null and confirmed_by is null)
  )
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete restrict,
  type text not null check (char_length(type) between 1 and 80),
  resource_type text check (resource_type is null or char_length(resource_type) <= 80),
  resource_id uuid,
  title text not null check (char_length(title) between 1 and 160),
  message text not null check (char_length(message) between 1 and 500),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete restrict,
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id uuid not null,
  action text not null check (char_length(action) between 1 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index loan_requests_borrower_id_idx on public.loan_requests (borrower_id);
create index loan_requests_lender_id_idx on public.loan_requests (lender_id);
create index loan_requests_status_idx on public.loan_requests (status);
create index loan_proposals_request_id_idx on public.loan_proposals (loan_request_id);
create index loan_proposals_proposed_by_idx on public.loan_proposals (proposed_by);
create index loan_proposals_parent_id_idx on public.loan_proposals (parent_proposal_id);
create index loan_proposals_status_idx on public.loan_proposals (status);
create index loans_borrower_id_idx on public.loans (borrower_id);
create index loans_lender_id_idx on public.loans (lender_id);
create index loans_status_idx on public.loans (status);
create index installments_loan_id_idx on public.installments (loan_id);
create index installments_due_date_idx on public.installments (due_date);
create index installments_status_idx on public.installments (status);
create index payments_installment_id_idx on public.payments (installment_id);
create index payments_reported_by_idx on public.payments (reported_by);
create index payments_status_idx on public.payments (status);
create index notifications_recipient_id_idx on public.notifications (recipient_id);
create index notifications_unread_idx on public.notifications (recipient_id, created_at desc)
  where read_at is null;
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger loan_requests_set_updated_at
before update on public.loan_requests
for each row execute function private.set_updated_at();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Novo usuario'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, display_name)
select
  users.id,
  coalesce(
    nullif(trim(users.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
    'Novo usuario'
  )
from auth.users as users
on conflict (id) do nothing;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and is_active
  );
$$;

create function private.mark_request_negotiating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.loan_requests
  set status = 'negotiating'
  where id = new.loan_request_id
    and status = 'pending';
  return new;
end;
$$;

create trigger loan_proposals_mark_request_negotiating
after insert on public.loan_proposals
for each row execute function private.mark_request_negotiating();

alter table public.profiles enable row level security;
alter table public.loan_requests enable row level security;
alter table public.loan_proposals enable row level security;
alter table public.loans enable row level security;
alter table public.installments enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_authenticated
on public.profiles
for select
to authenticated
using (is_active or id = (select auth.uid()) or (select private.is_admin()));

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy loan_requests_select_participants
on public.loan_requests
for select
to authenticated
using (
  borrower_id = (select auth.uid())
  or lender_id = (select auth.uid())
  or (select private.is_admin())
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
  or (select private.is_admin())
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
      and request.status in ('pending', 'negotiating')
      and (
        request.borrower_id = (select auth.uid())
        or request.lender_id = (select auth.uid())
      )
  )
  and (
    parent_proposal_id is null
    or exists (
      select 1
      from public.loan_proposals as parent
      where parent.id = public.loan_proposals.parent_proposal_id
        and parent.loan_request_id = public.loan_proposals.loan_request_id
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
  or (select private.is_admin())
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
  or (select private.is_admin())
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
  or (select private.is_admin())
);

create policy payments_insert_participant
on public.payments
for insert
to authenticated
with check (
  reported_by = (select auth.uid())
  and status = 'reported'
  and confirmed_at is null
  and confirmed_by is null
  and exists (
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

create policy notifications_select_recipient
on public.notifications
for select
to authenticated
using (recipient_id = (select auth.uid()) or (select private.is_admin()));

create policy audit_logs_select_admin
on public.audit_logs
for select
to authenticated
using ((select private.is_admin()));

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.loan_requests from anon, authenticated;
revoke all on table public.loan_proposals from anon, authenticated;
revoke all on table public.loans from anon, authenticated;
revoke all on table public.installments from anon, authenticated;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;
revoke all on table public.audit_logs from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, bio) on table public.profiles to authenticated;
grant select, insert on table public.loan_requests to authenticated;
grant select, insert on table public.loan_proposals to authenticated;
grant select on table public.loans to authenticated;
grant select on table public.installments to authenticated;
grant select, insert on table public.payments to authenticated;
grant select on table public.notifications to authenticated;
grant select on table public.audit_logs to authenticated;

comment on table public.loan_requests is 'Loan negotiation initiated by a borrower for a specific lender.';
comment on table public.loan_proposals is 'Immutable versions of terms offered during a loan negotiation.';
comment on table public.loans is 'Accepted loan agreements created from a single proposal.';
comment on table public.audit_logs is 'Append-only audit trail written by trusted database functions.';
