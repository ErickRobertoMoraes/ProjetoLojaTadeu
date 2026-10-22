begin;

select plan(86);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'addresses', 'addresses table exists');
select has_table('public', 'categories', 'categories table exists');
select has_table('public', 'products', 'products table exists');
select has_table('public', 'product_variants', 'product variants table exists');
select has_table('public', 'product_images', 'product images table exists');
select has_table('public', 'carts', 'carts table exists');
select has_table('public', 'cart_items', 'cart items table exists');
select has_table('public', 'shipping_regions', 'shipping regions table exists');
select has_table('public', 'coupons', 'coupons table exists');
select has_table('public', 'orders', 'orders table exists');
select has_table('public', 'order_items', 'order items table exists');
select has_table('public', 'reviews', 'reviews table exists');
select has_table('public', 'favorites', 'favorites table exists');
select has_table('public', 'browsing_events', 'browsing events table exists');
select has_table('public', 'audit_logs', 'audit logs table exists');
select has_pk('public', 'profiles', 'profiles primary key exists');
select has_pk('public', 'addresses', 'addresses primary key exists');
select has_pk('public', 'categories', 'categories primary key exists');
select has_pk('public', 'products', 'products primary key exists');
select has_pk('public', 'product_variants', 'product variants primary key exists');
select has_pk('public', 'product_images', 'product images primary key exists');
select has_pk('public', 'carts', 'carts primary key exists');
select has_pk('public', 'cart_items', 'cart items primary key exists');
select has_pk('public', 'shipping_regions', 'shipping regions primary key exists');
select has_pk('public', 'coupons', 'coupons primary key exists');
select has_pk('public', 'orders', 'orders primary key exists');
select has_pk('public', 'order_items', 'order items primary key exists');
select has_pk('public', 'reviews', 'reviews primary key exists');
select has_pk('public', 'favorites', 'favorites composite primary key exists');
select has_pk('public', 'browsing_events', 'browsing events primary key exists');
select has_pk('public', 'audit_logs', 'audit logs primary key exists');
select has_index('public', 'products', 'products_slug_key', 'product slug is indexed uniquely');
select has_index('public', 'orders', 'orders_customer_created_status_idx', 'customer order history index exists');
select has_index('public', 'products', 'products_category_active_idx', 'category and active index exists');
select has_index('public', 'product_variants', 'product_variants_product_idx', 'variant product index exists');
select has_index('public', 'browsing_events', 'browsing_events_customer_occurred_idx', 'event history index exists');
select has_index('public', 'coupons', 'coupons_code_key', 'coupon code is indexed uniquely');
select has_index('public', 'order_items', 'order_items_order_idx', 'order items order index exists');
select has_index('public', 'reviews', 'reviews_customer_id_product_id_key', 'customer can review a product only once');
select has_index('public', 'shipping_regions', 'shipping_regions_code_key', 'shipping region code is indexed uniquely');
select ok(
  (select count(*) = 16 from pg_class where relnamespace = 'public'::regnamespace
    and relkind = 'r' and relrowsecurity),
  'RLS is enabled on every domain table'
);

