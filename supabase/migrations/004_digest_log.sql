create table if not exists digest_log (
  id uuid primary key default uuid_generate_v4(),
  summary jsonb not null,
  message text not null,
  created_at timestamptz default now()
);

create index if not exists idx_digest_log_created on digest_log(created_at desc);
