create table if not exists soreness (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  date         date not null,
  score        int check(score between 1 and 10),
  created_at   timestamptz default now(),
  unique (user_id, date)
);

create table if not exists jump_tests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  date         date not null,
  height_cm    numeric not null,
  created_at   timestamptz default now(),
  unique (user_id, date)
);