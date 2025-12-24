import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatListItem from '@/components/chat/ChatListItem';
import SearchInputBox from '@/components/ui/SearchInputBox';
import useChats from '@/hooks/useChats';
import useCurrentUserProfile from '@/hooks/useCurrentUserProfile';
const BRAND_GRAY = '#9E9E9E';

interface ChatListScreenProps {
  navigation?: any;
}

export default function ChatListScreen({ navigation }: ChatListScreenProps) {
  const [searchText, setSearchText] = useState('');

  const { data: currentUser } = useCurrentUserProfile();
  const currentUserId = currentUser?.uid || currentUser?.id;

  const {
    data: chats = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useChats();

  const normalizedChats = useMemo(() => {
    return (chats || []).map(chat => {
      const otherParticipantId =
        chat.participantIds.find(pid => pid !== currentUserId) ||
        chat.participantIds[0];
      const otherProfile = chat.participantProfiles?.[otherParticipantId];

      return {
        id: chat.id,
        name: otherProfile?.name || otherProfile?.username || 'Conversación',
        avatar: otherProfile?.photo,
        lastMessage: chat.lastMessage?.text || 'Empieza la conversación',
        lastMessageAt: toDate(chat.lastMessageAt),
        unreadCount: (chat.unreadCount || {})[currentUserId || ''] || 0,
      };
    });
  }, [chats, currentUserId]);

  const filteredChats = useMemo(() => {
    if (!searchText) return normalizedChats;
    const normalizedQuery = searchText.toLowerCase();
    return normalizedChats.filter(chat => {
      const nameMatch = chat.name.toLowerCase().includes(normalizedQuery);
      const messageMatch = (chat.lastMessage || '')
        .toLowerCase()
        .includes(normalizedQuery);
      return nameMatch || messageMatch;
    });
  }, [normalizedChats, searchText]);

  const handleChatPress = (chatId: string) => {
    const chat = normalizedChats.find(c => c.id === chatId);
    if (!chat) return;

    navigation?.navigate('Chat', {
      chatId: chat.id,
      chatName: chat.name,
      chatAvatar: chat.avatar,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7F3F" />
        <Text style={styles.loadingText}>Cargando chats...</Text>
      </View>
    );
  }

  const handleOpenFriends = () => {
    navigation?.navigate?.('Friends');
  };

  const handleOpenSearch = () => {
    navigation?.navigate?.('SearchUser');
  };

  return (
    <View style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleOpenFriends}
            accessibilityRole="button"
            accessibilityLabel="Ver amigos"
          >
            <Icon name="group" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconButton, styles.headerIconSpacing]}
            onPress={handleOpenSearch}
            accessibilityRole="button"
            accessibilityLabel="Buscar usuarios"
          >
            <Icon name="person-add-alt-1" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR  */}
      <View style={styles.searchContainer}>
        <SearchInputBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar"
          mainIconName="search"
          mainIconColor={BRAND_GRAY}
          mainIconSize={20}
          containerStyle={styles.inputBoxStyle}
        />
      </View>

      {/* MESSAGE LIST */}
      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatListItem chat={item} onPress={() => handleChatPress(item.id)} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {error
              ? 'No se pudieron cargar los chats'
              : 'No hay chats con ese nombre.'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor="#FF7F3F"
          />
        }
      />
    </View>
  );
}

const toDate = (value?: any) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?._seconds === 'number') {
    const millis = value._seconds * 1000 + (value._nanoseconds || 0) / 1e6;
    return new Date(millis);
  }
  if (typeof value === 'number') return new Date(value);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: BRAND_GRAY,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconSpacing: {
    marginLeft: 10,
  },
  iconMargin: {
    marginRight: 15,
  },
  searchContainer: {
    padding: 10,
  },
  inputBoxStyle: {
    height: 36,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: BRAND_GRAY,
  },
});
