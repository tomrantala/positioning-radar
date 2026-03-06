-- Positioning Radar — Supabase schema
-- Run this in the Supabase SQL editor to create the tables

create table if not exists analyses (
  id text primary key,
  created_at timestamptz default now(),
  user_url text not null,
  competitor_urls text[] not null,
  industry text,
  locale text default 'en',
  result jsonb not null
);

create table if not exists leads (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  email text not null,
  analysis_id text references analyses(id),
  source text default 'full_report'
);

-- Indexes
create index if not exists idx_analyses_created_at on analyses(created_at desc);
create index if not exists idx_leads_email on leads(email);
create index if not exists idx_leads_analysis_id on leads(analysis_id);

-- Row Level Security
alter table analyses enable row level security;
alter table leads enable row level security;

-- Allow anonymous reads for analyses (users need to view shared results)
create policy "Anyone can read analyses" on analyses
  for select using (true);

-- Allow service role to insert analyses
create policy "Service role can insert analyses" on analyses
  for insert with check (true);

-- Allow service role to manage leads
create policy "Service role can insert leads" on leads
  for insert with check (true);

create policy "Service role can read leads" on leads
  for select using (true);
