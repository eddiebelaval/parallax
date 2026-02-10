-- Parallax: Real-time conflict resolution schema
-- Sessions + Messages with Realtime enabled

-- Generate random 6-character room codes
create or replace function generate_room_code()
returns text
language plpgsql
as $$
declare
  code text;
  exists_already boolean;
begin
  loop
    -- Uppercase alphanumeric, no ambiguous chars (0/O, 1/I/L)
    code := upper(substr(md5(random()::text), 1, 6));
    code := translate(code, '01IL', 'WXYZ');
    select exists(select 1 from sessions where room_code = code) into exists_already;
    exit when not exists_already;
  end loop;
  return code;
end;
$$;

-- Sessions table
create table sessions (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null default generate_room_code(),
  person_a_name text,
  person_b_name text,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  sender text not null check (sender in ('person_a', 'person_b', 'mediator')),
  content text not null,
  nvc_analysis jsonb,
  emotional_temperature float,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_sessions_room_code on sessions(room_code);
create index idx_sessions_status on sessions(status);
create index idx_messages_session_id on messages(session_id);
create index idx_messages_created_at on messages(session_id, created_at);

-- Auto-update updated_at on sessions
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_updated_at
  before update on sessions
  for each row execute function update_updated_at();

-- Enable Realtime
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table messages;

-- RLS policies (permissive for hackathon — no auth required)
alter table sessions enable row level security;
alter table messages enable row level security;

-- Sessions: anyone can create and read
create policy "Anyone can create sessions"
  on sessions for insert
  with check (true);

create policy "Anyone can read sessions"
  on sessions for select
  using (true);

create policy "Anyone can update sessions"
  on sessions for update
  using (true);

-- Messages: insert if session exists, read by session
create policy "Anyone can insert messages"
  on messages for insert
  with check (exists(select 1 from sessions where id = session_id));

create policy "Anyone can read messages"
  on messages for select
  using (true);
