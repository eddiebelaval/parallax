-- Private coaching messages: per-person, per-session side conversations with Parallax.
-- Separate table from messages to prevent Realtime leakage of private coaching data.
-- No RLS policies needed — all access goes through API routes with service role key.

create table coaching_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  person text not null check (person in ('person_a', 'person_b')),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

create index idx_coaching_session_person on coaching_messages(session_id, person);
