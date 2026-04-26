import { User } from '../services/firebase';

/**
 * Fallback user data when Firestore is unavailable
 * This provides a basic user structure for testing
 */
export const getFallbackUserData = (userId: string): User => {
  return {
    id: userId,
    agreed: true,
    email_address: 'user@example.com',
    first_surname: 'User',
    name: 'Test User',
    password: 'password',
    birthdate: '01/01/1990',
    city: 'Barcelona',
    gender: 'Other',
    height: 170,
    interests: ['Football', 'Swimming'],
    phone_number: '+34600000000',
    second_surname: 'Test',
    weight: 70,
  };
};

/**
 * Check if we should use fallback data
 */
export const shouldUseFallback = (error: any): boolean => {
  const fallbackErrors = [
    'service is currently unavailable',
    'service-unavailable',
    'unavailable',
    'network-error',
    'timeout'
  ];
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
  return fallbackErrors.some(fallbackError => 
    errorMessage.includes(fallbackError) || 
    errorCode.includes(fallbackError)
  );
};
