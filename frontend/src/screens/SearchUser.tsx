import useSearchUser from '@/hooks/useSearchUser';
import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import SearchInputBox from '@/components/ui/SearchInputBox';
const BRAND_GRAY = '#9E9E9E';

export default function SearchScreen() {
  const { inputUserValue, filteredUsers, handleSearch } = useSearchUser();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.usernameText}>{item.username}</Text>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <SearchInputBox
          value={inputUserValue}
          onChangeText={handleSearch}
          placeholder="Buscar"
          mainIconName="search"
          mainIconColor={BRAND_GRAY}
          mainIconSize={24}
        />
      </View>

      {/* --- RESULT LIST --- */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {inputUserValue.length > 0
              ? 'No se encontraron usuarios'
              : 'Comienza a buscar'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingVertical: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  nameText: {
    color: BRAND_GRAY,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: BRAND_GRAY,
  },
});