insert into public.categories (id, name, slug)
values ('10000000-0000-4000-8000-000000000001', 'Schema test', 'schema-test');
insert into public.products (id, category_id, name, slug, active)
values (
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  'Schema test product',
  'schema-test-product',
  true
);
insert into public.products (id, category_id, name, slug)
values (
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000001',
  'Schema test product two',
  'schema-test-product-two'
);
insert into public.product_variants (id, product_id, sku, price_cents, stock) values
  ('10000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'SCHEMA-TEST-1', 100, 10),
  ('10000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000004', 'SCHEMA-TEST-2', 100, 10);
insert into auth.users (id, email, raw_user_meta_data) values
  ('20000000-0000-4000-8000-000000000001', 'task002-customer-a@example.test', jsonb_build_object(
    'name', 'Customer A', 'phone', '11999990001', 'cpf_formatted', '529.982.247-25',
    'address', jsonb_build_object('postal_code', '01000-000', 'street', 'Test Street A', 'number', '1',
      'district', 'Center', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'))),
  ('20000000-0000-4000-8000-000000000002', 'task002-customer-b@example.test', jsonb_build_object(
    'name', 'Customer B', 'phone', '11999990002', 'cpf_formatted', '111.444.777-35',
    'address', jsonb_build_object('postal_code', '20000-000', 'street', 'Test Street B', 'number', '2',
      'district', 'Center', 'city', 'Rio de Janeiro', 'state', 'RJ', 'shipping_region', 'southeast'))),
  ('20000000-0000-4000-8000-000000000003', 'task002-admin@example.test', jsonb_build_object(
    'name', 'Schema admin', 'phone', '11999990003', 'cpf_formatted', '935.411.347-80',
    'address', jsonb_build_object('postal_code', '01000-000', 'street', 'Admin Street', 'number', '3',
      'district', 'Center', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'),
    'role', 'admin'));
update public.profiles set role = 'admin' where id = '20000000-0000-4000-8000-000000000003';
insert into public.carts (customer_id) values
  ('20000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002');
insert into public.cart_items (customer_id, variant_id, quantity) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 1),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 1);
insert into public.favorites (customer_id, product_id) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002');
insert into public.orders (
  id, customer_id, status, payment_method, subtotal_cents, shipping_cents,
  total_cents, shipping_address_snapshot, shipping_region, shipping_days_snapshot
) values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'pending', 'pix', 100, 0, 100, '{}'::jsonb, 'sp', 1),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'delivered', 'pix', 100, 0, 100, '{}'::jsonb, 'sp', 1),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'delivered', 'pix', 100, 0, 100, '{}'::jsonb, 'sp', 1);
insert into public.order_items (
  order_id, variant_id, product_name_snapshot, sku_snapshot,
  price_cents, quantity
) values
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 'Schema test product', 'SCHEMA-TEST-1', 100, 1),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'Schema test product', 'SCHEMA-TEST-1', 100, 1);
insert into public.coupons (code, discount_percent, starts_at, ends_at, usage_limit)
values ('TASK002-TEST', 10, now(), now() + interval '1 day', 10);

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select is((select count(*) from public.profiles), 1::bigint, 'customer reads own profile only');
select is((select count(*) from public.addresses), 1::bigint, 'customer reads own address only');
select is((select count(*) from public.addresses where customer_id = '20000000-0000-4000-8000-000000000002'), 0::bigint, 'customer cannot read another customer address');
select is((select count(*) from public.carts where customer_id = '20000000-0000-4000-8000-000000000002'), 0::bigint, 'customer cannot read another customer cart');
select is((select count(*) from public.cart_items where customer_id = '20000000-0000-4000-8000-000000000002'), 0::bigint, 'customer cannot read another customer cart items');
select is((select count(*) from public.favorites where customer_id = '20000000-0000-4000-8000-000000000002'), 0::bigint, 'customer cannot read another customer favorites');
select is((select count(*) from public.orders where customer_id = '20000000-0000-4000-8000-000000000002'), 0::bigint, 'customer cannot read another customer orders');
update public.addresses set street = 'Unauthorized change'
where customer_id = '20000000-0000-4000-8000-000000000002';
update public.cart_items set quantity = 9
where customer_id = '20000000-0000-4000-8000-000000000002';
delete from public.favorites
where customer_id = '20000000-0000-4000-8000-000000000002';
update public.orders set status = 'cancelled'
where customer_id = '20000000-0000-4000-8000-000000000002';
select throws_ok(
  $$insert into public.favorites (customer_id, product_id)
    values ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004')$$,
  '42501', null, 'customer cannot create a favorite for another customer'
);
select throws_ok(
  $$insert into public.categories (name, slug) values ('Client category', 'client-category')$$,
  '42501', null, 'customer cannot create administrative categories'
);
select throws_ok(
  $$insert into public.products (category_id, name, slug)
    values ('10000000-0000-4000-8000-000000000001', 'Client product', 'client-product')$$,
  '42501', null, 'customer cannot create administrative products'
);
select throws_ok(
  $$insert into public.coupons (code, discount_percent, starts_at, ends_at, usage_limit)
    values ('CLIENT-COUPON', 10, now(), now() + interval '1 day', 10)$$,
  '42501', null, 'customer cannot create administrative coupons'
);
update public.coupons set usage_count = 1 where code = 'TASK002-TEST';
update public.orders set status = 'cancelled'
where id = '30000000-0000-4000-8000-000000000001';
reset role;
select is((select count(*) from public.addresses
  where customer_id = '20000000-0000-4000-8000-000000000002' and street = 'Test Street B'),
  1::bigint, 'customer cannot change another customer address');
select is((select count(*) from public.cart_items
  where customer_id = '20000000-0000-4000-8000-000000000002' and quantity = 1),
  1::bigint, 'customer cannot change another customer cart');
select is((select count(*) from public.favorites
  where customer_id = '20000000-0000-4000-8000-000000000002'
    and product_id = '10000000-0000-4000-8000-000000000002'),
  1::bigint, 'customer cannot delete another customer favorite');
select is((select count(*) from public.orders
  where customer_id = '20000000-0000-4000-8000-000000000002' and status = 'delivered'),
  1::bigint, 'customer cannot change another customer order');
select is((select count(*) from public.coupons
  where code = 'TASK002-TEST' and usage_count = 0),
  1::bigint, 'customer cannot change administrative coupons');
