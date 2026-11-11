begin;
select plan(5);

select has_column('public', 'browsing_events', 'category_id', 'category events store a category identifier');
select has_column('public', 'browsing_events', 'training_goal', 'goal events store a structured training goal');

create temp table task017_cpf_reservations (cpf text primary key);
create or replace function pg_temp.unique_task017_cpf()
returns text language plpgsql as $$
declare digits text; candidate text;
begin
  loop
    digits := lpad(floor(random() * 100000000000)::bigint::text, 11, '0');
    candidate := substring(digits from 1 for 3) || '.' || substring(digits from 4 for 3) || '.' ||
      substring(digits from 7 for 3) || '-' || substring(digits from 10 for 2);
    if not exists (select 1 from public.profiles where cpf_formatted = candidate)
      and not exists (select 1 from pg_temp.task017_cpf_reservations where cpf = candidate) then
      insert into pg_temp.task017_cpf_reservations values (candidate);
      return candidate;
    end if;
  end loop;
end;
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('17000000-0000-4000-8000-000000000001', 'task017-customer-a@example.test', jsonb_build_object(
    'name', 'Task 017 Customer A', 'phone', '11999991701', 'cpf_formatted', pg_temp.unique_task017_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '1',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'))),
  ('17000000-0000-4000-8000-000000000002', 'task017-customer-b@example.test', jsonb_build_object(
    'name', 'Task 017 Customer B', 'phone', '11999991702', 'cpf_formatted', pg_temp.unique_task017_cpf(),
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '2',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp')));
insert into public.categories (id, name, slug)
values ('17000000-0000-4000-8000-000000000010', 'Task 017', 'task-017');
insert into public.products (id, category_id, name, slug, training_goal, active)
values ('17000000-0000-4000-8000-000000000011', '17000000-0000-4000-8000-000000000010', 'Task 017 Product', 'task-017-product', 'Força', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '17000000-0000-4000-8000-000000000001', true);
insert into public.browsing_events (customer_id, event_type, category_id)
values ('17000000-0000-4000-8000-000000000001', 'category', '17000000-0000-4000-8000-000000000010');
insert into public.browsing_events (customer_id, event_type, training_goal)
values ('17000000-0000-4000-8000-000000000001', 'goal', 'Força');
select is((select count(*)::integer from public.browsing_events), 2, 'customer can record their own category and goal signals');

select set_config('request.jwt.claim.sub', '17000000-0000-4000-8000-000000000002', true);
select is((select count(*)::integer from public.browsing_events), 0, 'another customer cannot read the first customer event history');
select throws_ok($$insert into public.browsing_events (customer_id, event_type, product_id)
  values ('17000000-0000-4000-8000-000000000001', 'view', '17000000-0000-4000-8000-000000000011')$$,
  '42501', null, 'another customer cannot write events for the first customer');

select * from finish();
rollback;
