import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
}

export function PrimaryButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable style={({ pressed }) => [styles.primary, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable style={({ pressed }) => [styles.secondary, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.brand,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.body,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: typography.body,
  },
  pressed: {
    opacity: 0.88,
  },
});
