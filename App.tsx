import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { supabase } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import IntentionFlowScreen from './src/screens/IntentionFlowScreen';
import SixHourPrompt from './src/components/SixHourPrompt';
import GroupPresence from './src/components/GroupPresence';
import { AppStateProvider, useAppState } from './src/state/appState';
import TimelineScreen from './src/screens/TimelineScreen';
import { theme } from './src/theme/theme';
import AnimatedBackground from './src/components/AnimatedBackground';

function AuthedApp() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [justSignedIn, setJustSignedIn] = useState<boolean>(false);

  useEffect(() => {
    // Handle auth callback from magic link
    const handleAuthCallback = async () => {
      if (typeof window !== 'undefined') {
        // Handle PKCE-style code exchange via query param
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const errorDescription = searchParams.get('error_description');
        if (errorDescription) {
          console.error('Auth callback error:', decodeURIComponent(errorDescription));
        }
        if (code) {
          try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('Code exchange error:', error);
            } else {
              setJustSignedIn(true);
              // Clear the query string
              window.history.replaceState({}, document.title, window.location.pathname);
              return; // done
            }
          } catch (e) {
            console.error('Code exchange threw:', e);
          }
        }

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('Processing auth callback...');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error('Auth callback error:', error);
          } else {
            console.log('Auth callback successful');
            setJustSignedIn(true);
            // Clear the URL hash
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    };

    handleAuthCallback();

    // Handle native deep links (Expo / React Native)
    const processUrl = async (url: string) => {
      try {
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const hash = urlObj.hash ? urlObj.hash.substring(1) : '';
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange error (native):', error);
          } else {
            setJustSignedIn(true);
          }
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error('Auth callback error (native):', error);
          } else {
            setJustSignedIn(true);
          }
        }
      } catch (e) {
        console.error('Failed processing URL:', e);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) processUrl(url);
    });

    const urlSub = Linking.addEventListener('url', ({ url }) => {
      processUrl(url);
    });

    supabase.auth.getSession().then(({ data }) => {
      console.log('Initial session:', data.session ? 'authenticated' : 'not authenticated');
      setIsAuthed(!!data.session);
      setReady(true);
    });
    
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'authenticated' : 'not authenticated');
      setIsAuthed(!!session);
      if (event === 'SIGNED_IN' && session) {
        setJustSignedIn(true);
      }
    });
    
    return () => {
      sub.subscription.unsubscribe();
      urlSub.remove();
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
      <AnimatedBackground intensity={1} />
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        {justSignedIn && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Welcome! Your account is ready.</Text>
            <TouchableOpacity style={styles.bannerCta} onPress={() => setJustSignedIn(false)}>
              <Text style={styles.bannerCtaText}>Start</Text>
            </TouchableOpacity>
          </View>
        )}
        <ProfileScreen />
        <IntentionFlowScreen />
        <TimelineScreen />
      </View>
      <WithGroupPresence />
      <SixHourPrompt />
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const WithGroupPresence = () => {
  const { groupId } = useAppState();
  if (!groupId) return null;
  return <GroupPresence groupId={groupId} />;
};

export default function App() {
  return (
    <AppStateProvider>
      <AuthedApp />
    </AppStateProvider>
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
  banner: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    margin: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: { color: '#fff', fontWeight: '600' },
  bannerCta: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  bannerCtaText: { color: '#fff', fontWeight: '700' },
});
