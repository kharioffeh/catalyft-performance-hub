create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  session_id uuid references sessions(id) not null,
  media_url text,
  caption text,
  created_at timestamptz default now()
);

create table if not exists feed_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references feed_posts(id) not null,
  user_id uuid references auth.users not null,
  type text check (type in ('like','cheer')),
  created_at timestamptz default now(),
  unique (post_id, user_id, type)
);