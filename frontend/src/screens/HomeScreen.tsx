import React, { useState } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '@/components/BottomNavigation';
import AppHeader from '@/components/home/AppHeader';
import ExperiencesFeed from '@/components/experiences/ExperiencesFeed';

// Screens
import TiendaScreen from './TiendaScreen';
import SearchUser from './SearchUser';
import ProfileScreen from './ProfileScreen';
import HobbiesScreen from './HobbiesScreen';
import ChatListScreen from './chat/ChatListScreen';
import GroupsScreen from './groups/GroupsScreen';
import CentersScreen from './centers/CentersScreen';
import MyReservationsScreen from './centers/MyReservationsScreen';

export default function HomeScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';

  const [activeTab, setActiveTab] = useState('experiences');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchAnimation = useState(new Animated.Value(0))[0];
  const addButtonAnimation = useState(new Animated.Value(1))[0];

  const toggleSearch = () => {
    if (isSearchExpanded) {
      Animated.parallel([
        Animated.timing(searchAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(addButtonAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      setIsSearchExpanded(false);
      setSearchQuery('');
    } else {
      Animated.parallel([
        Animated.timing(searchAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(addButtonAnimation, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      setIsSearchExpanded(true);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
      case 'experiences':
        return (
          <ExperiencesFeed
            filter={searchQuery}
            onToggleSearch={toggleSearch}
            isSearchExpanded={isSearchExpanded}
            searchAnimation={searchAnimation}
            addButtonAnimation={addButtonAnimation}
          />
        );
      case 'search':
        return <SearchUser />;
      case 'tienda':
        return <TiendaScreen />;
      case 'hobbie':
        return <HobbiesScreen query={searchQuery} />;
      case 'chat':
        return <ChatListScreen navigation={navigation} />;
      case 'groups':
        return <GroupsScreen navigation={navigation} />;
      case 'centers':
        return <CentersScreen navigation={navigation} />;
      case 'reservations':
        return <MyReservationsScreen />;
      case 'perfil':
        return <ProfileScreen navigation={navigation} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      <View style={styles.container}>
        {/* Header */}
        {activeTab !== 'tienda' ? (
          <>
            <AppHeader navigation={navigation} />
            {activeTab === 'experiences'}
          </>
        ) : (
          <AppHeader showTiendaHeader navigation={navigation} />
        )}

        {/* Main Content */}
        {renderTabContent()}

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          navigation={navigation}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
