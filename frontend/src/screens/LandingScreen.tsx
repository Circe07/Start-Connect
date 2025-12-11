import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

export default function LandingScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            resizeMode="contain"
            style={styles.logoImage}
          />
        </View>

        <Text
          style={[styles.title, { color: isDarkMode ? '#f2f2f2' : '#666' }]}
        >
          Bienvenido
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDarkMode ? '#bdbdbd' : '#9E9E9E' },
          ]}
        >
          ¿Listo para emprender tu nuevo hobbie?
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.signInButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signInText}>Sign in</Text>
        </Pressable>

        <Text
          style={[
            styles.footerText,
            { color: isDarkMode ? '#9E9E9E' : '#BDBDBD' },
          ]}
        >
          Don't have an account?{' '}
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.footerLink]}>Sign up here</Text>
          </Pressable>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  logoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },

  title: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  signInButton: {
    width: '80%',
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
  },
  footerLink: {
    color: BRAND_ORANGE,
    fontWeight: '600',
  },
});
