import { retryWithBackoff } from './retryWithBackoff';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

/**
 * Specialized retry function for Firestore operations
 * Uses more aggressive retry settings for Firestore
 */
export const retryFirestoreOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 3000
): Promise<T> => {
  console.log('🔥 Starting Firestore operation with specialized retry...');
  
  try {
    return await retryWithBackoff(operation, maxRetries, baseDelay);
  } catch (error: any) {
    console.error('💥 Firestore operation failed after all retries:', error);
    
    // Provide specific Firestore error context
    if (error.code === 'unavailable' || 
        error.code === 'firestore/unavailable' ||
        error.code === 'deadline-exceeded' ||
        error.message?.toLowerCase().includes('service is currently unavailable') ||
        error.message?.toLowerCase().includes('unavailable')) {
      throw new Error('Firestore service is temporarily unavailable. Please try again in a few moments.');
    } else if (error.code === 'permission-denied' || error.message?.includes('permission-denied')) {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    } else if (error.code === 'failed-precondition' || error.message?.includes('failed-precondition')) {
      throw new Error('Firestore precondition failed. Please try again.');
    } else {
      throw error;
    }
  }
};

/**
 * Test Firestore connection with retry
 */
export const testFirestoreConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🧪 Testing Firestore connection with retry...');
    
    await retryFirestoreOperation(async () => {
      const db = getFirestore();
      const testDoc = await getDoc(doc(db, '_test', 'connection'));
      console.log('✅ Firestore connection test successful');
      return testDoc;
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:', error);
    return { 
      success: false, 
      error: error.message || 'Firestore connection test failed' 
    };
  }
};
