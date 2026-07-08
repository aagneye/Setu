create extension if not exists "uuid-ossp";

create table vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null unique,
  trade text,
  preferred_language text default 'hi',
  created_at timestamptz default now()
);

create table purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  po_number text not null unique,
  vendor_id uuid references vendors(id),
  item_description text not null,
  quantity numeric,
  unit text,
  due_date date not null,
  status text not null default 'ordered',
  is_critical_path boolean default false,
  current_eta date,
  project_site text default 'Site A',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table po_updates (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid references purchase_orders(id),
  source text not null,
  raw_message text,
  original_language text,
  extracted_json jsonb,
  new_status text,
  new_eta date,
  delay_reason text,
  media_url text,
  created_at timestamptz default now()
);

create table grns (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid references purchase_orders(id),
  photo_url text not null,
  verified_quantity numeric,
  verified_item_match boolean,
  mismatch_notes text,
  vision_raw_response jsonb,
  created_at timestamptz default now()
);

create table nudges (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid references purchase_orders(id),
  nudge_number int default 1,
  sent_at timestamptz default now(),
  responded boolean default false,
  escalated_to_pm boolean default false
);

create index on purchase_orders(status);
create index on purchase_orders(due_date);
create index on po_updates(po_id);

-- Enable realtime for dashboard live updates
alter publication supabase_realtime add table purchase_orders;
alter publication supabase_realtime add table po_updates;
alter publication supabase_realtime add table nudges;
