import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';
import { theme } from '../theme/theme';
import MagicButton from '../components/MagicButton';

export const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const signInWithMagicLink = async () => {
    try {
      setLoading(true);
      const trimmed = email.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (!ok) {
        Alert.alert('Invalid email', 'Please enter a valid email address.');
        return;
      }
      const siteUrl = process.env.EXPO_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : undefined);
      const redirectTo = Platform.select({ web: siteUrl, default: makeRedirectUri({ scheme: 'manifest', path: 'auth-callback' }) });
      // eslint-disable-next-line no-console
      console.log('Magic link redirectTo:', redirectTo);
      let { error } = await supabase.auth.signInWithOtp({ email: trimmed, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
      // Fallback: if redirect is not allowlisted, retry without redirect so email still sends
      if (error && (error.status === 422 || String(error.message || '').toLowerCase().includes('redirect'))) {
        // eslint-disable-next-line no-console
        console.warn('Retrying magic link without redirectTo (not allowlisted yet).');
        ({ error } = await supabase.auth.signInWithOtp({ email: trimmed }));
      }
      if (error) {
        const msg = String(error.message || '').toLowerCase();
        if (error.status === 429) {
          Alert.alert('Too many requests', 'Please wait a minute and try again.');
        } else if (msg.includes('signup') || msg.includes('signups')) {
          Alert.alert('Signups disabled', 'New user signups are disabled in this project.');
        } else if (msg.includes('smtp') || msg.includes('email')) {
          Alert.alert('Email service error', 'Email provider not configured; check Supabase Auth email settings.');
        } else {
          throw error;
        }
        return;
      }
      Alert.alert('Check your email', 'We sent you a magic link to sign in. Check spam too.');
    } catch (err: any) {
      Alert.alert('Sign-in error', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const siteUrl = process.env.EXPO_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : undefined);
      const redirectTo = Platform.select({ web: siteUrl, default: makeRedirectUri({ scheme: 'manifest', path: 'auth-callback' }) });
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'oidc', options: { providerId: 'auth0', redirectTo } });
      if (error) throw error;
      if (!data?.url && Platform.OS === 'web') Alert.alert('Redirect', 'Continue in the opened tab to finish sign-in.');
    } catch (err: any) {
      Alert.alert('Auth0 sign-in error', err?.message ?? 'Unknown error');
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

      <View style={{ marginTop: 12 }}>
        <MagicButton title={loading ? 'Sending…' : 'Send magic link'} onPress={signInWithMagicLink} disabled={loading || !email} />
      </View>
      <View style={{ marginTop: 12 }}>
        <MagicButton title="Continue with Auth0" onPress={signInWithGoogle} disabled={loading} />
      </View>
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

