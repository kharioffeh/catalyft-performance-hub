create table if not exists meets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  host_id uuid references auth.users not null,
  created_at timestamptz default now()
);

create table if not exists meet_rsvps (
  id uuid primary key default gen_random_uuid(),
  meet_id uuid references meets(id) not null,
  user_id uuid references auth.users not null,
  rsvp_at timestamptz default now(),
  status text check (status in ('yes','no','maybe')),
  unique (meet_id, user_id)
);