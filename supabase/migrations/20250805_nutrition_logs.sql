create table if not exists nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  name text not null,
  calories numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fats_g numeric not null,
  created_at timestamptz default now()
);

-- Add RLS policies for the nutrition_logs table
alter table nutrition_logs enable row level security;

-- Policy to allow users to view their own nutrition logs
create policy "Users can view their own nutrition logs" on nutrition_logs
  for select using (auth.uid() = user_id);

-- Policy to allow users to insert their own nutrition logs
create policy "Users can insert their own nutrition logs" on nutrition_logs
  for insert with check (auth.uid() = user_id);

-- Policy to allow users to update their own nutrition logs
create policy "Users can update their own nutrition logs" on nutrition_logs
  for update using (auth.uid() = user_id);

-- Policy to allow users to delete their own nutrition logs
create policy "Users can delete their own nutrition logs" on nutrition_logs
  for delete using (auth.uid() = user_id);

-- Create an index on user_id and date for efficient queries
create index if not exists nutrition_logs_user_date_idx on nutrition_logs (user_id, date);

-- Create an index on created_at for ordering
create index if not exists nutrition_logs_created_at_idx on nutrition_logs (created_at);