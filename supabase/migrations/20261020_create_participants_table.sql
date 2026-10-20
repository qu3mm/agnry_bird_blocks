-- ─────────────────────────────────────────────────────────────
-- Angry Bird Blocks · Participants & Authentication Table
-- Run once in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

create table if not exists participants (
  id text primary key,            -- e.g. 'P01', 'P02', ...
  name text not null,             -- e.g. 'Participant 01'
  passcode text not null,         -- default password e.g. 'code01'
  created_at timestamptz default now()
);

-- Seed 30 participants (P01 to P30) with default password 'code01', 'code02', etc.
insert into participants (id, name, passcode)
select 
  'P' || lpad(i::text, 2, '0') as id,
  'Participant ' || lpad(i::text, 2, '0') as name,
  'code' || lpad(i::text, 2, '0') as passcode
from generate_series(1, 30) as i
on conflict (id) do nothing;

-- Enable Row Level Security
alter table participants enable row level security;

-- Allow anonymous read to authenticate participant IDs & passcodes
create policy "anon read participants" on participants for select to anon using (true);
