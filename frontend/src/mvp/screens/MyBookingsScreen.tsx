import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Screen from '../ui/Screen';
import StatusChip from '../ui/StatusChip';
import { mvpBookings } from '../data/mockData';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { MyBookingsStackParamList } from '@/navigation/appNav';

type Props = StackScreenProps<MyBookingsStackParamList, 'MyBookingsMain'>;

export default function MyBookingsScreen({ navigation }: Props) {
  const booking = mvpBookings[0];
  return (
    <Screen>
      <Text style={styles.title}>My bookings</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{booking.experienceName}</Text>
        <StatusChip status={booking.status} />
        <Text style={styles.meta}>{booking.club}</Text>
        <Text style={styles.meta}>{booking.dateLabel} {booking.timeLabel}</Text>
        <Text style={styles.meta}>Host: {booking.hostName || 'Pending assignment'}</Text>
        <Text style={styles.meta}>Instructions: {booking.instructions}</Text>
        <Pressable
          style={styles.action}
          onPress={() => navigation.navigate('PostSessionFeedback', { bookingId: booking.id })}
        >
          <Text style={styles.actionText}>Give feedback</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  meta: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  action: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  actionText: {
    color: colors.brandDark,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
