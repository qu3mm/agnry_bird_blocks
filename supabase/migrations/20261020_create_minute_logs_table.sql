-- ─────────────────────────────────────────────────────────────
-- Minute-by-Minute Telemetry Table for Gameplay Logs
-- Matches Study Log: Minute, Puzzle no., Tier, Attempts, Resets, Idle (s), Solved (0/1)
-- ─────────────────────────────────────────────────────────────

create table if not exists minute_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  participant_id text not null,
  minute_number integer not null,        -- e.g. 1, 2, 3, 4, 5...
  puzzle_no text,                        -- e.g. "1", "1, 2, 3" if multiple were touched
  tier text,                             -- e.g. "Easy", "Medium", "Hard"
  attempts integer default 0,            -- count of Run clicks
  resets integer default 0,              -- count of Reset / Start Over clicks
  idle_seconds integer default 0,        -- seconds without mouse/keyboard interaction
  solved integer default 0               -- 1 if solved in this minute, 0 otherwise
);

-- Enable RLS
alter table minute_logs enable row level security;

-- Allow anonymous inserts
create policy "anon insert minute_logs" on minute_logs for insert to anon with check (true);
