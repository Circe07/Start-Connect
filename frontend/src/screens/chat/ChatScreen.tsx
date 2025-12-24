import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import MessageBubble from '@/components/chat/MessageBubble';
import useChatMessages, {
  UseChatMessagesResult,
} from '@/hooks/useChatMessages';
import useCurrentUserProfile from '@/hooks/useCurrentUserProfile';
import { markChatAsRead, sendChatMessage } from '@/services/chat/chatService';

const BRAND_ORANGE = '#FF7F3F';

interface ChatScreenProps {
  route?: {
    params?: {
      chatId?: string;
      chatName?: string;
      chatAvatar?: string;
    };
  };
  navigation?: any;
}

export default function ChatScreen(
  { route, navigation }: ChatScreenProps = {} as ChatScreenProps,
) {
  const {
    chatId = '',
    chatName: initialChatName = 'Conversación',
    chatAvatar = '',
  } = route?.params || {};

  const isDarkMode = useColorScheme() === 'dark';
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const hasMarkedReadRef = useRef(false);

  const { data: currentUser } = useCurrentUserProfile();
  const currentUserId = currentUser?.uid || currentUser?.id;

  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch, error } =
    useChatMessages(chatId);

  const chatSummary = data?.chat;
  const messages = data?.messages || [];
  const showLoaderOverlay = isLoading && messages.length === 0;

  const sortedMessages = useMemo(() => {
    if (!messages.length) return [];
    return [...messages].sort((a, b) => {
      const timeA = a.createdAt?.getTime?.() ?? 0;
      const timeB = b.createdAt?.getTime?.() ?? 0;
      return timeA - timeB;
    });
  }, [messages]);

  const otherParticipantId = useMemo(() => {
    if (!chatSummary?.participantIds?.length) return undefined;
    return (
      chatSummary.participantIds.find(id => id !== currentUserId) ||
      chatSummary.participantIds[0]
    );
  }, [chatSummary?.participantIds, currentUserId]);

  const otherProfile = otherParticipantId
    ? chatSummary?.participantProfiles?.[otherParticipantId]
    : undefined;

  const chatDisplayName =
    otherProfile?.name || otherProfile?.username || initialChatName;

  const avatarUri = otherProfile?.photo || chatAvatar || '';
  const avatarInitials = useMemo(() => {
    if (!chatDisplayName) return 'SC';
    return chatDisplayName
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [chatDisplayName]);

  useEffect(() => {
    if (!sortedMessages.length) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [sortedMessages]);

  useEffect(() => {
    hasMarkedReadRef.current = false;
  }, [chatId]);

  const { mutate: markChatRead, isPending: isMarkingRead } = useMutation({
    mutationFn: async () => {
      if (!chatId) return;
      await markChatAsRead(chatId);
    },
    onSuccess: () => {
      hasMarkedReadRef.current = true;
    },
  });

  useEffect(() => {
    if (
      !chatId ||
      !currentUserId ||
      !sortedMessages.length ||
      hasMarkedReadRef.current ||
      isMarkingRead
    ) {
      return;
    }
    markChatRead();
  }, [
    chatId,
    currentUserId,
    sortedMessages.length,
    isMarkingRead,
    markChatRead,
  ]);

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!chatId) {
        throw new Error('Chat no encontrado');
      }
      return sendChatMessage(chatId, { text });
    },
    onMutate: async (text: string) => {
      if (!chatId) return { previousData: undefined };
      await queryClient.cancelQueries({ queryKey: ['chatMessages', chatId] });
      const previousData = queryClient.getQueryData<UseChatMessagesResult>([
        'chatMessages',
        chatId,
      ]);

      const senderId = currentUserId || 'me';
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        chatId,
        senderId,
        text,
        createdAt: new Date(),
        isReadBy: { [senderId]: true },
      };

      queryClient.setQueryData<UseChatMessagesResult>(
        ['chatMessages', chatId],
        old => ({
          chat: old?.chat || chatSummary,
          messages: [...(old?.messages || []), optimisticMessage],
        }),
      );

      return { previousData };
    },
    onError: (_error, _text, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['chatMessages', chatId],
          context.previousData,
        );
      }
    },
    onSettled: () => {
      if (chatId) {
        queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      }
    },
  });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !chatId) {
      return;
    }

    setMessageText('');
    sendMessageMutation.mutate(trimmed, {
      onError: () => setMessageText(trimmed),
    });
  };

  const isSendDisabled =
    !messageText.trim() || sendMessageMutation.isPending || !chatId;

  const computeIsRead = (
    senderId?: string,
    isReadBy?: Record<string, boolean>,
  ) => {
    if (!chatSummary?.participantIds || !senderId) return false;
    const others = chatSummary.participantIds.filter(id => id !== senderId);
    if (!others.length) return false;
    return others.every(id => Boolean(isReadBy?.[id]));
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
      edges={['top']}
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
        <Pressable
          onPress={() => navigation?.goBack()}
          hitSlop={10}
          style={styles.backButton}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#f2f2f2' : '#333'}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{avatarInitials}</Text>
            )}
          </View>
          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.headerName,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              {chatDisplayName}
            </Text>
            <Text style={styles.headerStatus}>Activo ahora</Text>
          </View>
        </View>

        <Pressable hitSlop={10}>
          <Icon
            name="more-vert"
            size={24}
            color={isDarkMode ? '#f2f2f2' : '#333'}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={sortedMessages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              text={item.text}
              timestamp={item.createdAt || new Date()}
              isSent={item.senderId === currentUserId}
              isRead={computeIsRead(item.senderId, item.isReadBy)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {error
                  ? 'No se pudieron cargar los mensajes'
                  : 'Aún no hay mensajes aquí'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={BRAND_ORANGE}
              enabled={Boolean(chatId)}
            />
          }
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {showLoaderOverlay && (
          <View
            style={[
              styles.loadingOverlay,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(0, 0, 0, 0.7)'
                  : 'rgba(255, 255, 255, 0.85)',
              },
            ]}
          >
            <ActivityIndicator size="large" color={BRAND_ORANGE} />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
              borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
            },
          ]}
        >
          <Pressable style={styles.attachButton} hitSlop={10}>
            <Icon name="add-circle-outline" size={28} color={BRAND_ORANGE} />
          </Pressable>

          <TextInput
            style={[
              styles.textInput,
              {
                color: isDarkMode ? '#f2f2f2' : '#333',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
              },
            ]}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={messageText}
            onChangeText={setMessageText}
            editable={Boolean(chatId)}
            multiline
            maxLength={1000}
          />

          <Pressable
            style={[
              styles.sendButton,
              {
                opacity: isSendDisabled ? 0.5 : 1,
              },
            ]}
            onPress={handleSend}
            disabled={isSendDisabled}
            hitSlop={10}
          >
            <Icon name="send" size={24} color={BRAND_ORANGE} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_ORANGE + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarInitials: {
    color: BRAND_ORANGE,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
    color: '#999',
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  attachButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    marginBottom: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
});
