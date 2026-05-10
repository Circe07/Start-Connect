import React, { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
}

export default function Screen({ children, scroll = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
