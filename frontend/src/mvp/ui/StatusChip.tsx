import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BookingStatus } from '../types';
import { colors, radius, spacing, typography } from '../theme/tokens';

const statusMap: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FFF3D9', text: '#8A5A00', label: 'pending' },
  confirmed: { bg: '#E5F5EA', text: '#166C3B', label: 'confirmed' },
  paid: { bg: '#DCF4E6', text: '#145C35', label: 'paid' },
  cancelled: { bg: '#FDE7E4', text: '#8E2E1E', label: 'cancelled' },
  attended: { bg: '#E3F2FF', text: '#1D5F9A', label: 'attended' },
  'no-show': { bg: '#F2E9E7', text: '#6A4A45', label: 'no-show' },
};

export default function StatusChip({ status }: { status: BookingStatus }) {
  const token = statusMap[status];
  return (
    <View style={[styles.chip, { backgroundColor: token.bg }]}>
      <Text style={[styles.text, { color: token.text }]}>{token.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
