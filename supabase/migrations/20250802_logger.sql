-- Create workout_sessions table for logging workout sessions
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  notes text
);

-- Create workout_sets table for logging individual sets
create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references workout_sessions(id) not null,
  exercise text not null,
  weight numeric not null,
  reps int not null,
  rpe int check (rpe between 1 and 10),
  tempo text,
  velocity numeric,
  created_at timestamptz default now()
);

-- Add indexes for better performance
create index if not exists idx_workout_sessions_user_id on workout_sessions(user_id);
create index if not exists idx_workout_sessions_started_at on workout_sessions(started_at);
create index if not exists idx_workout_sets_session_id on workout_sets(session_id);
create index if not exists idx_workout_sets_created_at on workout_sets(created_at);

-- Enable Row Level Security
alter table workout_sessions enable row level security;
alter table workout_sets enable row level security;

-- Create RLS policies for workout_sessions
create policy "Users can view their own workout sessions"
  on workout_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workout sessions"
  on workout_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workout sessions"
  on workout_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workout sessions"
  on workout_sessions for delete
  using (auth.uid() = user_id);

-- Create RLS policies for workout_sets
create policy "Users can view their own workout sets"
  on workout_sets for select
  using (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = workout_sets.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert workout sets for their own sessions"
  on workout_sets for insert
  with check (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = workout_sets.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can update workout sets for their own sessions"
  on workout_sets for update
  using (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = workout_sets.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete workout sets for their own sessions"
  on workout_sets for delete
  using (
    exists (
      select 1 from workout_sessions 
      where workout_sessions.id = workout_sets.session_id 
      and workout_sessions.user_id = auth.uid()
    )
  );