import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../theme/theme';

export const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const signInWithMagicLink = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: Platform.select({ web: window.location.origin, default: undefined }) } });
      if (error) throw error;
      Alert.alert('Check your email', 'We sent you a magic link to sign in.');
    } catch (err: any) {
      Alert.alert('Sign-in error', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: Platform.select({ web: window.location.origin, default: undefined }) } });
      if (error) throw error;
      if (!data?.url && Platform.OS === 'web') Alert.alert('Redirect', 'Continue in the opened tab to finish sign-in.');
    } catch (err: any) {
      Alert.alert('Google sign-in error', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manifest</Text>
      <Text style={styles.subtitle}>Sign in to start manifesting</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor="#bbb"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={signInWithMagicLink} disabled={loading || !email}>
        <Text style={styles.buttonText}>{loading ? 'Sending…' : 'Send magic link'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.google]} onPress={signInWithGoogle} disabled={loading}>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brandDeep,
    padding: 24,
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 32, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  input: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
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
  google: { backgroundColor: '#4285F4' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default AuthScreen;

