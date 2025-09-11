import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { intentionId, title, description } = req.body || {};
    if (!title || !intentionId) return res.status(400).json({ error: 'Missing fields' });

    const text = `${title} ${description || ''}`.trim();

    // Create embedding
    const emb = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
    const vector = emb.data?.[0]?.embedding;
    if (!vector) return res.status(500).json({ error: 'Embedding failed' });

    // Persist embedding to the intention
    await supabase.from('intentions').update({ embedding: vector }).eq('id', intentionId);

    // Find similar intentions using pgvector function if available, else simple text ILIKE as fallback
    const { data: similar, error } = await supabase.rpc('match_intentions', { query_embedding: vector, match_threshold: 0.83, match_count: 10 });

    if (error) {
      // Fallback naive search by title overlap
      const { data: fallback } = await supabase
        .from('intentions')
        .select('id, title, group_id')
        .ilike('title', `%${title.split(' ')[0]}%`)
        .limit(10);
      if (!fallback || fallback.length === 0) return res.status(200).json({ grouped: false });
      const existingGroup = fallback.find(r => r.group_id)?.group_id;
      if (existingGroup) {
        await supabase.from('intentions').update({ group_id: existingGroup }).eq('id', intentionId);
        return res.status(200).json({ grouped: true, groupId: existingGroup });
      }
      const groupId = crypto.randomUUID();
      const ids = [intentionId, ...fallback.map(r => r.id)];
      await supabase.from('intentions').update({ group_id: groupId }).in('id', ids);
      return res.status(200).json({ grouped: true, groupId });
    }

    if (!similar || similar.length === 0) return res.status(200).json({ grouped: false });

    const existingGroup = similar.find((r: any) => r.group_id)?.group_id;
    if (existingGroup) {
      await supabase.from('intentions').update({ group_id: existingGroup }).eq('id', intentionId);
      return res.status(200).json({ grouped: true, groupId: existingGroup });
    }

    const groupId = crypto.randomUUID();
    const ids = [intentionId, ...similar.map((r: any) => r.id)];
    await supabase.from('intentions').update({ group_id: groupId }).in('id', ids);
    return res.status(200).json({ grouped: true, groupId });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}

