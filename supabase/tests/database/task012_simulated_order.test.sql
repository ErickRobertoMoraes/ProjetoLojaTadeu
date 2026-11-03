begin;

select plan(14);

create temp table task012_test_cpf_reservations (cpf text primary key);
create or replace function pg_temp.unique_test_cpf()
returns text
language plpgsql
as $$
declare
  digits text;
  candidate text;
begin
  loop
    digits := lpad(floor(random() * 100000000000)::bigint::text, 11, '0');
    candidate := substring(digits from 1 for 3) || '.' || substring(digits from 4 for 3) || '.' ||
      substring(digits from 7 for 3) || '-' || substring(digits from 10 for 2);
    if not exists (select 1 from public.profiles where cpf_formatted = candidate)
      and not exists (select 1 from pg_temp.task012_test_cpf_reservations where cpf = candidate) then
      insert into pg_temp.task012_test_cpf_reservations values (candidate);
      return candidate;
    end if;
  end loop;
end;
$$;

select ok(has_function_privilege('authenticated', 'public.create_simulated_order(public.payment_method,text)', 'execute'),
  'authenticated users can call the simulated purchase RPC');
select ok(not has_function_privilege('anon', 'public.create_simulated_order(public.payment_method,text)', 'execute'),
  'anonymous users cannot call the simulated purchase RPC');

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('12000000-0000-4000-8000-000000000001', 'task012-customer-a@example.test', now(), jsonb_build_object(
    'name', 'Purchase Customer A', 'phone', '11999990121', 'cpf_formatted', pg_temp.unique_test_cpf(),
    'address', jsonb_build_object('postal_code', '01001-000', 'street', 'Rua Snapshot', 'number', '12',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'))),
  ('12000000-0000-4000-8000-000000000002', 'task012-customer-b@example.test', now(), jsonb_build_object(
    'name', 'Purchase Customer B', 'phone', '11999990122', 'cpf_formatted', pg_temp.unique_test_cpf(),
    'address', jsonb_build_object('postal_code', '01001-000', 'street', 'Rua B', 'number', '13',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp')));

insert into public.categories (id, name, slug) values
  ('12000000-0000-4000-8000-000000000010', 'Task 012', 'task-012');
insert into public.products (id, category_id, name, slug, active) values
  ('12000000-0000-4000-8000-000000000011', '12000000-0000-4000-8000-000000000010', 'Camiseta Snapshot', 'task-012-shirt', true);
insert into public.product_variants (id, product_id, attributes, sku, price_cents, stock, active) values
  ('12000000-0000-4000-8000-000000000012', '12000000-0000-4000-8000-000000000011', '{"tamanho":"M"}', 'TASK012-SHIRT-M', 2500, 10, true);
insert into public.carts (customer_id) values
  ('12000000-0000-4000-8000-000000000001'), ('12000000-0000-4000-8000-000000000002');
insert into public.cart_items (customer_id, variant_id, quantity) values
  ('12000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000012', 2),
  ('12000000-0000-4000-8000-000000000002', '12000000-0000-4000-8000-000000000012', 2);
insert into public.shipping_regions (code, name, price_cents, delivery_days)
values ('sp', 'São Paulo Task 012', 799, 3);
insert into public.coupons (code, discount_percent, starts_at, ends_at, minimum_order_cents, usage_limit)
values ('TASK012-ONLY', 10, now() - interval '1 day', now() + interval '1 day', 1000, 1);
create temp table task012_purchase_result (result jsonb);
grant select, insert on task012_purchase_result to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub', '12000000-0000-4000-8000-000000000001', true);
insert into task012_purchase_result select public.create_simulated_order('pix', 'TASK012-ONLY');

select is((select result ->> 'status' from task012_purchase_result), 'payment_approved',
  'simulated approval creates an approved order');
select is((select status::text from public.orders where id = (select (result ->> 'order_id')::uuid from task012_purchase_result)),
  'payment_approved', 'order starts in the approved state');
select is((select payment_status::text from public.orders where id = (select (result ->> 'order_id')::uuid from task012_purchase_result)),
  'approved', 'payment is recorded as simulated and approved');
select is((select shipping_address_snapshot ->> 'street' from public.orders
  where id = (select (result ->> 'order_id')::uuid from task012_purchase_result)),
  'Rua Snapshot', 'order preserves the address at purchase time');
select is((select product_name_snapshot from public.order_items
  where order_id = (select (result ->> 'order_id')::uuid from task012_purchase_result)),
  'Camiseta Snapshot', 'order item preserves the product name');
select is((select stock from public.product_variants where id = '12000000-0000-4000-8000-000000000012'),
  8, 'stock is reduced by the purchased quantity');
set local role service_role;
select is((select usage_count from public.coupons where code = 'TASK012-ONLY'),
  1, 'coupon use is consumed in the same purchase');
set local role authenticated;
select is((select count(*)::integer from public.cart_items where customer_id = '12000000-0000-4000-8000-000000000001'),
  0, 'successful purchase clears the customer cart');

select set_config('request.jwt.claim.sub', '12000000-0000-4000-8000-000000000002', true);
select throws_ok($$select public.create_simulated_order('boleto', 'TASK012-ONLY')$$,
  'P0001', 'usage_exhausted', 'a second customer cannot exceed the coupon usage limit');
select is((select stock from public.product_variants where id = '12000000-0000-4000-8000-000000000012'),
  8, 'failed coupon validation does not consume stock');
select is((select count(*)::integer from public.orders where customer_id = '12000000-0000-4000-8000-000000000002'),
  0, 'failed purchase creates no order');

reset role;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok($$select public.create_simulated_order('pix', null)$$,
  '42501', 'unauthenticated', 'unauthenticated calls cannot create orders');

select * from finish();
rollback;
