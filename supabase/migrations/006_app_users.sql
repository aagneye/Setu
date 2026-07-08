create table if not exists app_users (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'pm',
  created_at timestamptz default now()
);

create index if not exists idx_app_users_email on app_users(email);
