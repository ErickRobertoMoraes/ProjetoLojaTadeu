-- Evaluate review eligibility outside the caller's row-level visibility while
-- limiting the check to the authenticated user's own delivered purchases.
create or replace function public.customer_can_review_order_product(
  p_customer_id uuid,
  p_product_id uuid,
  p_order_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_customer_id = (select auth.uid())
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      join public.product_variants pv on pv.id = oi.variant_id
      where o.id = p_order_id
        and o.customer_id = (select auth.uid())
        and o.status = 'delivered'
        and pv.product_id = p_product_id
    );
$$;

revoke all on function public.customer_can_review_order_product(uuid, uuid, uuid) from public;
grant execute on function public.customer_can_review_order_product(uuid, uuid, uuid) to authenticated;

drop policy reviews_owner_insert on public.reviews;
create policy reviews_owner_insert on public.reviews for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and (select public.customer_can_review_order_product(customer_id, product_id, order_id))
  );

drop policy reviews_owner_update on public.reviews;
create policy reviews_owner_update on public.reviews for update to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()))
  with check (
    (select public.current_user_is_admin())
    or (
      customer_id = (select auth.uid())
      and (select public.customer_can_review_order_product(customer_id, product_id, order_id))
    )
  );
