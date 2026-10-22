-- ─────────────────────────────────────────────────────────────
-- Both Gameplay Telemetry Tables:
-- 1. minute_logs (Minute-by-minute time alignment for DeepFace / Video)
-- 2. puzzle_logs (Per-puzzle summary for thesis analysis / EDM)
-- ─────────────────────────────────────────────────────────────

create table if not exists minute_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  participant_id text not null,
  minute_number integer not null,
  puzzle_no text,
  tier text,
  attempts integer default 0,
  resets integer default 0,
  idle_seconds integer default 0,
  solved integer default 0
);

create table if not exists puzzle_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  participant_id text not null,
  level_id integer not null,
  tier text,
  time_seconds integer default 0,
  attempts integer default 0,
  resets integer default 0,
  crashes integer default 0,
  blocks_used integer default 0,
  optimal_blocks integer
);

alter table minute_logs enable row level security;
alter table puzzle_logs enable row level security;

create policy "anon insert minute_logs" on minute_logs for insert to anon with check (true);
create policy "anon insert puzzle_logs" on puzzle_logs for insert to anon with check (true);
