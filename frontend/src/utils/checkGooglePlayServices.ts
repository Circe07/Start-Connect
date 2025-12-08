import { NativeModules, Platform } from 'react-native';

interface GooglePlayServicesResult {
  available: boolean;
  resultCode: number;
  errorString?: string;
  isUserResolvableError?: boolean;
}

/**
 * Check if Google Play Services is available on Android
 * This is critical for Firebase Firestore to work
 */
export const checkGooglePlayServices = async (): Promise<GooglePlayServicesResult | null> => {
  if (Platform.OS !== 'android') {
    return { available: true, resultCode: 0 };
  }

  try {
    const { GooglePlayServicesCheck } = NativeModules;
    
    if (!GooglePlayServicesCheck) {
      console.warn('⚠️ GooglePlayServicesCheck module not found - native module may not be linked');
      return null;
    }

    const result: GooglePlayServicesResult = await GooglePlayServicesCheck.isGooglePlayServicesAvailable();
    
    if (result.available) {
      console.log('✅ Google Play Services is available');
    } else {
      console.error('❌ Google Play Services is NOT available');
      console.error('❌ Result code:', result.resultCode);
      console.error('❌ Error:', result.errorString);
      console.error('❌ User resolvable:', result.isUserResolvableError);
    }
    
    return result;
  } catch (error: any) {
    console.error('❌ Error checking Google Play Services:', error);
    return null;
  }
};

/**
 * Get a human-readable message about Google Play Services status
 */
export const getGooglePlayServicesMessage = (result: GooglePlayServicesResult | null): string => {
  if (!result) {
    return 'Could not check Google Play Services status';
  }
  
  if (result.available) {
    return 'Google Play Services is available ✅';
  }
  
  const messages: { [key: number]: string } = {
    1: 'SERVICE_MISSING - Google Play Services is missing. You need an emulator with Google Play Services.',
    2: 'SERVICE_VERSION_UPDATE_REQUIRED - Google Play Services needs to be updated.',
    3: 'SERVICE_DISABLED - Google Play Services is disabled.',
    9: 'SERVICE_INVALID - Google Play Services is invalid.',
    18: 'SERVICE_UPDATING - Google Play Services is updating.',
    19: 'SERVICE_MISSING_PERMISSION - Missing required permission.',
  };
  
  return messages[result.resultCode] || `Google Play Services unavailable (code: ${result.resultCode})`;
};



