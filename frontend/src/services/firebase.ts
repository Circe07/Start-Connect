import '@react-native-firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc } from '@react-native-firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from '@react-native-firebase/auth';
import { cleanUndefined } from '../utils/cleanUndefined';
import { retryWithBackoff } from '../utils/retryWithBackoff';
import { retryFirestoreOperation } from '../utils/firestoreRetry';

// Initialize Firestore instance (singleton pattern)
let firestoreDb: any = null;
let firestoreInitialized = false;

const getFirestoreDb = () => {
  if (!firestoreDb) {
    try {
      firestoreDb = getFirestore();
      console.log('✅ Firestore DB instance created');
      console.log('✅ Firestore app:', firestoreDb.app.name);
      console.log('✅ Firestore project ID:', firestoreDb.app.options.projectId);
      
      // Try to enable network explicitly (if available)
      if (!firestoreInitialized) {
        try {
          // In modular API, network is enabled by default, but we can check
          console.log('✅ Firestore network should be enabled by default');
          firestoreInitialized = true;
        } catch (e) {
          console.warn('⚠️ Could not explicitly enable Firestore network:', e);
        }
      }
    } catch (error: any) {
      console.error('💥 CRITICAL: Failed to create Firestore instance:', error);
      console.error('💥 Error code:', error.code);
      console.error('💥 Error message:', error.message);
      throw error;
    }
  }
  return firestoreDb;
};

export interface User {
  id?: string;
  agreed: boolean;
  birthdate?: string;
  city?: string;
  email_address: string;
  first_surname: string;
  gender?: string;
  height?: number;
  interests?: string[];
  name: string;
  password: string;
  phone_number?: string;
  profile_img_path?: string;
  second_surname?: string;
  weight?: number;
}

/**
 * Creates a new user document in Firestore under the 'users' collection.
 * @param {Object} params - The parameters for creating the user.
 * @param {string} params.email_address - The email address of the user.
 * @param {string} params.password - The password of the user.
 * @param {string} params.name - The name of the user.
 * @param {string} params.first_surname - The first surname of the user.
 * @param {string} params.second_surname - The second surname of the user.
 * @param {string} params.birthdate - The birthdate of the user.
 * @param {string} params.gender - The gender of the user.
 * @param {number} params.height - The height of the user.
 * @param {number} params.weight - The weight of the user.
 * @param {string} params.city - The city of the user.
 * @param {string[]} params.interests - The interests of the user.
 * @param {string} params.phone_number - The phone number of the user.
 * @param {string} params.profile_img_path - The profile image path of the user.
 * @param {boolean} params.agreed - Whether the user agreed to terms.
 * @return {Promise<{ success: boolean; userId?: string; error?: string }>} A Promise that resolves with the result of the user creation.
 */
