import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Animated,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BRAND_ORANGE = '#FF7F3F';

interface Post {
  id: number;
  user: string;
  image: any;
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface ExperiencesFeedProps {
  filter?: string;
  isSearchExpanded: boolean;
  searchAnimation: Animated.Value;
  addButtonAnimation: Animated.Value;
}

export default function ExperiencesFeed({
  filter = '',
  isSearchExpanded,
  searchAnimation,
  addButtonAnimation,
}: ExperiencesFeedProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [posts, setPosts] = useState<Post[]>([
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

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id.toString()}
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
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  experiencesContainer: {
    gap: 24,
  },
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
    overflow: 'scroll',
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
    fontSize: 15,
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
  postStats: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  postLikes: {
    fontSize: 15,
    fontWeight: '600',
  },
  postCaption: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  postCaptionText: {
    fontSize: 15,
    lineHeight: 18,
  },
  postCaptionUser: {
    fontWeight: '600',
  },
  postsList: {
    paddingBottom: 100,
  },
});
