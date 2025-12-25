import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import SearchInputBox from '@/components/ui/SearchInputBox';
import { Group } from '@/types/interface/group/group';
import {
  getPublicGroups,
  getMyGroups,
  joinGroup,
  sendGroupRequest,
} from '@/services/groups/authGroup';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

type SegmentKey = 'discover' | 'my';

interface GroupsScreenProps {
  navigation?: any;
}

export default function GroupsScreen(
  { navigation }: GroupsScreenProps = {} as GroupsScreenProps,
) {
  const isDarkMode = useColorScheme() === 'dark';
  const [searchText, setSearchText] = useState('');
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('discover');
  const queryClient = useQueryClient();

  const publicGroupsQuery = useQuery({
    queryKey: ['groups', 'public'],
    queryFn: getPublicGroups,
    staleTime: 60 * 1000,
  });

  const myGroupsQuery = useQuery({
    queryKey: ['groups', 'my'],
    queryFn: getMyGroups,
    staleTime: 60 * 1000,
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (args: { groupId: string; isPublic: boolean }) => {
      if (args.isPublic) {
        return joinGroup(args.groupId);
      }
      return sendGroupRequest(args.groupId);
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'my'] });
      if (!variables.isPublic) {
        Alert.alert(
          'Solicitud enviada',
          'El administrador revisará tu petición pronto.',
        );
      }
    },
    onError: (mutationError: any) => {
      Alert.alert(
        'No se pudo completar',
        mutationError?.message || 'Intenta nuevamente.',
      );
    },
  });

  const isLoading =
    activeSegment === 'discover'
      ? publicGroupsQuery.isLoading
      : myGroupsQuery.isLoading;

  const groups: Group[] = useMemo(() => {
    const source =
      activeSegment === 'discover'
        ? publicGroupsQuery.data?.groups || []
        : myGroupsQuery.data || [];

    if (!searchText.trim()) {
      return source;
    }

    const query = searchText.trim().toLowerCase();
    return source.filter(group => {
      const haystack = `${group.name} ${group.sport}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [activeSegment, publicGroupsQuery.data, myGroupsQuery.data, searchText]);

  const handleOpenGroup = (group: Group) => {
    navigation?.navigate?.('GroupDetail', { groupId: group.id });
  };

  const handlePrimaryAction = (group: Group) => {
    const viewerState = group.viewerState;

    if (viewerState?.isMember) {
      handleOpenGroup(group);
      return;
    }

    if (!group.isPublic && viewerState?.hasPendingRequest) {
      Alert.alert('Pendiente', 'Ya enviaste una solicitud para este grupo.');
      return;
    }

    joinGroupMutation.mutate({ groupId: group.id, isPublic: group.isPublic });
  };

  const renderSegmentTabs = () => (
    <View style={styles.segmentContainer}>
      {(
        [
          { key: 'discover', label: 'Descubrir' },
          { key: 'my', label: 'Mis grupos' },
        ] as { key: SegmentKey; label: string }[]
      ).map(segment => {
        const isActive = segment.key === activeSegment;
        return (
          <Pressable
            key={segment.key}
            style={[
              styles.segmentButton,
              {
                backgroundColor: isActive
                  ? BRAND_ORANGE
                  : isDarkMode
                  ? '#1a1a1a'
                  : '#f4f4f4',
              },
            ]}
            onPress={() => setActiveSegment(segment.key)}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: isActive ? '#fff' : isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderItem = ({ item }: { item: Group }) => {
    const viewerState = item.viewerState;
    const isMember = viewerState?.isMember;
    const hasPendingRequest = viewerState?.hasPendingRequest;
    const canPreview = item.isPublic || Boolean(isMember);
    const isProcessing =
      joinGroupMutation.isPending &&
      joinGroupMutation.variables?.groupId === item.id;

    let actionLabel = 'Unirme';
    if (isMember) {
      actionLabel = 'Ver grupo';
    } else if (!item.isPublic) {
      actionLabel = hasPendingRequest
        ? 'Solicitud enviada'
        : 'Solicitar acceso';
    }

    return (
      <Pressable
        style={[
          styles.groupCard,
          {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderColor: isDarkMode ? '#333' : '#e0e0e0',
          },
        ]}
        disabled={!canPreview}
        onPress={() => (canPreview ? handleOpenGroup(item) : null)}
      >
        <View style={styles.groupImageContainer}>
          <View style={styles.groupImagePlaceholder}>
            <Icon name="groups" size={40} color={BRAND_ORANGE} />
          </View>
        </View>

        <View style={styles.groupInfo}>
          <Text
            style={[
              styles.groupName,
              { color: isDarkMode ? '#f2f2f2' : '#333' },
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.groupActivity}>{item.sport}</Text>
          <View style={styles.groupMeta}>
            <Icon name="people" size={16} color={BRAND_GRAY} />
            <Text style={styles.groupMetaText}>
              {item.members.length} miembros
            </Text>
          </View>
          <Text
            style={[
              styles.groupDescription,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>

        <Pressable
          style={[
            styles.joinButton,
            {
              backgroundColor: isMember
                ? BRAND_ORANGE
                : isDarkMode
                ? '#2a2a2a'
                : '#f5f5f5',
              opacity:
                hasPendingRequest && !isMember ? 0.5 : isProcessing ? 0.7 : 1,
            },
          ]}
          disabled={hasPendingRequest && !isMember}
          onPress={() => handlePrimaryAction(item)}
        >
          {isProcessing ? (
            <ActivityIndicator color={isMember ? '#fff' : BRAND_ORANGE} />
          ) : (
            <Text
              style={[
                styles.joinButtonText,
                { color: isMember ? '#fff' : isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              {actionLabel}
            </Text>
          )}
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
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

      {renderSegmentTabs()}

      {isLoading ? (
        <View style={styles.loaderState}>
          <ActivityIndicator color={BRAND_ORANGE} />
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="groups" size={64} color={BRAND_GRAY} />
              <Text style={styles.emptyText}>
                {searchText
                  ? 'No hay coincidencias para tu búsqueda.'
                  : activeSegment === 'discover'
                  ? 'Aún no hay grupos públicos.'
                  : 'Todavía no perteneces a ningún grupo.'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingHorizontal: 18,
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
    textAlign: 'center',
  },
  loaderState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
