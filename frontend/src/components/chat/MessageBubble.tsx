import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageBubbleProps {
  text: string;
  timestamp: Date;
  isSent: boolean;
  isRead?: boolean;
}

const BRAND_ORANGE = '#FF7F3F';

export default function MessageBubble({
  text,
  timestamp,
  isSent,
  isRead = false,
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={[
        styles.container,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSent ? styles.sentBubble : styles.receivedBubble,
        ]}
      >
        <Text
          style={[styles.text, isSent ? styles.sentText : styles.receivedText]}
        >
          {text}
        </Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(timestamp)}</Text>
        {isSent && <Text style={styles.readStatus}>{isRead ? '✓✓' : '✓'}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  sentContainer: {
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble: {
    backgroundColor: BRAND_ORANGE,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#000',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: '#999',
  },
  readStatus: {
    fontSize: 11,
    color: BRAND_ORANGE,
  },
});
