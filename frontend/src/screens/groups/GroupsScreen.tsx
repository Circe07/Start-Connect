import Icon from 'react-native-vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SearchInputBox from '@/components/ui/SearchInputBox';
import { DUMMY_GROUPS } from '@/data/mockGroups';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

interface GroupsScreenProps {
  navigation?: any;
}

export default function GroupsScreen(
  { navigation }: GroupsScreenProps = {} as GroupsScreenProps,
) {
  const isDarkMode = useColorScheme() === 'dark';
  const [searchText, setSearchText] = useState('');
  const [groups, setGroups] = useState(DUMMY_GROUPS);

  const filteredGroups = groups.filter(
    group =>
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.activityType.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleJoinToggle = (groupId: string) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId ? { ...group, isJoined: !group.isJoined } : group,
      ),
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? '#f2f2f2' : '#333' },
          ]}
        >
          Grupos
        </Text>
        <Pressable hitSlop={10}>
          <Icon name="add" size={28} color={isDarkMode ? '#f2f2f2' : '#333'} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInputBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar grupos..."
          mainIconName="search"
          mainIconColor={BRAND_GRAY}
          mainIconSize={20}
          containerStyle={styles.inputBoxStyle}
        />
      </View>

      {/* Groups List */}
      <FlatList
        data={filteredGroups}
        keyExtractor={item => item.id}
        renderItem={({ item: group }) => (
          <View
            style={[
              styles.groupCard,
              {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                borderColor: isDarkMode ? '#333' : '#e0e0e0',
              },
            ]}
          >
            {/* Group Image */}
            <View style={styles.groupImageContainer}>
              <View style={styles.groupImagePlaceholder}>
                <Icon name="groups" size={40} color={BRAND_ORANGE} />
              </View>
            </View>

            {/* Group Info */}
            <View style={styles.groupInfo}>
              <Text
                style={[
                  styles.groupName,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                {group.name}
              </Text>
              <Text style={styles.groupActivity}>{group.activityType}</Text>
              <View style={styles.groupMeta}>
                <Icon name="people" size={16} color={BRAND_GRAY} />
                <Text style={styles.groupMetaText}>
                  {group.memberCount} miembros
                </Text>
              </View>
              <Text
                style={[
                  styles.groupDescription,
                  { color: isDarkMode ? '#999' : '#666' },
                ]}
                numberOfLines={2}
              >
                {group.description}
              </Text>
            </View>

            {/* Join Button */}
            <Pressable
              style={[
                styles.joinButton,
                {
                  backgroundColor: group.isJoined
                    ? isDarkMode
                      ? '#2a2a2a'
                      : '#f5f5f5'
                    : BRAND_ORANGE,
                },
              ]}
              onPress={() => handleJoinToggle(group.id)}
            >
              <Text
                style={[
                  styles.joinButtonText,
                  {
                    color: group.isJoined
                      ? isDarkMode
                        ? '#f2f2f2'
                        : '#333'
                      : '#fff',
                  },
                ]}
              >
                {group.isJoined ? 'Unirse' : 'Unido'}
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="groups" size={64} color={BRAND_GRAY} />
            <Text style={styles.emptyText}>No se encontraron grupos</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 12,
  },
  inputBoxStyle: {
    height: 40,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 100,
  },
  groupCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  groupImageContainer: {
    marginRight: 12,
  },
  groupImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND_ORANGE + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupActivity: {
    fontSize: 14,
    color: BRAND_ORANGE,
    marginBottom: 6,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  groupMetaText: {
    fontSize: 13,
    color: BRAND_GRAY,
  },
  groupDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: BRAND_GRAY,
    marginTop: 12,
  },
});
