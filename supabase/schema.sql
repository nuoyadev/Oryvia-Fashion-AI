-- ════════════════════════════════════════════════════════════════
-- Oryvia — Supabase / Postgres schema (production path)
--
-- Mirrors the local SQLite schema 1:1, with Row Level Security so a
-- user can only ever read their own rows. Photos are stored in
-- Supabase Storage (private bucket) and encrypted with the user's
-- Data Encryption Key before upload.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── core tables ─────────────────────────────────────────────────

create table if not exists public.users (
  id               uuid primary key default gen_random_uuid(),
  email            text unique not null,
  password_hash    text not null,
  name             text,
  avatar           text,
  data_key_wrapped text not null,          -- DEK wrapped with the KEK
  body_profile     jsonb,
  style_dna        jsonb,
  onboarding_done  boolean not null default false,
  created_at       timestamptz not null default now()
);

create table if not exists public.closet_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  category    text not null,               -- tops | bottoms | outerwear | dresses | shoes | accessories
  subcategory text not null default '',
  color       text,
  color_name  text,
  brand       text,
  tags        jsonb not null default '[]',
  image       text,                        -- storage object path
  created_at  timestamptz not null default now()
);
create index if not exists idx_closet_user on public.closet_items(user_id);

create table if not exists public.outfits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  occasion     text not null,
  city         text,
  look         jsonb not null,
  alternatives jsonb not null default '[]',
  feedback     text,                       -- like | dislike | null
  created_at   timestamptz not null default now()
);
create index if not exists idx_outfits_user on public.outfits(user_id);

create table if not exists public.inspiration_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  source     text not null,
  note       text,
  palette    jsonb not null default '[]',
  tags       jsonb not null default '[]',
  image      text,
  created_at timestamptz not null default now()
);
create index if not exists idx_insp_user on public.inspiration_items(user_id);

create table if not exists public.shopping_lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  goal       text not null,
  budget     numeric not null,
  style      text not null,
  items      jsonb not null default '[]',
  total      numeric not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_shopping_user on public.shopping_lists(user_id);

create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  role       text not null,               -- user | assistant
  content    jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_chat_user on public.chat_messages(user_id);

create table if not exists public.style_snapshots (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  trigger    text not null,               -- onboarding | like | dislike | reset
  dna        jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_snap_user on public.style_snapshots(user_id);

create table if not exists public.tryons (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  outfit_id  uuid,
  look_name  text not null,
  image      text not null,               -- encrypted blob path
  verdict    jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_tryons_user on public.tryons(user_id);

-- ── Row Level Security ──────────────────────────────────────────

alter table public.users             enable row level security;
alter table public.closet_items      enable row level security;
alter table public.outfits           enable row level security;
alter table public.inspiration_items enable row level security;
alter table public.shopping_lists    enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.style_snapshots   enable row level security;
alter table public.tryons            enable row level security;

create policy "own users"        on public.users             for all using (id = auth.uid());
create policy "own closet"       on public.closet_items      for all using (user_id = auth.uid());
create policy "own outfits"      on public.outfits           for all using (user_id = auth.uid());
create policy "own inspiration"  on public.inspiration_items for all using (user_id = auth.uid());
create policy "own shopping"     on public.shopping_lists    for all using (user_id = auth.uid());
create policy "own chat"         on public.chat_messages     for all using (user_id = auth.uid());
create policy "own snapshots"    on public.style_snapshots   for all using (user_id = auth.uid());
create policy "own tryons"       on public.tryons            for all using (user_id = auth.uid());

-- ── Storage (private, encrypted blobs) ──────────────────────────

insert into storage.buckets (id, name, public)
values ('oryvia-vault', 'oryvia-vault', false)
on conflict (id) do nothing;

create policy "owner can read vault"
  on storage.objects for select
  using (bucket_id = 'oryvia-vault' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner can write vault"
  on storage.objects for insert
  with check (bucket_id = 'oryvia-vault' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner can delete vault"
  on storage.objects for delete
  using (bucket_id = 'oryvia-vault' and (storage.foldername(name))[1] = auth.uid()::text);
