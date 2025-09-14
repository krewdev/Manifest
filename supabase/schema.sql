-- Enable required extensions (uncomment if needed)
-- create extension if not exists pgcrypto;
-- create extension if not exists vector;

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  location_general text,
  avatar_url text,
  updated_at timestamptz default now()
);

create table if not exists public.intentions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text default 'active',
  group_id uuid,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  intention_id uuid not null references public.intentions(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- Optional: pgvector similarity function expected by api/match.ts
-- Replace with your implementation or drop if not using pgvector
-- create or replace function public.match_intentions(
--   query_embedding vector(1536),
--   match_threshold float,
--   match_count int
-- ) returns table (
--   id uuid,
--   title text,
--   description text,
--   owner_id uuid,
--   group_id uuid,
--   similarity float
-- ) language sql stable as $$
--   select i.id, i.title, i.description, i.owner_id, i.group_id,
--          1 - (i.embedding <=> query_embedding) as similarity
--   from public.intentions i
--   where i.embedding is not null
--     and 1 - (i.embedding <=> query_embedding) > match_threshold
--   order by i.embedding <=> query_embedding
--   limit match_count;
-- $$;

