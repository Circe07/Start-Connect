import { cleanUndefined } from './cleanUndefined';

/**
 * Test function to verify undefined value handling
 */
export const testUndefinedHandling = () => {
  console.log('🧪 Testing undefined value handling...');
  
  // Test data with undefined values (like what comes from the form)
  const testData = {
    agreed: true,
    birthdate: undefined,
    city: "Barcelona",
    email_address: "test@example.com",
    first_surname: "Alex",
    gender: undefined,
    height: 176,
    interests: undefined,
    name: "Joan",
    password: "testpassword123",
    phone_number: undefined,
    profile_img_path: undefined,
    second_surname: "Fernandez",
    weight: 83,
  };
  
  console.log('📝 Original data with undefined values:', testData);
  
  // Clean the data
  const cleanedData = cleanUndefined(testData);
  
  console.log('✅ Cleaned data without undefined values:', cleanedData);
  
  // Verify no undefined values remain
  const hasUndefined = Object.values(cleanedData).some(value => value === undefined);
  
  if (hasUndefined) {
    console.error('❌ Test failed: undefined values still present');
    return false;
  } else {
    console.log('✅ Test passed: no undefined values found');
    return true;
  }
};
