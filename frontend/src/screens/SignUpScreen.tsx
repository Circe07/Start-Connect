import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  useColorScheme,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { registerUser } from '../services/api';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';
const DARK_ORANGE_PLACEHOLDER = 'rgba(255, 127, 63, 0.6)'; // Dark orange with transparency
const HALLOWEEN_ORANGE_BG = 'rgba(204, 85, 0, 0.15)'; // Halloween dark orange for input backgrounds
const HALLOWEEN_ORANGE_BG_DARK = 'rgba(204, 85, 0, 0.2)'; // Darker for dark mode
const LIGHT_RED_YELLOW = 'rgba(255, 204, 0, 0.3)'; // Lighter red/yellow for weight field
const LIGHT_ORANGE = 'rgba(255, 127, 63, 0.4)'; // Lighter orange for interests

const INTERESTS = [
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'swimming', name: 'Swimming', icon: '🏊' },
  { id: 'climbing', name: 'Climbing', icon: '🧗' },
  { id: 'skiing', name: 'Skiing', icon: '🎿' },
  { id: 'skating', name: 'Skating', icon: '⛸️' },
  { id: 'martialarts', name: 'Martial Arts', icon: '🥋' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'cycling', name: 'Cycling', icon: '🚴' },
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'boxing', name: 'Boxing', icon: '🥊' },
  { id: 'surfing', name: 'Surfing', icon: '🏄' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
  { id: 'golf', name: 'Golf', icon: '⛳' },
  { id: 'hiking', name: 'Hiking', icon: '🥾' },
];

