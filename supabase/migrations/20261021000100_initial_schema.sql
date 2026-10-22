-- TASK-002: relational foundation for the FitStore MVP.
-- Apply with Supabase migrations; auth.users remains the identity source.

create type public.app_role as enum ('customer', 'admin');
create type public.shipping_region_code as enum ('sp', 'southeast', 'south_center_west', 'north_northeast');
create type public.order_status as enum (
  'pending', 'payment_approved', 'preparing', 'shipped', 'delivered', 'cancelled'
);
create type public.payment_method as enum ('pix', 'card', 'boleto');
create type public.payment_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type public.browsing_event_type as enum ('view', 'search', 'category');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 160),
  phone text not null check (length(btrim(phone)) between 8 and 32),
  cpf_formatted text not null unique check (cpf_formatted ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
  role public.app_role not null default 'customer',
  email_confirmed_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  customer_id uuid primary key references public.profiles (id) on delete cascade,
  postal_code text not null check (postal_code ~ '^\d{5}-?\d{3}$'),
  street text not null check (length(btrim(street)) between 1 and 200),
  number text not null check (length(btrim(number)) between 1 and 32),
  complement text check (complement is null or length(complement) <= 160),
  district text not null check (length(btrim(district)) between 1 and 120),
  city text not null check (length(btrim(city)) between 1 and 120),
  state char(2) not null check (state ~ '^[A-Z]{2}$'),
  shipping_region public.shipping_region_code not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  brand text check (brand is null or length(brand) <= 120),
  description text not null default '',
  training_goal text,
  active boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object'),
  sku text not null unique check (length(btrim(sku)) between 1 and 80),
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null unique check (length(btrim(storage_path)) between 1 and 500),
  sort_order integer not null default 0 check (sort_order >= 0),
  alt_text text not null check (length(btrim(alt_text)) between 1 and 240),
  created_at timestamptz not null default now(),
  unique (product_id, sort_order)
);

create table public.carts (
  customer_id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.carts (customer_id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, variant_id)
);

create table public.shipping_regions (
  id uuid primary key default gen_random_uuid(),
  code public.shipping_region_code not null unique,
  name text not null unique check (length(btrim(name)) between 1 and 100),
  states char(2)[] not null default '{}',
  postal_prefixes text[] not null default '{}',
  price_cents integer not null check (price_cents >= 0),
  delivery_days integer not null check (delivery_days > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (array_position(states, null) is null),
  check (array_position(postal_prefixes, null) is null)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,39}$'),
  discount_percent numeric(5,2) not null check (discount_percent > 0 and discount_percent <= 100),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  minimum_order_cents integer not null default 0 check (minimum_order_cents >= 0),
  usage_limit integer not null check (usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0 and usage_count <= usage_limit),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  coupon_id uuid references public.coupons (id) on delete set null,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  shipping_address_snapshot jsonb not null check (jsonb_typeof(shipping_address_snapshot) = 'object'),
  shipping_region public.shipping_region_code not null,
  shipping_days_snapshot integer not null check (shipping_days_snapshot > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_cents <= subtotal_cents),
  check (total_cents = subtotal_cents - discount_cents + shipping_cents)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name_snapshot text not null check (length(btrim(product_name_snapshot)) between 1 and 180),
  sku_snapshot text not null check (length(btrim(sku_snapshot)) between 1 and 80),
  attributes_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes_snapshot) = 'object'),
  price_cents integer not null check (price_cents >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table public.favorites (
  customer_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or length(comment) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create table public.browsing_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  event_type public.browsing_event_type not null,
  occurred_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null check (length(btrim(action)) between 1 and 100),
  entity text not null check (length(btrim(entity)) between 1 and 100),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now()
);

create index products_category_active_idx on public.products (category_id, active);
create index product_variants_product_idx on public.product_variants (product_id);
create index cart_items_customer_idx on public.cart_items (customer_id);
create index cart_items_variant_idx on public.cart_items (variant_id);
create index coupons_active_window_idx on public.coupons (active, starts_at, ends_at);
create index orders_customer_created_status_idx on public.orders (customer_id, created_at desc, status);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_variant_idx on public.order_items (variant_id);
create index reviews_product_created_idx on public.reviews (product_id, created_at desc);
create index browsing_events_customer_occurred_idx on public.browsing_events (customer_id, occurred_at desc);
create index browsing_events_product_occurred_idx on public.browsing_events (product_id, occurred_at desc);
create index audit_logs_entity_occurred_idx on public.audit_logs (entity, entity_id, occurred_at desc);
create index audit_logs_actor_occurred_idx on public.audit_logs (actor_id, occurred_at desc);

-- RLS helper avoids recursive reads of profiles from profile policies.
create function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'::public.app_role and active
  );
$$;
revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.shipping_regions enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.browsing_events enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_read_self_or_admin on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy addresses_owner_manage on public.addresses for all to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()))
  with check (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));

create policy categories_public_read on public.categories for select to anon, authenticated using (active);
create policy categories_admin_manage on public.categories for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));
create policy products_public_read on public.products for select to anon, authenticated using (
  active and exists (select 1 from public.categories c where c.id = category_id and c.active)
);
create policy products_admin_manage on public.products for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));
create policy variants_public_read on public.product_variants for select to anon, authenticated using (
  active and exists (select 1 from public.products p where p.id = product_id and p.active)
);
create policy variants_admin_manage on public.product_variants for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));
create policy product_images_public_read on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.active));
create policy product_images_admin_manage on public.product_images for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));

create policy carts_owner_manage on public.carts for all to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()))
  with check (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy cart_items_owner_manage on public.cart_items for all to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()))
  with check (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy shipping_regions_public_read on public.shipping_regions for select to anon, authenticated
  using (active);
create policy shipping_regions_admin_manage on public.shipping_regions for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));
create policy coupons_admin_manage on public.coupons for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));

create policy orders_owner_read on public.orders for select to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy orders_admin_manage on public.orders for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));
create policy order_items_owner_read on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and
    (o.customer_id = (select auth.uid()) or (select public.current_user_is_admin()))));
create policy order_items_admin_manage on public.order_items for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));

create policy favorites_owner_manage on public.favorites for all to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()))
  with check (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy reviews_owner_read on public.reviews for select to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy reviews_owner_insert on public.reviews for insert to authenticated
  with check (customer_id = (select auth.uid()));
create policy reviews_owner_update on public.reviews for update to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()))
  with check (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy reviews_admin_delete on public.reviews for delete to authenticated
  using ((select public.current_user_is_admin()));
create policy browsing_events_owner_read on public.browsing_events for select to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy browsing_events_owner_insert on public.browsing_events for insert to authenticated
  with check (customer_id = (select auth.uid()) or (select public.current_user_is_admin()));
create policy browsing_events_admin_manage on public.browsing_events for all to authenticated
  using ((select public.current_user_is_admin())) with check ((select public.current_user_is_admin()));
create policy audit_logs_admin_read on public.audit_logs for select to authenticated
  using ((select public.current_user_is_admin()));
create policy audit_logs_admin_insert on public.audit_logs for insert to authenticated
  with check ((select public.current_user_is_admin()));
