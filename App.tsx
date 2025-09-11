import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import IntentionFlowScreen from './src/screens/IntentionFlowScreen';
import SixHourPrompt from './src/components/SixHourPrompt';
import { theme } from './src/theme/theme';

export default function App() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthed(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <LinearGradient colors={[theme.colors.brandDeep, theme.colors.brandViolet]} style={styles.container}>
        <StatusBar style="light" />
      </LinearGradient>
    );
  }

  if (!isAuthed) {
    return <AuthScreen />;
  }

  return (
    <LinearGradient colors={[theme.colors.brandDeep, theme.colors.brandViolet]} style={styles.container}>
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <ProfileScreen />
        <IntentionFlowScreen />
      </View>
      <SixHourPrompt />
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: { width: 160, height: 160, marginBottom: 16 },
  title: { color: '#fff', fontSize: 32, fontWeight: '700' },
  tagline: { color: 'rgba(255,255,255,0.8)', marginTop: 6 },
});
