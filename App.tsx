import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <LinearGradient colors={[theme.colors.brandDeep, theme.colors.brandViolet]} style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={require('./assets/brand/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Manifest</Text>
        <Text style={styles.tagline}>metaphysical • focused • collective</Text>
      </View>
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
