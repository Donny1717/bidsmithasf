-- BidSmith ASF — Phase 1 Foundation Schema (BS-NV-P1)
-- Organisations, Workspaces, Memberships, Roles, Policy Profiles,
-- Append-only Audit Events. Immutable originals are never overwritten.

create extension if not exists "pgcrypto";

create table if not exists organisations (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists workspaces (
  id text primary key default gen_random_uuid()::text,
  organisation_id text not null references organisations(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  id text primary key default gen_random_uuid()::text,
  user_subject text not null,          -- identity provider subject (human identity)
  organisation_id text not null references organisations(id),
  workspace_id text references workspaces(id),
  role text not null check (role in (
    'platform_admin','org_owner','bid_lead','contributor',
    'evidence_owner','reviewer','approver','auditor','ai_risk_owner'
  )),
  created_at timestamptz not null default now(),
  unique (user_subject, organisation_id, workspace_id)
);

create table if not exists policy_profiles (
  id text primary key,
  name text not null,
  version text not null,
  effective_from date not null,
  effective_to date,
  legislation text not null,
  summary text not null,
  key_obligations jsonb not null default '[]',
  disclosure_questions jsonb not null default '[]'
);

create table if not exists projects (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id),
  title text not null,
  reference text,
  commencement_date date,
  policy_profile_id text references policy_profiles(id),
  status text not null default 'active',
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  event_id text primary key,
  timestamp timestamptz not null default now(),
  actor_type text not null check (actor_type in ('human','machine','system')),
  actor_id text not null,
  actor_email text,
  action text not null,
  target_type text not null,
  target_id text,
  workspace_id text,
  result text not null check (result in ('success','denied','error')),
  correlation_id text not null,
  detail jsonb not null default '{}'
);
create index if not exists audit_events_ts on audit_events (timestamp desc);
create index if not exists audit_events_ws on audit_events (workspace_id);

-- Append-only enforcement: audit events can never be updated or deleted.
create or replace function forbid_mutation() returns trigger as $$
begin
  raise exception 'audit_events is append-only';
end;
$$ language plpgsql;

drop trigger if exists audit_events_append_only on audit_events;
create trigger audit_events_append_only
  before update or delete on audit_events
  for each row execute function forbid_mutation();

-- Row-level security baseline: all tables private by default.
alter table organisations enable row level security;
alter table workspaces enable row level security;
alter table memberships enable row level security;
alter table policy_profiles enable row level security;
alter table projects enable row level security;
alter table audit_events enable row level security;

-- Seed policy profiles (PPN 02/24 and PPN 017).
insert into policy_profiles (id, name, version, effective_from, effective_to, legislation, summary, key_obligations, disclosure_questions)
values
  ('ppn-02-24', 'PPN 02/24 — Supplier due diligence & payment transparency', 'v1.0', '2024-03-01', '2025-02-23',
   'Public Contracts Regulations 2015',
   'Applies to relevant procurements commenced before 24 February 2025 under the PCR 2015 regime.',
   '["Supplier fraud/insolvency due diligence checks","Prompt payment reporting expectations","Exclusion and debarment checks"]', '[]'),
  ('ppn-017', 'PPN 017 — Improving transparency of AI use in procurement', 'v1.0', '2025-02-24', null,
   'Procurement Act 2023 / Procurement Regulations 2024',
   'Applies to relevant procurements commenced from 24 February 2025. Encourages AI-use transparency, accuracy checks and proportionate due diligence.',
   '["Disclose AI use in tender preparation where asked","Check accuracy, robustness and credibility of AI-assisted content","Protect confidential information when using AI tools","Separate AI used for bid drafting from AI in proposed service delivery"]',
   '["Did you use AI to help prepare this tender?","What checks did you perform on the accuracy of AI-assisted content?","Does AI form part of the proposed service delivery?"]')
on conflict (id) do nothing;
