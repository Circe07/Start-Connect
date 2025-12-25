import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';

import useGroupMessages from '@/hooks/useGroupMessages';
import useCurrentUserProfile from '@/hooks/useCurrentUserProfile';
import { sendGroupMessage } from '@/services/groups/authGroup';

const BRAND_ORANGE = '#FF7F3F';

export default function GroupChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isDarkMode = useColorScheme() === 'dark';
  const flatListRef = useRef<FlatList>(null);
  const [messageText, setMessageText] = useState('');

  const { groupId, groupName } = route?.params || {};
  const { data: currentUser } = useCurrentUserProfile();
  const currentUserId = currentUser?.uid || currentUser?.id;

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGroupMessages(groupId);

  const messages = data?.messages || [];

  useEffect(() => {
    if (!messages.length) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!groupId) {
        throw new Error('Grupo no disponible');
      }
      return sendGroupMessage(groupId, { content: text });
    },
    onSuccess: () => {
      setMessageText('');
      refetch();
    },
    onError: (error: any) => {
      Alert.alert('No se pudo enviar', error?.message || 'Intenta nuevamente.');
    },
  });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || sendMessageMutation.isPending) {
      return;
    }
    sendMessageMutation.mutate(trimmed);
  };

  const renderMessage = ({ item }: any) => {
    const isMine = item.userId === currentUserId;
    const authorName =
      item.authorProfile?.name || item.authorProfile?.username || 'Miembro';
    const timestamp = item.createdAtDate
      ? item.createdAtDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <View
        style={[
          styles.messageRow,
          { alignItems: isMine ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.sentBubble : styles.receivedBubble,
          ]}
        >
          <Text
            style={[
              styles.messageAuthor,
              { color: isMine ? '#fff' : '#555' },
            ]}
          >
            {authorName}
          </Text>
          <Text
            style={[
              styles.messageText,
              { color: isMine ? '#fff' : '#111' },
            ]}
          >
            {item.content}
          </Text>
          <Text style={styles.messageTimestamp}>{timestamp}</Text>
        </View>
      </View>
    );
  };

  const showLoader = isLoading && messages.length === 0;

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
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={styles.backButton}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#f2f2f2' : '#333'}
          />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? '#f2f2f2' : '#333' },
          ]}
        >
          {groupName || 'Chat del grupo'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={BRAND_ORANGE}
            />
          }
          ListEmptyComponent={
            showLoader ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={BRAND_ORANGE} />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aún no hay mensajes.</Text>
              </View>
            )
          }
        />

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
              borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
            },
          ]}
        >
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
            multiline
            editable={!sendMessageMutation.isPending}
          />
          <Pressable
            style={[
              styles.sendButton,
              {
                opacity:
                  messageText.trim().length === 0 || sendMessageMutation.isPending
                    ? 0.5
                    : 1,
              },
            ]}
            disabled={
              messageText.trim().length === 0 || sendMessageMutation.isPending
            }
            onPress={handleSend}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: BRAND_ORANGE,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    marginTop: 4,
  },
  messageTimestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  loadingOverlay: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    padding: 8,
  },
});
