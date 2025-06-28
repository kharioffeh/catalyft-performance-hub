
-- === TRAINING OBJECTS • PROMPT 3.3  ── Helper RPCs & Views (v0.9) ===
-- What this does:
--  1. `v_template_grid`   – flattens template → one row per exercise cell
--  2. `fn_create_program_from_template`
--        • Atomically copies a template for one athlete
--        • Generates `program_instance` + dated `session` rows
--        • Returns the new program UUID
--  3. `fn_upsert_exercise` – convenience helper for ARIA / UI
--  4. Leaves comments & simple GRANTs for client‐side rpc usage

begin;

-- 1️⃣  FLAT VIEW  ──────────────────────────────────────────────────────
create or replace view public.v_template_grid as
select
  t.id                    as template_id,
  tb.week_no,
  tb.day_no,
  e.elem ->> 'exercise_id'          as exercise_id,
  (e.elem ->> 'sets')::int          as sets,
  (e.elem ->> 'reps')::int          as reps,
  (e.elem ->> 'load_percent')::numeric  as load_pct
from public.template_block tb
join public.template t on t.id = tb.template_id
cross join lateral jsonb_array_elements(tb.exercises) as e(elem);

comment on view public.v_template_grid is 'Denormalised template grid for easy UI rendering (one row per exercise).';

-- 2️⃣  PROGRAM CREATION FUNCTION  ─────────────────────────────────────
create or replace function public.fn_create_program_from_template(
  p_template_id uuid,
  p_athlete     uuid,
  p_coach       uuid,
  p_start_date  date
) returns uuid
language plpgsql security definer
as $$
declare
  v_weeks        int;
  v_program_id   uuid;
  v_session_id   uuid;
  v_day_offset   int;
begin
  -- fetch template meta
  select weeks into v_weeks from public.template where id = p_template_id;

  if v_weeks is null then
    raise exception 'Template % not found', p_template_id;
  end if;

  -- create program_instance
  insert into public.program_instance (
    athlete_uuid, coach_uuid, source, template_id,
    start_date, end_date, status
  ) values (
    p_athlete, p_coach, 'template', p_template_id,
    p_start_date, p_start_date + (v_weeks * 7 - 1), 'active'
  ) returning id into v_program_id;

  -- create session rows
  for v_day_offset in 0 .. (v_weeks * 7 - 1) loop
    insert into public.session (
      program_id, planned_at
    ) values (
      v_program_id, (p_start_date + v_day_offset)
    ) returning id into v_session_id;
  end loop;

  -- hydrate session.exercises JSON
  update public.session s
  set exercises = (
    select jsonb_agg(e.elem) from (
      select jsonb_build_object(
        'exercise_id', exercise_id,
        'sets', sets,
        'reps', reps,
        'load_pct', load_pct
      ) as elem
      from public.v_template_grid g
      where g.template_id = p_template_id
        and ( (g.week_no - 1)*7 + (g.day_no - 1) ) = (s.planned_at::date - p_start_date)
    ) q
  )
  where s.program_id = v_program_id;

  return v_program_id;
end;
$$;

comment on function public.fn_create_program_from_template is
'Copies a template for an athlete; generates sessions & returns program UUID.';

-- 3️⃣  UPSERT EXERCISE HELPER  ────────────────────────────────────────
create or replace function public.fn_upsert_exercise(
  p_name             text,
  p_category         text,
  p_primary_muscle   text,
  p_secondary_muscle text[] default '{}',
  p_video_url        text    default null,
  p_coach_uuid       uuid    default null
) returns uuid
language plpgsql security definer
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from public.exercise_library
  where lower(name) = lower(p_name)
    and coalesce(coach_uuid, '00000000-0000-0000-0000-000000000000') = coalesce(p_coach_uuid, '00000000-0000-0000-0000-000000000000')
  limit 1;

  if v_id is null then
    insert into public.exercise_library (name, category, primary_muscle, secondary_muscle, video_url, coach_uuid)
    values (p_name, p_category, p_primary_muscle, p_secondary_muscle, p_video_url, p_coach_uuid)
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

comment on function public.fn_upsert_exercise is
'Idempotent helper – returns existing ID or creates a new exercise row.';

-- 4️⃣  MINIMAL GRANTS  ────────────────────────────────────────────────
grant execute on function public.fn_create_program_from_template(uuid,uuid,uuid,date) to authenticated;
grant execute on function public.fn_upsert_exercise(text,text,text,text[],text,uuid) to authenticated;
grant select on public.v_template_grid to authenticated;

commit;
