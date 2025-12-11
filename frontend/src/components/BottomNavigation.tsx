/**
 * Bottom Navigation Component
 * This component represents the bottom navigation bar of the app.
 */

import HomeScreen from '@/screens/HomeScreen';
import React from 'react';
import { View, Pressable, useColorScheme, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BRAND_ORANGE = '#ff5703ff';
const BRAND_GRAY = '#9E9E9E';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  navigation?: any;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  navigation,
}: BottomNavigationProps) {
  const isDarkMode = useColorScheme() === 'dark';

  const handleTabPress = (tab: string) => {
    onTabChange(tab);
  };

  return (
    <View
      style={[
        styles.bottomNav,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' },
      ]}
    >
      <Pressable
        style={styles.navItem}
        onPress={() => handleTabPress('experiences')}
      >
        <Icon
          name="home"
          size={26}
          color={activeTab === 'experiences' ? BRAND_ORANGE : BRAND_GRAY}
        />
      </Pressable>

      <Pressable
        style={styles.navItem}
        onPress={() => handleTabPress('search')}
      >
        <Icon
          name="search"
          size={26}
          color={activeTab === 'search' ? BRAND_ORANGE : BRAND_GRAY}
        />
      </Pressable>

      <Pressable
        style={styles.navItem}
        onPress={() => handleTabPress('tienda')}
      >
        <Icon
          name="shopping-cart"
          size={26}
          color={activeTab === 'tienda' ? BRAND_ORANGE : BRAND_GRAY}
        />
      </Pressable>

      <Pressable
        style={styles.navItem}
        onPress={() => handleTabPress('hobbie')}
      >
        <Icon
          name="fitness-center"
          size={26}
          color={activeTab === 'hobbie' ? BRAND_ORANGE : BRAND_GRAY}
        />
      </Pressable>

      <Pressable style={styles.navItem} onPress={() => handleTabPress('chat')}>
        <Icon
          name="wechat"
          size={26}
          color={activeTab === 'chat' ? BRAND_ORANGE : BRAND_GRAY}
        />
      </Pressable>

      <Pressable
        style={styles.navItem}
        onPress={() => handleTabPress('perfil')}
      >
        <Icon
          name="person"
          size={26}
          color={activeTab === 'perfil' ? BRAND_ORANGE : BRAND_GRAY}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 4,
  },
  navIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  perfilIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  dotsContainer: {
    flexDirection: 'row' as const,
    gap: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
});
