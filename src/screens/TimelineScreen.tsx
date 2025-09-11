import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../theme/theme';

type Intention = { id: string; title: string; description: string | null; owner_id: string; group_id: string | null; created_at: string };
type Comment = { id: string; intention_id: string; author_id: string; text: string; created_at: string };

export const TimelineScreen: React.FC = () => {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [commentByIntention, setCommentByIntention] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('intentions').select('*').order('created_at', { ascending: false }).limit(50);
    setIntentions(data ?? []);
    // Load recent comments per intention
    const ids = (data ?? []).map(i => i.id);
    if (ids.length) {
      const { data: cmts } = await supabase.from('comments').select('*').in('intention_id', ids).order('created_at', { ascending: true });
      const grouped: Record<string, Comment[]> = {};
      (cmts ?? []).forEach(c => {
        (grouped[c.intention_id] ||= []).push(c);
      });
      setComments(grouped);
    } else {
      setComments({});
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Realtime: intentions and comments
  useEffect(() => {
    const iChan = supabase.channel('rt:timeline:intentions');
    iChan.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'intentions' }, payload => {
      setIntentions(prev => [payload.new as Intention, ...prev]);
    }).subscribe();

    const cChan = supabase.channel('rt:timeline:comments');
    cChan.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, payload => {
      const c = payload.new as Comment;
      setComments(prev => ({ ...prev, [c.intention_id]: [...(prev[c.intention_id] ?? []), c] }));
    }).subscribe();

    return () => { iChan.unsubscribe(); cChan.unsubscribe(); };
  }, []);

  const postComment = async (intentionId: string) => {
    const text = (commentByIntention[intentionId] ?? '').trim();
    if (!text) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Optimistic add
    const temp: Comment = { id: `temp-${Math.random()}`, intention_id: intentionId, author_id: user.id, text, created_at: new Date().toISOString() };
    setComments(prev => ({ ...prev, [intentionId]: [ ...(prev[intentionId] ?? []), temp ] }));
    setCommentByIntention(prev => ({ ...prev, [intentionId]: '' }));
    await supabase.from('comments').insert({ intention_id: intentionId, author_id: user.id, text });
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={intentions}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#fff" />}
        ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No intentions yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
            {(comments[item.id] ?? []).slice(-3).map(c => (
              <Text key={c.id} style={styles.comment}>• {c.text}</Text>
            ))}
            <View style={styles.row}>
              <TextInput
                placeholder="Leave an impression…"
                placeholderTextColor="#99a"
                value={commentByIntention[item.id] ?? ''}
                onChangeText={t => setCommentByIntention(prev => ({ ...prev, [item.id]: t }))}
                style={styles.input}
              />
              <TouchableOpacity style={styles.btn} onPress={() => postComment(item.id)}>
                <Text style={styles.btnTxt}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.brandDeep },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', margin: 12, padding: 14, borderRadius: 12 },
  title: { color: '#fff', fontWeight: '700', fontSize: 16 },
  desc: { color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 12, color: '#fff', marginRight: 8 },
  btn: { backgroundColor: theme.colors.brandViolet, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnTxt: { color: '#fff', fontWeight: '600' },
});

export default TimelineScreen;

