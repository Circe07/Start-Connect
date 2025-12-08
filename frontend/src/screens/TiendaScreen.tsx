import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, useColorScheme, Pressable, Dimensions } from 'react-native';

type Product = {
  id: string;
  title: string;
  price: string;
  image: any;
};

const PRODUCTS: Product[] = [
  { id: '1', title: 'Pack Iniciación', price: '200 €', image: require('../assets/images/pr1.jpg') },
  { id: '2', title: 'Sportiva Theory W', price: '145,99 €', image: require('../assets/images/pr2.png') },
  { id: '3', title: 'Arnés Escalada', price: '89,99 €', image: require('../assets/images/pr3.jpg') },
  { id: '4', title: 'Mosquetón', price: '12,50 €', image: require('../assets/images/pr4.png') },
];

export default function TiendaScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const screenWidth = Dimensions.get('window').width;
  const gap = 2;
  const side = 18; // 5px side padding
  const cardWidth = Math.floor((screenWidth - side * 2 - gap) / 2);

  const renderItem = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.card, { width: cardWidth, marginRight: (index % 2) === 1 ? 0 : gap }] }>
      <Image source={item.image} style={[styles.cardImage, { width: '100%', height: cardWidth }]} resizeMode="contain" />
      <View style={[styles.caption, { backgroundColor: isDarkMode ? '#222' : '#f4f4f4' }]}>
        <Text style={[styles.captionTitle, { color: isDarkMode ? '#f2f2f2' : '#333' }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.captionPrice, { color: isDarkMode ? '#dcdcdc' : '#666' }]}>{item.price}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={[styles.gridContent, { paddingTop: 7, paddingHorizontal: side }]}
        numColumns={2}
        columnWrapperStyle={{ marginBottom: gap }}
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
  },
  topTab: {
    paddingVertical: 6,
  },
  topTabText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  topTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00000022',
  },
  topTabTextActive: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: 'transparent',
  },
  cardImage: {
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  caption: {
    marginTop: 0,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  captionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  captionPrice: {
    fontSize: 13,
  },
});


