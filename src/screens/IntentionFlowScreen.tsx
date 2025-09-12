import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { useAppState } from '../state/appState';
import { supabase } from '../lib/supabase';
import MagicButton from '../components/MagicButton';

export const IntentionFlowScreen: React.FC = () => {
  const { setGroupId } = useAppState();
  const [step, setStep] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const steps = [
    {
      title: 'Center your breath',
      text: 'Close your eyes. Inhale 4, hold 4, exhale 6. Repeat 3 times.',
      cta: 'I am focused',
    },
    {
      title: 'Visualize it done',
      text: 'See the outcome as already real. Notice the details and feelings.',
      cta: 'I can see it',
    },
    {
      title: 'Write your intention',
      text: 'Give it a short title and an optional one-line description.',
      cta: 'Save intention',
    },
  ];

  const saveIntention = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const trimmedTitle = title.trim();
      if (!trimmedTitle) throw new Error('Please enter a title');
      const payload = { owner_id: user.id, title: trimmedTitle, description: description.trim() || null, status: 'active' };
      const { data, error } = await supabase.from('intentions').insert(payload).select('id').single();
      if (error) throw error;
      // Call matcher
      fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentionId: data.id, title: trimmedTitle, description: payload.description ?? '' }),
      })
        .then(r => r.json())
        .then(resp => { if (resp?.groupId) setGroupId(resp.groupId); })
        .catch(() => {});
      Alert.alert('Saved', 'Your intention is set.');
      setStep(0);
      setTitle('');
      setDescription('');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Unknown error');
    } finally { setSaving(false); }
  };

  return (
    <LinearGradient colors={[theme.colors.brandDeep, theme.colors.brandViolet]} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>{steps[step].title}</Text>
        <Text style={styles.body}>{steps[step].text}</Text>
        {step === 2 && (
          <>
            <TextInput value={title} onChangeText={setTitle} placeholder="Intention title" placeholderTextColor="#9aa" style={styles.input} />
            <TextInput value={description} onChangeText={setDescription} placeholder="One-line description (optional)" placeholderTextColor="#9aa" style={styles.input} />
          </>
        )}
        <View style={{ marginTop: 12 }}>
          <MagicButton
            title={saving ? 'Saving…' : steps[step].cta}
            onPress={() => (step < steps.length - 1 ? setStep(step + 1) : saveIntention())}
            disabled={saving}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  card: {
    margin: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
  },
  heading: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  body: { color: 'rgba(255,255,255,0.9)' },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
  },
  button: {
    backgroundColor: theme.colors.brandViolet,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default IntentionFlowScreen;

