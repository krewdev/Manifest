import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { theme } from '../theme/theme';

type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  location_general: string | null;
  avatar_url: string | null;
};

export const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error && error.code !== 'PGRST116') {
        Alert.alert('Load error', error.message);
      }
      setProfile(
        data ?? { id: user.id, display_name: '', bio: '', location_general: '', avatar_url: null }
      );
    })();
  }, []);

  const save = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const upsert = { ...profile, updated_at: new Date().toISOString() } as any;
      const { error } = await supabase.from('profiles').upsert(upsert).eq('id', profile.id);
      if (error) throw error;
      Alert.alert('Saved', 'Profile updated');
    } catch (e: any) {
      Alert.alert('Save error', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const chooseAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission', 'Media permissions are required');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.9 });
    if (result.canceled) return;
    const asset = result.assets[0];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `avatars/${user.id}.jpg`;
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (upErr) return Alert.alert('Upload error', upErr.message);
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    setProfile(p => p ? { ...p, avatar_url: pub.publicUrl } : p);
  };

  if (!profile) {
    return <View style={styles.container}><Text style={styles.title}>Loading…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={chooseAvatar} style={styles.avatarWrap}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}
        <Text style={styles.change}>Change photo</Text>
      </TouchableOpacity>

      <TextInput
        value={profile.display_name ?? ''}
        onChangeText={t => setProfile({ ...profile, display_name: t })}
        placeholder="Display name"
        placeholderTextColor="#bbb"
        style={styles.input}
      />
      <TextInput
        value={profile.bio ?? ''}
        onChangeText={t => setProfile({ ...profile, bio: t })}
        placeholder="One-line bio"
        placeholderTextColor="#bbb"
        style={styles.input}
      />
      <TextInput
        value={profile.location_general ?? ''}
        onChangeText={t => setProfile({ ...profile, location_general: t })}
        placeholder="City / Region"
        placeholderTextColor="#bbb"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={save} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Save profile'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brandDeep,
    padding: 24,
  },
  avatarWrap: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: { backgroundColor: 'rgba(255,255,255,0.2)' },
  change: { color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
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

export default ProfileScreen;

