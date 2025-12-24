import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useMyBookings, { Booking } from '@/hooks/useMyBookings';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

export default function MyReservationsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMyBookings();

  const categorizedReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalize = bookings.map(booking => {
      const startDate = buildDateFromBooking(booking);

      return {
        ...booking,
        startDate,
        displayDate: formatDateLabel(startDate),
        timeRange: formatTimeRange(booking.startTime, booking.endTime),
        centerLabel: booking.venueId || 'Centro por confirmar',
        activityLabel: booking.facilityId || 'Instalación por confirmar',
        status: booking.status || 'active',
      };
    });

    const upcoming = normalize
      .filter(res => {
        if (res.status === 'cancelled') return false;
        if (!res.startDate) return true;
        return res.startDate >= today;
      })
      .sort(compareDatesAsc);

    const past = normalize
      .filter(res => {
        if (res.status === 'cancelled') return true;
        if (!res.startDate) return false;
        return res.startDate < today;
      })
      .sort(compareDatesDesc);

    return { upcoming, past };
  }, [bookings]);

  const displayReservations =
    activeTab === 'upcoming'
      ? categorizedReservations.upcoming
      : categorizedReservations.past;

  const isRefreshing = isRefetching && !isLoading;
  const handleRefresh = () => {
    refetch();
  };
  const errorMessage =
    error instanceof Error
      ? error.message
      : 'No pudimos cargar tus reservas en este momento.';

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
            Cargando reservas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
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
      case 'active':
        return 'Activa';
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

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
          <Pressable onPress={() => refetch}>
            <Text style={styles.retryButtonInline}>Reintentar</Text>
          </Pressable>
        </View>
      )}

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
            Próximas ({categorizedReservations.upcoming.length})
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
            Pasadas ({categorizedReservations.past.length})
          </Text>
        </Pressable>
      </View>

      {/* Reservations List */}
      <FlatList
        data={displayReservations}
        keyExtractor={item =>
          item.id || `${item.centerLabel}-${item.timeRange}`
        }
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
                {reservation.centerLabel}
              </Text>
              <Text style={styles.activityName}>
                {reservation.activityLabel}
              </Text>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Icon name="event" size={16} color={BRAND_GRAY} />
                  <Text style={styles.detailText}>
                    {reservation.displayDate}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="schedule" size={16} color={BRAND_GRAY} />
                  <Text style={styles.detailText}>{reservation.timeRange}</Text>
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
                <Text style={styles.highlightText}>
                  {reservation.timeRange}
                </Text>
              </View>

              {/* Cancel Button (only for upcoming and non-cancelled) */}
              {activeTab === 'upcoming' &&
                reservation.status !== 'cancelled' && (
                  <Pressable
                    style={[styles.cancelButton, styles.cancelButtonDisabled]}
                    disabled
                  >
                    <Text style={styles.cancelButtonText}>
                      Cancelar (Próximamente)
                    </Text>
                  </Pressable>
                )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name={isError ? 'error-outline' : 'event-busy'}
              size={64}
              color={BRAND_GRAY}
            />
            <Text style={styles.emptyText}>
              {isError
                ? errorMessage
                : activeTab === 'upcoming'
                ? 'No tienes reservas próximas'
                : 'No hay reservas pasadas'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={BRAND_ORANGE}
          />
        }
      />
    </SafeAreaView>
  );
}

const toDateFromTimestamp = (value: any): Date | null => {
  if (!value) return null;

  if (typeof value.toDate === 'function') {
    const parsed = value.toDate();
    if (!Number.isNaN(parsed?.getTime?.())) {
      return parsed;
    }
  }

  if (typeof value.seconds === 'number') {
    const parsed = new Date(value.seconds * 1000);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
};

const buildDateFromBooking = (booking: Booking): Date | null => {
  if (!booking) return null;

  if (typeof booking.date === 'string' && booking.date.length > 0) {
    if (booking.startTime) {
      const withTime = new Date(`${booking.date}T${booking.startTime}`);
      if (!Number.isNaN(withTime.getTime())) {
        return withTime;
      }
    }

    const parsed = new Date(booking.date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const directDate = toDateFromTimestamp(booking.date);
  if (directDate) return directDate;

  return toDateFromTimestamp(booking.createdAt);
};

const formatDateLabel = (date: Date | null) => {
  if (!date) {
    return 'Fecha por confirmar';
  }

  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const formatTimeRange = (start?: string, end?: string) => {
  if (start && end) {
    return `${start} - ${end}`;
  }

  if (start) return start;
  if (end) return end;

  return 'Horario por confirmar';
};

const compareDatesAsc = (
  a: { startDate: Date | null },
  b: { startDate: Date | null },
) => {
  if (!a.startDate && !b.startDate) return 0;
  if (!a.startDate) return 1;
  if (!b.startDate) return -1;
  return a.startDate.getTime() - b.startDate.getTime();
};

const compareDatesDesc = (
  a: { startDate: Date | null },
  b: { startDate: Date | null },
) => compareDatesAsc(b, a);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FDECEA',
  },
  errorBannerText: {
    flex: 1,
    color: '#C62828',
    marginRight: 12,
  },
  retryButtonInline: {
    color: BRAND_ORANGE,
    fontWeight: '600',
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
  highlightText: {
    fontSize: 16,
    fontWeight: '600',
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
  cancelButtonDisabled: {
    backgroundColor: '#ECECEC',
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
