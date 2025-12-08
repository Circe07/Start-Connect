/**
 * Retry a function with exponential backoff
 * @param fn - The function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @returns Promise that resolves with the function result
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1}/${maxRetries + 1}`);
      const result = await fn();
      console.log(`✅ Success on attempt ${attempt + 1}`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.log(`❌ Attempt ${attempt + 1} failed:`, error.message);
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if it's a retryable error
      if (isRetryableError(error)) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.log(`🚫 Non-retryable error, stopping retries`);
        break;
      }
    }
  }
  
  throw lastError;
};

/**
 * Check if an error is retryable
 * @param error - The error to check
 * @returns true if the error is retryable
 */
const isRetryableError = (error: any): boolean => {
  const retryableErrors = [
    'service-unavailable',
    'unavailable',
    'deadline-exceeded',
    'internal',
    'resource-exhausted',
    'network-error',
    'timeout',
    'connection',
    'firestore',
    'permission-denied', // Sometimes temporary
    'failed-precondition', // Sometimes temporary
    'aborted' // Sometimes temporary
  ];
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
  // Check for specific Firestore retryable errors
  const isFirestoreRetryable = retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError) || 
    errorCode.includes(retryableError)
  );
  
  // Also check for common Firestore error patterns
  const isCommonFirestoreError = errorMessage.includes('firestore') || 
    errorMessage.includes('service is currently unavailable') ||
    errorMessage.includes('transient condition');
  
  return isFirestoreRetryable || isCommonFirestoreError;
};
