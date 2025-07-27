-- Migration for session_finishers table
-- Created: 2025-08-06
-- Description: Creates a table to track assigned/chosen finisher protocols for workout sessions

create table if not exists session_finishers (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references workout_sessions(id) not null,
  protocol_id     uuid references mobility_protocols(id) not null,
  auto_assigned   boolean default true,
  created_at      timestamptz default now(),
  unique (session_id)
);

-- Add indexes for better performance
create index if not exists idx_session_finishers_session_id on session_finishers(session_id);
create index if not exists idx_session_finishers_protocol_id on session_finishers(protocol_id);

-- Enable Row Level Security
alter table session_finishers enable row level security;

-- Create RLS policies for session_finishers
create policy "Users can view finishers for their own sessions"
  on session_finishers for select
  using (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = session_finishers.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert finishers for their own sessions"
  on session_finishers for insert
  with check (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = session_finishers.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can update finishers for their own sessions"
  on session_finishers for update
  using (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = session_finishers.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete finishers for their own sessions"
  on session_finishers for delete
  using (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = session_finishers.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );