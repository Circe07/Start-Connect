import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Dimensions } from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

// React Native Maps import
import MapView, { Marker, Callout } from 'react-native-maps';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

const DATA = {
  football: [require('../assets/images/hobbies/football/5.jpg')],
  basketball: [require('../assets/images/hobbies/basketball/2.jpg')],
  cycling: [require('../assets/images/hobbies/cycling/4.jpg')],
  martialArt: [require('../assets/images/hobbies/martialArt/3.jpg'), require('../assets/images/hobbies/martialArt/6.jpg')],
  mClimbing: [require('../assets/images/hobbies/mClimbing/9.jpg')],
  ski: [require('../assets/images/hobbies/ski/1.jpg'), require('../assets/images/hobbies/ski/7.jpg')],
  surf: [require('../assets/images/hobbies/surf/8.jpg')],
};

const ALL_IMAGES = Object.values(DATA).flat();

export default function HobbiesScreen({ query = '' as any }) {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeLabel, setActiveLabel] = useState('Label 1');

  const labels = ['Label 1', 'Label 2', 'Label 3', 'Label 4'];
  const screenWidth = Dimensions.get('window').width;
  const gap = 2; // 2px gap between images

  const itemSize = Math.floor((screenWidth - (2 * gap)) / 3); // two inner gaps per row

  const normalized = (query as string)?.toLowerCase?.().trim() ?? '';
  const filteredImages = useMemo(() => {
    if (!normalized) return ALL_IMAGES;
    const target = normalized;

    // collect datasets where the key starts with the query
    const matchedKeys = Object.keys(DATA).filter((key) => key.toLowerCase().startsWith(target));

    // also support common stems
    if (matchedKeys.length === 0) {
      const stems: Array<[string, keyof typeof DATA]> = [
        ['basket', 'basketball'],
        ['cycle', 'cycling'],
        ['martial', 'martialArt'],
        ['climb', 'mClimbing'],
        ['mountain', 'mClimbing'],
        ['ski', 'ski'],
        ['surf', 'surf'],
        ['foot', 'football'],
      ];
      const stemHit = stems
        .filter(([stem]) => target.startsWith(stem))
        .map(([, key]) => key);
      if (stemHit.length === 0) return [];
      return stemHit.flatMap((k) => DATA[k]);
    }

    return matchedKeys.flatMap((k) => DATA[k as keyof typeof DATA]);
  }, [normalized]);

  return (
    <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          {/* Hobbies Title */}
          <Text style={[styles.hobbiesTitle, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
            HOBBIES
          </Text>

          {/* Label Tabs */}
          <View style={styles.labelTabsContainer}>
            {labels.map((label, index) => (
              <Pressable
                key={index}
                style={[
                  styles.labelTab,
                  {
                    backgroundColor: activeLabel === label 
                      ? (isDarkMode ? '#333' : '#f0f0f0')
                      : 'transparent'
                  }
                ]}
                onPress={() => setActiveLabel(label)}
              >
                <Text style={[
                  styles.labelTabText,
                  { color: isDarkMode ? '#f2f2f2' : '#333' }
                ]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Content based on active label */}
          {activeLabel === 'Label 2' ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 41.3851,
                  longitude: 2.1734,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={true}
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={true}
                rotateEnabled={true}
              >
                {/* Barcelona City Center */}
                <Marker
                  coordinate={{
                    latitude: 41.3851,
                    longitude: 2.1734,
                  }}
                  title="Barcelona City Center"
                  description="Historic city center of Barcelona"
                >
                  <View style={styles.customMarker}>
                    <Text style={styles.markerText}>🏛️</Text>
                  </View>
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>Barcelona City Center</Text>
                      <Text style={styles.calloutDescription}>Historic city center of Barcelona</Text>
                    </View>
                  </Callout>
                </Marker>

                {/* Park Güell */}
                <Marker
                  coordinate={{
                    latitude: 41.4036,
                    longitude: 2.1744,
                  }}
                  title="Park Güell Area"
                  description="Gaudí's famous park and architectural masterpiece"
                >
                  <View style={styles.customMarker}>
                    <Text style={styles.markerText}>🌳</Text>
                  </View>
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>Park Güell Area</Text>
                      <Text style={styles.calloutDescription}>Gaudí's famous park and architectural masterpiece</Text>
                    </View>
                  </Callout>
                </Marker>

                {/* Sagrada Familia */}
                <Marker
                  coordinate={{
                    latitude: 41.3809,
                    longitude: 2.1228,
                  }}
                  title="Sagrada Familia Area"
                  description="Antoni Gaudí's unfinished masterpiece"
                >
                  <View style={styles.customMarker}>
                    <Text style={styles.markerText}>⛪</Text>
                  </View>
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>Sagrada Familia Area</Text>
                      <Text style={styles.calloutDescription}>Antoni Gaudí's unfinished masterpiece</Text>
                    </View>
                  </Callout>
                </Marker>
              </MapView>
            </View>
          ) : (
            <View style={styles.hobbyGrid}>
              {filteredImages.map((img: any, index: number) => (
                <Pressable
                  key={index}
                  style={[
                    styles.hobbyCard,
                    {
                      width: itemSize,
                      marginRight: (index % 3) === 2 ? 0 : gap,
                      marginBottom: gap,
                    },
                  ]}
                >
                  <Image
                    source={img}
                    style={[styles.hobbyImage, { height: itemSize }]}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </View>
          )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    paddingHorizontal: 0,
    marginTop: 16
  },
  hobbiesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 20,
    marginLeft: 0,
  },
  labelTabsContainer: {
    flexDirection: 'row',
    marginBottom: 0,
    gap: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    width: '100%',
  },
  labelTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hobbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  hobbyCard: {
    // width is set inline via calculated itemWidth
  },
  hobbyImage: {
    width: '100%',
    height: 120,
    borderRadius: 0,
  },
  mapContainer: {
    height: 500,
    marginHorizontal: 0,
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  mapFallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapFallbackSubtext: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  mapFallbackMarkers: {
    marginTop: 20,
    alignItems: 'center',
  },
  mapMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapMarkerText: {
    fontSize: 20,
    marginRight: 8,
  },
  mapMarkerLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventsScroll: {
    marginTop: 20,
    marginBottom: 20,
  },
  eventsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  eventCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventStat: {
    fontSize: 12,
    fontWeight: '500',
  },
  mapVisual: {
    height: 200,
    marginTop: 20,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: '100%',
  },
  mapCell: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  interactiveMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEmoji: {
    fontSize: 24,
    zIndex: 2,
  },
  markerPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.3,
    zIndex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7F3F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  calloutContainer: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#666',
  },
});
