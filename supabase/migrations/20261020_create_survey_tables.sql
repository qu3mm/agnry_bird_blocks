-- ─────────────────────────────────────────────────
-- Angry Bird Blocks · CS413.2 Study Survey Tables
-- Run once in Supabase SQL Editor
-- ─────────────────────────────────────────────────

-- 1. Pre-test
create table if not exists pre_test (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  participant_id text not null,
  programming_skill smallint,
  experience_level text,
  hours_per_week text,
  block_experience text,
  valence smallint,
  arousal smallint,
  pretest_confidence smallint,
  difficulty_expect smallint,
  submitted_at text
);

-- 2. Check-in (In-Game) - "checkin_window" avoids PostgreSQL reserved keyword
create table if not exists check_in (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  participant_id text not null,
  checkin_window smallint,
  emotion text,
  emotion_category text,
  challenge smallint,
  confidence smallint,
  balance smallint,
  flow_state text,
  level_id smallint,
  tier text,
  timestamp text
);

-- 3. Post-test
create table if not exists post_test (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  participant_id text not null,
  dominant_emotion text,
  overall_difficulty smallint,
  future_confidence smallint,
  perceived_performance smallint,
  engagement_level smallint,
  recording_comfort smallint,
  comments text,
  submitted_at text
);

-- Enable RLS
alter table pre_test enable row level security;
alter table check_in enable row level security;
alter table post_test enable row level security;

-- Anon insert policies
create policy "anon insert pre_test" on pre_test for insert to anon with check (true);
create policy "anon insert check_in" on check_in for insert to anon with check (true);
create policy "anon insert post_test" on post_test for insert to anon with check (true);
