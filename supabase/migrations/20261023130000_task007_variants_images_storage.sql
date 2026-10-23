-- Product images are public catalog assets; object writes remain restricted to active admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy product_images_storage_admin_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (select public.current_user_is_admin())
    and exists (
      select 1 from public.products p
      where p.id::text = (storage.foldername(storage.objects.name))[1]
    )
  );

create policy product_images_storage_admin_update on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.current_user_is_admin())
    and exists (
      select 1 from public.products p
      where p.id::text = (storage.foldername(storage.objects.name))[1]
    )
  )
  with check (
    bucket_id = 'product-images'
    and (select public.current_user_is_admin())
    and exists (
      select 1 from public.products p
      where p.id::text = (storage.foldername(storage.objects.name))[1]
    )
  );

create policy product_images_storage_admin_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.current_user_is_admin())
    and exists (
      select 1 from public.products p
      where p.id::text = (storage.foldername(storage.objects.name))[1]
    )
  );
