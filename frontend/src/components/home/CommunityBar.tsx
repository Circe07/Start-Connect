import React from 'react';
import { View, Image, FlatList, StyleSheet } from 'react-native';

const BRAND_ORANGE = '#FF7F3F';

export default function CommunityBar() {
  return (
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
              style={[styles.communityCircle, { borderColor: BRAND_ORANGE }]}
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
  );
}

const styles = StyleSheet.create({
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
});
