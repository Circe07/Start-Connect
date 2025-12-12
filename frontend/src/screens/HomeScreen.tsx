import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  useColorScheme,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HobbiesScreen from './HobbiesScreen';
import BottomNavigation from '@/components/BottomNavigation';

// Placeholder screens for each tab
import TiendaScreen from './TiendaScreen';
import SearchUser from './SearchUser';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProfileScreen from './ProfileScreen';
import ChatListScreen from './ChatListScreen';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

const HobbieScreen = () => <HobbiesScreen />;

const ChatScreen = () => <ChatListScreen />;

const PerfilScreen = ({ navigation }: any) => {
  return <ProfileScreen navigation={navigation} />;
};

export default function HomeScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState('experiences');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchAnimation = useState(new Animated.Value(0))[0];
  const addButtonAnimation = useState(new Animated.Value(1))[0];

  const toggleSearch = () => {
    if (isSearchExpanded) {
      // Collapse search
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
      // Expand search
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
          <ExperiencesContent
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
        return <ChatScreen />;
      case 'perfil':
        return <PerfilScreen navigation={navigation} />;
      default:
        return <Text>404- Tab Not Found</Text>;
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
        {/* Fixed Header */}
        {activeTab !== 'tienda' ? (
          <>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Pressable onPress={() => setActiveTab('experiences')}>
                  <Icon name="add" size={30} color={BRAND_ORANGE} />
                </Pressable>
              </View>
              <View style={styles.headerRight}>
                <View style={styles.headerTitleContainer}>
                  <Text
                    style={[styles.headerTitleStart, { color: BRAND_ORANGE }]}
                  >
                    START&
                  </Text>
                  <Text
                    style={[styles.headerTitleConnect, { color: BRAND_GRAY }]}
                  >
                    CONNECT
                  </Text>
                </View>
              </View>
            </View>

            {/* Fixed Community Stories Bar - Only on Experiences tab */}
            {activeTab === 'experiences' && (
              <View style={styles.communityBar}>
                <FlatList
                  data={[...Array(8)].map((_, i) => i)}
                  horizontal
                  keyExtractor={item => String(item)}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.communityBarContent}
                  renderItem={({ item }) => (
                    <View style={styles.communityItem}>
                      <View
                        style={[
                          styles.communityCircle,
                          { borderColor: BRAND_ORANGE },
                        ]}
                      >
                        <Image
                          source={require('@/assets/images/pr1.jpg')}
                          style={styles.communityImage as any}
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  )}
                />
              </View>
            )}
          </>
        ) : (
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
        )}

        {/* Scrollable Main Content */}
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

const ExperiencesContent = ({
  filter = '' as any,
  onToggleSearch,
  isSearchExpanded,
  searchAnimation,
  addButtonAnimation,
}: {
  filter?: any;
  onToggleSearch: () => void;
  isSearchExpanded: boolean;
  searchAnimation: Animated.Value;
  addButtonAnimation: Animated.Value;
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'chanchito_feliz',
      image: require('@/assets/images/escalada1.jpg'),
      caption: 'Amazing day at the crag! 🧗‍♀️ #climbing #outdoor',
      likes: 142,
      comments: 8,
      isLiked: false,
    },
    {
      id: 2,
      user: 'unai',
      image: require('@/assets/images/natacion 2.jpg'),
      caption: 'Morning swim session complete! 💪 #swimming #fitness',
      likes: 28,
      comments: 5,
      isLiked: false,
    },
    {
      id: 3,
      user: 'climber_anna',
      image: require('@/assets/images/escalada2.png'),
      caption: 'New route conquered! The view was incredible 🏔️',
      likes: 67,
      comments: 12,
      isLiked: false,
    },
  ]);

  const handleLike = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  // Create header component for FlatList
  const renderHeader = () => (
    <View style={styles.experiencesContainer}>
      {/* Search and Add Button */}
      <View style={styles.searchAddContainer}>
        <Pressable style={styles.searchIconButton} onPress={onToggleSearch}>
          <Icon
            name="search"
            size={30}
            style={{ color: isDarkMode ? '#666' : '#999' }}
          />
        </Pressable>

        {isSearchExpanded && (
          <Animated.View
            style={[
              styles.searchContainer,
              {
                flex: searchAnimation,
                opacity: searchAnimation,
              },
            ]}
          >
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: isDarkMode ? '#f2f2f2' : '#333',
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                },
              ]}
              placeholder="Search experiences..."
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={filter as string}
              onChangeText={text => {
                /* Handle search */
              }}
            />
          </Animated.View>
        )}

        <Pressable
          style={[styles.addButton, { backgroundColor: BRAND_ORANGE }]}
        >
          <Icon name="add" size={27} style={styles.addButtonText} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      renderItem={({ item: post }) => (
        <View
          style={[
            styles.postContainer,
            { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' },
          ]}
        >
          {/* Post Header */}
          <View style={styles.postHeader}>
            <View style={styles.postUserInfo}>
              <View
                style={[styles.postAvatar, { backgroundColor: BRAND_ORANGE }]}
              />
              <Text
                style={[
                  styles.postUsername,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                {post.user}
              </Text>
            </View>
          </View>

          {/* Post Image */}
          <Image
            source={post.image}
            style={styles.postImage as any}
            resizeMode="cover"
          />

          {/* Post Actions */}
          <View style={styles.postActions}>
            <Pressable
              style={styles.postAction}
              onPress={() => handleLike(post.id)}
            >
              <Icon
                name="favorite"
                size={30}
                style={[{ color: post.isLiked ? '#ff3040' : '#999' }]}
              />
            </Pressable>
            <Pressable style={styles.postAction}>
              <Icon name="comment" size={30} />
            </Pressable>
            <Pressable style={styles.postAction}>
              <Icon name="send" size={30} />
            </Pressable>
          </View>

          {/* Post Stats */}
          <View style={styles.postStats}>
            <Text
              style={[
                styles.postLikes,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              {post.likes} likes
            </Text>
          </View>

          {/* Post Caption */}
          <View style={styles.postCaption}>
            <Text
              style={[
                styles.postCaptionText,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              <Text
                style={[
                  styles.postCaptionUser,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                {post.user}
              </Text>{' '}
              {post.caption}
            </Text>
          </View>
        </View>
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.postsList}
      style={styles.mainContent}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
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
  logoImage: {
    width: 40,
    height: 40,
  },
  communityBar: {
    marginTop: 0,
    height: 84,
    marginBottom: 0,
  },
  communityBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 12,
    height: 56,
    alignItems: 'center',
  },
  communityItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  communityCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
  },
  communityImage: {
    width: '100%',
    height: '100%',
  },
  communityLabel: {
    display: 'none',
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainContentEdgeToEdge: {
    paddingHorizontal: 0,
  },
  experiencesContainer: {
    gap: 24,
  },
  experiencesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchThinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 2,
    gap: 8,
  },
  searchThinIcon: {
    fontSize: 14,
  },
  searchThinInput: {
    flex: 1,
    fontSize: 13,
  },
  activitySection: {
    gap: 12,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageCard: {
    flex: 1,
  },
  activityImage: {
    height: 120,
    borderRadius: 8,
    width: '100%',
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  // New styles for Instagram-like posts and search
  searchAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
    gap: 8,
    paddingHorizontal: 4,
    height: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 8,
  },
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    flex: 1,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
  },
  searchIconButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  postContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postUsername: {
    fontSize: 18,
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
  },
  postAction: {
    padding: 4,
  },
  postActionIcon: {
    fontSize: 20,
  },
  postStats: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  postLikes: {
    fontSize: 18,
    fontWeight: '600',
  },
  postCaption: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  postCaptionText: {
    fontSize: 18,
    lineHeight: 18,
  },
  postCaptionUser: {
    fontWeight: '600',
  },
  postsList: {
    paddingBottom: 20,
  },
  profileButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postIcon: {
    color: 'fff',
    borderColor: 'black',
  },
});
