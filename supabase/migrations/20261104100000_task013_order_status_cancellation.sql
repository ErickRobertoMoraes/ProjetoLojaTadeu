-- TASK-013: serialize permitted order transitions, cancellation, and stock restoration.
create or replace function public.transition_order_status(
  p_order_id uuid,
  p_status public.order_status
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_order public.orders%rowtype;
  v_previous_status public.order_status;
  v_is_admin boolean;
  v_allowed boolean := false;
  v_item record;
begin
  if v_actor is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;
  if p_order_id is null or p_status is null then
    raise exception using errcode = '22023', message = 'invalid_order_transition';
  end if;

  select public.current_user_is_admin() into v_is_admin;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'order_not_found';
  end if;
  if not v_is_admin and v_order.customer_id <> v_actor then
    raise exception using errcode = '42501', message = 'order_forbidden';
  end if;

  -- Repeated cancellation is safe and does not restore inventory twice.
  if v_order.status = 'cancelled' and p_status = 'cancelled' then
    return jsonb_build_object('order_id', v_order.id, 'status', v_order.status, 'unchanged', true);
  end if;

  if p_status = 'cancelled' then
    v_allowed := v_order.status in ('payment_approved', 'preparing');
  elsif v_is_admin then
    v_allowed := (v_order.status = 'payment_approved' and p_status = 'preparing')
      or (v_order.status = 'preparing' and p_status = 'shipped')
      or (v_order.status = 'shipped' and p_status = 'delivered');
  end if;
  if not v_allowed then
    raise exception using errcode = 'P0001', message = 'invalid_order_transition';
  end if;
  v_previous_status := v_order.status;

  if p_status = 'cancelled' then
    -- The order row lock serializes retries; stable variant ordering avoids deadlocks.
    for v_item in
      select variant_id, quantity from public.order_items
      where order_id = p_order_id and variant_id is not null
      order by variant_id
    loop
      update public.product_variants
        set stock = stock + v_item.quantity, updated_at = now()
        where id = v_item.variant_id;
    end loop;
    update public.orders
      set status = 'cancelled', payment_status = 'cancelled', updated_at = now()
      where id = p_order_id
      returning * into v_order;
  else
    update public.orders set status = p_status, updated_at = now()
      where id = p_order_id returning * into v_order;
  end if;

  insert into public.audit_logs(actor_id, action, entity, entity_id, metadata)
  values (v_actor, case when p_status = 'cancelled' then 'order.cancelled' else 'order.status_changed' end,
    'order', p_order_id, jsonb_build_object('from', v_previous_status, 'to', p_status));

  return jsonb_build_object('order_id', v_order.id, 'status', v_order.status, 'unchanged', false);
end;
$$;

revoke all on function public.transition_order_status(uuid, public.order_status) from public, anon;
grant execute on function public.transition_order_status(uuid, public.order_status) to authenticated;