export default function SignUpScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';

  // BMI calculation and color determination
  const calculateBMI = (heightCm: string, weightKg: string) => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (h && w && h > 0) {
      const heightM = h / 100;
      return w / (heightM * heightM);
    }
    return null;
  };

  const getWeightFieldBackgroundColor = () => {
    const bmi = calculateBMI(height, weight);
    if (!bmi) return isDarkMode ? '#1a1a1a' : '#f8f8f8';

    if (bmi < 18.5) {
      // Underweight - lighter yellow with more transparency
      const intensity = Math.max(0, Math.min((18.5 - bmi) / 10, 1));
      const alpha = 0.2 + (intensity * 0.2); // 0.2 → 0.4 (lighter)
      return `rgba(255, 204, 0, ${Math.min(alpha, 0.4)})`;
    } else if (bmi > 25) {
      // Overweight - lighter red with more transparency
      const intensity = Math.max(0, Math.min((bmi - 25) / 15, 1));
      const alpha = 0.2 + (intensity * 0.2); // 0.2 → 0.4 (lighter)
      return `rgba(255, 100, 100, ${Math.min(alpha, 0.4)})`;
    }
    
    // Normal weight - default grey
    return isDarkMode ? '#1a1a1a' : '#f8f8f8';
  };

  const getWeightFieldPlaceholderColor = () => {
    const bmi = calculateBMI(height, weight);
    if (!bmi) return '#666';

    if (bmi < 18.5) {
      // Underweight - trend toward pure yellow placeholder as BMI gets lower
      const intensity = Math.max(0, Math.min((18.5 - bmi) / 10, 1));
      const alpha = 0.65 + (intensity * 0.3); // 0.65 → 0.95
      return `rgba(255, 204, 0, ${Math.min(alpha, 0.95)})`;
    } else if (bmi > 25) {
      // Overweight - trend toward pure red placeholder as BMI gets higher
      const intensity = Math.max(0, Math.min((bmi - 25) / 15, 1));
      const alpha = 0.65 + (intensity * 0.3); // 0.65 → 0.95
      return `rgba(198, 0, 0, ${Math.min(alpha, 0.95)})`;
    }
    
    // Normal weight - keep dark placeholder
    return '#666';
  };
  
  // Form state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [firstSurname, setFirstSurname] = useState('');
  const [secondSurname, setSecondSurname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [dataConsent, setDataConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePicker = () => {
    Alert.alert(
      'Profile Picture',
      'Profile image selection will be implemented when we connect to Firebase',
      [{ text: 'OK' }]
    );
  };


  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleCreateAccount = async () => {
    // Validation
    if (!name.trim() || !firstSurname.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Name, First Surname, Email, Password)');
      return;
    }

    if (password !== retypePassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!dataConsent) {
      Alert.alert('Error', 'Please accept the data processing consent');
      return;
    }

    setIsLoading(true);

    try {
      // Generate username from name if not provided
      // The API expects username, so we'll create one from the name
      const username = email.trim().split('@')[0]; // Use email prefix as username
      
      // Prepare user data for API registration
      // The API register endpoint expects: email, password, username
      // Additional fields can be sent if the API supports them
      const registerData: any = {
        email: email.trim(),
        password: password,
        username: username,
        // Include additional fields if the API supports them in registration
        name: name.trim(),
        first_surname: firstSurname.trim(),
        second_surname: secondSurname.trim() || undefined,
        birthdate: birthdate.trim() || undefined,
        gender: gender || undefined,
        height: height.trim() ? parseInt(height.trim()) : undefined,
        weight: weight.trim() ? parseInt(weight.trim()) : undefined,
        city: city.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
        profile_img_path: profileImage || undefined,
        agreed: dataConsent,
      };

      // Remove undefined values to clean up the payload
      Object.keys(registerData).forEach(key => {
        if (registerData[key] === undefined) {
          delete registerData[key];
        }
      });

      console.log('📝 Registering user with API...');
      console.log('📧 Email:', registerData.email);
      console.log('👤 Username:', registerData.username);
      
      // Register user via API
      const result = await registerUser(registerData);

      setIsLoading(false);

      if (result.success) {
        console.log('✅ Registration successful!');
        Alert.alert(
          'Success!',
          'Your account has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        console.error('❌ Registration failed:', result.error);
        Alert.alert(
          'Error',
          result.error || 'Failed to create account. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error('💥 Sign up error:', error);
      Alert.alert(
        'Error',
        error.message || 'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (text: string) => {
    // Auto-format date as DD/MM/YYYY
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 8) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    } else if (cleaned.length >= 4) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4);
    } else if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitleStart, { color: BRAND_ORANGE }]}>CREATE</Text>
            <Text style={[styles.headerTitleConnect, { color: BRAND_GRAY }]}>ACCOUNT</Text>
          </View>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#bdbdbd' : '#9E9E9E' }]}>
            Start a habbit and connect
          </Text>
        </View>

        <View style={styles.form}>
          {/* Profile Picture */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel,{ color: isDarkMode ? '#f2f2f2' : '#333' }]}>
              Profile Picture
            </Text>
            <Pressable 
              style={[styles.imagePickerContainer, { borderColor: isDarkMode ? '#444' : '#ccc' }]}
              onPress={handleImagePicker}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={[styles.imagePlaceholderText, { color: isDarkMode ? '#888' : '#666' }]}>
                    📷 Add Photo
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Name */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Name *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="Enter your name"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* First Surname */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>First Surname *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="Enter your first surname"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={firstSurname}
              onChangeText={setFirstSurname}
            />
          </View>

          {/* Second Surname (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
              Second Surname (Optional)
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="Enter your second surname"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={secondSurname}
              onChangeText={setSecondSurname}
            />
          </View>

          {/* Birthdate */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Birthdate *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={birthdate}
              onChangeText={(text) => setBirthdate(formatDate(text))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Gender *</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((genderOption) => (
                <Pressable
                  key={genderOption}
                    style={[
                      styles.genderOption,
                      {
                        backgroundColor: gender === genderOption 
                          ? BRAND_ORANGE 
                          : (isDarkMode ? '#1a1a1a' : '#f8f8f8'),
                        borderColor: isDarkMode ? '#333' : '#ddd',
                      }
                    ]}
                  onPress={() => setGender(genderOption)}
                >
                  <Text style={[
                    styles.genderOptionText,
                    { 
                      color: gender === genderOption 
                        ? '#fff' 
                        : (isDarkMode ? '#f2f2f2' : '#333')
                    }
                  ]}>
                    {genderOption}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Height and Weight */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Height (cm) *</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                  color: isDarkMode ? '#f2f2f2' : '#333',
                  borderColor: isDarkMode ? '#333' : '#ddd',
                }]}
                placeholder="170"
                placeholderTextColor={isDarkMode ? '#888' : '#666'}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Weight (kg) *</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: getWeightFieldBackgroundColor(),
                  color: isDarkMode ? '#f2f2f2' : '#333',
                  borderColor: isDarkMode ? '#333' : '#ddd',
                }]}
                placeholder="70"
                placeholderTextColor={isDarkMode ? '#888' : getWeightFieldPlaceholderColor()}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* City */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>City *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="Enter your city"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Interests */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
              Interests (Select your favorite activities)
            </Text>
            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => (
                <Pressable
                  key={interest.id}
                    style={[
                      styles.interestChip,
                      {
                        backgroundColor: selectedInterests.includes(interest.id)
                          ? LIGHT_ORANGE
                          : (isDarkMode ? '#1a1a1a' : '#f8f8f8'),
                        borderColor: selectedInterests.includes(interest.id)
                          ? LIGHT_ORANGE
                          : (isDarkMode ? '#333' : '#ddd'),
                      }
                    ]}
                  onPress={() => toggleInterest(interest.id)}
                >
                  <Text style={styles.interestIcon}>{interest.icon}</Text>
                  <Text style={[
                    styles.interestText,
                    {
                      color: selectedInterests.includes(interest.id)
                        ? '#fff'
                        : (isDarkMode ? '#f2f2f2' : '#333')
                    }
                  ]}>
                    {interest.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Phone Number *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="+34 (123) 456-789"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Email Address *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="Enter your email"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Password *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="Enter your password"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Retype Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Retype Password *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? HALLOWEEN_ORANGE_BG_DARK : HALLOWEEN_ORANGE_BG,
                color: isDarkMode ? '#f2f2f2' : '#333',
                borderColor: isDarkMode ? '#333' : '#ddd',
              }]}
              placeholder="Retype your password"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={retypePassword}
              onChangeText={setRetypePassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Data Consent */}
          <Pressable 
            style={styles.consentContainer}
            onPress={() => setDataConsent(!dataConsent)}
          >
            <View style={[
              styles.checkbox,
              {
                backgroundColor: dataConsent ? BRAND_ORANGE : 'transparent',
                borderColor: dataConsent ? BRAND_ORANGE : (isDarkMode ? '#444' : '#ccc'),
              }
            ]}>
              {dataConsent && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.consentText, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
              I agree to the processing of my personal data and accept the{' '}
              <Text style={{ color: BRAND_ORANGE, fontWeight: '600' }}>Terms & Conditions</Text>
            </Text>
          </Pressable>

          {/* Create Account Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.createAccountButton, 
              { 
                opacity: pressed || isLoading ? 0.85 : 1,
                backgroundColor: isLoading ? '#ccc' : BRAND_ORANGE 
              }
            ]} 
            onPress={handleCreateAccount}
            disabled={isLoading}
          >
            <Text style={styles.createAccountButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: isDarkMode ? '#9E9E9E' : '#BDBDBD' }]}>
              Already have an account?{' '}
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.footerLink, { color: BRAND_ORANGE }]}>Sign in</Text>
              </Pressable>
            </Text>
          </View>
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleStart: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
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
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imagePickerContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  interestIcon: {
    fontSize: 16,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '500',
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  createAccountButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createAccountButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontWeight: '600',
  },
});
