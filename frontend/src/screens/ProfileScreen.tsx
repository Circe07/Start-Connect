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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  getUserById as getFirebaseUserById,
  updateUser,
  signOut,
  getCurrentUser as getFirebaseCurrentUser,
  User,
} from '../services/firebase';
import {
  getCurrentUser as getAPICurrentUser,
  updateCurrentUser,
} from '@/services/user/userService';
import {
  getFallbackUserData,
  shouldUseFallback,
} from '@/utils/firestoreFallback';
import { getAuthToken } from '@/services/storage/authStorage';
import { INTERESTS } from '@/constants/interests';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

export default function ProfileScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Form state for editing - Firestore fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photo, setPhoto] = useState('');
  const [sports, setSports] = useState<string[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // Check if we have an API token (API-based authentication)
      const token = getAuthToken();

      if (token) {
        try {
          // Get user profile from API
          const apiUserResult = await getAPICurrentUser();

          if (apiUserResult.success && apiUserResult.user) {
            const apiUser = apiUserResult.user;
            setUserData(apiUser);
            populateForm(apiUser);
            setIsLoading(false);
            return;
          }
        } catch (apiError: any) {
          console.error('API error loading user:', apiError);
        }
      }

      // Fallback to Firebase Auth
      const currentUser = getFirebaseCurrentUser();
      if (!currentUser) {
        Alert.alert('Error', 'Please log in to view your profile', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const user = await getFirebaseUserById(currentUser.uid);

        if (user) {
          setUserData(user);
          populateForm(user);
        } else {
          Alert.alert('Error', 'User data not found. Please contact support.', [
            { text: 'OK' },
          ]);
          navigation.navigate('Login');
        }
      } catch (error: any) {
        if (shouldUseFallback(error)) {
          const fallbackUser = getFallbackUserData(currentUser.uid);
          setUserData(fallbackUser);
          populateForm(fallbackUser);

          Alert.alert(
            'Service Unavailable',
            'Using demo data. Changes will not be saved.',
            [{ text: 'OK' }],
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const populateForm = (user: any) => {
    setName(user.name || '');
    setUsername(user.username || '');
    setEmail(user.email || '');
    setLocation(user.location || '');
    setBio(user.bio || '');
    setPhoneNumber(user.phoneNumber || user.phone_number || '');
    setPhoto(user.photo || user.profile_img_path || user.profileImage || '');
    setSports(user.sports || []);
  };

  const handleSave = async () => {
    if (!userData) return;

    // Validation
    if (!name.trim() || !username.trim()) {
      Alert.alert('Error', 'Name and username are required', [{ text: 'OK' }]);
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        location: location.trim(),
        bio: bio.trim(),
        phoneNumber: phoneNumber.trim(),
        photo: photo.trim(),
        sports: sports || [],
      };

      // Try API update first
      const token = getAuthToken();
      if (token) {
        try {
          const apiResult = await updateCurrentUser(updateData);
          if (apiResult.success) {
            Alert.alert('Success', 'Profile updated!', [{ text: 'OK' }]);
            setIsEditing(false);
            await loadUserData();
            return;
          }
        } catch (apiError) {
          console.error('Error updating via API:', apiError);
        }
      }

      // Fallback to Firebase
      const result = await updateUser(userData.uid || userData.id, updateData);
      if (result.success) {
        Alert.alert('Success', 'Profile updated!', [{ text: 'OK' }]);
        setIsEditing(false);
        await loadUserData();
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile', [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile', [{ text: 'OK' }]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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
        },
      },
    ]);
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

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: isDarkMode ? '#000' : '#fff' },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_ORANGE} />
          <Text
            style={[
              styles.loadingText,
              { color: isDarkMode ? '#f2f2f2' : '#333' },
            ]}
          >
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: isDarkMode ? '#000' : '#fff' },
        ]}
      >
        <View style={styles.errorContainer}>
          <Text
            style={[
              styles.errorText,
              { color: isDarkMode ? '#f2f2f2' : '#333' },
            ]}
          >
            User data not found
          </Text>
          <Pressable style={styles.retryButton} onPress={loadUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitleStart, { color: BRAND_ORANGE }]}>
                MY
              </Text>
              <Text style={[styles.headerTitleConnect, { color: BRAND_GRAY }]}>
                PROFILE
              </Text>
            </View>
            <Text
              style={[
                styles.subtitle,
                { color: isDarkMode ? '#bdbdbd' : '#9E9E9E' },
              ]}
            >
              {isEditing
                ? 'Edit your information'
                : 'View and manage your profile'}
            </Text>
          </View>

          {/* Profile Picture Section */}
          <View
            style={[
              styles.profilePictureCard,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8' },
            ]}
          >
            <View
              style={[styles.imageContainer, { borderColor: BRAND_ORANGE }]}
            >
              {userData.profile_img_path ? (
                <Image
                  source={{ uri: userData.profile_img_path }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="account-circle" size={64} color={BRAND_ORANGE} />
                </View>
              )}
            </View>
            <View style={styles.profileNameContainer}>
              <Text
                style={[
                  styles.profileNameText,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                {userData.name}
              </Text>
              <Text
                style={[
                  styles.profileEmailText,
                  { color: isDarkMode ? '#bdbdbd' : '#666' },
                ]}
              >
                @{userData.username}
              </Text>
              {userData.email && (
                <Text
                  style={[
                    styles.profileEmailText,
                    { color: isDarkMode ? '#bdbdbd' : '#666', marginTop: 4 },
                  ]}
                >
                  {userData.email}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                      color: isDarkMode ? '#f2f2f2' : '#333',
                      borderColor: isDarkMode ? '#333' : '#ddd',
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                />
              ) : (
                <Text
                  style={[
                    styles.displayValue,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  {userData.name || 'Not set'}
                </Text>
              )}
            </View>

            {/* Username */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                Username
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                      color: isDarkMode ? '#f2f2f2' : '#333',
                      borderColor: isDarkMode ? '#333' : '#ddd',
                    },
                  ]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Your username"
                />
              ) : (
                <Text
                  style={[
                    styles.displayValue,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  @{userData.username || 'Not set'}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                Email
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                      color: isDarkMode ? '#f2f2f2' : '#333',
                      borderColor: isDarkMode ? '#333' : '#ddd',
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  editable={false}
                />
              ) : (
                <Text
                  style={[
                    styles.displayValue,
                    { color: isDarkMode ? '#888' : '#999' },
                  ]}
                >
                  {userData.email || 'Not set'}
                </Text>
              )}
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                Location
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                      color: isDarkMode ? '#f2f2f2' : '#333',
                      borderColor: isDarkMode ? '#333' : '#ddd',
                    },
                  ]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="City, Country"
                />
              ) : (
                <Text
                  style={[
                    styles.displayValue,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  {userData.location || 'Not set'}
                </Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                Phone Number
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                      color: isDarkMode ? '#f2f2f2' : '#333',
                      borderColor: isDarkMode ? '#333' : '#ddd',
                    },
                  ]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="+1 (555) 000-0000"
                />
              ) : (
                <Text
                  style={[
                    styles.displayValue,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  {userData.phoneNumber || 'Not set'}
                </Text>
              )}
            </View>

            {/* Bio */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                Bio
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    styles.bioInput,
                    {
                      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                      color: isDarkMode ? '#f2f2f2' : '#333',
                      borderColor: isDarkMode ? '#333' : '#ddd',
                    },
                  ]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              ) : (
                <Text
                  style={[
                    styles.displayValue,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  {userData.bio || 'Not set'}
                </Text>
              )}
            </View>

            {/* Sports */}
            {sports.length > 0 && (
              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  Sports
                </Text>
                <View style={styles.sportsContainer}>
                  {sports.map((sport, index) => (
                    <View key={index} style={styles.sportTag}>
                      <Text style={styles.sportText}>{sport}</Text>
                      {isEditing && (
                        <Pressable
                          onPress={() =>
                            setSports(sports.filter((_, i) => i !== index))
                          }
                        >
                          <Icon name="close" size={16} color={BRAND_ORANGE} />
                        </Pressable>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Sports/Activities */}
            {userData.sports && userData.sports.length > 0 && (
              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  Sports & Activities
                </Text>
                <View style={styles.sportsDisplay}>
                  {userData.sports.map((sport, index) => (
                    <View
                      key={`${sport}-${index}`}
                      style={styles.sportDisplayChip}
                    >
                      <Text
                        style={[
                          styles.sportDisplayText,
                          { color: isDarkMode ? '#f2f2f2' : '#333' },
                        ]}
                      >
                        {sport}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Interests */}
            {userData.interests && userData.interests.length > 0 && (
              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  Interests
                </Text>
                <View style={styles.interestsDisplay}>
                  {userData.interests.map((interestId: any, index: any) => {
                    const interestObj = INTERESTS.find(
                      interest => interest.id === interestId,
                    );

                    if (!interestObj) {
                      return null;
                    }

                    return (
                      <View
                        key={`${interestId}-${index}`}
                        style={styles.interestDisplayChip}
                      >
                        <Text style={styles.interestIcon}>
                          {interestObj.icon}
                        </Text>
                        <Text
                          style={[
                            styles.interestText,
                            { color: isDarkMode ? '#f2f2f2' : '#333' },
                          ]}
                        >
                          {interestObj.name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Phone Number */}
            {userData.phone_number && (
              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDarkMode ? '#f2f2f2' : '#333' },
                  ]}
                >
                  Phone Number
                </Text>
                {isEditing ? (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                        color: isDarkMode ? '#f2f2f2' : '#333',
                        borderColor: isDarkMode ? '#333' : '#ddd',
                      },
                    ]}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text
                    style={[
                      styles.displayValue,
                      { color: isDarkMode ? '#f2f2f2' : '#333' },
                    ]}
                  >
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
                    <View style={styles.buttonContent}>
                      <Icon name="check" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditing(false);
                      populateForm(userData);
                    }}
                  >
                    <View style={styles.buttonContent}>
                      <Icon name="close" size={20} color="#fff" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </View>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <View style={styles.buttonContent}>
                      <Icon name="edit" size={20} color="#fff" />
                      <Text style={styles.editButtonText}>Edit Profile</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                  >
                    <View style={styles.buttonContent}>
                      <Icon name="logout" size={20} color="#fff" />
                      <Text style={styles.signOutButtonText}>Sign Out</Text>
                    </View>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingBottom: 80,
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 10,
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
    marginBottom: 20,
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
    fontSize: 14,
    textAlign: 'center',
  },
  profilePictureCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  profileNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmailText: {
    fontSize: 12,
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
    backgroundColor: 'rgba(255, 127, 63, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 127, 63, 0.2)',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 127, 63, 0.4)',
    backgroundColor: 'rgba(255, 127, 63, 0.12)',
    gap: 6,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sportsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportDisplayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 127, 63, 0.3)',
    backgroundColor: 'rgba(255, 127, 63, 0.1)',
  },
  sportDisplayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255, 127, 63, 0.15)',
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
    flexDirection: 'row',
    justifyContent: 'center',
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
    flexDirection: 'row',
    justifyContent: 'center',
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
