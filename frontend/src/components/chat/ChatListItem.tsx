import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

interface ChatListItemData {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageAt?: Date | null;
  avatar?: string;
  unreadCount?: number;
  isStorySeen?: boolean;
}

interface ChatItemProps {
  chat: ChatListItemData;
  onPress: () => void;
}

const BRAND_BLUE = '#007AFF';
const BRAND_GRAY = '#9E9E9E';

const formatRelativeTime = (date?: Date | null) => {
  if (!date || Number.isNaN(date.getTime?.())) {
    return '';
  }

  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < 60 * 1000) return 'Ahora';
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h`;
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

export default function ChatListItem({ chat, onPress }: ChatItemProps) {
  const { name, lastMessage, lastMessageAt, avatar, isStorySeen, unreadCount } =
    chat;

  const avatarSource =
    avatar && avatar.length > 0
      ? { uri: avatar }
      : {
          uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name || 'SC',
          )}&background=FF7F3F&color=fff`,
        };

  const timeLabel = formatRelativeTime(lastMessageAt);
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
          <Image source={avatarSource} style={styles.avatar} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, unreadCount > 0 && styles.nameUnread]}>
            {name}
          </Text>
          <Text style={styles.time}>{timeLabel}</Text>
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
