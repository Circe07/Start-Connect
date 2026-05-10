import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Screen from '../ui/Screen';
import { PrimaryButton } from '../ui/Buttons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { trackKpiEvent, kpiEvents } from '../analytics/events';
import { ExperiencesStackParamList } from '@/navigation/appNav';

type Props = StackScreenProps<ExperiencesStackParamList, 'ExperienceDetail'>;

export default function ExperienceDetailScreen({ route, navigation }: Props) {
  const { experience } = route.params;

  useEffect(() => {
    trackKpiEvent(kpiEvents.experienceDetailViewed, { experienceId: experience.id });
  }, [experience.id]);

  return (
    <Screen>
      <Text style={styles.title}>{experience.name}</Text>
      <Text style={styles.promise}>{experience.promise}</Text>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>What is included</Text>
        {experience.included.map((item) => (
          <Text key={item} style={styles.bullet}>• {item}</Text>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Details</Text>
        <Text style={styles.meta}>Club: {experience.club}</Text>
        <Text style={styles.meta}>Address: {experience.address}</Text>
        <Text style={styles.meta}>Date: {experience.dateLabel}</Text>
        <Text style={styles.meta}>Start time: {experience.timeLabel}</Text>
        <Text style={styles.meta}>Duration: {experience.durationLabel}</Text>
        <Text style={styles.meta}>Price: {experience.priceLabel}</Text>
        <Text style={styles.meta}>
          Available spots: {experience.spotsAvailable}/{experience.spotsTotal}
        </Text>
        <Text style={styles.meta}>Recommended level: {experience.levelLabel}</Text>
        <Text style={styles.meta}>Host: {experience.hostName || 'Pending assignment'}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Who this is for</Text>
        {experience.whoIsFor.map((item) => (
          <Text key={item} style={styles.bullet}>• {item}</Text>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Who this is NOT for</Text>
        {experience.whoIsNotFor.map((item) => (
          <Text key={item} style={styles.bullet}>• {item}</Text>
        ))}
      </View>

      <PrimaryButton
        label="Reserve my spot"
        onPress={() => navigation.navigate('BookingForm', { experience })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  promise: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  block: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  blockTitle: {
    fontSize: typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  meta: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  bullet: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
