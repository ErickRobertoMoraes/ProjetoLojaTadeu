-- TASK-017: store only structured, first-party recommendation signals.
alter type public.browsing_event_type add value if not exists 'goal';

alter table public.browsing_events
  add column category_id uuid references public.categories (id) on delete set null,
  add column training_goal text check (training_goal is null or length(btrim(training_goal)) between 1 and 120);

alter table public.browsing_events
  add constraint browsing_events_category_signal_check check (
    event_type <> 'category'::public.browsing_event_type
    or not (category_id is not null and training_goal is not null)
  ) not valid;

create index browsing_events_customer_category_idx
  on public.browsing_events (customer_id, category_id, occurred_at desc)
  where category_id is not null;

create index browsing_events_customer_goal_idx
  on public.browsing_events (customer_id, training_goal, occurred_at desc)
  where training_goal is not null;
