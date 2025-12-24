import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SearchInputBox from '@/components/ui/SearchInputBox';
import useSearchUser from '@/hooks/useSearchUser';
import useCurrentUserProfile from '@/hooks/useCurrentUserProfile';
import { PublicUserSummary } from '@/services/user/userService';
import { createChat } from '@/services/chat/chatService';
import { addFriend } from '@/services/friends/friendsService';

const BRAND_GRAY = '#9E9E9E';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserProfile();
  const currentUserId = currentUser?.uid || currentUser?.id;

  const { searchText, handleSearch, results, isLoading, error, minimumChars } =
    useSearchUser();

  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingFriendId, setPendingFriendId] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    if (!currentUserId) return results;
    return results.filter(user => user.id !== currentUserId);
  }, [results, currentUserId]);

  const startChatMutation = useMutation({
    mutationFn: async (user: PublicUserSummary) => {
      const response = await createChat([user.id], { source: 'search' });

      if (!response.success) {
        throw new Error(response.error || 'No se pudo crear el chat');
      }

      const payload = response.data || {};
      const chatId = payload.chatId || payload.chat?.id;

      if (!chatId) {
        throw new Error('No se pudo obtener el identificador del chat');
      }

      return {
        chatId,
        chat: payload.chat,
        target: user,
      };
    },
    onSuccess: ({ chatId, target }) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      navigation.navigate('Chat', {
        chatId,
        chatName: target.name || target.username || 'Chat',
        chatAvatar: target.photo,
      });
    },
    onError: (mutationError: any) => {
      Alert.alert(
        'No se pudo iniciar el chat',
        mutationError?.message || 'Inténtalo de nuevo en unos segundos.',
      );
    },
    onSettled: () => setPendingUserId(null),
  });

  const addFriendMutation = useMutation({
    mutationFn: async (user: PublicUserSummary) => {
      const response = await addFriend(user.id);

      if (!response.success) {
        throw new Error(response.error || 'No se pudo agregar el amigo');
      }

      return response.data?.friend;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      Alert.alert('Listo', 'Guardaste a este usuario en tu lista de amigos.');
    },
    onError: (mutationError: any) => {
      Alert.alert(
        'No se pudo guardar',
        mutationError?.message || 'Inténtalo de nuevo en unos segundos.',
      );
    },
    onSettled: () => setPendingFriendId(null),
  });

  const handleUserPress = (user: PublicUserSummary) => {
    if (!user?.id || startChatMutation.isPending) {
      return;
    }

    setPendingUserId(user.id);
    startChatMutation.mutate(user);
  };

  const handleAddFriend = (user: PublicUserSummary) => {
    if (!user?.id || addFriendMutation.isPending) {
      return;
    }

    setPendingFriendId(user.id);
    addFriendMutation.mutate(user);
  };

  const renderItem = ({ item }: { item: PublicUserSummary }) => {
    const avatarUri = item.photo
      ? { uri: item.photo }
      : {
          uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            item.name || item.username || 'SC',
          )}&background=FF7F3F&color=fff`,
        };

    const isChatPending =
      pendingUserId === item.id && startChatMutation.isPending;
    const isFriendPending =
      pendingFriendId === item.id && addFriendMutation.isPending;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
        disabled={isChatPending}
      >
        <Image source={avatarUri} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.usernameText}>
            {item.name || item.username || 'Usuario'}
          </Text>
          {item.username ? (
            <Text style={styles.handleText}>@{item.username}</Text>
          ) : null}
          {item.bio ? (
            <Text style={styles.bioText} numberOfLines={1}>
              {item.bio}
            </Text>
          ) : null}
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.outlinedButton}
            onPress={() => handleUserPress(item)}
            disabled={isChatPending}
          >
            {isChatPending ? (
              <ActivityIndicator size="small" color="#FF7F3F" />
            ) : (
              <Text style={styles.outlinedButtonText}>Chatear</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filledButton}
            onPress={() => handleAddFriend(item)}
            disabled={isFriendPending}
          >
            {isFriendPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.filledButtonText}>Amigos</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const emptyMessage = () => {
    if (error) {
      return 'No se pudo realizar la búsqueda en este momento.';
    }
    if (!searchText.trim()) {
      return 'Comienza a buscar usuarios para iniciar una conversación.';
    }
    if (searchText.trim().length < minimumChars) {
      return `Escribe al menos ${minimumChars} caracteres.`;
    }
    if (isLoading) {
      return 'Buscando usuarios...';
    }
    return 'No se encontraron usuarios con ese nombre.';
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <SearchInputBox
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Buscar usuarios"
          mainIconName="search"
          mainIconColor={BRAND_GRAY}
          mainIconSize={24}
        />
      </View>

      {error && (
        <Text style={styles.errorText}>
          Ocurrió un error al buscar usuarios.
        </Text>
      )}

      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{emptyMessage()}</Text>
        }
        contentContainerStyle={
          filteredResults.length === 0 ? styles.emptyContainer : undefined
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  headerContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  userInfo: {
    flex: 1,
  },
  usernameText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  handleText: {
    color: BRAND_GRAY,
    fontSize: 13,
  },
  bioText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginLeft: 12,
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: '#FF7F3F',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  outlinedButtonText: {
    color: '#FF7F3F',
    fontWeight: '600',
    fontSize: 13,
  },
  filledButton: {
    backgroundColor: '#FF7F3F',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  filledButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: BRAND_GRAY,
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    marginVertical: 8,
  },
});
