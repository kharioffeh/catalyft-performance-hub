
-- 0️⃣ safety
begin;

-- 1️⃣  EXERCISE LIBRARY  ───────────────────────────────────────────────
create table if not exists public.exercise_library (
  id               uuid            primary key default gen_random_uuid(),
  name             text            not null,
  category         text            not null,                 -- e.g. "strength", "power", "mobility"
  primary_muscle   text            not null,                 -- e.g. "quadriceps"
  secondary_muscle text[]          default '{}'::text[],
  video_url        text,
  coach_uuid       uuid,                                     -- null  => global exercise
  created_at       timestamptz     default now(),
  constraint fk_coach foreign key (coach_uuid) references profiles(id) on delete set null
);
comment on table  public.exercise_library is 'Master list of movements (global + coach-specific)';
comment on column public.exercise_library.coach_uuid is 'NULL = visible to every coach/athlete';

create index if not exists exercise_library_name_idx on public.exercise_library (lower(name));

-- 2️⃣  TEMPLATE HEADER  ────────────────────────────────────────────────
create table if not exists public.template (
  id            uuid         primary key default gen_random_uuid(),
  owner_uuid    uuid         not null references profiles(id) on delete cascade,
  title         text         not null,
  goal          text         not null check (goal in ('strength','power','hypertrophy','endurance','rehab')),
  weeks         int          not null check (weeks between 1 and 12),
  visibility    text         not null default 'private' check (visibility in ('private','org','public')),
  created_at    timestamptz  default now()
);

-- 3️⃣  TEMPLATE BLOCK (week × day grid rows)  ─────────────────────────
create table if not exists public.template_block (
  template_id   uuid         not null references public.template(id) on delete cascade,
  week_no       int          not null,
  day_no        int          not null,
  session_title text,
  exercises     jsonb        not null default '[]'::jsonb,   -- [{exercise_id, sets, reps, load%}, …]
  primary key (template_id, week_no, day_no)
);

-- 4️⃣  PROGRAM INSTANCE  ──────────────────────────────────────────────
create table if not exists public.program_instance (
  id              uuid         primary key default gen_random_uuid(),
  athlete_uuid    uuid         not null references profiles(id) on delete cascade,
  coach_uuid      uuid         not null references profiles(id) on delete cascade,
  source          text         not null check (source in ('template','aria')),
  template_id     uuid         references public.template(id) on delete set null,
  start_date      date         not null,
  end_date        date         not null,
  status          text         not null default 'pending' check (status in ('pending','active','completed','archived')),
  created_at      timestamptz  default now()
);
create index if not exists program_instance_athlete_idx on public.program_instance (athlete_uuid);

-- 5️⃣  SESSION (calendar row)  ─────────────────────────────────────────
create table if not exists public.session (
  id              uuid         primary key default gen_random_uuid(),
  program_id      uuid         not null references public.program_instance(id) on delete cascade,
  planned_at      timestamptz  not null,
  completed_at    timestamptz,
  rpe             numeric(4,2),
  strain          numeric(6,2),     -- sync from wearable
  acwr_snapshot   numeric(4,2),
  exercises       jsonb        not null default '[]'::jsonb,  -- in-session editable copy
  created_at      timestamptz  default now()
);
create index if not exists session_program_idx on public.session (program_id);
create index if not exists session_planned_idx on public.session (planned_at);

-- 6️⃣  SET LOG (optional detailed capture)  ───────────────────────────
create table if not exists public.set_log (
  id            uuid         primary key default gen_random_uuid(),
  session_id    uuid         not null references public.session(id) on delete cascade,
  exercise_id   uuid         not null references public.exercise_library(id),
  set_no        int          not null,
  reps          int,
  load          numeric(6,2),   -- kg or lbs, client determines unit
  rpe           numeric(4,2),
  created_at    timestamptz  default now()
);
create index if not exists set_log_session_idx on public.set_log (session_id);

-- 7️⃣  Enable RLS on all new tables
alter table public.exercise_library enable row level security;
alter table public.template enable row level security;
alter table public.template_block enable row level security;
alter table public.program_instance enable row level security;
alter table public.session enable row level security;
alter table public.set_log enable row level security;

-- 8️⃣  Basic RLS policies
-- Exercise Library: coaches can see all, athletes see global + their coach's
create policy "exercise_library_select" on public.exercise_library
  for select using (
    coach_uuid is null or 
    coach_uuid = auth.uid() or
    exists (select 1 from athletes where id = auth.uid() and coach_uuid in (
      select id from coaches where email in (select email from profiles where id = exercise_library.coach_uuid)
    ))
  );

create policy "exercise_library_insert" on public.exercise_library
  for insert with check (coach_uuid = auth.uid());

create policy "exercise_library_update" on public.exercise_library
  for update using (coach_uuid = auth.uid());

-- Templates: owners and their athletes can see
create policy "template_select" on public.template
  for select using (
    owner_uuid = auth.uid() or
    exists (select 1 from athletes where id = auth.uid() and coach_uuid in (
      select id from coaches where email in (select email from profiles where id = template.owner_uuid)
    ))
  );

create policy "template_insert" on public.template
  for insert with check (owner_uuid = auth.uid());

create policy "template_update" on public.template
  for update using (owner_uuid = auth.uid());

-- Template blocks follow template permissions
create policy "template_block_select" on public.template_block
  for select using (
    exists (select 1 from template where id = template_id and (
      owner_uuid = auth.uid() or
      exists (select 1 from athletes where id = auth.uid() and coach_uuid in (
        select id from coaches where email in (select email from profiles where id = template.owner_uuid)
      ))
    ))
  );

create policy "template_block_insert" on public.template_block
  for insert with check (
    exists (select 1 from template where id = template_id and owner_uuid = auth.uid())
  );

create policy "template_block_update" on public.template_block
  for update using (
    exists (select 1 from template where id = template_id and owner_uuid = auth.uid())
  );

-- Program instances: athletes and coaches can see their own
create policy "program_instance_select" on public.program_instance
  for select using (athlete_uuid = auth.uid() or coach_uuid = auth.uid());

create policy "program_instance_insert" on public.program_instance
  for insert with check (coach_uuid = auth.uid());

create policy "program_instance_update" on public.program_instance
  for update using (coach_uuid = auth.uid() or athlete_uuid = auth.uid());

-- Sessions: athletes and coaches can see their own
create policy "session_select" on public.session
  for select using (
    exists (select 1 from program_instance where id = program_id and (
      athlete_uuid = auth.uid() or coach_uuid = auth.uid()
    ))
  );

create policy "session_insert" on public.session
  for insert with check (
    exists (select 1 from program_instance where id = program_id and coach_uuid = auth.uid())
  );

create policy "session_update" on public.session
  for update using (
    exists (select 1 from program_instance where id = program_id and (
      athlete_uuid = auth.uid() or coach_uuid = auth.uid()
    ))
  );

-- Set logs: athletes and coaches can see their own
create policy "set_log_select" on public.set_log
  for select using (
    exists (select 1 from session s 
      join program_instance pi on s.program_id = pi.id 
      where s.id = session_id and (pi.athlete_uuid = auth.uid() or pi.coach_uuid = auth.uid())
    )
  );

create policy "set_log_insert" on public.set_log
  for insert with check (
    exists (select 1 from session s 
      join program_instance pi on s.program_id = pi.id 
      where s.id = session_id and pi.athlete_uuid = auth.uid()
    )
  );

commit;
