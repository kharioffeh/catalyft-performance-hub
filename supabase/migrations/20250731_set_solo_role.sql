-- Function to add solo role if not present
create or replace function public.f_set_solo_role()
returns trigger
language plpgsql
as $$
begin
  if new.app_metadata is null then
    new.app_metadata := jsonb_build_object('role','solo');
  elsif not new.app_metadata ? 'role' then
    new.app_metadata := new.app_metadata || jsonb_build_object('role','solo');
  end if;
  return new;
end;
$$;

-- Trigger fires BEFORE INSERT on auth.users
drop trigger if exists trg_set_solo_role on auth.users;
create trigger trg_set_solo_role
  before insert on auth.users
  for each row
  execute procedure public.f_set_solo_role();