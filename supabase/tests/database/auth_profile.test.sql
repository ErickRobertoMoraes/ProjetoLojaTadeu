begin;

select plan(12);


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

insert into auth.users (id, email, raw_user_meta_data) values (
  '40000000-0000-4000-8000-000000000001',
  'task003-customer@example.test',
  jsonb_build_object(
    'name', 'Task Three Customer',
    'phone', '11999990004',
    'cpf_formatted', pg_temp.unique_test_cpf(),
    'role', 'admin',
    'address', jsonb_build_object(
      'postal_code', '01001000', 'street', 'Rua de Teste', 'number', '10',
      'complement', 'Apto 2', 'district', 'Sé', 'city', 'São Paulo',
      'state', 'SP', 'shipping_region', 'sp'
    )
  )
);
select set_config('task.test.updated_cpf', pg_temp.unique_test_cpf(), true);

select is(
  (select role::text from public.profiles where id = '40000000-0000-4000-8000-000000000001'),
  'customer', 'signup metadata cannot grant an admin role'
);
select is(
  (select name from public.profiles where id = '40000000-0000-4000-8000-000000000001'),
  'Task Three Customer', 'signup creates the customer profile'
);
select is(
  (select count(*) from public.addresses where customer_id = '40000000-0000-4000-8000-000000000001'),
  1::bigint, 'signup creates exactly one address'
);
select is(
  (select postal_code from public.addresses where customer_id = '40000000-0000-4000-8000-000000000001'),
  '01001000', 'signup stores the submitted postal code'
);
select lives_ok(
  $$update auth.users set email_confirmed_at = now()
    where id = '40000000-0000-4000-8000-000000000001'$$,
  'Auth confirmation update succeeds'
);
select ok(
  (select email_confirmed_at is not null from public.profiles
    where id = '40000000-0000-4000-8000-000000000001'),
  'email confirmation is synchronized to the profile'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$select public.update_customer_profile('Updated Name', '11988887777', current_setting('task.test.updated_cpf'))$$,
  'customer can update allowed profile fields through the scoped function'
);
select throws_ok(
  $$update public.profiles set role = 'admin'
    where id = '40000000-0000-4000-8000-000000000001'$$,
  '42501', null, 'customer cannot promote their own role'
);
select is(
  (select role::text from public.profiles where id = '40000000-0000-4000-8000-000000000001'),
  'customer', 'customer cannot promote their own role'
);
select is(
  (select count(*) from public.addresses where customer_id = '20000000-0000-4000-8000-000000000002'),
  0::bigint, 'customer cannot read another customer address'
);
select throws_ok(
  $$insert into public.addresses (customer_id, postal_code, street, number, district, city, state, shipping_region)
    values ('40000000-0000-4000-8000-000000000001', '01001000', 'Second Street', '11', 'Sé', 'São Paulo', 'SP', 'sp')$$,
  '23505', null, 'customer cannot create a second address'
);
reset role;

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data)
    values ('40000000-0000-4000-8000-000000000002', 'invalid-task003@example.test', '{}'::jsonb)$$,
  '22023', 'Invalid customer signup data', 'signup without required metadata is rejected'
);

select * from finish();
rollback;
