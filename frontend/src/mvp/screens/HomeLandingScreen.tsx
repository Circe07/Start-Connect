import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Screen from '../ui/Screen';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { trackKpiEvent, kpiEvents } from '../analytics/events';
import { ExperiencesStackParamList } from '@/navigation/appNav';

type Props = StackScreenProps<ExperiencesStackParamList, 'HomeLanding'>;

export default function HomeLandingScreen({ navigation }: Props) {
  return (
    <Screen>
      <Text style={styles.headline}>Start playing padel in Barcelona without coming alone.</Text>
      <Text style={styles.subtitle}>
        Guided beginner padel sessions with court included, a host, and people at your level.
      </Text>

      <View style={styles.signatureCard}>
        <Text style={styles.signatureTitle}>No vienes solo/a</Text>
        <Text style={styles.signatureText}>
          We organize beginner groups so you can join your first session with confidence.
        </Text>
      </View>

      <PrimaryButton
        label="See upcoming sessions"
        onPress={() => {
          trackKpiEvent(kpiEvents.homeCtaPrimaryClicked);
          navigation.navigate('ExperiencesList');
        }}
      />
      <SecondaryButton
        label="Notify me about future sessions"
        onPress={() => navigation.navigate('ExperiencesList')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: {
    color: colors.textPrimary,
    fontSize: typography.h1,
    fontWeight: '800',
    lineHeight: 38,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 23,
  },
  signatureCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  signatureTitle: {
    color: colors.brandDark,
    fontWeight: '800',
    fontSize: typography.h3,
  },
  signatureText: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
});
