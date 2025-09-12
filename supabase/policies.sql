-- Enable Row Level Security on tables
alter table if exists public.profiles enable row level security;
alter table if exists public.intentions enable row level security;
alter table if exists public.comments enable row level security;

-- PROFILES
drop policy if exists "Profiles select all" on public.profiles;
create policy "Profiles select all"
on public.profiles
for select
to authenticated, anon
using (true);

drop policy if exists "Profiles insert own row" on public.profiles;
create policy "Profiles insert own row"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Profiles update own row" on public.profiles;
create policy "Profiles update own row"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- INTENTIONS
drop policy if exists "Intentions select all" on public.intentions;
create policy "Intentions select all"
on public.intentions
for select
to authenticated, anon
using (true);

drop policy if exists "Intentions insert own" on public.intentions;
create policy "Intentions insert own"
on public.intentions
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Intentions update own" on public.intentions;
create policy "Intentions update own"
on public.intentions
for update
to authenticated
using (owner_id = auth.uid())
with check (true);

-- COMMENTS
drop policy if exists "Comments select all" on public.comments;
create policy "Comments select all"
on public.comments
for select
to authenticated, anon
using (true);

drop policy if exists "Comments insert own" on public.comments;
create policy "Comments insert own"
on public.comments
for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "Comments update own" on public.comments;
create policy "Comments update own"
on public.comments
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

-- STORAGE POLICIES (Avatars bucket)
-- Ensure the bucket "avatars" exists
-- dashboard: Storage → Create bucket named "avatars" and set it to Public

-- Enable RLS on storage.objects if not already
alter table if exists storage.objects enable row level security;

-- Read: allow public read from avatars bucket
drop policy if exists "Avatars public read" on storage.objects;
create policy "Avatars public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

-- Insert: allow users to upload their own file path
-- We support two path styles to match current code and future cleanup:
-- 1) name = '{uid}.ext'
-- 2) name = 'avatars/{uid}.ext'
drop policy if exists "Avatars user insert own" on storage.objects;
create policy "Avatars user insert own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '.%')
    or name like ('avatars/' || auth.uid()::text || '.%')
  )
);

-- Update: allow users to update their own file
drop policy if exists "Avatars user update own" on storage.objects;
create policy "Avatars user update own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '.%')
    or name like ('avatars/' || auth.uid()::text || '.%')
  )
)
with check (
  bucket_id = 'avatars'
);

-- Delete: allow users to delete their own file
drop policy if exists "Avatars user delete own" on storage.objects;
create policy "Avatars user delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '.%')
    or name like ('avatars/' || auth.uid()::text || '.%')
  )
);

-- NOTE: The matching and grouping in api/match.ts updates group_id server-side.
-- Set SUPABASE_SERVICE_ROLE_KEY in your Vercel environment so this route bypasses RLS,
-- or add a dedicated policy for that service if you prefer not to use the service key.


