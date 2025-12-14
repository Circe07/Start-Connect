import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SearchInputBox from '@/components/ui/SearchInputBox';
import { DUMMY_CENTERS } from '@/data/mockCenters';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

interface CentersScreenProps {
  navigation?: any;
}

export default function CentersScreen(
  { navigation }: CentersScreenProps = {} as CentersScreenProps,
) {
  const isDarkMode = useColorScheme() === 'dark';
  const [searchText, setSearchText] = useState('');

  const filteredCenters = DUMMY_CENTERS.filter(
    center =>
      center.name.toLowerCase().includes(searchText.toLowerCase()) ||
      center.location.toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Icon
            key={star}
            name={star <= Math.floor(rating) ? 'star' : 'star-border'}
            size={16}
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
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? '#f2f2f2' : '#333' },
          ]}
        >
          Centros Deportivos
        </Text>
        <Pressable hitSlop={10}>
          <Icon
            name="filter-list"
            size={24}
            color={isDarkMode ? '#f2f2f2' : '#333'}
          />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInputBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar centros..."
          mainIconName="search"
          mainIconColor={BRAND_GRAY}
          mainIconSize={20}
          containerStyle={styles.inputBoxStyle}
        />
      </View>

      {/* Centers List */}
      <FlatList
        data={filteredCenters}
        keyExtractor={item => item.id}
        renderItem={({ item: center }) => (
          <View
            style={[
              styles.centerCard,
              {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                borderColor: isDarkMode ? '#333' : '#e0e0e0',
              },
            ]}
          >
            {/* Center Image Placeholder */}
            <View style={styles.centerImagePlaceholder}>
              <Icon name="location-city" size={48} color={BRAND_ORANGE} />
            </View>

            {/* Center Info */}
            <View style={styles.centerInfo}>
              <Text
                style={[
                  styles.centerName,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                {center.name}
              </Text>

              <View style={styles.locationContainer}>
                <Icon name="location-on" size={16} color={BRAND_GRAY} />
                <Text style={styles.locationText}>{center.location}</Text>
              </View>

              <View style={styles.ratingContainer}>
                {renderStars(center.rating)}
                <Text style={styles.ratingText}>
                  {center.rating} ({center.reviewCount} reseñas)
                </Text>
              </View>

              <View style={styles.activitiesContainer}>
                {center.activities.slice(0, 3).map((activity, index) => (
                  <View key={activity.id} style={styles.activityTag}>
                    <Text style={styles.activityTagText}>{activity.name}</Text>
                  </View>
                ))}
                {center.activities.length > 3 && (
                  <Text style={styles.moreActivities}>
                    +{center.activities.length - 3} más
                  </Text>
                )}
              </View>

              <View style={styles.hoursContainer}>
                <Icon name="schedule" size={16} color={BRAND_GRAY} />
                <Text style={styles.hoursText}>
                  {center.hours.open} - {center.hours.close}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonsContainer}>
                <Pressable
                  style={[styles.button, styles.detailsButton]}
                  onPress={() =>
                    navigation?.navigate('CenterDetail', { center })
                  }
                >
                  <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.reserveButton]}
                  onPress={() =>
                    navigation?.navigate('Reservation', { center })
                  }
                >
                  <Text style={styles.reserveButtonText}>Reservar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="location-city" size={64} color={BRAND_GRAY} />
            <Text style={styles.emptyText}>No se encontraron centros</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 12,
  },
  inputBoxStyle: {
    height: 40,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 100, // Space for bottom navigation
  },
  centerCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  centerImagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: BRAND_ORANGE + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  centerInfo: {
    gap: 8,
  },
  centerName: {
    fontSize: 20,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: BRAND_GRAY,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    color: BRAND_GRAY,
  },
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  activityTag: {
    backgroundColor: BRAND_ORANGE + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTagText: {
    fontSize: 12,
    color: BRAND_ORANGE,
    fontWeight: '500',
  },
  moreActivities: {
    fontSize: 12,
    color: BRAND_GRAY,
    alignSelf: 'center',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hoursText: {
    fontSize: 14,
    color: BRAND_GRAY,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: '#f5f5f5',
  },
  detailsButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  reserveButton: {
    backgroundColor: BRAND_ORANGE,
  },
  reserveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: BRAND_GRAY,
    marginTop: 12,
  },
});