export const createUser = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    console.log('🔥 Firebase createUser called with:', userData);
    
    // Create user with Firebase Auth (with retry)
    console.log('🔐 Creating Firebase Auth user with retry logic...');
    const authInstance = getAuth();
    const userCredential = await retryWithBackoff(
      () => createUserWithEmailAndPassword(authInstance, userData.email_address, userData.password),
      3, // max retries
      2000 // base delay 2 seconds
    );
    const userId = userCredential.user.uid;
    console.log('✅ Firebase Auth user created with ID:', userId);

    // Prepare user document data - clean undefined values
    console.log('🧹 Cleaning user data...');
    const userDoc = cleanUndefined({
      agreed: userData.agreed,
      email_address: userData.email_address,
      first_surname: userData.first_surname,
      name: userData.name,
      password: userData.password,
      id: userId,
      birthdate: userData.birthdate,
      city: userData.city,
      gender: userData.gender,
      height: userData.height,
      interests: userData.interests,
      phone_number: userData.phone_number,
      profile_img_path: userData.profile_img_path,
      second_surname: userData.second_surname,
      weight: userData.weight,
    });
    
    console.log('📝 Cleaned user document:', userDoc);

    // Save user data to Firestore 'users' collection (with specialized retry)
    console.log('💾 Saving to Firestore with specialized retry logic...');
    const db = getFirestoreDb();
    await retryFirestoreOperation(
      async () => {
        console.log('🔄 Attempting Firestore write...');
        await setDoc(doc(db, 'users', userId), userDoc);
        console.log('✅ Firestore write successful');
      },
      5, // max retries
      3000 // base delay 3 seconds
    );
    console.log('✅ User document saved to Firestore');
    
    return { success: true, userId };
  } catch (error: any) {
    console.error('💥 Error creating user:', error);
    console.error('💥 Error code:', error.code);
    console.error('💥 Error message:', error.message);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Failed to create user';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please use a different email or try logging in.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please choose a stronger password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'unavailable' || 
               error.code === 'firestore/unavailable' ||
               error.code === 'deadline-exceeded' ||
               error.message?.toLowerCase().includes('service is currently unavailable') ||
               error.message?.toLowerCase().includes('unavailable')) {
      errorMessage = 'Firebase services are unavailable at this moment. Please check your internet connection and try again.';
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

/**
 * Gets a user by their ID from the 'users' collection.
 * @param {string} userId - The ID of the user to retrieve.
 * @return {Promise<User | null>} A Promise that resolves with the user data or null if not found.
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    console.log('🔍 Getting user data with retry logic...');
    console.log('🔍 User ID:', userId);
    
    // Debug: Check Firestore instance
    try {
      const db = getFirestoreDb();
      console.log('✅ Firestore instance created:', !!db);
    } catch (initError: any) {
      console.error('❌ Firestore initialization error:', initError);
      console.error('❌ Init error code:', initError.code);
      console.error('❌ Init error message:', initError.message);
      console.error('❌ Init error stack:', initError.stack);
    }
    
    const userDoc = await retryFirestoreOperation(
      async () => {
        console.log('🔄 Attempting Firestore read...');
        console.log('🔄 Collection: users, Document ID:', userId);
        
        try {
          const db = getFirestoreDb();
          const snapshot = await getDoc(doc(db, 'users', userId));
          console.log('✅ Firestore read successful');
          console.log('✅ Snapshot exists:', snapshot.exists());
          return snapshot;
        } catch (readError: any) {
          console.error('❌ Firestore read error details:');
          console.error('❌ Error type:', typeof readError);
          console.error('❌ Error constructor:', readError?.constructor?.name);
          console.error('❌ Error code:', readError?.code);
          console.error('❌ Error message:', readError?.message);
          console.error('❌ Error nativeErrorCode:', readError?.nativeErrorCode);
          console.error('❌ Error nativeErrorMessage:', readError?.nativeErrorMessage);
          console.error('❌ Full error object:', JSON.stringify(readError, Object.getOwnPropertyNames(readError)));
          throw readError;
        }
      },
      3, // max retries
      2000 // base delay 2 seconds
    );
    
    if (userDoc.exists()) {
      console.log('✅ User document found');
      const userData = userDoc.data() || {};
      return { id: userDoc.id, ...userData } as User;
    }
    
    console.log('⚠️ User document does not exist');
    return null;
  } catch (error: any) {
    console.error('💥 Error getting user - FULL DETAILS:');
    console.error('💥 Error type:', typeof error);
    console.error('💥 Error constructor:', error?.constructor?.name);
    console.error('💥 Error code:', error?.code);
    console.error('💥 Error message:', error?.message);
    console.error('💥 Error nativeErrorCode:', error?.nativeErrorCode);
    console.error('💥 Error nativeErrorMessage:', error?.nativeErrorMessage);
    console.error('💥 Error stack:', error?.stack);
    console.error('💥 Full error keys:', Object.keys(error));
    console.error('💥 Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Check for service unavailable errors
    const errorCode = error?.code || error?.nativeErrorCode || '';
    const errorMessage = error?.message || error?.nativeErrorMessage || '';
    
    if (errorCode === 'unavailable' || 
        errorCode === 'firestore/unavailable' ||
        errorCode === 'deadline-exceeded' ||
        errorCode?.includes('unavailable') ||
        errorMessage?.toLowerCase().includes('service is currently unavailable') ||
        errorMessage?.toLowerCase().includes('unavailable')) {
      console.error('⚠️ Firebase service unavailable detected');
      console.error('⚠️ Error code:', errorCode);
      console.error('⚠️ Error message:', errorMessage);
      throw new Error('Firebase services are unavailable at this moment. Please check your internet connection and try again.');
    }
    
    return null;
  }
};

/**
 * Updates a user document in the 'users' collection.
 * @param {string} userId - The ID of the user to update.
 * @param {Partial<User>} updateData - The data to update.
 * @return {Promise<{ success: boolean; error?: string }>} A Promise that resolves with the update result.
 */
export const updateUser = async (userId: string, updateData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
  try {
    // Clean undefined values before updating
    const userDoc = cleanUndefined(updateData);

    // Use specialized Firestore retry for updates
    const db = getFirestoreDb();
    await retryFirestoreOperation(
      async () => {
        console.log('🔄 Attempting Firestore update...');
        await updateDoc(doc(db, 'users', userId), userDoc as any);
        console.log('✅ Firestore update successful');
      },
      3, // max retries for updates
      2000 // base delay 2 seconds
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update user' 
    };
  }
};

/**
 * Deletes a user document from the 'users' collection.
 * @param {string} userId - The ID of the user to delete.
 * @return {Promise<{ success: boolean; error?: string }>} A Promise that resolves with the deletion result.
 */
export const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, 'users', userId));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to delete user' 
    };
  }
};

/**
 * Signs in a user with email and password.
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @return {Promise<{ success: boolean; user?: any; error?: string }>} A Promise that resolves with the sign-in result.
 */
export const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    console.log('🔐 Signing in with retry logic...');
    const authInstance = getAuth();
    const userCredential = await retryWithBackoff(
      () => signInWithEmailAndPassword(authInstance, email, password),
      3, // max retries
      2000 // base delay 2 seconds
    );
    console.log('✅ Sign in successful');
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('💥 Error signing in:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Failed to sign in';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please check your email or create a new account.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled. Please contact support.';
    } else if (error.code === 'unavailable' || 
               error.code === 'firestore/unavailable' ||
               error.code === 'deadline-exceeded' ||
               error.message?.toLowerCase().includes('service is currently unavailable') ||
               error.message?.toLowerCase().includes('unavailable')) {
      errorMessage = 'Firebase services are unavailable at this moment. Please check your internet connection and try again.';
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

/**
 * Signs out the current user.
 * @return {Promise<{ success: boolean; error?: string }>} A Promise that resolves with the sign-out result.
 */
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const authInstance = getAuth();
    await firebaseSignOut(authInstance);
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign out' 
    };
  }
};

/**
 * Gets the current authenticated user.
 * @return {any | null} The current user or null if not authenticated.
 */
export const getCurrentUser = (): any | null => {
  return getAuth().currentUser;
};

/**
 * Listens to authentication state changes.
 * @param {Function} callback - The callback function to call when auth state changes.
 * @return {Function} A function to unsubscribe from the listener.
 */
export const onAuthStateChanged = (callback: (user: any) => void): (() => void) => {
  return firebaseOnAuthStateChanged(getAuth(), callback);
};
