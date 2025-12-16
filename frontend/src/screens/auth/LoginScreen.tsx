import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  useColorScheme,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { validateEmail, validatePassword } from '@/utils/authDebug';
import { loginUser, changePassword } from '@/services/auth/authService';
import { getCurrentUser } from '@/services/user/userService';
import { getAuthToken } from '@/services/storage/authStorage';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#060505ff';

const WEB_CLIENT_ID =
  '752455978145-u569j5ctob5cacmtg6un552rkkaivtf5.apps.googleusercontent.com';

export default function LoginScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Enhanced validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      Alert.alert(
        'Invalid Email',
        emailValidation.error || 'Please enter a valid email address',
      );
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert(
        'Invalid Password',
        passwordValidation.error ||
          'Password must be at least 6 characters long',
      );
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Starting login process...');
      console.log('📧 Email:', email.trim());
      console.log('🔑 Password length:', password.length);

      // Login via API
      const loginResult = await loginUser({
        email: email.trim(),
        password: password,
      });

      if (!loginResult.success) {
        console.log('❌ Login failed:', loginResult.error);
        setIsLoading(false);
        Alert.alert(
          'Login Failed',
          loginResult.error || 'Invalid email or password. Please try again.',
          [{ text: 'OK' }],
        );
        return;
      }

      console.log('✅ Login API call successful');
      console.log(
        '📦 Full login response:',
        JSON.stringify(loginResult, null, 2),
      );

      // Verify token was stored
      const storedToken = getAuthToken();
      if (!storedToken) {
        console.error('❌ CRITICAL: Token was not stored after login!');
        console.error('❌ Login response:', loginResult);
        setIsLoading(false);
        Alert.alert(
          'Login Error',
          'Authentication token was not received. Please try logging in again.',
          [{ text: 'OK' }],
        );
        return;
      }
      console.log(
        '✅ Token verified and stored (length:',
        storedToken.length,
        ')',
      );

      // IMPORTANT: Login response only contains token/uid, NOT full user profile
      // We MUST ALWAYS fetch the full user profile from /auth/me after login
      console.log('📋 Login response analysis:', {
        hasUserObject: !!loginResult.user,
        hasData: !!loginResult.data,
        hasUid: !!loginResult.uid,
        hasToken: !!loginResult.token,
        keys: Object.keys(loginResult),
      });

      // Always fetch full user profile from API after login
      // Login response typically only has: success, token, refreshToken, uid
      console.log('📥 Fetching full user profile from API...');
      console.log('🔑 Token available for API request:', !!storedToken);

      let userData = null;

      try {
        // Wait a tiny bit to ensure token is fully stored
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('🔍 Calling getCurrentUser() API...');
        const userResult = await getCurrentUser();
        console.log('📥 User profile API response received');
        console.log('📥 Response success:', userResult.success);
        console.log('📥 Full response:', JSON.stringify(userResult, null, 2));

        if (userResult.success) {
          if (userResult.user) {
            userData = userResult.user;
            console.log('✅ User data extracted from getCurrentUser().user');
          } else if (userResult.data) {
            userData = userResult.data.user || userResult.data;
            console.log('✅ User data extracted from getCurrentUser().data');
          } else {
            // Check if response itself contains user fields (without wrapper)
            const responseData = userResult as any;
            const hasUserFields =
              responseData.id ||
              responseData.email ||
              responseData.username ||
              responseData.name ||
              responseData.uid;
            if (hasUserFields) {
              // Extract user fields from response (remove metadata like success, status, etc.)
              const { success, error, message, status, ...userFields } =
                responseData;
              if (Object.keys(userFields).length > 0) {
                userData = userFields;
                console.log(
                  '✅ User data extracted from response (removed metadata)',
                );
              }
            } else {
              console.error(
                '❌ getCurrentUser() succeeded but no user data found',
              );
              console.error('❌ Response keys:', Object.keys(userResult));
              console.error(
                '❌ Full response:',
                JSON.stringify(userResult, null, 2),
              );
            }
          }
        } else {
          const errorMsg = userResult.error || 'Unknown error';
          const statusCode = userResult.status || 'unknown';

          console.error('❌ getCurrentUser() failed:', errorMsg);
          console.error('❌ Error status:', statusCode);
          console.error(
            '❌ Full error response:',
            JSON.stringify(userResult, null, 2),
          );

          // Show detailed error to user
          setIsLoading(false);
          Alert.alert(
            'Profile Load Failed',
            `Failed to load your profile:\n\nError: ${errorMsg}\n\nStatus: ${statusCode}\n\nPlease check:\n1. Your internet connection\n2. The API server is running\n3. Your authentication token is valid`,
            [{ text: 'OK' }],
          );
          return;
        }
      } catch (error: any) {
        console.error('❌ Exception while fetching user profile:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }

      // Final validation - ensure we have user data
      if (!userData) {
        console.error('❌ CRITICAL: No user data available after all attempts');
        console.error(
          '❌ Login was successful, token is stored, but user profile is missing',
        );
        console.error(
          '❌ This should not happen - user data must be available',
        );

        setIsLoading(false);
        Alert.alert(
          'Profile Error',
          'Login was successful, but we could not retrieve your profile information. Please try logging in again or contact support.',
          [{ text: 'OK' }],
        );
        return;
      }

      console.log('✅ User data successfully retrieved:', {
        id: userData.id || userData.uid,
        email: userData.email,
        username: userData.username,
        name: userData.name,
      });

      console.log('✅ User data retrieved:', userData);
      setIsLoading(false);

      const displayName =
        userData.name || userData.username || userData.email || 'User';
      Alert.alert('Success', `Welcome back, ${displayName}!`, [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        'Login Failed',
        'An error occurred during login. Please try again.',
        [{ text: 'OK' }],
      );
      console.error('Login error:', error);
    }
  };

  /**
   * Google login
   * TODO -> FIX THE LOGIN
   */
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
    });
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken, user } = userInfo;

      const backendLoginResult = await loginUserWithGoogle({ idToken });
      if (backendLoginResult.success) {
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          const displayName = userResult.user.name || user.name || 'Usuario';
          Alert.alert('¡Éxito!', `Bienvenido, ${displayName}!`);
          navigation.navigate('Home');
        } else {
          Alert.alert(
            'Error',
            'Inició sesión, pero no pudimos cargar su perfil. Por favor, intente de nuevo.',
          );
          setIsLoading(false);
        }
      } else {
        Alert.alert(
          'Error de Sesión',
          backendLoginResult.error ||
            'El servidor rechazó la autenticación de Google. Intente de nuevo.',
        );
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        'Error de Google Sign-In',
        error.message || 'Ocurrió un error de conexión o configuración.',
        [{ text: 'OK' }],
      );
    }
  };

  /**
   * Facebook Login
   * TODO -> IMPLEMENT LOGIN
   */
  const handleFacebookLogin = () => {
    console.log('Facebook Login');
  };

  const handleForgotPassword = () => {
    changePassword(JSON.stringify({ email }));
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitleStart, { color: BRAND_ORANGE }]}>
              START&
            </Text>
            <Text style={[styles.headerTitleConnect, { color: BRAND_GRAY }]}>
              CONNECT
            </Text>
          </View>
          <Text
            style={[
              styles.subtitle,
              { color: isDarkMode ? '#bdbdbd' : '#9E9E9E' },
            ]}
          >
            Inicia sesión en tu cuenta
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              Correo electrónico
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                  color: isDarkMode ? '#f2f2f2' : '#333',
                  borderColor: isDarkMode ? '#333' : '#e0e0e0',
                },
              ]}
              placeholder="Introduce tu correo electrónico"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              Contraseña
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                  color: isDarkMode ? '#f2f2f2' : '#333',
                  borderColor: isDarkMode ? '#333' : '#e0e0e0',
                },
              ]}
              placeholder="Introduce tu contraseña"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Pressable
            onPress={handleForgotPassword}
            style={({ pressed }) => [
              styles.forgotPassword,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.forgotPasswordText, { color: BRAND_ORANGE }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              {
                opacity: pressed || isLoading ? 0.85 : 1,
                backgroundColor: isLoading ? '#ccc' : BRAND_ORANGE,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' },
              ]}
            />
            <Text
              style={[
                styles.dividerText,
                { color: isDarkMode ? '#666' : '#999' },
              ]}
            >
              OR
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' },
              ]}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              { opacity: pressed || isLoading ? 0.85 : 1 },
            ]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Image
              source={require('@/assets/images/icon/google.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.googleButtonText,
                { color: isDarkMode ? '#f2f2f2' : '#000' },
              ]}
            >
              Continua con Google
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.facebookButton,
              { opacity: pressed || isLoading ? 0.85 : 1 },
            ]}
            onPress={handleFacebookLogin}
            disabled={isLoading}
          >
            <Image
              source={require('@/assets/images/icon/facebook.webp')}
              style={styles.facebookIcon}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.facebookButtonText,
                { color: isDarkMode ? '#f2f2f2' : '#000' },
              ]}
            >
              Continua con Facebook
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: isDarkMode ? '#9E9E9E' : '#BDBDBD' },
            ]}
          >
            No tienes una cuenta?{' '}
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.footerLink, { color: BRAND_ORANGE }]}>
                Registrarse
              </Text>
            </Pressable>
          </Text>
        </View>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleStart: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitleConnect: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 16,
    borderRadius: 999,
    gap: 12,
    marginBottom: 12,
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 16,
    borderRadius: 999,
    gap: 12,
    marginTop: 2,
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  facebookIcon: {
    width: 22,
    height: 22,
  },
  facebookIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  facebookButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontWeight: '600',
  },
});
function loginUserWithGoogle(arg0: { idToken: string | null }) {
  throw new Error('Function not implemented.');
}
