import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Screen from '../ui/Screen';
import SessionCard from '../ui/SessionCard';
import { mvpExperiences } from '../data/mockData';
import { colors, typography } from '../theme/tokens';
import { trackKpiEvent, kpiEvents } from '../analytics/events';
import { ExperiencesStackParamList } from '@/navigation/appNav';

type Props = StackScreenProps<ExperiencesStackParamList, 'ExperiencesList'>;

export default function ExperiencesListScreen({ navigation }: Props) {
  return (
    <Screen scroll={false}>
      <Text style={styles.title}>Upcoming beginner sessions in Barcelona</Text>
      <FlatList
        data={mvpExperiences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard
            experience={item}
            onPress={() => {
              trackKpiEvent(kpiEvents.experiencesCardClicked, { experienceId: item.id });
              navigation.navigate('ExperienceDetail', { experience: item });
            }}
          />
        )}
        contentContainerStyle={styles.list}
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
  list: {
    gap: 12,
  },
});
