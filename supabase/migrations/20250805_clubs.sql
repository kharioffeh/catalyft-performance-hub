-- Create clubs table
create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

-- Create club_memberships table
create table if not exists club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) not null,
  user_id uuid references auth.users not null,
  joined_at timestamptz default now(),
  unique (club_id, user_id)
);

-- Enable RLS (Row Level Security)
alter table clubs enable row level security;
alter table club_memberships enable row level security;

-- Policies for clubs table
create policy "Anyone can view clubs" on clubs for select using (true);
create policy "Authenticated users can create clubs" on clubs for insert with check (auth.uid() is not null);
create policy "Club creators can update their clubs" on clubs for update using (auth.uid() = created_by);
create policy "Club creators can delete their clubs" on clubs for delete using (auth.uid() = created_by);

-- Policies for club_memberships table
create policy "Anyone can view club memberships" on club_memberships for select using (true);
create policy "Authenticated users can join clubs" on club_memberships for insert with check (auth.uid() = user_id);
create policy "Users can leave clubs they joined" on club_memberships for delete using (auth.uid() = user_id);