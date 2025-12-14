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
import { DUMMY_RESERVATIONS } from '@/data/mockReservations';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

export default function MyReservationsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReservations = DUMMY_RESERVATIONS.filter(
    res => new Date(res.date) >= today && res.status !== 'cancelled',
  );

  const pastReservations = DUMMY_RESERVATIONS.filter(
    res => new Date(res.date) < today || res.status === 'cancelled',
  );

  const displayReservations =
    activeTab === 'upcoming' ? upcomingReservations : pastReservations;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return BRAND_ORANGE;
      case 'cancelled':
        return '#F44336';
      default:
        return BRAND_GRAY;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
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
          Mis Reservas
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'upcoming'
                    ? BRAND_ORANGE
                    : isDarkMode
                    ? '#999'
                    : '#666',
              },
            ]}
          >
            Próximas ({upcomingReservations.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'past'
                    ? BRAND_ORANGE
                    : isDarkMode
                    ? '#999'
                    : '#666',
              },
            ]}
          >
            Pasadas ({pastReservations.length})
          </Text>
        </Pressable>
      </View>

      {/* Reservations List */}
      <FlatList
        data={displayReservations}
        keyExtractor={item => item.id}
        renderItem={({ item: reservation }) => (
          <View
            style={[
              styles.reservationCard,
              {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                borderColor: isDarkMode ? '#333' : '#e0e0e0',
              },
            ]}
          >
            {/* Center Image Placeholder */}
            <View style={styles.centerImageSmall}>
              <Icon name="location-city" size={32} color={BRAND_ORANGE} />
            </View>

            {/* Reservation Info */}
            <View style={styles.reservationInfo}>
              <Text
                style={[
                  styles.centerName,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                {reservation.centerName}
              </Text>
              <Text style={styles.activityName}>
                {reservation.activityName}
              </Text>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Icon name="event" size={16} color={BRAND_GRAY} />
                  <Text style={styles.detailText}>
                    {new Date(reservation.date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="schedule" size={16} color={BRAND_GRAY} />
                  <Text style={styles.detailText}>
                    {reservation.time} ({reservation.duration} min)
                  </Text>
                </View>
              </View>

              <View style={styles.bottomRow}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        getStatusColor(reservation.status) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(reservation.status) },
                    ]}
                  >
                    {getStatusText(reservation.status)}
                  </Text>
                </View>
                <Text style={styles.price}>{reservation.price}€</Text>
              </View>

              {/* Cancel Button (only for upcoming and non-cancelled) */}
              {activeTab === 'upcoming' &&
                reservation.status !== 'cancelled' && (
                  <Pressable style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={64} color={BRAND_GRAY} />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? 'No tienes reservas próximas'
                : 'No hay reservas pasadas'}
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: BRAND_ORANGE,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 100, // Space for bottom navigation
  },
  reservationCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  centerImageSmall: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: BRAND_ORANGE + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reservationInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityName: {
    fontSize: 14,
    color: BRAND_ORANGE,
    marginBottom: 8,
  },
  detailsContainer: {
    gap: 4,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: BRAND_GRAY,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BRAND_ORANGE,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#F44336',
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
