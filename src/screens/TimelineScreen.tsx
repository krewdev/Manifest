import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../theme/theme';

type Intention = { id: string; title: string; description: string | null; owner_id: string; group_id: string | null; created_at: string };
type Comment = { id: string; intention_id: string; author_id: string; text: string; created_at: string };

export const TimelineScreen: React.FC = () => {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [commentByIntention, setCommentByIntention] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('intentions').select('*').order('created_at', { ascending: false }).limit(50);
      setIntentions(data ?? []);
    };
    load();
  }, []);

  const postComment = async (intentionId: string) => {
    const text = commentByIntention[intentionId];
    if (!text) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('comments').insert({ intention_id: intentionId, author_id: user.id, text });
    setCommentByIntention(prev => ({ ...prev, [intentionId]: '' }));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={intentions}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
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

