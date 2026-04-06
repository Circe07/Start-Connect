import { Platform } from 'react-native';

/**
 * API configuration for React Native app.
 *
 * Automatic behavior:
 * - Dev build (`__DEV__ === true`) uses local backend.
 * - Release build uses production backend.
 *
 * If you need dev -> production temporarily, set `FORCE_PROD_IN_DEV = true`.
 */
const PROD_API_URL =
  'https://europe-west1-startandconnect-c44b2.cloudfunctions.net/api';
const LOCAL_ANDROID_API_URL =
  'http://10.0.2.2:5001/startandconnect-c44b2/europe-west1/api';
const LOCAL_IOS_API_URL = 'http://localhost:5001/startandconnect-c44b2/europe-west1/api';

const FORCE_PROD_IN_DEV = false;
const isDevMode = __DEV__ && !FORCE_PROD_IN_DEV;
const localApiUrl =
  Platform.OS === 'android' ? LOCAL_ANDROID_API_URL : LOCAL_IOS_API_URL;

export const API_CONFIG = {
  BASE_URL: isDevMode ? localApiUrl : PROD_API_URL,
  TIMEOUT: 30000,
};

export default API_CONFIG;
