import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Screen from '../ui/Screen';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { trackKpiEvent, kpiEvents } from '../analytics/events';
import { ExperiencesStackParamList } from '@/navigation/appNav';

type Props = StackScreenProps<ExperiencesStackParamList, 'BookingConfirmation'>;

export default function BookingConfirmationScreen({ route, navigation }: Props) {
  const { experience } = route.params;

  useEffect(() => {
    trackKpiEvent(kpiEvents.bookingConfirmedViewed, { experienceId: experience.id });
  }, [experience.id]);

  return (
    <Screen>
      <Text style={styles.title}>Your spot is almost confirmed 🎾</Text>
      <Text style={styles.subtitle}>
        We received your reservation request for {experience.name}. We will confirm your spot and send
        you final details via WhatsApp.
      </Text>

      <View style={styles.block}>
        <Text style={styles.item}>Date: {experience.dateLabel}</Text>
        <Text style={styles.item}>Time: {experience.timeLabel}</Text>
        <Text style={styles.item}>Club: {experience.club}</Text>
        <Text style={styles.item}>Address: {experience.address}</Text>
        <Text style={styles.item}>What to bring: sports shoes and water</Text>
        <Text style={styles.item}>Cancellation: {experience.cancellationPolicy}</Text>
        <Text style={styles.item}>WhatsApp contact: +34 600 000 000</Text>
        <Text style={styles.item}>Next step: payment confirmation by WhatsApp</Text>
      </View>

      <PrimaryButton label="See upcoming sessions" onPress={() => navigation.navigate('ExperiencesList')} />
      <SecondaryButton label="Back to home" onPress={() => navigation.navigate('HomeLanding')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  block: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  item: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
