import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Screen from '../ui/Screen';
import { PrimaryButton } from '../ui/Buttons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { BookingFormValues, TimesPlayedOption } from '../types';
import { trackKpiEvent, kpiEvents } from '../analytics/events';
import { ExperiencesStackParamList } from '@/navigation/appNav';

type Props = StackScreenProps<ExperiencesStackParamList, 'BookingForm'>;

const timesPlayedOptions: { label: string; value: TimesPlayedOption }[] = [
  { label: 'Never', value: 'never' },
  { label: '1-3 times', value: '1-3' },
  { label: '4-10 times', value: '4-10' },
  { label: '10-25 times', value: '10-25' },
  { label: 'I play occasionally, but I do not have a fixed group', value: 'occasional_no_fixed_group' },
];

export default function BookingFormScreen({ route, navigation }: Props) {
  const { experience } = route.params;
  const [form, setForm] = useState<BookingFormValues>({
    name: '',
    age: '',
    barcelonaArea: '',
    timesPlayed: 'never',
    whatsapp: '',
    comingMode: 'alone',
  });

  useEffect(() => {
    trackKpiEvent(kpiEvents.bookingFormStarted, { experienceId: experience.id });
  }, [experience.id]);

  const paymentIntegrated = false;
  const ctaLabel = useMemo(
    () => (paymentIntegrated ? 'Confirm reservation' : 'Reserve via WhatsApp'),
    [paymentIntegrated]
  );

  const isValid =
    form.name.trim().length > 1 &&
    form.age.trim().length > 0 &&
    form.barcelonaArea.trim().length > 1 &&
    form.whatsapp.trim().length >= 6;

  const onSubmit = () => {
    if (!isValid) return;
    trackKpiEvent(kpiEvents.bookingFormSubmitted, { experienceId: experience.id });
    if (!paymentIntegrated) {
      trackKpiEvent(kpiEvents.bookingWhatsappClicked, { experienceId: experience.id });
    } else {
      trackKpiEvent(kpiEvents.paymentStepStarted, { experienceId: experience.id });
    }
    navigation.navigate('BookingConfirmation', { experience });
  };

  return (
    <Screen>
      <Text style={styles.title}>Reserve your spot in 60 seconds</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor={colors.textMuted}
        value={form.name}
        onChangeText={(v) => setForm((prev) => ({ ...prev, name: v }))}
        style={styles.input}
      />
      <TextInput
        placeholder="Age"
        placeholderTextColor={colors.textMuted}
        value={form.age}
        keyboardType="numeric"
        onChangeText={(v) => setForm((prev) => ({ ...prev, age: v }))}
        style={styles.input}
      />
      <TextInput
        placeholder="Area of Barcelona"
        placeholderTextColor={colors.textMuted}
        value={form.barcelonaArea}
        onChangeText={(v) => setForm((prev) => ({ ...prev, barcelonaArea: v }))}
        style={styles.input}
      />

      <View style={styles.block}>
        <Text style={styles.blockTitle}>How many times have you played padel?</Text>
        {timesPlayedOptions.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setForm((prev) => ({ ...prev, timesPlayed: opt.value }))}
            style={[
              styles.option,
              form.timesPlayed === opt.value && styles.optionSelected,
            ]}
          >
            <Text style={styles.optionText}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        placeholder="WhatsApp number"
        placeholderTextColor={colors.textMuted}
        value={form.whatsapp}
        onChangeText={(v) => setForm((prev) => ({ ...prev, whatsapp: v }))}
        style={styles.input}
      />

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Are you coming alone or with someone?</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setForm((prev) => ({ ...prev, comingMode: 'alone' }))}
            style={[styles.toggle, form.comingMode === 'alone' && styles.optionSelected]}
          >
            <Text style={styles.optionText}>Alone</Text>
          </Pressable>
          <Pressable
            onPress={() => setForm((prev) => ({ ...prev, comingMode: 'with_someone' }))}
            style={[styles.toggle, form.comingMode === 'with_someone' && styles.optionSelected]}
          >
            <Text style={styles.optionText}>With someone</Text>
          </Pressable>
        </View>
      </View>

      <PrimaryButton label={ctaLabel} onPress={onSubmit} />
      {!isValid && <Text style={styles.helper}>Please complete all fields to continue.</Text>}
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
  block: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  blockTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.xs,
  },
  optionSelected: {
    borderColor: colors.brand,
    backgroundColor: '#FFF1E8',
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  helper: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
});
