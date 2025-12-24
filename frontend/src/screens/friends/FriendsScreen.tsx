import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SearchInputBox from '@/components/ui/SearchInputBox';
import useFriends from '@/hooks/useFriends';
import { FriendSummary, removeFriend } from '@/services/friends/friendsService';
import { createChat } from '@/services/chat/chatService';

const ACCENT = '#FF7F3F';
const CANVAS = '#F5F6FA';
const INK = '#111322';
const MUTED = '#8B90A6';

export default function FriendsScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState('');
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const {
    data: friends = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useFriends();

  const filteredFriends = useMemo(() => {
    if (!searchText.trim()) return friends;
    const normalized = searchText.toLowerCase();
    return friends.filter(friend => {
      const profile = friend.profile || {};
      const name = (profile.name || '').toLowerCase();
      const username = (profile.username || '').toLowerCase();
      return name.includes(normalized) || username.includes(normalized);
    });
  }, [friends, searchText]);

  const startChatMutation = useMutation({
    mutationFn: async (friend: FriendSummary) => {
      const response = await createChat([friend.friendId], {
        source: 'friends',
      });

      if (!response.success) {
        throw new Error(response.error || 'No se pudo crear el chat');
      }

      const payload = response.data || {};
      const chatId = payload.chatId || payload.chat?.id;

      if (!chatId) {
        throw new Error('No se pudo obtener el identificador del chat');
      }

      return { chatId, friend };
    },
    onSuccess: ({ chatId, friend }) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      navigation.navigate('Chat', {
        chatId,
        chatName: friend.profile?.name || friend.profile?.username || 'Chat',
        chatAvatar: friend.profile?.photo,
      });
    },
    onError: (mutationError: any) => {
      Alert.alert(
        'No se pudo abrir el chat',
        mutationError?.message || 'Inténtalo de nuevo en unos segundos.',
      );
    },
    onSettled: () => setPendingChatId(null),
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friend: FriendSummary) => {
      const response = await removeFriend(friend.friendId);

      if (!response.success) {
        throw new Error(response.error || 'No se pudo eliminar al amigo');
      }

      return friend.friendId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (mutationError: any) => {
      Alert.alert(
        'No se pudo eliminar',
        mutationError?.message || 'Inténtalo de nuevo en unos segundos.',
      );
    },
    onSettled: () => setPendingRemoveId(null),
  });

  const handleStartChat = (friend: FriendSummary) => {
    if (startChatMutation.isPending) return;
    setPendingChatId(friend.friendId);
    startChatMutation.mutate(friend);
  };

  const handleRemoveFriend = (friend: FriendSummary) => {
    if (removeFriendMutation.isPending) return;
    setPendingRemoveId(friend.friendId);
    removeFriendMutation.mutate(friend);
  };

  const renderFriend = ({ item }: { item: FriendSummary }) => {
    const avatarUri = item.profile?.photo
      ? { uri: item.profile.photo }
      : {
          uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            item.profile?.name || item.profile?.username || 'SC',
          )}&background=111322&color=fff`,
        };

    const isChatPending =
      pendingChatId === item.friendId && startChatMutation.isPending;
    const isRemovePending =
      pendingRemoveId === item.friendId && removeFriendMutation.isPending;

    return (
      <View style={styles.friendRow}>
        <View style={styles.avatarShadow}>
          <Image source={avatarUri} style={styles.avatar} />
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName} numberOfLines={1}>
            {item.profile?.name || item.profile?.username || 'Usuario'}
          </Text>
          {item.profile?.username ? (
            <Text style={styles.friendHandle} numberOfLines={1}>
              @{item.profile.username}
            </Text>
          ) : null}
          {item.profile?.bio ? (
            <Text style={styles.friendBio} numberOfLines={1}>
              {item.profile.bio}
            </Text>
          ) : null}
        </View>
        <View style={styles.friendActions}>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => handleStartChat(item)}
            disabled={isChatPending}
          >
            {isChatPending ? (
              <ActivityIndicator size="small" color={ACCENT} />
            ) : (
              <Text style={styles.secondaryActionText}>Chat</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerAction}
            onPress={() => handleRemoveFriend(item)}
            disabled={isRemovePending}
          >
            {isRemovePending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="close" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="group-off" size={44} color={ACCENT} />
      <Text style={styles.emptyTitle}>Aún no guardas amigos</Text>
      <Text style={styles.emptyCopy}>
        Añade personas a tu círculo para encontrarlas tan fácil como en
        Instagram.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('SearchUser')}
        accessibilityRole="button"
      >
        <Text style={styles.emptyButtonText}>Explorar usuarios</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Icon name="arrow-back-ios" size={16} color="#fff" />
        </TouchableOpacity>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Tu círculo</Text>
          <Text style={styles.heroSubtitle}>
            Guarda conexiones reales y vuelve a escribirles cuando quieras.
          </Text>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <SearchInputBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar en tus amigos"
          mainIconName="search"
          mainIconColor={MUTED}
          mainIconSize={20}
        />
      </View>

      {error ? (
        <Text style={styles.errorBanner}>
          No se pudieron cargar los amigos. Desliza para reintentar.
        </Text>
      ) : null}

      {isLoading ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loaderText}>Cargando tus amigos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={item => item.friendId}
          renderItem={renderFriend}
          contentContainerStyle={
            filteredFriends.length === 0
              ? styles.emptyContainer
              : styles.listContainer
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={ACCENT}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SearchUser')}
        accessibilityRole="button"
        accessibilityLabel="Agregar amigos"
      >
        <Icon name="person-add-alt-1" size={20} color="#fff" />
        <Text style={styles.fabText}>Agregar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CANVAS,
  },
  hero: {
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroCopy: {
    gap: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  searchWrapper: {
    marginTop: -25,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  loaderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loaderText: {
    marginTop: 12,
    color: MUTED,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
    padding: 32,
    justifyContent: 'center',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
  },
  avatarShadow: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#111',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginRight: 14,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  friendInfo: {
    flex: 1,
    gap: 2,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  friendHandle: {
    color: MUTED,
    fontSize: 13,
  },
  friendBio: {
    color: '#5F6478',
    fontSize: 12,
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginLeft: 10,
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: ACCENT,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  secondaryActionText: {
    color: ACCENT,
    fontWeight: '600',
  },
  dangerAction: {
    backgroundColor: '#EF4444',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  emptyCopy: {
    textAlign: 'center',
    color: MUTED,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: INK,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  errorBanner: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
    color: '#B91C1C',
    fontSize: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
  },
});
