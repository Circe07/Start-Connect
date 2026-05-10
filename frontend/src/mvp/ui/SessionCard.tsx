import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Experience } from '../types';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

interface SessionCardProps {
  experience: Experience;
  onPress: () => void;
}

export default function SessionCard({ experience, onPress }: SessionCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.title}>{experience.name}</Text>
      <Text style={styles.meta}>📍 {experience.club} — {experience.area}</Text>
      <Text style={styles.meta}>🗓 {experience.dateLabel} {experience.timeLabel}</Text>
      <Text style={styles.meta}>🎾 Level: {experience.levelLabel}</Text>
      <Text style={styles.meta}>👥 {experience.spotsAvailable}/{experience.spotsTotal} spots available</Text>
      <Text style={styles.meta}>💶 {experience.priceLabel}</Text>
      <Text style={styles.included}>✅ {experience.included.slice(0, 3).join(' + ')}</Text>
      <View style={styles.cta}>
        <Text style={styles.ctaText}>Reserve spot</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.95,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  included: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  cta: {
    marginTop: spacing.sm,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.body,
  },
});
