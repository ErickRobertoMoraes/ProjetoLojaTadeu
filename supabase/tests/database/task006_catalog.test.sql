begin;

select plan(14);

select is((select count(*)::integer from public.categories
  where slug in ('roupas', 'suplementos', 'acessorios') and active),
  3, 'the three approved shopping categories are seeded and active');

insert into auth.users (id, email, raw_user_meta_data) values
  ('60000000-0000-4000-8000-000000000001', 'task006-admin@example.test', jsonb_build_object(
    'name', 'Catalog Admin', 'phone', '11999990001', 'cpf_formatted', '529.982.247-25',
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '1',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'), 'role', 'admin')),
  ('60000000-0000-4000-8000-000000000002', 'task006-customer@example.test', jsonb_build_object(
    'name', 'Catalog Customer', 'phone', '11999990002', 'cpf_formatted', '111.444.777-35',
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '2',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp')));
update public.profiles set role = 'admin' where id = '60000000-0000-4000-8000-000000000001';

set local role anon;
select ok((select count(*) = 3 from public.categories
  where slug in ('roupas', 'suplementos', 'acessorios')), 'anonymous shoppers can browse active categories');
select throws_ok($$insert into public.categories (name, slug) values ('Forbidden', 'forbidden')$$,
  '42501', null, 'anonymous users cannot create categories');

set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000002', true);
select throws_ok($$insert into public.categories (name, slug) values ('Customer category', 'customer-category')$$,
  '42501', null, 'customers cannot create categories');
select throws_ok($$insert into public.products (category_id, name, slug, active)
  values ((select id from public.categories where slug = 'roupas'), 'Customer product', 'customer-product', true)$$,
  '42501', null, 'customers cannot create products');
select is((select count(*)::integer from public.products), 0, 'customers cannot read administrative products');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000001', true);
select lives_ok($$insert into public.categories (name, slug) values ('Test category', 'task006-test-category')$$,
  'active admin can create a category');
select lives_ok($$update public.categories set name = 'Updated category'
  where slug = 'task006-test-category'$$, 'active admin can update a category');
select is((select name from public.categories where slug = 'task006-test-category'),
  'Updated category', 'category update is persisted');
select lives_ok($$insert into public.products (category_id, name, slug, active)
  values ((select id from public.categories where slug = 'task006-test-category'), 'Test product', 'task006-test-product', true)$$,
  'active admin can create a product');
select lives_ok($$update public.products set name = 'Updated product'
  where slug = 'task006-test-product'$$, 'active admin can update a product');
select is((select name from public.products where slug = 'task006-test-product'),
  'Updated product', 'product update is persisted');
select lives_ok($$update public.products set active = false where slug = 'task006-test-product'$$,
  'active admin can archive a product without deleting it');
select is((select count(*)::integer from public.products where slug = 'task006-test-product'),
  1, 'archived product is retained for dependent records');
select * from finish();
rollback;
