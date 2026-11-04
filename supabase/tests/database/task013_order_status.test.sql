begin;

select plan(11);

create temp table task013_cpf_reservations (cpf text primary key);
create or replace function pg_temp.unique_task013_cpf()
returns text language plpgsql as $$
declare digits text; candidate text;
begin
  loop
    digits := lpad(floor(random() * 100000000000)::bigint::text, 11, '0');
    candidate := substring(digits from 1 for 3) || '.' || substring(digits from 4 for 3) || '.' ||
      substring(digits from 7 for 3) || '-' || substring(digits from 10 for 2);
    if not exists (select 1 from public.profiles where cpf_formatted = candidate)
      and not exists (select 1 from pg_temp.task013_cpf_reservations where cpf = candidate) then
      insert into pg_temp.task013_cpf_reservations values (candidate);
      return candidate;
    end if;
  end loop;
end;
$$;

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('13000000-0000-4000-8000-000000000001', 'task013-customer@example.test', now(), jsonb_build_object(
    'name', 'Status Customer', 'phone', '11999991301', 'cpf_formatted', pg_temp.unique_task013_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '1',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'))),
  ('13000000-0000-4000-8000-000000000002', 'task013-admin@example.test', now(), jsonb_build_object(
    'name', 'Status Admin', 'phone', '11999991302', 'cpf_formatted', pg_temp.unique_task013_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '2',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'))),
  ('13000000-0000-4000-8000-000000000003', 'task013-customer-b@example.test', now(), jsonb_build_object(
    'name', 'Status Customer B', 'phone', '11999991303', 'cpf_formatted', pg_temp.unique_task013_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '3',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp')));
update public.profiles set role = 'admin' where id = '13000000-0000-4000-8000-000000000002';

insert into public.categories (id, name, slug) values
  ('13000000-0000-4000-8000-000000000010', 'Task 013', 'task-013');
insert into public.products (id, category_id, name, slug) values
  ('13000000-0000-4000-8000-000000000011', '13000000-0000-4000-8000-000000000010', 'Task 013 Item', 'task-013-item');
insert into public.product_variants (id, product_id, attributes, sku, price_cents, stock) values
  ('13000000-0000-4000-8000-000000000012', '13000000-0000-4000-8000-000000000011', '{}', 'TASK013-ITEM', 1000, 8);
insert into public.orders (id, customer_id, status, payment_method, payment_status, subtotal_cents,
  shipping_cents, total_cents, shipping_address_snapshot, shipping_region, shipping_days_snapshot) values
  ('13000000-0000-4000-8000-000000000020', '13000000-0000-4000-8000-000000000001', 'payment_approved', 'pix', 'approved',
    2000, 500, 2500, '{}', 'sp', 2),
  ('13000000-0000-4000-8000-000000000021', '13000000-0000-4000-8000-000000000001', 'payment_approved', 'pix', 'approved',
    1000, 500, 1500, '{}', 'sp', 2),
  ('13000000-0000-4000-8000-000000000022', '13000000-0000-4000-8000-000000000003', 'payment_approved', 'pix', 'approved',
    1000, 500, 1500, '{}', 'sp', 2);
insert into public.order_items (order_id, variant_id, product_name_snapshot, sku_snapshot, price_cents, quantity) values
  ('13000000-0000-4000-8000-000000000020', '13000000-0000-4000-8000-000000000012', 'Task 013 Item', 'TASK013-ITEM', 1000, 2),
  ('13000000-0000-4000-8000-000000000021', '13000000-0000-4000-8000-000000000012', 'Task 013 Item', 'TASK013-ITEM', 1000, 1);

set local role authenticated;
select set_config('request.jwt.claim.sub', '13000000-0000-4000-8000-000000000001', true);
select is(public.transition_order_status('13000000-0000-4000-8000-000000000020', 'cancelled')->>'status',
  'cancelled', 'customer can cancel an eligible order');
select is(public.transition_order_status('13000000-0000-4000-8000-000000000020', 'cancelled')->>'unchanged',
  'true', 'repeated cancellation is idempotent');
set local role service_role;
select is((select stock from public.product_variants where id = '13000000-0000-4000-8000-000000000012'),
  10, 'cancellation restores inventory exactly once');
select is((select count(*)::integer from public.audit_logs where entity_id = '13000000-0000-4000-8000-000000000020'),
  1, 'only the actual status change is audited');
set local role authenticated;
select set_config('request.jwt.claim.sub', '13000000-0000-4000-8000-000000000001', true);
select throws_ok($$select public.transition_order_status('13000000-0000-4000-8000-000000000020', 'preparing')$$,
  'P0001', 'invalid_order_transition', 'cancelled orders cannot return to an active state');
select throws_ok($$select public.transition_order_status('13000000-0000-4000-8000-000000000021', 'shipped')$$,
  'P0001', 'invalid_order_transition', 'customers cannot ship an order');
select throws_ok($$select public.transition_order_status('13000000-0000-4000-8000-000000000022', 'cancelled')$$,
  '42501', 'order_forbidden', 'customer cannot alter another customer order');

set local role authenticated;
select set_config('request.jwt.claim.sub', '13000000-0000-4000-8000-000000000002', true);
select throws_ok($$update public.orders set status = 'shipped'
  where id = '13000000-0000-4000-8000-000000000021'$$,
  '42501', 'order_status_rpc_required', 'admins cannot bypass the transition RPC with a direct status update');
select is(public.transition_order_status('13000000-0000-4000-8000-000000000021', 'preparing')->>'status',
  'preparing', 'admin can start preparation');
select is(public.transition_order_status('13000000-0000-4000-8000-000000000021', 'shipped')->>'status',
  'shipped', 'admin can ship a prepared order');
select throws_ok($$select public.transition_order_status('13000000-0000-4000-8000-000000000021', 'cancelled')$$,
  'P0001', 'invalid_order_transition', 'shipped order cannot be cancelled');

select * from finish();
rollback;
