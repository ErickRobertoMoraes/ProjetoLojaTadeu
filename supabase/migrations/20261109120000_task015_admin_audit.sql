-- TASK-015: keep critical administrative changes and their audit records atomic.
create or replace function public.audit_admin_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_before jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  v_after jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  v_entity_id uuid;
  v_fields text[];
  v_metadata jsonb;
begin
  -- Authenticated mutations are already protected by RLS or a guarded RPC.
  -- Database-owned setup/maintenance has no actor and is intentionally not an
  -- administrative event.
  if v_actor is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  v_entity_id := coalesce((v_after ->> 'id')::uuid, (v_before ->> 'id')::uuid);
  v_fields := case tg_table_name
    when 'product_variants' then array['sku', 'attributes', 'stock', 'price_cents', 'active']
    when 'products' then array['name', 'category_id', 'slug', 'brand', 'description', 'training_goal', 'active', 'featured']
    when 'product_images' then array['product_id', 'storage_path', 'sort_order', 'alt_text']
    when 'categories' then array['name', 'slug', 'active']
    when 'coupons' then array['code', 'discount_percent', 'starts_at', 'ends_at', 'minimum_order_cents', 'usage_limit', 'usage_count', 'active']
    when 'shipping_regions' then array['code', 'price_cents', 'delivery_days', 'active']
    else array[]::text[]
  end;
  select coalesce(jsonb_object_agg(field, jsonb_build_object(
    'before', v_before -> field, 'after', v_after -> field
  )), '{}'::jsonb)
    into v_metadata
    from unnest(v_fields) as fields(field)
    where v_before -> field is distinct from v_after -> field;

  if tg_op = 'INSERT' or tg_op = 'DELETE' or v_metadata <> '{}'::jsonb then
    insert into public.audit_logs(actor_id, action, entity, entity_id, metadata)
    values (
      v_actor,
      lower(tg_table_name || '.' || tg_op),
      tg_table_name,
      v_entity_id,
      jsonb_build_object('changes', v_metadata)
    );
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.audit_admin_row_change() from public, anon, authenticated;

create trigger audit_admin_product_variants
  after insert or update or delete on public.product_variants
  for each row execute function public.audit_admin_row_change();
create trigger audit_admin_product_images
  after insert or update or delete on public.product_images
  for each row execute function public.audit_admin_row_change();
create trigger audit_admin_products
  after insert or update or delete on public.products
  for each row execute function public.audit_admin_row_change();
create trigger audit_admin_categories
  after insert or update or delete on public.categories
  for each row execute function public.audit_admin_row_change();
create trigger audit_admin_coupons
  after insert or update or delete on public.coupons
  for each row execute function public.audit_admin_row_change();
create trigger audit_admin_shipping_regions
  after insert or update or delete on public.shipping_regions
  for each row execute function public.audit_admin_row_change();

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
  v_old_role public.app_role;
  v_old_active boolean;
begin
  if v_actor_id is null or not public.current_user_is_admin() then
    raise exception using errcode = '42501', message = 'Administrator access required';
  end if;
  if p_target_user_id is null or p_action is null or p_action not in ('promote', 'deactivate') then
    raise exception using errcode = '22023', message = 'Invalid administrator action';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(4004, 1);
  select role, active into v_target_role, v_target_active
    from public.profiles where id = p_target_user_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Target profile not found'; end if;
  v_old_role := v_target_role;
  v_old_active := v_target_active;

  if p_action = 'promote' then
    if p_target_user_id = v_actor_id then raise exception using errcode = '22023', message = 'Administrators cannot manage themselves'; end if;
    if not v_target_active then raise exception using errcode = '22023', message = 'Inactive profile cannot be promoted'; end if;
    update public.profiles set role = 'admin' where id = p_target_user_id;
  else
    if v_target_role <> 'admin' or not v_target_active then raise exception using errcode = '22023', message = 'Target is not an active administrator'; end if;
    select count(*) into v_active_admin_count from public.profiles where role = 'admin' and active;
    if v_active_admin_count <= 1 then raise exception using errcode = 'P0001', message = 'Cannot deactivate the last active administrator'; end if;
    if p_target_user_id = v_actor_id then raise exception using errcode = '22023', message = 'Administrators cannot manage themselves'; end if;
    update public.profiles set active = false where id = p_target_user_id;
  end if;

  if v_old_role is distinct from (select role from public.profiles where id = p_target_user_id)
     or v_old_active is distinct from (select active from public.profiles where id = p_target_user_id) then
    insert into public.audit_logs(actor_id, action, entity, entity_id, metadata)
    select v_actor_id, 'admin_access.' || p_action, 'profiles', p_target_user_id,
      jsonb_build_object('role_before', v_old_role, 'role_after', role,
        'active_before', v_old_active, 'active_after', active)
      from public.profiles where id = p_target_user_id;
  end if;
end;
$$;

revoke all on function public.manage_admin_access(uuid, text) from public, anon;
grant execute on function public.manage_admin_access(uuid, text) to authenticated;
