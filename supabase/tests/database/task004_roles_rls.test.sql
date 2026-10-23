begin;

select plan(13);

insert into auth.users (id, email, raw_user_meta_data) values
  ('50000000-0000-4000-8000-000000000001', 'task004-admin-one@example.test', jsonb_build_object(
    'name', 'First Admin', 'phone', '11999990001', 'cpf_formatted', '529.982.247-25',
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '1',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'))),
  ('50000000-0000-4000-8000-000000000002', 'task004-admin-two@example.test', jsonb_build_object(
    'name', 'Second Admin', 'phone', '11999990002', 'cpf_formatted', '111.444.777-35',
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '2',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp'))),
  ('50000000-0000-4000-8000-000000000003', 'task004-customer@example.test', jsonb_build_object(
    'name', 'Regular Customer', 'phone', '11999990003', 'cpf_formatted', '123.456.789-09',
    'address', jsonb_build_object('postal_code', '01001000', 'street', 'Rua Teste', 'number', '3',
      'district', 'Sé', 'city', 'São Paulo', 'state', 'SP', 'shipping_region', 'sp')));

update public.profiles set role = 'admin'
where id in ('50000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002');

set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-4000-8000-000000000001', true);

select is((select role::text from public.profiles where id = '50000000-0000-4000-8000-000000000003'),
  'customer', 'admin can read a customer profile');
select throws_ok($$update public.profiles set role = 'admin'
  where id = '50000000-0000-4000-8000-000000000003'$$,
  '42501', null, 'direct role updates are denied even to an administrator');
select throws_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000003', null)$$,
  '22023', 'Invalid administrator action', 'null action is rejected');
select lives_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000003', 'promote')$$,
  'administrator can promote an active customer');
select is((select role::text from public.profiles where id = '50000000-0000-4000-8000-000000000003'),
  'admin', 'promotion changes the target role');
select lives_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000002', 'deactivate')$$,
  'administrator can deactivate another administrator while one remains');
select ok(not (select active from public.profiles where id = '50000000-0000-4000-8000-000000000002'),
  'deactivation marks the target inactive');
select lives_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000003', 'deactivate')$$,
  'administrator can deactivate another administrator while one remains');
select throws_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000001', 'deactivate')$$,
  'P0001', 'Cannot deactivate the last active administrator', 'last active administrator cannot be deactivated');

reset role;
update public.profiles set active = true
where id = '50000000-0000-4000-8000-000000000002';
update public.profiles set role = 'customer', active = true
where id = '50000000-0000-4000-8000-000000000003';

set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-4000-8000-000000000003', true);
select throws_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000001', 'deactivate')$$,
  '42501', 'Administrator access required', 'customer cannot call administrator management');
select throws_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000003', 'promote')$$,
  '42501', 'Administrator access required', 'customer cannot promote themselves');

reset role;
update public.profiles set active = false
where id = '50000000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-4000-8000-000000000001', true);
select throws_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000001', 'deactivate')$$,
  'P0001', 'Cannot deactivate the last active administrator', 'sole active administrator cannot disable their account');
select throws_ok($$select public.manage_admin_access(
  '50000000-0000-4000-8000-000000000002', 'deactivate')$$,
  '22023', 'Target is not an active administrator', 'inactive admin is not treated as an active admin target');

select * from finish();
rollback;
