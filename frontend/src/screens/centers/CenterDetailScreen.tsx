import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Center } from '@/types/models.d';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

interface CenterDetailScreenProps {
  route?: {
    params?: {
      center?: Center;
    };
  };
  navigation?: any;
}

export default function CenterDetailScreen(
  {
    route,
    navigation,
  }: CenterDetailScreenProps = {} as CenterDetailScreenProps,
) {
  const center = route?.params?.center;
  const isDarkMode = useColorScheme() === 'dark';

  if (!center) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Centro no encontrado</Text>
      </SafeAreaView>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Icon
            key={star}
            name={star <= Math.floor(rating) ? 'star' : 'star-border'}
            size={20}
            color={BRAND_ORANGE}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
          },
        ]}
      >
        <Pressable onPress={() => navigation?.goBack()} hitSlop={10}>
          <Icon
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#f2f2f2' : '#333'}
          />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? '#f2f2f2' : '#333' },
          ]}
        >
          Detalles del Centro
        </Text>
        <Pressable hitSlop={10}>
          <Icon
            name="favorite-border"
            size={24}
            color={isDarkMode ? '#f2f2f2' : '#333'}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Center Image */}
        <View style={styles.imageContainer}>
          <Icon name="location-city" size={80} color={BRAND_ORANGE} />
        </View>

        {/* Center Info */}
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.centerName,
              { color: isDarkMode ? '#f2f2f2' : '#333' },
            ]}
          >
            {center.name}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Icon name="location-on" size={20} color={BRAND_ORANGE} />
            <View style={styles.locationInfo}>
              <Text
                style={[
                  styles.locationText,
                  { color: isDarkMode ? '#f2f2f2' : '#666' },
                ]}
              >
                {center.address}
              </Text>
              <Text style={styles.locationSubtext}>{center.location}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {renderStars(center.rating)}
            <Text style={styles.ratingText}>
              {center.rating} ({center.reviewCount} reseñas)
            </Text>
          </View>

          {/* Hours */}
          <View style={styles.infoRow}>
            <Icon name="schedule" size={20} color={BRAND_GRAY} />
            <Text style={styles.infoText}>
              {center.hours.open} - {center.hours.close}
            </Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              Servicios
            </Text>
            <View style={styles.amenitiesContainer}>
              {center.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityTag}>
                  <Icon name="check-circle" size={16} color={BRAND_ORANGE} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Activities */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              Actividades Disponibles
            </Text>
            {center.activities.map(activity => (
              <View
                key={activity.id}
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9',
                    borderColor: isDarkMode ? '#333' : '#e0e0e0',
                  },
                ]}
              >
                <View style={styles.activityInfo}>
                  <Text
                    style={[
                      styles.activityName,
                      { color: isDarkMode ? '#f2f2f2' : '#333' },
                    ]}
                  >
                    {activity.name}
                  </Text>
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityDuration}>
                      {activity.duration} min
                    </Text>
                    <Text style={styles.activityPrice}>{activity.price}€</Text>
                  </View>
                </View>
                <Pressable style={styles.activityButton}>
                  <Text style={styles.activityButtonText}>Reservar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Reserve Button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
          },
        ]}
      >
        <Pressable style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Hacer Reserva</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for footer and bottom navigation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: BRAND_ORANGE + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  centerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 14,
    color: BRAND_GRAY,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    color: BRAND_GRAY,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: BRAND_GRAY,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_ORANGE + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  amenityText: {
    fontSize: 14,
    color: BRAND_ORANGE,
    fontWeight: '500',
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  activityInfo: {
    marginBottom: 12,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: BRAND_GRAY,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  activityDuration: {
    fontSize: 13,
    color: BRAND_GRAY,
  },
  activityPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_ORANGE,
  },
  activityButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  activityButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  reserveButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: BRAND_GRAY,
    textAlign: 'center',
    marginTop: 40,
  },
});
