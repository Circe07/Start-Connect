import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BRAND_ORANGE = '#FF7F3F';

interface ProfileCardProps {
  name: string;
  email: string;
  profileImage?: string;
  city?: string;
}

export default function ProfileCard({
  name,
  email,
  profileImage,
  city,
}: ProfileCardProps) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8' },
      ]}
    >
      <View style={styles.imageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="account-circle" size={64} color={BRAND_ORANGE} />
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text
          style={[styles.nameText, { color: isDarkMode ? '#f2f2f2' : '#333' }]}
        >
          {name}
        </Text>
        <Text
          style={[styles.emailText, { color: isDarkMode ? '#bdbdbd' : '#666' }]}
        >
          {email}
        </Text>
        {city && (
          <View style={styles.locationContainer}>
            <Icon
              name="location-on"
              size={14}
              color={BRAND_ORANGE}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.cityText, { color: isDarkMode ? '#999' : '#888' }]}
            >
              {city}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: BRAND_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 12,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 12,
  },
});
