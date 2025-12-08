import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BRAND_ORANGE = '#FF7F3F';
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
    if (tab === 'perfil' && navigation) {
      // Navigate to Profile screen
      navigation.navigate('Profile');
    } else {
      onTabChange(tab);
    }
  };

  return (
    <View
      style={[
        styles.bottomNav,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' },
      ]}
    >
      <Pressable style={styles.navItem} onPress={() => handleTabPress('home')}>
        <Icon
          name="home"
          size={26}
          color={activeTab === 'home' ? BRAND_ORANGE : BRAND_GRAY}
        />
        <Text
          style={[styles.navLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}
        >
          INICIO
        </Text>
      </Pressable>
      <Pressable
        style={styles.navItem}
        onPress={() => handleTabPress('tienda')}
      >
        <Icon
          name="store"
          size={26}
          color={activeTab === 'tienda' ? BRAND_ORANGE : BRAND_GRAY}
        />
        <Text
          style={[styles.navLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}
        >
          TIENDA
        </Text>
      </Pressable>

      <Pressable
        style={styles.navItem}
        onPress={() => handleTabPress('hobbie')}
      >
        <Icon
          name="star"
          size={26}
          color={activeTab === 'hobbie' ? BRAND_ORANGE : BRAND_GRAY}
        />
        <Text
          style={[styles.navLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}
        >
          HOBBIE
        </Text>
      </Pressable>

      <Pressable style={styles.navItem} onPress={() => handleTabPress('chat')}>
        <Icon
          name="chat"
          size={26}
          color={activeTab === 'chat' ? BRAND_ORANGE : BRAND_GRAY}
        />
        <Text
          style={[styles.navLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}
        >
          CHAT
        </Text>
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

        <Text
          style={[styles.navLabel, { color: isDarkMode ? '#f2f2f2' : '#333' }]}
        >
          PERFIL
        </Text>
      </Pressable>
    </View>
  );
}

const styles = {
  bottomNav: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
};
