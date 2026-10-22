-- TASK-003: create customer identity data only from validated signup metadata.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_address jsonb := new.raw_user_meta_data -> 'address';
  v_name text := nullif(btrim(new.raw_user_meta_data ->> 'name'), '');
  v_phone text := nullif(btrim(new.raw_user_meta_data ->> 'phone'), '');
  v_cpf text := nullif(btrim(new.raw_user_meta_data ->> 'cpf_formatted'), '');
begin
  if v_name is null or length(v_name) > 160
    or v_phone is null or length(v_phone) not between 8 and 32
    or v_cpf !~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'
    or jsonb_typeof(v_address) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'Invalid customer signup data';
  end if;

  insert into public.profiles (id, name, phone, cpf_formatted, role, email_confirmed_at, active)
  values (new.id, v_name, v_phone, v_cpf, 'customer', new.email_confirmed_at, true);

  insert into public.addresses (
    customer_id, postal_code, street, number, complement, district, city, state, shipping_region
  ) values (
    new.id,
    coalesce(v_address ->> 'postal_code', ''),
    coalesce(v_address ->> 'street', ''),
    coalesce(v_address ->> 'number', ''),
    nullif(v_address ->> 'complement', ''),
    coalesce(v_address ->> 'district', ''),
    coalesce(v_address ->> 'city', ''),
    upper(coalesce(v_address ->> 'state', '')),
    coalesce(v_address ->> 'shipping_region', '')::public.shipping_region_code
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.sync_customer_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email_confirmed_at = new.email_confirmed_at, updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_email_confirmation_updated on auth.users;
create trigger on_auth_email_confirmation_updated
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is distinct from new.email_confirmed_at)
  execute function public.sync_customer_email_confirmation();

create or replace function public.update_customer_profile(
  p_name text,
  p_phone text,
  p_cpf_formatted text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if length(btrim(coalesce(p_name, ''))) not between 1 and 160
    or length(btrim(coalesce(p_phone, ''))) not between 8 and 32
    or p_cpf_formatted !~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' then
    raise exception using errcode = '22023', message = 'Invalid customer profile data';
  end if;

  update public.profiles
  set name = btrim(p_name), phone = btrim(p_phone), cpf_formatted = p_cpf_formatted,
      updated_at = now()
  where id = v_user_id and role = 'customer'::public.app_role and active;

  if not found then
    raise exception using errcode = '42501', message = 'Customer profile unavailable';
  end if;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.sync_customer_email_confirmation() from public, anon, authenticated;
revoke all on function public.update_customer_profile(text, text, text) from public, anon;
grant execute on function public.update_customer_profile(text, text, text) to authenticated;
