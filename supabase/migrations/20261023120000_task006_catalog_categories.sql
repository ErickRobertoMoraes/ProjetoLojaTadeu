-- The three top-level shopping categories are part of the approved catalog requirements.
insert into public.categories (name, slug)
values
  ('Roupas', 'roupas'),
  ('Suplementos', 'suplementos'),
  ('Acessórios', 'acessorios')
on conflict (slug) do nothing;
