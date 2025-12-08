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
// import { configureGoogleSignIn, signInWithGoogle } from '../services/googleAuth';
import { loginUser, getCurrentUser, getAuthToken } from '../services/api';
import { validateEmail, validatePassword } from '../utils/authDebug';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#060505ff';

export default function LoginScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   configureGoogleSignIn();
  // }, []);

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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Placeholder: Google Sign-In to be configured later
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Google Login',
          'Google Sign-In requires configuration. For now, please use the regular Sign In button.',
          [{ text: 'OK' }],
        );
      }, 400);
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Google Login',
        'Google Sign-In requires configuration. For now, please use the regular Sign In button.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      // Placeholder: Apple Sign-In to be configured later
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Apple Login',
          'Apple Sign-In requires configuration. For now, please use the regular Sign In button.',
          [{ text: 'OK' }],
        );
      }, 400);
    } catch (e) {
      setIsLoading(false);
      Alert.alert(
        'Apple Login',
        'Apple Sign-In requires configuration. For now, please use the regular Sign In button.',
        [{ text: 'OK' }],
      );
    }
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
            Welcome back
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
              Email Address
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
              placeholder="Enter your email"
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
              Password
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
              placeholder="Enter your password"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.forgotPassword,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.forgotPasswordText, { color: BRAND_ORANGE }]}>
              Forgot Password?
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
              {isLoading ? 'Signing In...' : 'Sign In'}
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
              source={require('../assets/images/icon/google.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.googleButtonText,
                { color: isDarkMode ? '#f2f2f2' : '#000' },
              ]}
            >
              Continue with Google
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.appleButton,
              { opacity: pressed || isLoading ? 0.85 : 1 },
            ]}
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            <Image
              source={require('../assets/images/icon/apple.png')}
              style={styles.appleIcon}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.appleButtonText,
                { color: isDarkMode ? '#f2f2f2' : '#000' },
              ]}
            >
              Continue with Apple
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
            Don't have an account?{' '}
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.footerLink, { color: BRAND_ORANGE }]}>
                Sign up
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
  appleButton: {
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
  appleIcon: {
    width: 22,
    height: 22,
  },
  appleIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  appleButtonText: {
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
