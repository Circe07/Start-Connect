import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { getUserById as getFirebaseUserById, updateUser, signOut, getCurrentUser as getFirebaseCurrentUser, User } from '../services/firebase';
import { getCurrentUser as getAPICurrentUser, getUserById as getAPIUserById, updateCurrentUser, getAuthToken } from '../services/api';
import { getFallbackUserData, shouldUseFallback } from '../utils/firestoreFallback';
import BottomNavigation from '../components/BottomNavigation';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';
const HALLOWEEN_ORANGE_BG = 'rgba(204, 85, 0, 0.15)';
const HALLOWEEN_ORANGE_BG_DARK = 'rgba(204, 85, 0, 0.2)';

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

export default function ProfileScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('perfil');

  // Form state for editing
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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 ProfileScreen: Loading user data...');
      console.log('🔍 ProfileScreen: Starting loadUserData function');
      
      // Check if we have an API token (API-based authentication)
      const token = getAuthToken();
      console.log('🔑 ProfileScreen: Token check result:', token ? `Found (length: ${token.length})` : 'NOT FOUND');
      
      if (token) {
        console.log('🔑 API token found, fetching user profile from API...');
        try {
          // Get user profile from API
          const apiUserResult = await getAPICurrentUser();
          
          console.log('📦 API response received:', {
            success: apiUserResult.success,
            hasUser: !!(apiUserResult.user),
            hasError: !!(apiUserResult.error),
            responseKeys: Object.keys(apiUserResult),
          });
          
          if (apiUserResult.success && apiUserResult.user) {
            console.log('✅ User data loaded from API:', apiUserResult.user);
            console.log('📋 API user keys:', Object.keys(apiUserResult.user));
            
            // Convert API user data to User type format
            const apiUser = apiUserResult.user;
            const userData: User = {
              id: apiUser.uid || apiUser.id || '',
              agreed: apiUser.agreed !== undefined ? apiUser.agreed : true,
              email_address: apiUser.email || apiUser.email_address || '',
              name: apiUser.name || '',
              first_surname: apiUser.first_surname || apiUser.firstSurname || '',
              second_surname: apiUser.second_surname || apiUser.secondSurname || '',
              password: apiUser.password || '', // Required field, but we don't store it from API response
              birthdate: apiUser.birthdate || '',
              gender: apiUser.gender || '',
              height: apiUser.height || undefined,
              weight: apiUser.weight || undefined,
              city: apiUser.city || '',
              phone_number: apiUser.phone_number || apiUser.phoneNumber || '',
              interests: apiUser.interests || [],
              profile_img_path: apiUser.profile_img_path || apiUser.profileImage || apiUser.profile_img_path || '',
            };
            
            console.log('✅ Converted user data:', {
              id: userData.id,
              email_address: userData.email_address,
              name: userData.name,
              first_surname: userData.first_surname,
              hasAllRequiredFields: !!(userData.id && userData.email_address && userData.name && userData.first_surname),
            });
            
            // Validate that we have at least the minimum required fields
            if (!userData.email_address || !userData.name || !userData.first_surname) {
              console.warn('⚠️ User data missing required fields:', {
                hasEmail: !!userData.email_address,
                hasName: !!userData.name,
                hasFirstSurname: !!userData.first_surname,
              });
            }
            
            setUserData(userData);
            populateForm(userData);
            setIsLoading(false);
            return;
          } else {
            console.error('❌ Failed to load user from API:', {
              success: apiUserResult.success,
              error: apiUserResult.error,
              hasUser: !!(apiUserResult.user),
              rawResponse: apiUserResult,
            });
            // Don't return here - fall through to Firebase fallback
          }
        } catch (apiError: any) {
          console.error('❌ API error loading user:', apiError);
          // Don't return here - fall through to Firebase fallback
        }
      }
      
      // Fallback to Firebase Auth (if using Firebase authentication)
      console.log('🔄 Trying Firebase Auth as fallback...');
      const currentUser = getFirebaseCurrentUser();
      if (!currentUser) {
        console.log('❌ No authenticated user found (neither API token nor Firebase)');
        Alert.alert('Error', 'Please log in to view your profile', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Firebase user found:', currentUser.uid);
      
      try {
        const user = await getFirebaseUserById(currentUser.uid);
        
        if (user) {
          console.log('✅ User data loaded successfully from Firestore');
          setUserData(user);
          populateForm(user);
        } else {
          console.log('❌ User data not found in Firestore');
          Alert.alert('Error', 'User data not found. Please contact support.', [{ text: 'OK' }]);
          navigation.navigate('Login');
        }
      } catch (error: any) {
        console.error('💥 Error getting user data:', error);
        
        // Check if we should use fallback data
        if (shouldUseFallback(error)) {
          console.log('🔄 Using fallback data due to Firestore unavailability');
          const fallbackUser = getFallbackUserData(currentUser.uid);
          setUserData(fallbackUser);
          populateForm(fallbackUser);
          
          Alert.alert(
            'Service Unavailable', 
            'Firestore is temporarily unavailable. Showing demo data. Changes will not be saved.',
            [{ text: 'OK' }]
          );
        } else {
          throw error; // Re-throw if it's not a service unavailable error
        }
      }
    } catch (error) {
      console.error('💥 Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const populateForm = (user: User) => {
    setName(user.name || '');
    setFirstSurname(user.first_surname || '');
    setSecondSurname(user.second_surname || '');
    setBirthdate(user.birthdate || '');
    setGender(user.gender || '');
    setHeight(user.height?.toString() || '');
    setWeight(user.weight?.toString() || '');
    setCity(user.city || '');
    setSelectedInterests(user.interests || []);
    setPhoneNumber(user.phone_number || '');
  };

  const handleSave = async () => {
    if (!userData) return;

    // Check if we're using fallback data
    if (userData.email_address === 'user@example.com') {
      Alert.alert(
        'Cannot Save', 
        'You are viewing demo data. Firestore is unavailable, so changes cannot be saved.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSaving(true);
    try {
      const updateData: Partial<User> = {
        name: name.trim(),
        first_surname: firstSurname.trim(),
        second_surname: secondSurname.trim() || undefined,
        birthdate: birthdate.trim() || undefined,
        gender: gender || undefined,
        height: height.trim() ? parseInt(height.trim()) : undefined,
        weight: weight.trim() ? parseInt(weight.trim()) : undefined,
        city: city.trim() || undefined,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
        phone_number: phoneNumber.trim() || undefined,
      };

      const result = await updateUser(userData.id!, updateData);
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK' }]);
        setIsEditing(false);
        // Reload user data
        await loadUserData();
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile', [{ text: 'OK' }]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'perfil') {
      // Already on profile screen
      return;
    } else if (tab === 'tienda') {
      navigation.navigate('Home', { screen: 'tienda' });
    } else if (tab === 'hobbie') {
      navigation.navigate('Home', { screen: 'hobbie' });
    } else if (tab === 'chat') {
      navigation.navigate('Home', { screen: 'chat' });
    }
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const formatDate = (text: string) => {
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
            User data not found
          </Text>
          <Pressable 
            style={styles.retryButton}
            onPress={loadUserData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitleStart, { color: BRAND_ORANGE }]}>MY</Text>
            <Text style={[styles.headerTitleConnect, { color: BRAND_GRAY }]}>PROFILE</Text>
          </View>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#bdbdbd' : '#9E9E9E' }]}>
            {isEditing ? 'Edit your information' : 'View your profile'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Profile Picture */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
              Profile Picture
            </Text>
            <View style={[styles.imageContainer, { borderColor: isDarkMode ? '#444' : '#ccc' }]}>
              {userData.profile_img_path ? (
                <Image source={{ uri: userData.profile_img_path }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={[styles.imagePlaceholderText, { color: isDarkMode ? '#888' : '#666' }]}>
                    📷 No Photo
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Name */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                  color: isDarkMode ? '#f2f2f2' : '#333',
                  borderColor: isDarkMode ? '#333' : '#ddd',
                }]}
                value={name}
                onChangeText={setName}
              />
            ) : (
              <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                {userData.name}
              </Text>
            )}
          </View>

          {/* First Surname */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>First Surname</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                  color: isDarkMode ? '#f2f2f2' : '#333',
                  borderColor: isDarkMode ? '#333' : '#ddd',
                }]}
                value={firstSurname}
                onChangeText={setFirstSurname}
              />
            ) : (
              <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                {userData.first_surname}
              </Text>
            )}
          </View>

          {/* Second Surname */}
          {userData.second_surname && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Second Surname</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                    color: isDarkMode ? '#f2f2f2' : '#333',
                    borderColor: isDarkMode ? '#333' : '#ddd',
                  }]}
                  value={secondSurname}
                  onChangeText={setSecondSurname}
                />
              ) : (
                <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                  {userData.second_surname}
                </Text>
              )}
            </View>
          )}

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Email</Text>
            <Text style={[styles.displayValue, { color: isDarkMode ? '#888' : '#666' }]}>
              {userData.email_address}
            </Text>
          </View>

          {/* Birthdate */}
          {userData.birthdate && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Birthdate</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                    color: isDarkMode ? '#f2f2f2' : '#333',
                    borderColor: isDarkMode ? '#333' : '#ddd',
                  }]}
                  placeholder="DD/MM/YYYY"
                  value={birthdate}
                  onChangeText={(text) => setBirthdate(formatDate(text))}
                  keyboardType="numeric"
                  maxLength={10}
                />
              ) : (
                <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                  {userData.birthdate}
                </Text>
              )}
            </View>
          )}

          {/* Gender */}
          {userData.gender && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Gender</Text>
              {isEditing ? (
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
              ) : (
                <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                  {userData.gender}
                </Text>
              )}
            </View>
          )}

          {/* Height and Weight */}
          {(userData.height || userData.weight) && (
            <View style={styles.row}>
              {userData.height && (
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Height (cm)</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.input, {
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                        color: isDarkMode ? '#f2f2f2' : '#333',
                        borderColor: isDarkMode ? '#333' : '#ddd',
                      }]}
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                      {userData.height}
                    </Text>
                  )}
                </View>
              )}
              {userData.weight && (
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Weight (kg)</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.input, {
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                        color: isDarkMode ? '#f2f2f2' : '#333',
                        borderColor: isDarkMode ? '#333' : '#ddd',
                      }]}
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                      {userData.weight}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* City */}
          {userData.city && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>City</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                    color: isDarkMode ? '#f2f2f2' : '#333',
                    borderColor: isDarkMode ? '#333' : '#ddd',
                  }]}
                  value={city}
                  onChangeText={setCity}
                />
              ) : (
                <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                  {userData.city}
                </Text>
              )}
            </View>
          )}

          {/* Interests */}
          {userData.interests && userData.interests.length > 0 && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                Interests
              </Text>
              {isEditing ? (
                <View style={styles.interestsGrid}>
                  {INTERESTS.map((interest) => (
                    <Pressable
                      key={interest.id}
                      style={[
                        styles.interestChip,
                        {
                          backgroundColor: selectedInterests.includes(interest.id)
                            ? HALLOWEEN_ORANGE_BG
                            : (isDarkMode ? '#1a1a1a' : '#f8f8f8'),
                          borderColor: selectedInterests.includes(interest.id)
                            ? HALLOWEEN_ORANGE_BG
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
              ) : (
                <View style={styles.interestsDisplay}>
                  {userData.interests.map((interest, index) => {
                    const interestObj = INTERESTS.find(i => i.id === interest);
                    return interestObj ? (
                      <View key={index} style={styles.interestDisplayChip}>
                        <Text style={styles.interestIcon}>{interestObj.icon}</Text>
                        <Text style={[styles.interestText, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                          {interestObj.name}
                        </Text>
                      </View>
                    ) : null;
                  })}
                </View>
              )}
            </View>
          )}

          {/* Phone Number */}
          {userData.phone_number && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>Phone Number</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                    color: isDarkMode ? '#f2f2f2' : '#333',
                    borderColor: isDarkMode ? '#333' : '#ddd',
                  }]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.displayValue, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
                  {userData.phone_number}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isEditing ? (
              <>
                <Pressable 
                  style={[styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </Pressable>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    populateForm(userData);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable 
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </Pressable>
                <Pressable 
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                >
                  <Text style={styles.signOutButtonText}>Sign Out</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
        </ScrollView>
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          navigation={navigation}
        />
      </View>
    </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  displayValue: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 127, 63, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 127, 63, 0.3)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
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
  interestsDisplay: {
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
  interestDisplayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 127, 63, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 127, 63, 0.4)',
    gap: 6,
  },
  interestIcon: {
    fontSize: 16,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
  },
  editButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#8E8E93',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