select is((select count(*) from public.orders
  where id = '30000000-0000-4000-8000-000000000001' and status = 'pending'),
  1::bigint, 'customer cannot change administrative order status');
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$insert into public.reviews (customer_id, product_id, order_id, rating)
    values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002',
      '30000000-0000-4000-8000-000000000001', 5)$$,
  '42501', null, 'customer cannot review before order delivery'
);
select throws_ok(
  $$insert into public.reviews (customer_id, product_id, order_id, rating)
    values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002',
      '30000000-0000-4000-8000-000000000003', 5)$$,
  '42501', null, 'customer cannot review another customer order'
);
select throws_ok(
  $$insert into public.reviews (customer_id, product_id, order_id, rating)
    values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004',
      '30000000-0000-4000-8000-000000000002', 5)$$,
  '42501', null, 'customer cannot review a product absent from delivered order'
);
select lives_ok(
  $$insert into public.reviews (customer_id, product_id, order_id, rating)
    values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002',
      '30000000-0000-4000-8000-000000000002', 5)$$,
  'customer can review a product from own delivered order'
);
select throws_ok(
  $$update public.reviews set order_id = '30000000-0000-4000-8000-000000000003'
    where customer_id = '20000000-0000-4000-8000-000000000001'
      and product_id = '10000000-0000-4000-8000-000000000002'$$,
  '42501', null, 'customer cannot move review to another customer order'
);
select throws_ok(
  $$update public.reviews set product_id = '10000000-0000-4000-8000-000000000004'
    where customer_id = '20000000-0000-4000-8000-000000000001'
      and product_id = '10000000-0000-4000-8000-000000000002'$$,
  '42501', null, 'customer cannot change review to unpurchased product'
);
select throws_ok(
  $$insert into public.orders (
    customer_id, payment_method, subtotal_cents, shipping_cents, total_cents,
    shipping_address_snapshot, shipping_region, shipping_days_snapshot
  ) values (
    '20000000-0000-4000-8000-000000000001', 'pix', 100, 0, 100, '{}'::jsonb, 'sp', 1
  )$$,
  '42501', null, 'customer cannot create orders directly through the database API'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000003', true);
select is((select count(*) from public.profiles), 3::bigint, 'active admin can read profiles');
select is((select count(*) from public.addresses), 3::bigint, 'active admin can read customer addresses');
select is((select count(*) from public.coupons), 1::bigint, 'active admin can read coupons');
select lives_ok(
  $$insert into public.categories (name, slug, active)
    values ('Admin test category', 'admin-test-category', false)$$,
  'active admin can create categories'
);
select lives_ok(
  $$insert into public.products (category_id, name, slug, active)
    values ('10000000-0000-4000-8000-000000000001', 'Admin test product', 'admin-test-product', false)$$,
  'active admin can create products'
);
select lives_ok(
  $$update public.coupons set usage_count = 1 where code = 'TASK002-TEST'$$,
  'active admin can update coupons'
);
select lives_ok(
  $$update public.orders set status = 'preparing'
    where id = '30000000-0000-4000-8000-000000000001'$$,
  'active admin can update order status'
);

reset role;
set local role anon;
select is((select count(*) from public.orders), 0::bigint, 'anonymous cannot read private orders');
select is((select count(*) from public.profiles), 0::bigint, 'anonymous cannot read private profiles');
select is((select count(*) from public.addresses), 0::bigint, 'anonymous cannot read private addresses');
select is((select count(*) from public.carts), 0::bigint, 'anonymous cannot read private carts');
select is((select count(*) from public.coupons), 0::bigint, 'anonymous cannot read coupons');
select is((select count(*) from public.audit_logs), 0::bigint, 'anonymous cannot read private audit logs');
select is((select count(*) from public.categories where slug = 'schema-test'), 1::bigint, 'anonymous can read active catalog categories');
select is((select count(*) from public.products where slug = 'schema-test-product'), 1::bigint, 'anonymous can read active catalog products');

reset role;

select throws_ok(
  $$insert into public.products (category_id, name, slug)
    values ('10000000-0000-4000-8000-000000000099', 'Orphan', 'orphan-product')$$,
  '23503', null, 'product category foreign key is enforced'
);
select throws_ok(
  $$insert into public.product_variants (product_id, sku, price_cents, stock)
    values ('10000000-0000-4000-8000-000000000099', 'ORPHAN', 100, 1)$$,
  '23503', null, 'variant product foreign key is enforced'
);
select throws_ok(
  $$insert into public.product_variants (product_id, sku, price_cents, stock)
    values ('10000000-0000-4000-8000-000000000002', 'NEGATIVE-PRICE', -1, 1)$$,
  '23514', null, 'negative variant price is rejected'
);
select throws_ok(
  $$insert into public.product_variants (product_id, sku, price_cents, stock)
    values ('10000000-0000-4000-8000-000000000002', 'NEGATIVE-STOCK', 100, -1)$$,
  '23514', null, 'negative stock is rejected'
);
select throws_ok(
  $$insert into public.reviews (customer_id, product_id, order_id, rating)
    values (
      '10000000-0000-4000-8000-000000000099',
      '10000000-0000-4000-8000-000000000099',
      '10000000-0000-4000-8000-000000000099',
      6
    )$$,
  '23514', null, 'review rating must be between one and five'
);

select * from finish();
rollback;
