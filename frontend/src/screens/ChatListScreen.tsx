import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatListItem from '@/components/chat/ChatListItem';
import { DUMMY_CHATS } from '@/data/mockChats';
import SearchInputBox from '@/components/ui/SearchInputBox';
const BRAND_GRAY = '#9E9E9E';

export default function ChatListScreen() {
  const [searchText, setSearchText] = useState('');

  const filteredChats = DUMMY_CHATS.filter(
    chat =>
      chat.name.toLowerCase().includes(searchText.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleChatPress = (chatId: string) => {
    console.log(`Abriendo chat con ID: ${chatId}`);
  };

  return (
    <View style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerIcons}>
          <Icon name="edit-square" size={26} color="#000" />
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
          <Text style={styles.emptyText}>No hay chats con ese nombre.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: BRAND_GRAY,
  },
});
