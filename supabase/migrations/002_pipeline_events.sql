create table if not exists pipeline_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  pipeline text not null,
  po_id uuid references purchase_orders(id),
  po_number text,
  vendor_phone text,
  payload jsonb,
  error_message text,
  duration_ms int,
  created_at timestamptz default now()
);

create index if not exists idx_pipeline_events_type on pipeline_events(event_type);
create index if not exists idx_pipeline_events_created on pipeline_events(created_at desc);
