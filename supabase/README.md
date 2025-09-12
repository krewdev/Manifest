Setup Supabase policies

1) Open Supabase dashboard → SQL Editor
2) Paste and run the contents of `supabase/policies.sql`
3) Storage → Create bucket named `avatars` and set it to Public
4) Auth → URL Configuration
   - Site URL: your deployed URL
   - Redirect URLs: include your deployed URL and localhost

Environment variables (Vercel)
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (recommended for `api/match.ts`)
- OPENAI_API_KEY (for embeddings in `api/match.ts`)

Notes
- `api/match.ts` uses service key to update `group_id`. Without it, you need policies permitting that update.
- Avatars bucket policies allow users to upload/update `avatars/{uid}.*` or `{uid}.*` paths.


