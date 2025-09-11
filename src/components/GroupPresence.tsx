import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

type PresencePayload = { user_id: string; display_name?: string | null };

export const GroupPresence: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [members, setMembers] = useState<Record<string, PresencePayload>>({});
  const channel = useMemo(() => supabase.channel(`presence:${groupId}`, { config: { presence: { key: 'user_id' } } }), [groupId]);

  useEffect(() => {
    const join = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as any;
        const flat: Record<string, PresencePayload> = {};
        Object.values(state).forEach((arr: any) => {
          arr.forEach((p: any) => { flat[p.user_id] = p; });
        });
        setMembers(flat);
      });
      channel.subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          channel.track({ user_id: user.id });
        }
      });
    };
    join();
    return () => { channel.unsubscribe(); };
  }, [channel]);

  const start = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    channel.track({ user_id: user.id });
  };
  const stop = async () => { channel.untrack(); };

  const count = Object.keys(members).length;
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>Group active: {count}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={start}><Text style={styles.btnTxt}>Start</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.stop]} onPress={stop}><Text style={styles.btnTxt}>Stop</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 40, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
  text: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', marginTop: 6, gap: 8 },
  btn: { backgroundColor: '#26c281', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  stop: { backgroundColor: '#ff4d4f' },
  btnTxt: { color: '#fff', fontWeight: '600' },
});

export default GroupPresence;

