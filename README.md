# Cube Ascent

Endless 2D vertical climbing game. Jump a cube as high as you can. There is no finish line.

## Setup

```bash
npm install
npm run dev
```

Open the local Vite URL (usually `http://localhost:5173`).

## Supabase leaderboard

1. Create a Supabase project.
2. Copy `.env.example` to `.env`.
3. Set only the **anon/public** key (never the service-role key):

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

4. Run this SQL in the Supabase SQL editor:

```sql
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
```

Without env vars the game still runs and keeps a local best height on this device.

## Controls

- **A / D** or arrows: move
- **Space**, **W**, or **Up**: jump
- **Esc**: pause
- **F3**: hitbox debug overlay

## Notes

Gameplay runs on an HTML5 Canvas `requestAnimationFrame` loop. React only owns menus, HUD, and leaderboard so the climb stays smooth.
