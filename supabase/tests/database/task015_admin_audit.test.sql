begin;
select plan(6);

create temp table task015_test_cpf_reservations (cpf text primary key);
create or replace function pg_temp.task015_test_cpf()
returns text language plpgsql as $$
declare digits text; candidate text;
begin
  loop
    digits := lpad(floor(random() * 100000000000)::bigint::text, 11, '0');
    candidate := substring(digits from 1 for 3) || '.' || substring(digits from 4 for 3) || '.' ||
      substring(digits from 7 for 3) || '-' || substring(digits from 10 for 2);
    if not exists (select 1 from public.profiles where cpf_formatted = candidate)
      and not exists (select 1 from pg_temp.task015_test_cpf_reservations where cpf = candidate) then
      insert into pg_temp.task015_test_cpf_reservations values (candidate);
      return candidate;
    end if;
  end loop;
end;
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('15000000-0000-4000-8000-000000000001', 'task015-admin@example.test', jsonb_build_object(
    'name', 'Task 015 Admin', 'phone', '11999991501', 'cpf_formatted', pg_temp.task015_test_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '1',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'))),
  ('15000000-0000-4000-8000-000000000002', 'task015-customer@example.test', jsonb_build_object(
    'name', 'Task 015 Customer', 'phone', '11999991502', 'cpf_formatted', pg_temp.task015_test_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '2',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp')));
update public.profiles set role = 'admin' where id = '15000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub', '15000000-0000-4000-8000-000000000001', true);
insert into public.categories (name, slug) values ('Task 015', 'task-015');
insert into public.products (category_id, name, slug, active)
select id, 'Task 015 Item', 'task-015-item', true from public.categories where slug = 'task-015';
insert into public.product_variants (product_id, sku, price_cents, stock)
select id, 'TASK015-ITEM', 1000, 4 from public.products where slug = 'task-015-item';
update public.product_variants set stock = 7 where sku = 'TASK015-ITEM';

select is((select count(*)::integer from public.audit_logs where entity = 'product_variants' and action = 'product_variants.insert'),
  1, 'admin variant creation writes an audit event');
select is((select metadata #>> '{changes,stock,before}' from public.audit_logs
  where entity = 'product_variants' and action = 'product_variants.update'),
  '4', 'inventory audit captures the previous stock value');

insert into public.coupons (code, discount_percent, starts_at, ends_at, usage_limit)
values ('TASK015', 10, now() - interval '1 day', now() + interval '1 day', 10);
update public.coupons set active = false where code = 'TASK015';
select is((select count(*)::integer from public.audit_logs where entity = 'coupons'),
  2, 'coupon creation and edit are audited');

insert into public.shipping_regions (code, name, price_cents, delivery_days, active)
values ('sp', 'São Paulo', 500, 2, true);
select is((select count(*)::integer from public.audit_logs where entity = 'shipping_regions'),
  1, 'shipping configuration is audited');

set local role authenticated;
select set_config('request.jwt.claim.sub', '15000000-0000-4000-8000-000000000002', true);
update public.product_variants set stock = 99 where sku = 'TASK015-ITEM';
set local role service_role;
select ok((select stock = 7 from public.product_variants where sku = 'TASK015-ITEM')
  and (select count(*) = 2 from public.audit_logs where entity = 'product_variants'),
  'customer cannot change stock or create an audit event');

set local role authenticated;
select set_config('request.jwt.claim.sub', '15000000-0000-4000-8000-000000000001', true);
select public.manage_admin_access('15000000-0000-4000-8000-000000000002', 'promote');
select is((select action from public.audit_logs where entity = 'profiles' and entity_id = '15000000-0000-4000-8000-000000000002'),
  'admin_access.promote', 'administrator promotion writes an audit event');

select * from finish();
rollback;
