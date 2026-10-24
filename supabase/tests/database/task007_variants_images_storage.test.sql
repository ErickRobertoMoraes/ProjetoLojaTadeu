begin;

select plan(17);


create temp table task_test_cpf_reservations (cpf text primary key);
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
      and not exists (select 1 from pg_temp.task_test_cpf_reservations where cpf = candidate) then
      insert into pg_temp.task_test_cpf_reservations (cpf) values (candidate);
      return candidate;
    end if;
  end loop;
end;
$$;

select ok(exists (select 1 from storage.buckets where id = 'product-images' and public),
  'catalog images use a public Storage bucket');
select is((select file_size_limit::integer from storage.buckets where id = 'product-images'),
  5242880, 'catalog image uploads are limited to five MiB');
select is((select cardinality(allowed_mime_types) from storage.buckets where id = 'product-images'),
  3, 'catalog image bucket accepts only JPEG, PNG, and WebP');

insert into auth.users (id, email, raw_user_meta_data) values
  ('70000000-0000-4000-8000-000000000001', 'task007-admin@example.test', jsonb_build_object(
    'name', 'Catalog Admin', 'phone', '11999990001', 'cpf_formatted', pg_temp.unique_test_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '1',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'), 'role', 'admin')),
  ('70000000-0000-4000-8000-000000000002', 'task007-customer@example.test', jsonb_build_object(
    'name', 'Catalog Customer', 'phone', '11999990002', 'cpf_formatted', pg_temp.unique_test_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '2',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp')));
update public.profiles set role = 'admin' where id = '70000000-0000-4000-8000-000000000001';
insert into public.categories (id, name, slug) values
  ('70000000-0000-4000-8000-000000000010', 'Task 007', 'task-007');
insert into public.products (id, category_id, name, slug, active) values
  ('70000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000010', 'Task 007 product', 'task-007-product', true);
insert into public.product_variants (id, product_id, attributes, sku, price_cents, stock, active) values
  ('70000000-0000-4000-8000-000000000012', '70000000-0000-4000-8000-000000000011', '{"size":"M"}', 'TASK007-ZERO', 4990, 0, true);

set local role anon;
select is((select count(*)::integer from public.product_variants where id = '70000000-0000-4000-8000-000000000012'),
  1, 'active zero-stock variants remain visible to shoppers');
select throws_ok($$insert into public.product_variants (product_id, sku, price_cents, stock)
  values ('70000000-0000-4000-8000-000000000011', 'TASK007-ANON', 100, 1)$$,
  '42501', null, 'anonymous shoppers cannot create variants');
select throws_ok($$insert into storage.objects (bucket_id, name)
  values ('product-images', '70000000-0000-4000-8000-000000000011/anon.png')$$,
  '42501', null, 'anonymous users cannot upload product images');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000002', true);
select throws_ok($$insert into public.product_variants (product_id, sku, price_cents, stock)
  values ('70000000-0000-4000-8000-000000000011', 'TASK007-CUSTOMER', 100, 1)$$,
  '42501', null, 'customers cannot create variants');
select throws_ok($$insert into public.product_images (product_id, storage_path, alt_text)
  values ('70000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000011/customer.png', 'Imagem')$$,
  '42501', null, 'customers cannot create image metadata');
select throws_ok($$insert into storage.objects (bucket_id, name)
  values ('product-images', '70000000-0000-4000-8000-000000000011/customer.png')$$,
  '42501', null, 'customers cannot upload product images');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000001', true);
select lives_ok($$insert into public.product_variants (product_id, sku, price_cents, stock)
  values ('70000000-0000-4000-8000-000000000011', 'TASK007-ADMIN', 100, 0)$$,
  'active admins can create zero-stock variants');
select throws_ok($$insert into public.product_variants (product_id, sku, price_cents, stock)
  values ('70000000-0000-4000-8000-000000000011', 'TASK007-NEGATIVE-PRICE', -1, 1)$$,
  '23514', null, 'negative variant prices are rejected');
select throws_ok($$insert into public.product_variants (product_id, sku, price_cents, stock)
  values ('70000000-0000-4000-8000-000000000011', 'TASK007-NEGATIVE-STOCK', 100, -1)$$,
  '23514', null, 'negative variant stock is rejected');
select throws_ok($$insert into public.product_variants (product_id, sku, price_cents, stock)
  values ('70000000-0000-4000-8000-000000000011', 'TASK007-ZERO', 100, 1)$$,
  '23505', null, 'duplicate variant SKUs are rejected');
select lives_ok($$insert into public.product_images (product_id, storage_path, alt_text)
  values ('70000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000011/admin.png', 'Camiseta azul tamanho M')$$,
  'active admins can attach image metadata with alternative text');
select throws_ok($$insert into public.product_images (product_id, storage_path, alt_text)
  values ('70000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000011/no-alt.png', '   ')$$,
  '23514', null, 'blank image alternative text is rejected');
select lives_ok($$insert into storage.objects (bucket_id, name)
  values ('product-images', '70000000-0000-4000-8000-000000000011/admin.png')$$,
  'active admins can upload under an existing product folder');
select throws_ok($$insert into storage.objects (bucket_id, name)
  values ('product-images', '70000000-0000-4000-8000-000000000099/orphan.png')$$,
  '42501', null, 'admins cannot upload outside an existing product folder');

select * from finish();
rollback;
