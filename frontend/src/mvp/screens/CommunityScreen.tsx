import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Screen from '../ui/Screen';
import { SecondaryButton } from '../ui/Buttons';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function CommunityScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Community</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Join the WhatsApp group for beginner sessions updates.</Text>
        <SecondaryButton
          label="Open WhatsApp group"
          onPress={() => Linking.openURL('https://chat.whatsapp.com/')}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.text}>Invite a friend and join your next session together.</Text>
        <SecondaryButton label="Invite a friend" onPress={() => {}} />
      </View>
      <View style={styles.card}>
        <Text style={styles.text}>Upcoming group events: Sunday warm-up meetup at 16:30.</Text>
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
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
