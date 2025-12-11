import useSearchUser from '@/hooks/useSearchUser';
import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BRAND_GRAY = '#9E9E9E';
const BG_COLOR = '#F2F2F2';

export default function SearchInputBox() {
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
        <View style={styles.searchBarContainer}>
          <Icon
            name="search"
            size={20}
            color={BRAND_GRAY}
            style={styles.searchIcon}
          />
          {/* INPUT BOX */}
          <TextInput
            style={styles.textBoxInput}
            placeholder="Buscar"
            placeholderTextColor={BRAND_GRAY}
            value={inputUserValue}
            onChangeText={handleSearch}
          />
          {/* X BUTTON TO CLEAR INPUT */}
          {inputUserValue.length > 0 && (
            <Icon
              name="close"
              size={20}
              color={BRAND_GRAY}
              onPress={() => handleSearch('')}
            />
          )}
        </View>
      </View>

      {/* --- RESULT LIST --- */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron usuarios</Text>
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

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  textBoxInput: {
    flex: 1,
    height: 40,
    color: '#000',
    fontSize: 16,
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
