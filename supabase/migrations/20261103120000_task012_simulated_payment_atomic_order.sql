-- TASK-012: approve simulated payment and consume cart, stock, and coupon atomically.
create or replace function public.create_simulated_order(
  p_payment_method public.payment_method,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := (select auth.uid());
  v_profile public.profiles%rowtype;
  v_address public.addresses%rowtype;
  v_coupon public.coupons%rowtype;
  v_shipping public.shipping_regions%rowtype;
  v_item record;
  v_line jsonb;
  v_lines jsonb := '[]'::jsonb;
  v_order_id uuid;
  v_coupon_id uuid;
  v_coupon_code text := nullif(upper(btrim(p_coupon_code)), '');
  v_subtotal bigint := 0;
  v_discount bigint := 0;
  v_shipping_cents integer;
  v_total bigint;
  v_now timestamptz := now();
begin
  if v_customer_id is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;
  if p_payment_method is null or p_payment_method not in ('pix', 'card', 'boleto') then
    raise exception using errcode = '22023', message = 'invalid_payment_method';
  end if;
  if length(coalesce(p_coupon_code, '')) > 40 then
    raise exception using errcode = '22023', message = 'invalid_coupon';
  end if;

  select * into v_profile from public.profiles where id = v_customer_id for share;
  if not found or v_profile.role <> 'customer' or not v_profile.active or v_profile.email_confirmed_at is null then
    raise exception using errcode = '42501', message = 'checkout_forbidden';
  end if;

  select * into v_address from public.addresses where customer_id = v_customer_id for share;
  if not found then
    raise exception using errcode = 'P0001', message = 'address_required';
  end if;

  -- Stable lock order serializes competing checkouts for shared variants and cart rows.
  for v_item in
    select ci.variant_id, ci.quantity, pv.sku, pv.attributes, pv.price_cents, pv.stock,
      pv.active as variant_active, p.name as product_name, p.active as product_active,
      c.active as category_active
    from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    join public.categories c on c.id = p.category_id
    where ci.customer_id = v_customer_id
    order by pv.id
    for update of ci, pv, p, c
  loop
    if not v_item.variant_active or not v_item.product_active or not v_item.category_active
      or v_item.quantity < 1 or v_item.quantity > v_item.stock then
      raise exception using errcode = 'P0001', message = 'cart_item_unavailable';
    end if;

    v_line := jsonb_build_object(
      'variant_id', v_item.variant_id,
      'sku', v_item.sku,
      'name', v_item.product_name,
      'attributes', v_item.attributes,
      'quantity', v_item.quantity,
      'price_cents', v_item.price_cents
    );
    v_lines := v_lines || jsonb_build_array(v_line);
    v_subtotal := v_subtotal + (v_item.price_cents::bigint * v_item.quantity::bigint);
    if v_subtotal > 2147483647 then
      raise exception using errcode = '22003', message = 'cart_total_invalid';
    end if;
  end loop;
  if jsonb_array_length(v_lines) = 0 then
    raise exception using errcode = 'P0001', message = 'cart_empty';
  end if;

  if v_coupon_code is not null then
    select * into v_coupon from public.coupons where code = v_coupon_code for update;
    if not found or not v_coupon.active then
      raise exception using errcode = 'P0001', message = 'invalid_coupon';
    end if;
    if v_now < v_coupon.starts_at then
      raise exception using errcode = 'P0001', message = 'not_started';
    end if;
    if v_now >= v_coupon.ends_at then
      raise exception using errcode = 'P0001', message = 'expired';
    end if;
    if v_subtotal < v_coupon.minimum_order_cents then
      raise exception using errcode = 'P0001', message = 'minimum_not_met';
    end if;
    if v_coupon.usage_count >= v_coupon.usage_limit then
      raise exception using errcode = 'P0001', message = 'usage_exhausted';
    end if;
    v_coupon_id := v_coupon.id;
    v_discount := least(v_subtotal, round(v_subtotal * v_coupon.discount_percent / 100)::bigint);
  end if;

  select * into v_shipping from public.shipping_regions
  where code = v_address.shipping_region and active for share;
  if not found then
    raise exception using errcode = 'P0001', message = 'shipping_region_unconfigured';
  end if;
  v_shipping_cents := v_shipping.price_cents;
  v_total := v_subtotal - v_discount + v_shipping_cents;
  if v_total > 2147483647 then
    raise exception using errcode = '22003', message = 'cart_total_invalid';
  end if;

  insert into public.orders (
    customer_id, coupon_id, status, payment_method, payment_status,
    subtotal_cents, discount_cents, shipping_cents, total_cents,
    shipping_address_snapshot, shipping_region, shipping_days_snapshot
  ) values (
    v_customer_id, v_coupon_id, 'payment_approved', p_payment_method, 'approved',
    v_subtotal::integer, v_discount::integer, v_shipping_cents, v_total::integer,
    to_jsonb(v_address) - 'customer_id' - 'created_at' - 'updated_at',
    v_address.shipping_region, v_shipping.delivery_days
  ) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(v_lines)
  loop
    update public.product_variants
      set stock = stock - (v_item.value ->> 'quantity')::integer, updated_at = v_now
      where id = (v_item.value ->> 'variant_id')::uuid
        and stock >= (v_item.value ->> 'quantity')::integer;
    if not found then
      raise exception using errcode = 'P0001', message = 'cart_item_unavailable';
    end if;
    insert into public.order_items (
      order_id, variant_id, product_name_snapshot, sku_snapshot,
      attributes_snapshot, price_cents, quantity
    ) values (
      v_order_id, (v_item.value ->> 'variant_id')::uuid, v_item.value ->> 'name',
      v_item.value ->> 'sku', v_item.value -> 'attributes',
      (v_item.value ->> 'price_cents')::integer, (v_item.value ->> 'quantity')::integer
    );
  end loop;

  if v_coupon_id is not null then
    update public.coupons set usage_count = usage_count + 1, updated_at = v_now
      where id = v_coupon_id and usage_count < usage_limit;
    if not found then
      raise exception using errcode = 'P0001', message = 'usage_exhausted';
    end if;
  end if;

  delete from public.cart_items where customer_id = v_customer_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'status', 'payment_approved',
    'payment_method', p_payment_method,
    'subtotal_cents', v_subtotal,
    'discount_cents', v_discount,
    'shipping_cents', v_shipping_cents,
    'total_cents', v_total
  );
end;
$$;

revoke all on function public.create_simulated_order(public.payment_method, text) from public, anon;
grant execute on function public.create_simulated_order(public.payment_method, text) to authenticated;
