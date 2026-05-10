import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../ui/Screen';
import { PrimaryButton } from '../ui/Buttons';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function ProgressScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Progress</Text>
      <View style={styles.card}>
        <Text style={styles.stat}>Games played: 3</Text>
        <Text style={styles.stat}>Current level: Beginner (0-10 games)</Text>
        <Text style={styles.stat}>Previous sessions: Primer Set x3</Text>
      </View>
      <PrimaryButton label="Repeat with a similar group" onPress={() => {}} />
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
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  stat: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
});
