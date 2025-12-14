/**
 * Bottom Navigation Component - Instagram Style
 * 5 main icons with center expandable menu button
 */

import React, { useState } from 'react';
import { View, Pressable, useColorScheme, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ExpandableMenu from '@/components/navigation/ExpandableMenu';

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
  const [menuVisible, setMenuVisible] = useState(false);

  const handleTabPress = (tab: string) => {
    if (tab === 'menu') {
      setMenuVisible(true);
    } else {
      onTabChange(tab);
    }
  };

  const handleMenuOptionSelect = (option: string) => {
    onTabChange(option);
  };

  return (
    <>
      <View
        style={[
          styles.bottomNav,
          { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' },
        ]}
      >
        {/* Home / Experiences */}
        <Pressable
          style={styles.navItem}
          onPress={() => handleTabPress('experiences')}
        >
          <Icon
            name="home"
            size={28}
            color={activeTab === 'experiences' ? BRAND_ORANGE : BRAND_GRAY}
          />
        </Pressable>

        {/* Search */}
        <Pressable
          style={styles.navItem}
          onPress={() => handleTabPress('search')}
        >
          <Icon
            name="search"
            size={28}
            color={activeTab === 'search' ? BRAND_ORANGE : BRAND_GRAY}
          />
        </Pressable>

        {/* Center Expandable Menu Button */}
        <Pressable
          style={[styles.navItem, styles.centerButton]}
          onPress={() => handleTabPress('menu')}
        >
          <View style={styles.centerButtonCircle}>
            <Icon name="menu" size={32} color="#fff" />
          </View>
        </Pressable>

        {/* Chat */}
        <Pressable
          style={styles.navItem}
          onPress={() => handleTabPress('groups')}
        >
          <Icon
            name="groups"
            size={28}
            color={activeTab === 'groups' ? BRAND_ORANGE : BRAND_GRAY}
          />
        </Pressable>

        {/* Profile */}
        <Pressable
          style={styles.navItem}
          onPress={() => handleTabPress('perfil')}
        >
          <Icon
            name="person"
            size={28}
            color={activeTab === 'perfil' ? BRAND_ORANGE : BRAND_GRAY}
          />
        </Pressable>
      </View>

      {/* Expandable Menu Modal */}
      <ExpandableMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onOptionSelect={handleMenuOptionSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row' as const,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 8,
  },
  centerButton: {
    position: 'relative',
    bottom: 8,
  },
  centerButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_ORANGE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
