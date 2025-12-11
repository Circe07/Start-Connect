import { getAuth } from '@react-native-firebase/auth';

/**
 * Debug function to check authentication state and provide troubleshooting info
 */
export const debugAuthState = () => {
  try {
    const currentUser = getAuth().currentUser;

    console.log('🔍 Auth Debug Information:');
    console.log(
      '📱 Current user:',
      currentUser ? 'Logged in' : 'Not logged in',
    );

    if (currentUser) {
      console.log('👤 User ID:', currentUser.uid);
      console.log('📧 Email:', currentUser.email);
      console.log('✅ Email verified:', currentUser.emailVerified);
      console.log('📅 Created at:', currentUser.metadata.creationTime);
      console.log('🔄 Last sign in:', currentUser.metadata.lastSignInTime);
    }

    return {
      isLoggedIn: !!currentUser,
      user: currentUser,
      debugInfo: {
        hasUser: !!currentUser,
        email: currentUser?.email,
        emailVerified: currentUser?.emailVerified,
        uid: currentUser?.uid,
      },
    };
  } catch (error) {
    console.error('❌ Auth debug error:', error);
    return {
      isLoggedIn: false,
      user: null,
      error: error,
    };
  }
};

/**
 * Test function to validate email format
 */
export const validateEmail = (
  email: string,
): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Test function to validate password
 */
export const validatePassword = (
  password: string,
): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  return { isValid: true };
};
