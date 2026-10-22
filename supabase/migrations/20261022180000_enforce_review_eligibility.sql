-- RN-007: only the customer who owns a delivered order may review a product
-- included in that order. Enforce the rule in PostgreSQL so direct Data API
-- requests cannot bypass it.

drop policy reviews_owner_insert on public.reviews;
create policy reviews_owner_insert on public.reviews for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      join public.product_variants pv on pv.id = oi.variant_id
      where o.id = reviews.order_id
        and o.customer_id = (select auth.uid())
        and o.status = 'delivered'
        and pv.product_id = reviews.product_id
    )
  );

drop policy reviews_owner_update on public.reviews;
create policy reviews_owner_update on public.reviews for update to authenticated
  using (customer_id = (select auth.uid()) or (select public.current_user_is_admin()))
  with check (
    (select public.current_user_is_admin())
    or (
      customer_id = (select auth.uid())
      and exists (
        select 1
        from public.orders o
        join public.order_items oi on oi.order_id = o.id
        join public.product_variants pv on pv.id = oi.variant_id
        where o.id = reviews.order_id
          and o.customer_id = (select auth.uid())
          and o.status = 'delivered'
          and pv.product_id = reviews.product_id
      )
    )
  );
