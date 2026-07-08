create table if not exists webhook_idempotency (
  message_sid text primary key,
  processed_at timestamptz default now()
);

create index if not exists idx_webhook_idempotency_at on webhook_idempotency(processed_at desc);
