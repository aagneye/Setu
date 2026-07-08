create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid references purchase_orders(id),
  alert_type text not null,
  severity text not null default 'warning',
  message text not null,
  acknowledged boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_alerts_ack on alerts(acknowledged);
create index if not exists idx_alerts_po on alerts(po_id);

alter publication supabase_realtime add table alerts;
