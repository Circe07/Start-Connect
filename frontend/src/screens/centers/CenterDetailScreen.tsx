import useGetCenters from '@/hooks/useGetCenters';
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

interface CenterDetailScreenProps {
  navigation?: any;
  route?: any;
}

export default function CenterDetailScreen(
  {
    navigation,
    route,
  }: CenterDetailScreenProps = {} as CenterDetailScreenProps,
) {
  const { data: centers, isLoading } = useGetCenters();
  const centerId = route?.params?.centerId;

  const isDarkMode = useColorScheme() === 'dark';

  // Get the center from the list
  const center = useMemo(() => {
    if (!centers?.centers) return null;
    return centers.centers.find(c => c.id === centerId);
  }, [centers, centerId]) as any;

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
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
            Cargando detalles del centro...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!center) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#000' : '#fff' },
        ]}
      >
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color={BRAND_ORANGE} />
          <Text
            style={[
              styles.errorText,
              { color: isDarkMode ? '#f2f2f2' : '#333' },
            ]}
          >
            Centro no encontrado
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        </View>
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
            size={18}
            color={BRAND_ORANGE}
          />
        ))}
      </View>
    );
  };

  const handleReserve = (activityId?: string) => {
    Alert.alert(
      'Reservar',
      'Esta funcionalidad estará disponible pronto. Puedes contactar al centro directamente.',
      [{ text: 'OK' }],
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
          Centro Deportivo
        </Text>
        <Pressable
          hitSlop={10}
          onPress={() => Alert.alert('Agregado a favoritos')}
        >
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
              {typeof center.location === 'string' && (
                <Text
                  style={[
                    styles.locationSubtext,
                    { color: isDarkMode ? '#999' : BRAND_GRAY },
                  ]}
                >
                  {center.location}
                </Text>
              )}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {renderStars(center.rating || 4)}
            <Text
              style={[
                styles.ratingText,
                { color: isDarkMode ? '#bdbdbd' : BRAND_GRAY },
              ]}
            >
              {((center.rating || 4) as number).toFixed(1)} (
              {center.reviewCount || 0} reseñas)
            </Text>
          </View>

          {/* Hours */}
          {center.hours && (
            <View style={styles.infoRow}>
              <Icon name="schedule" size={20} color={BRAND_GRAY} />
              <Text
                style={[
                  styles.infoText,
                  { color: isDarkMode ? '#bdbdbd' : BRAND_GRAY },
                ]}
              >
                {center.hours.open} - {center.hours.close}
              </Text>
            </View>
          )}

          {/* Amenities */}
          {center.amenities && center.amenities.length > 0 && (
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
                {center.amenities.map((amenity: string, index: number) => (
                  <View key={index} style={styles.amenityTag}>
                    <Icon name="check-circle" size={16} color={BRAND_ORANGE} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Activities */}
          {center.activities && center.activities.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                Actividades Disponibles
              </Text>
              {center.activities.map((activity: any) => (
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
                    <Text
                      style={[
                        styles.activityDescription,
                        { color: isDarkMode ? '#bdbdbd' : BRAND_GRAY },
                      ]}
                    >
                      {activity.description}
                    </Text>
                    <View style={styles.activityMeta}>
                      <Text
                        style={[
                          styles.activityDuration,
                          { color: isDarkMode ? '#999' : BRAND_GRAY },
                        ]}
                      >
                        ⏱ {activity.duration} min
                      </Text>
                      <Text style={styles.activityPrice}>
                        {activity.price}€
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.activityButton}
                    onPress={() => handleReserve(activity.id)}
                  >
                    <Icon name="calendar-today" size={16} color="#fff" />
                    <Text style={styles.activityButtonText}>Reservar</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
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
        <Pressable style={styles.reserveButton} onPress={() => handleReserve()}>
          <Icon name="event-available" size={20} color="#fff" />
          <Text style={styles.reserveButtonText}>Hacer Reserva General</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 100,
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
    height: 200,
    backgroundColor: BRAND_ORANGE + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  centerName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    marginBottom: 4,
    fontWeight: '500',
  },
  locationSubtext: {
    fontSize: 13,
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
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    color: BRAND_GRAY,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    fontWeight: '700',
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
    backgroundColor: BRAND_ORANGE + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  amenityText: {
    fontSize: 13,
    color: BRAND_ORANGE,
    fontWeight: '500',
  },
  activityCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  activityDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_ORANGE,
  },
  activityButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  reserveButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
