import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MessageBubble from '@/components/chat/MessageBubble';
import { DUMMY_MESSAGES } from '@/data/mockMessages';

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
    chatId = '1',
    chatName = 'Test User',
    chatAvatar = '',
  } = route?.params || {};

  const isDarkMode = useColorScheme() === 'dark';
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(DUMMY_MESSAGES[chatId] || []);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim() === '') return;

    const newMessage = {
      id: `m${Date.now()}`,
      chatId,
      text: messageText.trim(),
      senderId: 'me',
      timestamp: new Date(),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
      edges={['top']}
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
            <Icon name="person" size={24} color={BRAND_ORANGE} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.headerName,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              {chatName}
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

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              text={item.text}
              timestamp={item.timestamp}
              isSent={item.senderId === 'me'}
              isRead={item.isRead}
            />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input */}
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
            multiline
            maxLength={1000}
          />

          <Pressable
            style={[
              styles.sendButton,
              {
                opacity: messageText.trim() === '' ? 0.5 : 1,
              },
            ]}
            onPress={handleSend}
            disabled={messageText.trim() === ''}
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
});
