import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { checkGooglePlayServices, getGooglePlayServicesMessage } from './checkGooglePlayServices';

/**
 * Comprehensive Firebase debugging utility
 */
export const debugFirebase = async () => {
  console.log('🔍 ========== FIREBASE DEBUG START ==========');
  
  // 0. Platform info
  console.log('📱 Platform:', Platform.OS);
  console.log('📱 Platform version:', Platform.Version);
  console.log('📱 Is emulator check:', 'Check Android emulator settings');
  
  // 0.5. Check Google Play Services (Android only)
  if (Platform.OS === 'android') {
    console.log('🔍 Checking Google Play Services...');
    try {
      const gpsResult = await checkGooglePlayServices();
      if (gpsResult) {
        console.log('📱 Google Play Services check:', getGooglePlayServicesMessage(gpsResult));
        if (!gpsResult.available) {
          console.error('');
          console.error('🚨 CRITICAL: Google Play Services is NOT available!');
          console.error('🚨 This is why Firestore is unavailable.');
          console.error('🚨 SOLUTION: Use an Android emulator WITH Google Play Services');
          console.error('');
        }
      } else {
        console.warn('⚠️ Could not check Google Play Services (native module may not be available)');
      }
    } catch (error: any) {
      console.warn('⚠️ Error checking Google Play Services:', error.message);
    }
  }
  
  // 1. Check network connectivity
  console.log('📡 Checking network connectivity...');
  const netInfo = await NetInfo.fetch();
  console.log('📡 Network type:', netInfo.type);
  console.log('📡 Is connected:', netInfo.isConnected);
  console.log('📡 Is internet reachable:', netInfo.isInternetReachable);
  console.log('📡 Details:', JSON.stringify(netInfo.details, null, 2));
  
  // 2. Check Firestore instance
  console.log('🔥 Checking Firestore instance...');
  try {
    const db = getFirestore();
    console.log('✅ Firestore instance created:', !!db);
    console.log('✅ Firestore app name:', db.app.name);
    console.log('✅ Firestore app options:', JSON.stringify(db.app.options, null, 2));
    console.log('✅ Firestore type:', typeof db);
    
    // Try to access settings (might not be available in modular API)
    try {
      const settings = (db as any).settings;
      console.log('✅ Firestore settings:', settings);
    } catch (e) {
      console.log('⚠️ Firestore settings not accessible (this is normal for modular API)');
    }
    
    // Check if we can access the native module
    console.log('✅ Firestore database ID:', (db as any)._delegate?.databaseId?.databaseId || 'N/A');
  } catch (error: any) {
    console.error('❌ Firestore instance error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
  
  // 3. Check Auth instance
  console.log('🔐 Checking Auth instance...');
  try {
    const authInstance = getAuth();
    console.log('✅ Auth instance created:', !!authInstance);
    console.log('✅ Auth app name:', authInstance.app.name);
    console.log('✅ Current user:', authInstance.currentUser?.uid || 'No user');
    console.log('✅ Auth app options:', JSON.stringify(authInstance.app.options, null, 2));
  } catch (error: any) {
    console.error('❌ Auth instance error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
  }
  
  // 4. Test Firestore connection with timeout
  console.log('🧪 Testing Firestore connection...');
  try {
    const db = getFirestore();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay
    
    // Try a simple read with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore connection timeout after 10 seconds')), 10000)
    );
    
    const readPromise = getDoc(doc(db, '_test', 'connection'));
    const testDoc = await Promise.race([readPromise, timeoutPromise]);
    
    console.log('✅ Firestore connection test successful');
    console.log('✅ Test document exists:', (testDoc as any).exists?.() || 'N/A');
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:');
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error constructor:', error?.constructor?.name);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error nativeErrorCode:', error.nativeErrorCode);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error nativeErrorMessage:', error.nativeErrorMessage);
    console.error('❌ Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Provide specific guidance based on error
    if (error.code === 'firestore/unavailable' || error.message?.includes('unavailable')) {
      console.error('');
      console.error('🚨 CRITICAL: Firestore unavailable error detected!');
      console.error('🚨 This usually means:');
      console.error('   1. Android emulator does NOT have Google Play Services');
      console.error('   2. Network connectivity issues');
      console.error('   3. Firebase project configuration issue');
      console.error('');
      console.error('💡 SOLUTIONS:');
      console.error('   - Use an Android emulator WITH Google Play Services');
      console.error('   - Test on a physical Android device');
      console.error('   - Check Firebase Console: Firestore Database is enabled');
      console.error('   - Verify google-services.json is correct');
      console.error('');
    }
  }
  
  console.log('🔍 ========== FIREBASE DEBUG END ==========');
};

/**
 * Test Firestore read operation with detailed logging
 */
export const testFirestoreRead = async (collection: string, docId: string) => {
  console.log('🧪 Testing Firestore read operation...');
  console.log('🧪 Collection:', collection);
  console.log('🧪 Document ID:', docId);
  
  try {
    const db = getFirestore();
    const snapshot = await getDoc(doc(db, collection, docId));
    console.log('✅ Read successful');
    console.log('✅ Document exists:', snapshot.exists());
    if (snapshot.exists()) {
      console.log('✅ Document data:', snapshot.data());
    }
    return { success: true, snapshot };
  } catch (error: any) {
    console.error('❌ Read failed - FULL DETAILS:');
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error constructor:', error?.constructor?.name);
    console.error('❌ Error code:', error?.code);
    console.error('❌ Error nativeErrorCode:', error?.nativeErrorCode);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error nativeErrorMessage:', error?.nativeErrorMessage);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Full error keys:', Object.keys(error));
    console.error('❌ Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { success: false, error };
  }
};
