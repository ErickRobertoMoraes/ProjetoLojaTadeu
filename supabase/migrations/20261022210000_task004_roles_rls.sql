-- TASK-004: keep profile role and active status writable only through a guarded RPC.
revoke insert, update, delete on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

create or replace function public.manage_admin_access(
  p_target_user_id uuid,
  p_action text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_target_role public.app_role;
  v_target_active boolean;
  v_active_admin_count bigint;
begin
  if v_actor_id is null or not public.current_user_is_admin() then
    raise exception using errcode = '42501', message = 'Administrator access required';
  end if;

  if p_target_user_id is null or p_action is null or p_action not in ('promote', 'deactivate') then
    raise exception using errcode = '22023', message = 'Invalid administrator action';
  end if;

  -- Serialize role changes so concurrent requests cannot both remove the final admins.
  perform pg_catalog.pg_advisory_xact_lock(4004, 1);

  select role, active
    into v_target_role, v_target_active
    from public.profiles
    where id = p_target_user_id
    for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Target profile not found';
  end if;

  if p_action = 'promote' then
    if p_target_user_id = v_actor_id then
      raise exception using errcode = '22023', message = 'Administrators cannot manage themselves';
    end if;
    if not v_target_active then
      raise exception using errcode = '22023', message = 'Inactive profile cannot be promoted';
    end if;
    update public.profiles set role = 'admin' where id = p_target_user_id;
    return;
  end if;

  if v_target_role <> 'admin' or not v_target_active then
    raise exception using errcode = '22023', message = 'Target is not an active administrator';
  end if;

  select count(*) into v_active_admin_count
    from public.profiles
    where role = 'admin' and active;

  if v_active_admin_count <= 1 then
    raise exception using errcode = 'P0001', message = 'Cannot deactivate the last active administrator';
  end if;

  if p_target_user_id = v_actor_id then
    raise exception using errcode = '22023', message = 'Administrators cannot manage themselves';
  end if;

  update public.profiles set active = false where id = p_target_user_id;
end;
$$;

revoke all on function public.manage_admin_access(uuid, text) from public, anon;
grant execute on function public.manage_admin_access(uuid, text) to authenticated;
