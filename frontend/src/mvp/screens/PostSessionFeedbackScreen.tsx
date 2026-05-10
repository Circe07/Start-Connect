import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Screen from '../ui/Screen';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function PostSessionFeedbackScreen() {
  const [rating, setRating] = useState('');
  const [wouldRepeat, setWouldRepeat] = useState(true);
  const [wouldBringFriend, setWouldBringFriend] = useState(true);
  const [improvement, setImprovement] = useState('');
  const [comment, setComment] = useState('');

  return (
    <Screen>
      <Text style={styles.title}>Post-session feedback</Text>

      <TextInput
        value={rating}
        onChangeText={setRating}
        keyboardType="number-pad"
        placeholder="Rating from 1 to 10"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <View style={styles.row}>
        <Text style={styles.label}>Would you repeat?</Text>
        <Switch value={wouldRepeat} onValueChange={setWouldRepeat} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Would you bring a friend?</Text>
        <Switch value={wouldBringFriend} onValueChange={setWouldBringFriend} />
      </View>
      <TextInput
        value={improvement}
        onChangeText={setImprovement}
        placeholder="What would you improve?"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Open comment"
        placeholderTextColor={colors.textMuted}
        multiline
        style={[styles.input, styles.multiline]}
      />

      <PrimaryButton label="Book next session" onPress={() => {}} />
      <SecondaryButton label="I want to repeat with a similar group" onPress={() => {}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
});
