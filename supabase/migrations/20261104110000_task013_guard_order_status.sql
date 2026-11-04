-- Prevent direct status changes from bypassing the transition and inventory RPC.
create or replace function public.require_order_status_rpc()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and current_user <> 'postgres' then
    raise exception using errcode = '42501', message = 'order_status_rpc_required';
  end if;
  return new;
end;
$$;

revoke all on function public.require_order_status_rpc() from public, anon, authenticated;

create trigger orders_status_requires_rpc
before update of status on public.orders
for each row execute function public.require_order_status_rpc();
