import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { DUMMY_CHATS } from '@/data/mockChats';

interface ChatItemProps {
  chat: (typeof DUMMY_CHATS)[0];
  onPress: () => void;
}

const BRAND_BLUE = '#007AFF';
const BRAND_GRAY = '#9E9E9E';

export default function ChatListItem({ chat, onPress }: ChatItemProps) {
  const { name, lastMessage, time, avatar, isStorySeen, unreadCount } = chat;
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.avatarBorder,
            {
              borderColor: isStorySeen ? BRAND_GRAY : '#FF8C00',
            },
          ]}
        >
          <Image source={{ uri: avatar }} style={styles.avatar} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, unreadCount > 0 && styles.nameUnread]}>
            {name}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <View style={styles.row}>
          <Text
            style={[
              styles.lastMessage,
              unreadCount > 0 && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  content: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontWeight: 'normal',
    fontSize: 16,
    color: '#000',
  },
  nameUnread: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: BRAND_GRAY,
  },
  lastMessage: {
    fontSize: 14,
    color: BRAND_GRAY,
    flex: 1,
  },
  lastMessageUnread: {
    color: '#000',
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
