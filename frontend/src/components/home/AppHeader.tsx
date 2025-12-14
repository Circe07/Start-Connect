import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

interface AppHeaderProps {
  onAddPress?: () => void;
  showTiendaHeader?: boolean;
}

export default function AppHeader({
  onAddPress,
  showTiendaHeader = false,
}: AppHeaderProps) {
  const isDarkMode = useColorScheme() === 'dark';

  if (showTiendaHeader) {
    return (
      <View style={[styles.tiendaTopBar, { marginTop: 18 }]}>
        <Pressable hitSlop={10}>
          <Text style={[styles.tiendaTopText, { color: BRAND_GRAY }]}>
            Menu
          </Text>
        </Pressable>
        <Text style={styles.tiendaTopTitle}>Producto</Text>
        <Pressable hitSlop={10}>
          <Text style={[styles.tiendaTopText, { color: BRAND_GRAY }]}>
            Carrete
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Pressable onPress={onAddPress}>
          <Icon name="add" size={30} color={BRAND_ORANGE} />
        </Pressable>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitleStart, { color: BRAND_ORANGE }]}>
            START&
          </Text>
          <Text style={[styles.headerTitleConnect, { color: BRAND_GRAY }]}>
            CONNECT
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
  },
  headerTitleStart: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitleConnect: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    alignItems: 'center',
  },
  tiendaTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
    marginTop: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  tiendaTopText: {
    fontSize: 16,
  },
  tiendaTopTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
