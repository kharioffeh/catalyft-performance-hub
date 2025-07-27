-- Create challenges table
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

-- Create challenge_participants table
create table if not exists challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) not null,
  user_id uuid references auth.users not null,
  joined_at timestamptz default now(),
  progress numeric default 0,
  unique (challenge_id, user_id)
);

-- Enable RLS (Row Level Security)
alter table challenges enable row level security;
alter table challenge_participants enable row level security;

-- Policies for challenges table
create policy "Anyone can view challenges" on challenges for select using (true);
create policy "Authenticated users can create challenges" on challenges for insert with check (auth.uid() is not null);
create policy "Challenge creators can update their challenges" on challenges for update using (auth.uid() = created_by);
create policy "Challenge creators can delete their challenges" on challenges for delete using (auth.uid() = created_by);

-- Policies for challenge_participants table
create policy "Anyone can view challenge participants" on challenge_participants for select using (true);
create policy "Authenticated users can join challenges" on challenge_participants for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on challenge_participants for update using (auth.uid() = user_id);
create policy "Users can leave challenges they joined" on challenge_participants for delete using (auth.uid() = user_id);