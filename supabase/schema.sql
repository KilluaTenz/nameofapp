create table if not exists public.player_scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 24),
  height integer not null check (height >= 0),
  created_at timestamptz not null default now()
);

alter table public.player_scores enable row level security;

create policy "public can read scores"
  on public.player_scores for select
  to anon, authenticated
  using (true);

create policy "public can insert scores"
  on public.player_scores for insert
  to anon, authenticated
  with check (
    char_length(player_name) between 1 and 24
    and height >= 0
    and height < 100000000
  );
