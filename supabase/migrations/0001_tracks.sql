-- tracks: one row per exported lo-fi render
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  original_name text not null,
  file_name text not null,
  storage_url text not null,
  effects text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tracks_user_id_created_at_idx
  on public.tracks (user_id, created_at desc);

-- The browser uses the anon key, so RLS must allow inserts/selects scoped by
-- the localStorage-derived user_id. Until real auth lands, scope by the same
-- text id the client sends.
alter table public.tracks enable row level security;

drop policy if exists "tracks_anon_select" on public.tracks;
create policy "tracks_anon_select"
  on public.tracks for select
  to anon
  using (true);

drop policy if exists "tracks_anon_insert" on public.tracks;
create policy "tracks_anon_insert"
  on public.tracks for insert
  to anon
  with check (true);
